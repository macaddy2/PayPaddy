import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionBar, BackHeader, Eyebrow, MilestoneBar, Screen, TrustPill, VaultCard } from '@/ui';
import { useAuth, useDeal, useDeals } from '@/state';
import { computeFees, computeMilestonePayout, formatNaira } from '@/domain/money';
import { colors, radii, spacing, typography } from '@/theme';
import type { Deal, DealStatus, LedgerEntry, Milestone } from '@/domain/schema';

const STATUS_STAGE: Partial<Record<DealStatus, number>> = {
  awaiting_funds: 0,
  funded: 1,
  in_progress: 2,
  delivered: 2,
  disputed: 2,
  settled: 3,
  refunded: 3,
};

const steps = ['Created', 'Funded', 'Delivery', 'Done'];

export default function DealRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deal = useDeal(id ?? '');
  const { loadOne, confirmReceipt, markMilestoneDelivered, releaseMilestone } = useDeals();
  const user = useAuth((s) => s.user);
  const [confirming, setConfirming] = useState(false);
  const [busyMilestone, setBusyMilestone] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void loadOne(id);
    const interval = setInterval(() => {
      if (deal?.status === 'awaiting_funds') void loadOne(id);
    }, 3000);
    return () => clearInterval(interval);
  }, [id, deal?.status, loadOne]);

  if (!deal) {
    return (
      <Screen bg={colors.cream} padH>
        <BackHeader title="Deal Room" />
        <ActivityIndicator color={colors.emerald} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  const currentDeal = deal;
  const stage = STATUS_STAGE[currentDeal.status] ?? 0;
  const fees = computeFees(currentDeal.grossKobo, currentDeal.sellerTier);

  async function handleConfirm() {
    setConfirming(true);
    await confirmReceipt(currentDeal.id);
    setConfirming(false);
    router.push({ pathname: '/(app)/deal/[id]/complete', params: { id: currentDeal.id } });
  }

  const viewerIsBuyer = !!user && user.id === currentDeal.buyerId;
  const viewerIsSeller = !!user && user.id === currentDeal.sellerId;

  async function handleDeliverMilestone(milestoneId: string) {
    setBusyMilestone(milestoneId);
    try {
      await markMilestoneDelivered(currentDeal.id, milestoneId);
    } finally {
      setBusyMilestone(null);
    }
  }

  async function handleReleaseMilestone(milestoneId: string) {
    setBusyMilestone(milestoneId);
    try {
      await releaseMilestone(currentDeal.id, milestoneId);
    } finally {
      setBusyMilestone(null);
    }
  }

  return (
    <Screen bg={colors.cream} padH={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackHeader title={currentDeal.title} />
          <View style={styles.pad}>
            <VaultCard amountKobo={currentDeal.grossKobo} bank="with GTBank (CBN Licensed)" />
          </View>
        </View>

        <View style={styles.body}>
          <MilestoneBar steps={steps} activeIndex={stage} />

          <View style={styles.parties}>
            <Party initials="AO" name="You" state="Paid" tone="buyer" />
            <View style={styles.partyLine} />
            <Text style={styles.handshake}>🤝</Text>
            <View style={styles.partyLine} />
            <Party initials="TH" name="Seller" state={deal.status === 'settled' ? 'Paid' : 'Delivering'} tone="seller" />
          </View>

          <View style={styles.feeCard}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Seller fee</Text>
              <Text style={styles.feeValue}>{formatNaira(fees.escrowFeeKobo)}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>SafeGuard contribution</Text>
              <Text style={styles.feeValue}>{formatNaira(fees.safeguardKobo)}</Text>
            </View>
            <View style={[styles.feeRow, styles.lastFee]}>
              <Text style={styles.feeLabel}>Seller receives</Text>
              <Text style={[styles.feeValue, styles.safeValue]}>{formatNaira(fees.netToSellerKobo)}</Text>
            </View>
          </View>

          {currentDeal.milestones && currentDeal.milestones.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Eyebrow>Milestones</Eyebrow>
                <TrustPill
                  label={`${currentDeal.milestones.filter((m) => m.status === 'released').length}/${currentDeal.milestones.length} released`}
                  tone="safe"
                />
              </View>
              {currentDeal.milestones.map((m) => (
                <MilestoneRow
                  key={m.id}
                  milestone={m}
                  deal={currentDeal}
                  viewerIsBuyer={viewerIsBuyer}
                  viewerIsSeller={viewerIsSeller}
                  busy={busyMilestone === m.id}
                  onDeliver={() => handleDeliverMilestone(m.id)}
                  onRelease={() => handleReleaseMilestone(m.id)}
                />
              ))}
            </View>
          )}

          {currentDeal.ledger && currentDeal.ledger.length > 0 && (
            <LedgerSection entries={currentDeal.ledger} />
          )}

          <View style={styles.sectionHead}>
            <Eyebrow>Activity</Eyebrow>
            <TrustPill label={currentDeal.status.replace('_', ' ').toUpperCase()} tone={currentDeal.status === 'disputed' ? 'alert' : 'safe'} />
          </View>

          <View style={styles.feed}>
            {currentDeal.timeline.map((event, index) => (
              <View key={`${event.kind}-${index}`} style={event.actor === 'seller' ? styles.sellerBubble : styles.systemBubble}>
                <Text style={styles.feedActor}>{event.actor === 'system' ? 'PayPaddy' : event.actor}</Text>
                <Text style={styles.feedText}>{event.note ?? event.kind.replace(/_/g, ' ')}</Text>
              </View>
            ))}
          </View>

          {currentDeal.status === 'awaiting_funds' ? (
            <ActionBar
              primaryLabel="Fund this Deal"
              onPrimary={() => router.push({ pathname: '/(app)/deal/[id]/fund/method', params: { id: currentDeal.id } })}
              secondaryLabel="Pay Offline"
              onSecondary={() => router.push('/(app)/(tabs)/agents')}
            />
          ) : ['funded', 'in_progress', 'delivered'].includes(currentDeal.status) ? (
            <ActionBar
              primaryLabel={confirming ? 'Confirming...' : '✓ I got the item'}
              onPrimary={handleConfirm}
              secondaryLabel="Chat"
              onSecondary={() => undefined}
              dangerLabel="Report"
              onDanger={() => router.push({ pathname: '/(app)/deal/[id]/dispute/open', params: { id: currentDeal.id } })}
            />
          ) : currentDeal.status === 'disputed' ? (
            <ActionBar
              primaryLabel="Add Evidence"
              onPrimary={() => router.push({ pathname: '/(app)/deal/[id]/dispute/evidence', params: { id: currentDeal.id, disputeId: 'disp_sneakers' } })}
              secondaryLabel="Admin Review"
              onSecondary={() => router.push('/(app)/admin/disputes')}
            />
          ) : (
            <ActionBar
              primaryLabel="View Receipt"
              onPrimary={() => router.push({ pathname: '/(app)/deal/[id]/receipt', params: { id: currentDeal.id } })}
              secondaryLabel="Back to integrations"
              onSecondary={() => router.push('/(app)/(tabs)/commerce')}
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function Party({ initials, name, state, tone }: { initials: string; name: string; state: string; tone: 'buyer' | 'seller' }) {
  return (
    <View style={styles.party}>
      <View style={[styles.partyAvatar, tone === 'seller' && styles.sellerAvatar]}>
        <Text style={[styles.partyInitials, tone === 'seller' && styles.sellerInitials]}>{initials}</Text>
      </View>
      <Text style={styles.partyName}>{name}</Text>
      <Text style={[styles.partyState, tone === 'buyer' ? styles.paid : styles.delivering]}>{state}</Text>
    </View>
  );
}

const MILESTONE_STATUS_TONE: Record<Milestone['status'], 'safe' | 'alert' | 'neutral'> = {
  pending: 'neutral',
  in_progress: 'neutral',
  delivered: 'safe',
  released: 'safe',
  disputed: 'alert',
};

function MilestoneRow({
  milestone,
  deal,
  viewerIsBuyer,
  viewerIsSeller,
  busy,
  onDeliver,
  onRelease,
}: {
  milestone: Milestone;
  deal: Deal;
  viewerIsBuyer: boolean;
  viewerIsSeller: boolean;
  busy: boolean;
  onDeliver: () => void;
  onRelease: () => void;
}) {
  const sharePct = (milestone.shareBps / 100).toFixed(milestone.shareBps % 100 ? 1 : 0);
  const { fees } = computeMilestonePayout(deal.grossKobo, milestone.shareBps, deal.sellerTier);

  const canDeliver =
    viewerIsSeller &&
    (milestone.status === 'pending' || milestone.status === 'in_progress') &&
    (deal.status === 'funded' || deal.status === 'in_progress');
  const canRelease = viewerIsBuyer && milestone.status === 'delivered';

  return (
    <View style={styles.milestoneCard}>
      <View style={styles.milestoneHead}>
        <View style={styles.milestoneTitleBlock}>
          <Text style={styles.milestoneTitle}>{milestone.title}</Text>
          {milestone.description ? (
            <Text style={styles.milestoneDesc}>{milestone.description}</Text>
          ) : null}
        </View>
        <View style={styles.milestoneSharePill}>
          <Text style={styles.milestoneShareText}>{sharePct}%</Text>
        </View>
      </View>

      <View style={styles.milestoneMeta}>
        <TrustPill
          label={milestone.status.replace('_', ' ').toUpperCase()}
          tone={MILESTONE_STATUS_TONE[milestone.status]}
        />
        <Text style={styles.milestoneNet}>
          {milestone.status === 'released' && milestone.releasedKobo != null
            ? `Paid ${formatNaira(milestone.releasedKobo)}`
            : `Releases ${formatNaira(fees.netToSellerKobo)} to seller`}
        </Text>
      </View>

      {canDeliver && (
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.milestoneBtn, styles.milestoneBtnPrimary, pressed && styles.btnPressed]}
          disabled={busy}
          onPress={onDeliver}
        >
          <Text style={styles.milestoneBtnText}>{busy ? 'Submitting…' : 'Mark delivered'}</Text>
        </Pressable>
      )}
      {canRelease && (
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.milestoneBtn, styles.milestoneBtnRelease, pressed && styles.btnPressed]}
          disabled={busy}
          onPress={onRelease}
        >
          <Text style={[styles.milestoneBtnText, styles.milestoneBtnTextDark]}>
            {busy ? 'Releasing…' : `Release ${formatNaira(fees.netToSellerKobo)}`}
          </Text>
        </Pressable>
      )}
      {milestone.status === 'delivered' && !canRelease && (
        <Text style={styles.milestoneHint}>
          Awaiting buyer release{milestone.autoReleaseAt ? ' · auto-releases after the window expires' : ''}.
        </Text>
      )}
    </View>
  );
}

function LedgerSection({ entries }: { entries: readonly LedgerEntry[] }) {
  const [open, setOpen] = useState(true);
  return (
    <View style={styles.section}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.sectionHead}>
        <Eyebrow>Ledger · provenance chain</Eyebrow>
        <Text style={styles.ledgerToggle}>{open ? 'Hide' : 'Show'} ({entries.length})</Text>
      </Pressable>
      {open && (
        <View style={styles.ledgerCard}>
          {entries.map((e) => (
            <View key={e.index} style={styles.ledgerRow}>
              <Text style={styles.ledgerIndex}>#{String(e.index).padStart(2, '0')}</Text>
              <View style={styles.ledgerBody}>
                <Text style={styles.ledgerKind}>{e.kind.replace(/_/g, ' ')}</Text>
                <Text style={styles.ledgerMeta}>
                  {e.actor} · {new Date(e.at).toLocaleTimeString()}
                  {e.amountKobo > 0 ? ` · ${formatNaira(e.amountKobo)}` : ''}
                </Text>
                <Text style={styles.ledgerHash}>hash {e.hash.slice(0, 12)}…</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  header: { backgroundColor: colors.cream },
  pad: { paddingHorizontal: spacing.lg },
  body: { padding: spacing.lg, gap: spacing.md },
  parties: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radii.md, borderWidth: 1, borderColor: colors.sand, padding: spacing.md },
  party: { alignItems: 'center', width: 62 },
  partyAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.apricot, alignItems: 'center', justifyContent: 'center' },
  sellerAvatar: { backgroundColor: colors.forest },
  partyInitials: { color: colors.ink, fontWeight: '900', fontSize: 11 },
  sellerInitials: { color: colors.cream },
  partyName: { color: colors.charcoal, fontSize: 10, fontWeight: '900', marginTop: 4 },
  partyState: { fontSize: 9, fontWeight: '900', marginTop: 2 },
  paid: { color: colors.emerald },
  delivering: { color: colors.apricot },
  partyLine: { flex: 1, height: 1, backgroundColor: colors.sand },
  handshake: { paddingHorizontal: spacing.sm },
  feeCard: { backgroundColor: '#fff', borderRadius: radii.md, borderWidth: 1, borderColor: colors.sand, padding: spacing.lg },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.sand },
  lastFee: { borderBottomWidth: 0 },
  feeLabel: { color: colors.stone, fontWeight: '700' },
  feeValue: { color: colors.charcoal, fontWeight: '900' },
  safeValue: { color: colors.emerald },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feed: { gap: spacing.sm },
  systemBubble: { backgroundColor: colors.safeBg, borderRadius: radii.sm, padding: spacing.md },
  sellerBubble: { backgroundColor: '#fff', borderRadius: radii.sm, borderWidth: 1, borderColor: colors.sand, padding: spacing.md },
  feedActor: { color: colors.emerald, fontSize: typography.caption.size, fontWeight: '900', textTransform: 'capitalize' },
  feedText: { color: colors.charcoal, fontSize: typography.bodySm.size, fontWeight: '700', marginTop: 2, textTransform: 'capitalize' },
  section: { gap: spacing.sm },
  milestoneCard: { backgroundColor: '#fff', borderRadius: radii.md, borderWidth: 1, borderColor: colors.sand, padding: spacing.md, gap: spacing.sm },
  milestoneHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  milestoneTitleBlock: { flex: 1, gap: 2 },
  milestoneTitle: { color: colors.charcoal, fontWeight: '900', fontSize: typography.body.size },
  milestoneDesc: { color: colors.stone, fontSize: typography.caption.size, fontWeight: '600' },
  milestoneSharePill: { backgroundColor: colors.safeBg, borderRadius: radii.pill, paddingVertical: 4, paddingHorizontal: spacing.sm },
  milestoneShareText: { color: colors.emerald, fontWeight: '900', fontSize: typography.caption.size },
  milestoneMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  milestoneNet: { color: colors.stone, fontSize: typography.caption.size, fontWeight: '700', textAlign: 'right', flexShrink: 1 },
  milestoneBtn: { borderRadius: radii.sm, paddingVertical: spacing.sm, alignItems: 'center', marginTop: 4 },
  milestoneBtnPrimary: { backgroundColor: colors.forest },
  milestoneBtnRelease: { backgroundColor: colors.lime },
  milestoneBtnText: { color: colors.cream, fontWeight: '900', fontSize: typography.bodySm.size },
  milestoneBtnTextDark: { color: colors.ink },
  btnPressed: { opacity: 0.85 },
  milestoneHint: { color: colors.stone, fontSize: typography.caption.size, fontStyle: 'italic', marginTop: 2 },
  ledgerToggle: { color: colors.emerald, fontWeight: '800', fontSize: typography.caption.size },
  ledgerCard: { backgroundColor: '#fff', borderRadius: radii.md, borderWidth: 1, borderColor: colors.sand, paddingVertical: spacing.sm },
  ledgerRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.sand },
  ledgerIndex: { color: colors.stone, fontFamily: typography.monoFamily, fontWeight: '900', fontSize: typography.caption.size, width: 28 },
  ledgerBody: { flex: 1, gap: 2 },
  ledgerKind: { color: colors.charcoal, fontWeight: '900', fontSize: typography.bodySm.size, textTransform: 'capitalize' },
  ledgerMeta: { color: colors.stone, fontSize: typography.caption.size, fontWeight: '600' },
  ledgerHash: { color: colors.emerald, fontFamily: typography.monoFamily, fontSize: 10, fontWeight: '700' },
});
