/**
 * Confirm-received screen — buyer confirms they got the item/service.
 *
 * Shows the fee breakdown so the buyer sees exactly how much the seller
 * receives vs the escrow and SafeGuard fees. Confirmation triggers settlement.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BackHeader, Button, Card, Screen } from '@/ui';
import { useDeal, useDeals } from '@/state';
import { formatNaira, computeFees } from '@/domain/money';
import { colors, spacing, typography } from '@/theme';
import { useState } from 'react';

export default function CompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deal = useDeal(id ?? '');
  const { confirmReceipt } = useDeals();
  const [loading, setLoading] = useState(false);

  if (!deal) return null;

  const currentDeal = deal;
  const fees = computeFees(currentDeal.grossKobo, currentDeal.sellerTier);

  async function handleConfirm() {
    setLoading(true);
    await confirmReceipt(currentDeal.id);
    setLoading(false);
    router.replace({ pathname: '/(app)/deal/[id]/receipt', params: { id: currentDeal.id } });
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Confirm Receipt" />

      <View style={styles.body}>
        <Text style={styles.heading}>You got it?</Text>
        <Text style={styles.sub}>
          Confirm that you received "{currentDeal.title}" and the deal is settled.
          This releases the funds to the seller.
        </Text>

        {/* Fee breakdown */}
        <Card>
          <Text style={styles.breakdownTitle}>Fee Breakdown</Text>
          <FeeRow label="Deal amount" value={fees.grossKobo} />
          <FeeRow label={`Escrow fee (${currentDeal.sellerTier})`} value={-fees.escrowFeeKobo} />
          <FeeRow label="SafeGuard levy" value={-fees.safeguardKobo} />
          <View style={styles.divider} />
          <FeeRow label="Seller receives" value={fees.netToSellerKobo} highlight />
        </Card>

        {/* Dispute reminder */}
        <View style={styles.disputeNote}>
          <Text style={styles.disputeNoteText}>
            🛡 If something is wrong, go back and open a dispute instead.
            Once you confirm, the payment releases immediately.
          </Text>
        </View>

        <Button label={loading ? 'Confirming…' : 'Yes, I received it'} onPress={handleConfirm} loading={loading} />
        <Button
          label="Something is wrong — dispute"
          onPress={() => router.push({ pathname: '/(app)/deal/[id]/dispute/open', params: { id: currentDeal.id } })}
          variant="danger"
        />
      </View>
    </Screen>
  );
}

function FeeRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  const isNeg = value < 0;
  return (
    <View style={styles.feeRow}>
      <Text style={styles.feeLabel}>{label}</Text>
      <Text style={[styles.feeValue, isNeg && styles.feeNeg, highlight && styles.feeHighlight]}>
        {isNeg ? '-' : ''}{formatNaira(Math.abs(value))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.lg },
  heading: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.cream,
  },
  sub: { fontSize: typography.body.size, color: colors.stone, lineHeight: 22 },
  breakdownTitle: {
    fontSize: typography.bodySm.size,
    fontWeight: '700',
    color: colors.stone,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  feeLabel: { fontSize: typography.bodySm.size, color: colors.stone, fontWeight: '500' },
  feeValue: { fontSize: typography.bodySm.size, color: colors.cream, fontWeight: '600' },
  feeNeg: { color: colors.coral },
  feeHighlight: { color: colors.lime, fontSize: typography.body.size, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.sand, marginVertical: spacing.sm },
  disputeNote: {
    backgroundColor: colors.alertBg,
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.alert,
  },
  disputeNoteText: { fontSize: typography.bodySm.size, color: colors.cream, lineHeight: 20 },
});
