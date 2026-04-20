/**
 * Dispute Resolved screen — shows the verdict and payout breakdown.
 *
 * Breaks down exactly how the buyer refund was funded:
 *  1. Seller's collateral (slashed at the tier rate).
 *  2. SafeGuard pool top-up (if collateral was insufficient).
 *
 * This transparency is a core trust differentiator — buyers can see the
 * system worked as promised.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen } from '@/ui';
import { api } from '@/services/api';
import { formatNaira } from '@/domain/money';
import { colors, spacing, typography } from '@/theme';
import type { Dispute } from '@/domain/schema';

export default function DisputeResolvedScreen() {
  const { disputeId } = useLocalSearchParams<{ disputeId: string }>();
  const router = useRouter();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!disputeId) return;
    void api.disputes.get(disputeId).then((d) => {
      setDispute(d);
      setLoading(false);
    });
  }, [disputeId]);

  if (loading || !dispute) {
    return (
      <Screen bg={colors.ink} padH>
        <ActivityIndicator color={colors.lime} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  const buyerWins = dispute.verdict === 'buyer_wins';
  const payout = dispute.payout;

  return (
    <Screen bg={colors.ink} padH scroll>
      <View style={styles.body}>
        {/* Verdict banner */}
        <View style={[styles.verdictBadge, buyerWins ? styles.verdictSafe : styles.verdictAlert]}>
          <Text style={styles.verdictIcon}>{buyerWins ? '✓' : '×'}</Text>
          <View>
            <Text style={styles.verdictTitle}>
              {buyerWins ? 'Dispute resolved — you win' : 'Dispute resolved — seller wins'}
            </Text>
            <Text style={styles.verdictSub}>
              {buyerWins
                ? 'Funds are being returned to your wallet.'
                : 'Funds have been released to the seller.'}
            </Text>
          </View>
        </View>

        {/* Payout breakdown — transparency */}
        {payout && buyerWins && (
          <Card>
            <Text style={styles.breakdownTitle}>HOW YOUR REFUND WAS FUNDED</Text>

            <PayoutRow label="From seller collateral" value={payout.fromCollateralKobo} />
            {payout.fromSafeguardPoolKobo > 0 && (
              <PayoutRow
                label="From SafeGuard pool 🛡"
                value={payout.fromSafeguardPoolKobo}
                info
              />
            )}
            <View style={styles.divider} />
            <PayoutRow label="Total refund to you" value={payout.toBuyerKobo} highlight />
          </Card>
        )}

        {/* SafeGuard explainer */}
        {payout && payout.fromSafeguardPoolKobo > 0 && (
          <View style={styles.safeguardNote}>
            <Text style={styles.safeguardTitle}>What's the SafeGuard pool?</Text>
            <Text style={styles.safeguardText}>
              Every PayPaddy transaction contributes 2% of the escrow fee into
              a community insurance pool. When a seller's collateral isn't enough
              to cover the refund, the pool tops it up — automatically.
            </Text>
          </View>
        )}

        <Button label="Back to Home" onPress={() => router.replace('/(app)/(tabs)')} />
      </View>
    </Screen>
  );
}

function PayoutRow({
  label,
  value,
  highlight,
  info,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  info?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, info && styles.rowInfo]}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowHighlight]}>
        {formatNaira(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.xl, gap: spacing.lg },
  verdictBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderRadius: 14,
    padding: spacing.lg,
  },
  verdictSafe: { backgroundColor: colors.safeBg, borderWidth: 1, borderColor: colors.safe },
  verdictAlert: { backgroundColor: colors.alertBg, borderWidth: 1, borderColor: colors.alert },
  verdictIcon: { fontSize: 28, marginTop: 2 },
  verdictTitle: {
    fontSize: typography.body.size,
    fontWeight: '700',
    color: colors.cream,
    marginBottom: 4,
  },
  verdictSub: { fontSize: typography.bodySm.size, color: colors.stone, lineHeight: 18 },
  breakdownTitle: {
    fontSize: typography.caption.size,
    fontWeight: '700',
    color: colors.stone,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand,
  },
  rowLabel: { fontSize: typography.bodySm.size, color: colors.stone, fontWeight: '500' },
  rowInfo: { color: colors.info },
  rowValue: { fontSize: typography.bodySm.size, color: colors.cream, fontWeight: '600' },
  rowHighlight: { color: colors.lime, fontSize: typography.body.size, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.sand, marginVertical: spacing.xs },
  safeguardNote: {
    backgroundColor: colors.infoBg,
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  safeguardTitle: {
    fontSize: typography.body.size,
    fontWeight: '700',
    color: colors.info,
    marginBottom: spacing.sm,
  },
  safeguardText: { fontSize: typography.bodySm.size, color: colors.cream, lineHeight: 20 },
});
