/**
 * Negotiation board.
 *
 * Shared between both sides — `viewerIsInitiator` / `viewerIsCounterparty`
 * determines which actions are enabled. Renders:
 *   - Current terms (live deal: title, gross, milestones).
 *   - Each open amendment as a side-by-side compare card with accept/reject
 *     buttons (only the side that hasn't yet responded sees their button).
 *   - A "Propose an amendment" entry point — a small inline editor for the
 *     three most common knobs (gross, milestone breakdown, description).
 *   - When no amendments are open, a big "Endorse final terms" CTA. When
 *     both sides have endorsed on the same termsHash, the deal locks and
 *     the screen redirects back to the Deal Room.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackHeader, Button, Screen } from '@/ui';
import { useAuth, useDeal, useDeals } from '@/state';
import { formatNaira, nairaToKobo } from '@/domain/money';
import type { Amendment, AmendmentChanges } from '@/domain/schema';
import { colors, radii, spacing, typography } from '@/theme';

export default function NegotiateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuth((s) => s.user);
  const deal = useDeal(id ?? '');
  const { proposeAmendment, respondToAmendment, endorseLock, loadOne } = useDeals();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorNote, setEditorNote] = useState('');
  const [editorAmountNaira, setEditorAmountNaira] = useState('');
  const [editorDescription, setEditorDescription] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const viewer: 'initiator' | 'counterparty' | 'spectator' = useMemo(() => {
    if (!deal || !user) return 'spectator';
    const initiatorId = deal.initiatorRole === 'buyer' ? deal.buyerId : deal.sellerId;
    if (user.id === initiatorId) return 'initiator';
    if (user.id === deal.counterparty?.userId) return 'counterparty';
    return 'spectator';
  }, [deal, user]);

  if (!deal) {
    return (
      <Screen bg={colors.ink} padH>
        <BackHeader title="Negotiation" />
        <Text style={styles.subtle}>Loading deal…</Text>
      </Screen>
    );
  }

  if (!deal.counterparty) {
    return (
      <Screen bg={colors.ink} padH>
        <BackHeader title="Negotiation" />
        <Text style={styles.subtle}>This deal has no counterparty — nothing to negotiate.</Text>
      </Screen>
    );
  }

  // Capture the narrowed values so closures keep the right types.
  const d = deal;
  const openAmendments: Amendment[] = (d.amendments ?? []).filter((a) => a.status === 'proposed');
  const closedAmendments: Amendment[] = (d.amendments ?? []).filter((a) => a.status !== 'proposed');
  const initEndorsed = !!d.endorsements?.find((e) => e.by === 'initiator');
  const counterEndorsed = !!d.endorsements?.find((e) => e.by === 'counterparty');
  const readyToEndorse = openAmendments.length === 0 && d.status === 'viewed';
  const locked = d.status === 'locked' || d.lockedAt;

  async function handleRespond(amendmentId: string, response: 'accept' | 'reject') {
    if (viewer === 'spectator') return;
    setBusy(`resp_${amendmentId}_${response}`);
    try {
      await respondToAmendment({ dealId: d.id, amendmentId, by: viewer, response });
    } catch (e) {
      Alert.alert('Could not record response', (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function handleEndorse() {
    if (viewer === 'spectator') return;
    setBusy('endorse');
    try {
      const updated = await endorseLock({ dealId: d.id, by: viewer });
      if (updated.lockedAt) {
        Alert.alert('Locked', 'Both parties endorsed. The contract is now binding.', [
          { text: 'Continue', onPress: () => router.replace({ pathname: '/(app)/deal/[id]', params: { id: d.id } }) },
        ]);
      }
    } catch (e) {
      Alert.alert('Could not endorse', (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function handlePropose() {
    if (viewer === 'spectator') return;
    const changes: AmendmentChanges = {};
    if (editorAmountNaira.trim()) {
      const naira = parseInt(editorAmountNaira.replace(/[^0-9]/g, ''));
      if (Number.isInteger(naira) && naira >= 100) {
        changes.grossKobo = nairaToKobo(naira);
      }
    }
    if (editorDescription.trim()) {
      changes.description = editorDescription.trim();
    }
    if (Object.keys(changes).length === 0) {
      Alert.alert('Nothing to amend', 'Enter at least one change — a new amount or a description note.');
      return;
    }
    setBusy('propose');
    try {
      await proposeAmendment({
        dealId: d.id,
        proposedBy: viewer,
        changes,
        note: editorNote.trim() || undefined,
      });
      setEditorOpen(false);
      setEditorAmountNaira('');
      setEditorDescription('');
      setEditorNote('');
      await loadOne(d.id);
    } catch (e) {
      Alert.alert('Could not propose amendment', (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Negotiation" />

      <View style={styles.body}>
        <Text style={styles.heading}>{deal.title}</Text>
        <View style={styles.statusRow}>
          <StatusPill status={deal.status} />
          {viewer !== 'spectator' && (
            <Text style={styles.subtle}>
              You're the {viewer === 'initiator' ? (deal.initiatorRole ?? 'initiator') : (deal.counterparty.role)}
            </Text>
          )}
        </View>

        {/* Current terms snapshot */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>CURRENT TERMS</Text>
          <SummaryRow label="Amount" value={formatNaira(deal.grossKobo)} />
          {deal.description ? <SummaryRow label="Notes" value={deal.description} /> : null}
          <SummaryRow label="Funding" value={deal.fundingMode === 'fund_first' ? 'Fund-first' : 'Fund after lock'} />
          {deal.milestones && deal.milestones.length > 0 && (
            <View style={{ gap: 4 }}>
              <Text style={styles.subtle}>STAGES</Text>
              {deal.milestones.map((m) => (
                <Text key={m.id} style={styles.milestoneLine}>
                  • {m.title} — {(m.shareBps / 100).toFixed(0)}%
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Open amendments */}
        {openAmendments.map((a) => (
          <AmendmentCard
            key={a.id}
            amendment={a}
            viewer={viewer}
            busy={busy}
            currentGrossKobo={deal.grossKobo}
            onRespond={handleRespond}
          />
        ))}

        {/* Propose-amendment entry */}
        {viewer !== 'spectator' && !locked && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>PROPOSE AN AMENDMENT</Text>
              <Pressable
                onPress={() => setEditorOpen((v) => !v)}
                style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
              >
                <Text style={styles.linkBtnText}>{editorOpen ? 'Cancel' : '+ New'}</Text>
              </Pressable>
            </View>
            {editorOpen && (
              <View style={{ gap: spacing.sm }}>
                <Text style={styles.subtle}>NEW AMOUNT (NGN, OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  value={editorAmountNaira}
                  onChangeText={setEditorAmountNaira}
                  keyboardType="number-pad"
                  placeholder={String(Math.floor(deal.grossKobo / 100))}
                  placeholderTextColor={colors.stone}
                  maxLength={10}
                />
                <Text style={styles.subtle}>DESCRIPTION / SCOPE UPDATE (OPTIONAL)</Text>
                <TextInput
                  style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
                  value={editorDescription}
                  onChangeText={setEditorDescription}
                  placeholder="What changes about the scope, deliverables, or timeline?"
                  placeholderTextColor={colors.stone}
                  multiline
                  maxLength={1000}
                />
                <Text style={styles.subtle}>NOTE TO THE OTHER SIDE (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  value={editorNote}
                  onChangeText={setEditorNote}
                  placeholder="Why are you proposing this?"
                  placeholderTextColor={colors.stone}
                  maxLength={280}
                />
                <Button
                  label="Send proposal"
                  onPress={handlePropose}
                  loading={busy === 'propose'}
                />
              </View>
            )}
          </View>
        )}

        {/* Endorsement / lock CTA */}
        {readyToEndorse && viewer !== 'spectator' && (
          <View style={styles.endorseCard}>
            <Text style={styles.cardLabel}>READY TO LOCK?</Text>
            <Text style={styles.subtle}>
              No open amendments. When both sides endorse the current terms, the contract locks
              and only a joint amendment can change it.
            </Text>
            <View style={styles.endorseStatusRow}>
              <EndorseChip label="Initiator" endorsed={initEndorsed} />
              <EndorseChip label="Counterparty" endorsed={counterEndorsed} />
            </View>
            <Button
              label={
                (viewer === 'initiator' && initEndorsed) || (viewer === 'counterparty' && counterEndorsed)
                  ? 'You\'ve endorsed — waiting for the other side'
                  : 'Endorse final terms (the die is cast)'
              }
              onPress={handleEndorse}
              loading={busy === 'endorse'}
              disabled={
                (viewer === 'initiator' && initEndorsed) || (viewer === 'counterparty' && counterEndorsed)
              }
            />
          </View>
        )}

        {/* Closed amendments — light audit history */}
        {closedAmendments.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>HISTORY ({closedAmendments.length})</Text>
            {closedAmendments.map((a) => (
              <Text key={a.id} style={styles.historyLine}>
                <Text style={styles.historyKind}>{a.status.toUpperCase()}</Text> ·{' '}
                proposed by {a.proposedBy} ·{' '}
                {a.note ? `"${a.note}"` : '(no note)'}
              </Text>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

function AmendmentCard({
  amendment,
  viewer,
  busy,
  currentGrossKobo,
  onRespond,
}: {
  amendment: Amendment;
  viewer: 'initiator' | 'counterparty' | 'spectator';
  busy: string | null;
  currentGrossKobo: number;
  onRespond: (amendmentId: string, response: 'accept' | 'reject') => void;
}) {
  const myResponse =
    viewer === 'initiator' ? amendment.initiatorResponse :
    viewer === 'counterparty' ? amendment.counterpartyResponse : 'pending';
  const canRespond = viewer !== 'spectator' && myResponse === 'pending';

  return (
    <View style={styles.amendmentCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardLabel}>AMENDMENT · by {amendment.proposedBy}</Text>
        <Text style={styles.subtle}>{new Date(amendment.proposedAt).toLocaleString()}</Text>
      </View>
      {amendment.note ? <Text style={styles.amendmentNote}>"{amendment.note}"</Text> : null}
      {amendment.changes.grossKobo !== undefined && amendment.changes.grossKobo !== currentGrossKobo && (
        <SummaryRow
          label="Amount"
          value={`${formatNaira(currentGrossKobo)} → ${formatNaira(amendment.changes.grossKobo)}`}
        />
      )}
      {amendment.changes.description ? (
        <SummaryRow label="New description" value={amendment.changes.description} />
      ) : null}
      {amendment.changes.milestones && (
        <View style={{ gap: 4 }}>
          <Text style={styles.subtle}>NEW STAGES</Text>
          {amendment.changes.milestones.map((m, i) => (
            <Text key={i} style={styles.milestoneLine}>
              • {m.title} — {(m.shareBps / 100).toFixed(0)}%
            </Text>
          ))}
        </View>
      )}

      <View style={styles.respondRow}>
        <ResponseChip side="initiator" response={amendment.initiatorResponse} />
        <ResponseChip side="counterparty" response={amendment.counterpartyResponse} />
      </View>

      {canRespond && (
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => onRespond(amendment.id, 'accept')}
            disabled={busy?.startsWith(`resp_${amendment.id}`)}
            style={({ pressed }) => [styles.acceptBtn, pressed && styles.pressed]}
          >
            <Text style={styles.acceptBtnText}>Accept</Text>
          </Pressable>
          <Pressable
            onPress={() => onRespond(amendment.id, 'reject')}
            disabled={busy?.startsWith(`resp_${amendment.id}`)}
            style={({ pressed }) => [styles.rejectBtn, pressed && styles.pressed]}
          >
            <Text style={styles.rejectBtnText}>Reject</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function ResponseChip({ side, response }: { side: 'initiator' | 'counterparty'; response: 'pending' | 'accept' | 'reject' }) {
  const bg =
    response === 'accept' ? colors.safeBg :
    response === 'reject' ? colors.alertBg : 'rgba(255,255,255,0.04)';
  const fg =
    response === 'accept' ? colors.safe :
    response === 'reject' ? colors.alert : colors.stone;
  return (
    <View style={[styles.responseChip, { backgroundColor: bg }]}>
      <Text style={[styles.responseChipText, { color: fg }]}>
        {side === 'initiator' ? 'Initiator' : 'Counterparty'} · {response}
      </Text>
    </View>
  );
}

function EndorseChip({ label, endorsed }: { label: string; endorsed: boolean }) {
  return (
    <View style={[styles.responseChip, { backgroundColor: endorsed ? colors.safeBg : 'rgba(255,255,255,0.04)' }]}>
      <Text style={[styles.responseChipText, { color: endorsed ? colors.safe : colors.stone }]}>
        {label} · {endorsed ? '✓ endorsed' : 'pending'}
      </Text>
    </View>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <View style={styles.statusPill}>
      <Text style={styles.statusPillText}>{status.toUpperCase().replace(/_/g, ' ')}</Text>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryRowLabel}>{label}</Text>
      <Text style={styles.summaryRowValue} numberOfLines={4}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.lg },
  heading: { fontSize: typography.h2.size, fontWeight: typography.h2.weight, color: colors.cream },
  subtle: { color: colors.stone, fontSize: typography.caption.size, fontWeight: '600', letterSpacing: 0.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.cautionBg,
  },
  statusPillText: { color: colors.caution, fontWeight: '900', fontSize: typography.caption.size },
  card: {
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: typography.caption.size, fontWeight: '700', color: colors.stone, letterSpacing: 0.8 },
  amendmentCard: {
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.caution,
  },
  amendmentNote: { color: colors.cream, fontStyle: 'italic', fontSize: typography.bodySm.size },
  endorseCard: {
    backgroundColor: 'rgba(0,168,107,0.06)',
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,168,107,0.3)',
  },
  endorseStatusRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  summaryRowLabel: { color: colors.stone, fontSize: typography.bodySm.size, fontWeight: '600' },
  summaryRowValue: { color: colors.cream, fontSize: typography.bodySm.size, fontWeight: '700', textAlign: 'right', flex: 1 },
  milestoneLine: { color: colors.cream, fontSize: typography.bodySm.size, fontWeight: '500' },
  respondRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  responseChip: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.pill },
  responseChipText: { fontWeight: '800', fontSize: typography.caption.size, letterSpacing: 0.3 },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  acceptBtn: {
    flex: 1,
    backgroundColor: colors.lime,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  acceptBtnText: { color: colors.ink, fontWeight: '900', fontSize: typography.body.size },
  rejectBtn: {
    flex: 1,
    backgroundColor: colors.forest,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.alert,
  },
  rejectBtnText: { color: colors.alert, fontWeight: '900', fontSize: typography.body.size },
  linkBtn: { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  linkBtnText: { color: colors.lime, fontWeight: '800', fontSize: typography.bodySm.size },
  pressed: { opacity: 0.75 },
  input: {
    backgroundColor: colors.ink,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.cream,
    fontWeight: '600',
    fontSize: typography.bodySm.size,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  historyLine: { color: colors.stone, fontSize: typography.caption.size, fontWeight: '500' },
  historyKind: { color: colors.cream, fontWeight: '900' },
});
