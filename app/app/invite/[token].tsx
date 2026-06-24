/**
 * Public invite landing page (NOT inside the `(app)/` group, so the auth
 * guard does not redirect).
 *
 * Shows the counterparty a read-only summary of the deal terms they've been
 * invited into. If they're not signed in yet, the CTA routes them through
 * phone OTP and back here via `?next=`. If they are signed in (or come back
 * post-auth), they can accept the invite, decline, or jump into the
 * negotiation editor.
 *
 * Real-backend swap: the token would resolve over a public read-only endpoint;
 * accept would write to the same DB row the initiator owns. The shape of
 * `useDeal(...)` already matches what the API surface returns.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BackHeader, Button, Screen } from '@/ui';
import { useAuth, useDeals, useDeal } from '@/state';
import { api } from '@/services/api';
import { formatNaira } from '@/domain/money';
import { colors, radii, spacing, typography } from '@/theme';

export default function InviteLandingScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const user = useAuth((s) => s.user);
  const { acceptInvite, loadOne } = useDeals();

  const [dealId, setDealId] = useState<string | null>(null);
  const [loadingDeal, setLoadingDeal] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  // MOCK: resolve the token → dealId via the public-token API (no auth needed).
  // In a real backend, the token would carry the dealId via a signed JWT or
  // server-side lookup.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!token) return;
      try {
        const result = await api.deals.lookupInviteToken(token);
        if (!cancelled) {
          setDealId(result.dealId);
          await loadOne(result.dealId);
        }
      } catch (e) {
        if (!cancelled) setTokenError((e as Error).message);
      } finally {
        if (!cancelled) setLoadingDeal(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, loadOne]);

  const deal = useDeal(dealId ?? '');

  const isInitiator = useMemo(() => {
    if (!deal || !user) return false;
    const initId = deal.initiatorRole === 'buyer' ? deal.buyerId : deal.sellerId;
    return user.id === initId;
  }, [deal, user]);

  const alreadyAccepted = !!deal?.counterparty?.userId;

  async function handleSignIn() {
    router.push({ pathname: '/auth/phone', params: { next: `/invite/${token}` } });
  }

  async function handleAccept() {
    if (!user || !token) return;
    if (isInitiator) {
      Alert.alert('That\'s your own invite', 'Open this link as the counterparty to accept the contract.');
      return;
    }
    setAccepting(true);
    try {
      const updated = await acceptInvite(token, user.id);
      router.replace({ pathname: '/(app)/deal/[id]', params: { id: updated.id } });
    } catch (e) {
      Alert.alert('Could not accept invite', (e as Error).message);
    } finally {
      setAccepting(false);
    }
  }

  if (loadingDeal) {
    return (
      <Screen bg={colors.ink} padH>
        <BackHeader title="Invite" />
        <Text style={styles.subtle}>Loading invite…</Text>
      </Screen>
    );
  }

  if (tokenError || !deal) {
    return (
      <Screen bg={colors.ink} padH>
        <BackHeader title="Invite" />
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>This invite isn't valid</Text>
          <Text style={styles.subtle}>{tokenError ?? 'The link may have expired or been withdrawn by the initiator.'}</Text>
        </View>
        <Button label="Go home" onPress={() => router.replace('/welcome')} />
      </Screen>
    );
  }

  const cp = deal.counterparty!;
  const cpRoleLabel = cp.role === 'seller' ? 'Seller' : 'Buyer';
  const milestoneCount = deal.milestones?.length ?? 0;
  const fundLabel = deal.fundingMode === 'fund_first' ? 'Already funded (proof of funds)' : 'Fund after we agree';

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Contract invite" />

      <View style={styles.body}>
        <Text style={styles.heading}>You've been invited</Text>
        <Text style={styles.subDesc}>
          Review the terms below. You'll be able to propose amendments before you endorse the
          contract — once both sides sign, the terms are locked.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>CONTRACT SUMMARY</Text>
          <SummaryRow label="Title" value={deal.title} />
          {deal.description ? <SummaryRow label="Scope" value={deal.description} /> : null}
          <SummaryRow label="Amount" value={formatNaira(deal.grossKobo)} />
          <SummaryRow label="Your role" value={cpRoleLabel} />
          <SummaryRow label="Funding" value={fundLabel} />
          <SummaryRow
            label="Stages"
            value={milestoneCount > 0 ? `${milestoneCount} milestone${milestoneCount === 1 ? '' : 's'}` : 'Single payout'}
          />
        </View>

        {deal.milestones && deal.milestones.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>MILESTONE BREAKDOWN</Text>
            {deal.milestones.map((m, i) => (
              <View key={m.id} style={styles.milestoneRow}>
                <Text style={styles.milestoneIndex}>{i + 1}</Text>
                <Text style={styles.milestoneTitle}>{m.title}</Text>
                <Text style={styles.milestoneShare}>{(m.shareBps / 100).toFixed(0)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA block */}
        {!user ? (
          <View style={styles.ctaCard}>
            <Text style={styles.subtle}>
              Sign in to accept or propose amendments. PayPaddy never shares your contact details
              with the other side beyond what they've already entered.
            </Text>
            <Button label="Sign in to accept" onPress={handleSignIn} />
          </View>
        ) : alreadyAccepted ? (
          <View style={styles.ctaCard}>
            <Text style={styles.subtle}>You've already joined this contract.</Text>
            <Button
              label="Open the deal board"
              onPress={() => router.replace({ pathname: '/(app)/deal/[id]', params: { id: deal.id } })}
            />
          </View>
        ) : isInitiator ? (
          <View style={styles.ctaCard}>
            <Text style={styles.subtle}>
              This is your own invite — open it from a counterparty's device (or sign in as them)
              to step through the acceptance flow.
            </Text>
            <Button
              label="Back to your deal board"
              variant="secondary"
              onPress={() => router.replace({ pathname: '/(app)/deal/[id]', params: { id: deal.id } })}
            />
          </View>
        ) : (
          <View style={styles.ctaCard}>
            <Button label="Accept and join" loading={accepting} onPress={handleAccept} />
            <Button
              label="View first, decide later"
              variant="secondary"
              onPress={() => router.replace({ pathname: '/(app)/deal/[id]', params: { id: deal.id } })}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryRowLabel}>{label}</Text>
      <Text style={styles.summaryRowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.lg },
  heading: { fontSize: typography.h2.size, fontWeight: typography.h2.weight, color: colors.cream },
  subDesc: { color: colors.stone, fontSize: typography.body.size, lineHeight: 22 },
  subtle: { color: colors.stone, fontSize: typography.bodySm.size, fontWeight: '500', lineHeight: 20 },
  cardLabel: { fontSize: typography.caption.size, fontWeight: '700', color: colors.stone, letterSpacing: 0.8 },
  summaryCard: {
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.emerald,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  summaryRowLabel: { color: colors.stone, fontSize: typography.bodySm.size, fontWeight: '600' },
  summaryRowValue: { color: colors.cream, fontSize: typography.bodySm.size, fontWeight: '700', textAlign: 'right', flex: 1 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  milestoneIndex: { color: colors.lime, fontWeight: '900', width: 18, textAlign: 'center', fontSize: typography.bodySm.size },
  milestoneTitle: { color: colors.cream, fontSize: typography.bodySm.size, fontWeight: '600', flex: 1 },
  milestoneShare: { color: colors.lime, fontWeight: '900', fontSize: typography.bodySm.size },
  ctaCard: { gap: spacing.md },
  errorCard: {
    backgroundColor: colors.alertBg,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.alert,
  },
  errorTitle: { color: colors.alert, fontWeight: '900', fontSize: typography.body.size },
});
