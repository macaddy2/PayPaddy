/**
 * Fund Collateral screen — lock the stake and register as a seller.
 *
 * In MVP: button calls the mock API which stubs the bank transfer and
 * registers the seller. Real implementation integrates Paystack or Providus
 * virtual account for the stake transfer.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BackHeader, Button, Screen } from '@/ui';
import { useAuth, useSeller } from '@/state';
import { COLLATERAL_YIELD, TIERS } from '@/domain/constants';
import { formatNaira } from '@/domain/money';
import { colors, spacing, typography } from '@/theme';
import type { TierKey } from '@/domain/constants';

export default function FundCollateralScreen() {
  const { tier } = useLocalSearchParams<{ tier: TierKey }>();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { stake, loading } = useSeller();

  const resolvedTier: TierKey = tier === 'gold' ? 'gold' : 'silver';
  const cfg = TIERS[resolvedTier];

  async function handleLock() {
    if (!user) return;
    try {
      await stake(user.id, resolvedTier);
      router.replace('/(app)/sell/dashboard');
    } catch {
      Alert.alert('Error', 'Could not lock collateral. Please try again.');
    }
  }

  const monthlyYield = Math.round((cfg.stakeKobo * (COLLATERAL_YIELD.annualPct / 100)) / 12);

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Lock Collateral" />

      <View style={styles.body}>
        <Text style={styles.heading}>Lock your {cfg.label} stake</Text>
        <Text style={styles.sub}>
          Transfer the stake into your PayPaddy collateral account.
          It earns T-bill yield and is only at risk if you commit fraud.
        </Text>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <SummaryRow label="Tier" value={cfg.label} />
          <SummaryRow label="Stake to lock" value={formatNaira(cfg.stakeKobo)} highlight />
          <SummaryRow label="Monthly yield (~)" value={`+${formatNaira(monthlyYield)}`} safe />
          <SummaryRow label="Fraud slash rate" value={`${cfg.slashRate * 100}%`} warn />
          <SummaryRow label="Monthly tx limit" value={formatNaira(cfg.monthlyLimitKobo)} />
        </View>

        {/* Transfer instruction placeholder */}
        <View style={styles.transferNote}>
          <Text style={styles.transferTitle}>How it works</Text>
          <Text style={styles.transferText}>
            1. Tap "Lock Stake" below.{'\n'}
            2. A Providus virtual account will be shown (real integration upcoming).{'\n'}
            3. Transfer the exact amount.{'\n'}
            4. Once confirmed, your {cfg.label} badge is activated within 10 minutes.
          </Text>
        </View>

        <Button label={loading ? 'Locking…' : `Lock ${formatNaira(cfg.stakeKobo)} Stake`} onPress={handleLock} loading={loading} />
        <Button label="Choose a different tier" onPress={() => router.back()} variant="ghost" />
      </View>
    </Screen>
  );
}

function SummaryRow({ label, value, highlight, safe, warn }: {
  label: string; value: string; highlight?: boolean; safe?: boolean; warn?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[
        styles.rowValue,
        highlight && styles.rowHighlight,
        safe && styles.rowSafe,
        warn && styles.rowWarn,
      ]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.lg },
  heading: { fontSize: typography.h2.size, fontWeight: typography.h2.weight, color: colors.cream },
  sub: { fontSize: typography.body.size, color: colors.stone, lineHeight: 22 },
  summaryCard: {
    backgroundColor: colors.forest,
    borderRadius: 14,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: typography.bodySm.size, color: colors.stone },
  rowValue: { fontSize: typography.bodySm.size, color: colors.cream, fontWeight: '600' },
  rowHighlight: { color: colors.lime, fontSize: typography.body.size, fontWeight: '800' },
  rowSafe: { color: colors.safe },
  rowWarn: { color: colors.caution },
  transferNote: { backgroundColor: colors.forest, borderRadius: 12, padding: spacing.lg, gap: spacing.sm },
  transferTitle: { fontSize: typography.body.size, fontWeight: '700', color: colors.cream },
  transferText: { fontSize: typography.bodySm.size, color: colors.stone, lineHeight: 22 },
});
