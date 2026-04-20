/**
 * Tier selection — Silver vs Gold collateral staking.
 *
 * Surfaces:
 *  • Stake amounts (from domain constants, never hard-coded).
 *  • Monthly limit per tier.
 *  • T-bill yield as an incentive — collateral earns while locked.
 *  • Fraud slash rate so sellers understand the risk.
 *
 * The seller taps a tier, is shown the fund-collateral screen next.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BackHeader, Button, Screen } from '@/ui';
import { COLLATERAL_YIELD, TIERS } from '@/domain/constants';
import { formatNaira } from '@/domain/money';
import { colors, radii, spacing, typography } from '@/theme';
import type { TierKey } from '@/domain/constants';

export default function TierScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<TierKey>('silver');

  const cfg = TIERS[selected];

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Choose Your Tier" />

      <View style={styles.body}>
        <Text style={styles.heading}>Start selling on PayPaddy</Text>
        <Text style={styles.sub}>
          Lock collateral to get verified. Sellers with skin-in-the-game earn
          buyer trust — and earn T-bill yield while they wait.
        </Text>

        {/* Tier cards */}
        <View style={styles.tiers}>
          {(Object.keys(TIERS) as TierKey[]).map((key) => {
            const t = TIERS[key];
            const active = selected === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.tierCard, active && styles.tierCardActive]}
                onPress={() => setSelected(key)}
                activeOpacity={0.85}
              >
                <View style={styles.tierHeader}>
                  <Text style={styles.tierLabel}>{t.label}</Text>
                  {key === 'gold' && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>POPULAR</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.tierStake}>{formatNaira(t.stakeKobo)}</Text>
                <Text style={styles.tierStakeLabel}>minimum stake</Text>

                <View style={styles.tierDetails}>
                  <DetailRow label="Monthly limit" value={formatNaira(t.monthlyLimitKobo)} />
                  <DetailRow label="Yield on stake" value={`${COLLATERAL_YIELD.annualPct}% / year`} />
                  <DetailRow label="Escrow fee" value={`${t.escrowFeeBps / 100}%`} />
                  <DetailRow label="Fraud slash" value={`${t.slashRate * 100}% of stake`} warn />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Collateral explainer */}
        <View style={styles.explainer}>
          <Text style={styles.explainerText}>
            🏦 Your stake is held in a T-bill investment account. It earns{' '}
            {COLLATERAL_YIELD.annualPct}% annual yield while locked. You can
            withdraw it only when your account is in good standing.
          </Text>
        </View>

        <Button
          label={`Lock ${cfg.label} Tier Stake →`}
          onPress={() => router.push({ pathname: '/(app)/sell/fund-collateral', params: { tier: selected } })}
        />
      </View>
    </Screen>
  );
}

function DetailRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, warn && styles.detailWarn]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.lg },
  heading: { fontSize: typography.h2.size, fontWeight: typography.h2.weight, color: colors.cream },
  sub: { fontSize: typography.body.size, color: colors.stone, lineHeight: 22 },
  tiers: { gap: spacing.md },
  tierCard: {
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.sm,
  },
  tierCardActive: { borderColor: colors.lime },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierLabel: { fontSize: typography.h3.size, fontWeight: '700', color: colors.cream },
  popularBadge: {
    backgroundColor: colors.cautionBg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  popularText: { fontSize: 9, fontWeight: '800', color: colors.caution, letterSpacing: 1 },
  tierStake: { fontSize: typography.display.size, fontWeight: '800', color: colors.lime },
  tierStakeLabel: { fontSize: typography.caption.size, color: colors.stone, fontWeight: '600' },
  tierDetails: { gap: spacing.sm, marginTop: spacing.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: typography.bodySm.size, color: colors.stone },
  detailValue: { fontSize: typography.bodySm.size, color: colors.cream, fontWeight: '600' },
  detailWarn: { color: colors.caution },
  explainer: {
    backgroundColor: colors.forest,
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.emerald,
  },
  explainerText: { fontSize: typography.bodySm.size, color: colors.cream, lineHeight: 20 },
});
