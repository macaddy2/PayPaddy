/**
 * TrustBadge — shows a seller's trust score (0–100) as a compact badge.
 *
 * Score ranges map to semantic colours per the PRD's trust-score weighting:
 *   ≥ 80  →  safe (emerald)
 *   60–79 →  caution (amber)
 *   < 60  →  alert (coral)
 *
 * The optional `verified` flag adds a Trinity ✓ checkmark — only shown when
 * all three Trinity checks are confirmed.
 */

import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

type TrustBadgeProps = {
  score: number;
  verified?: boolean;
  style?: StyleProp<ViewStyle>;
};

function scoreColor(score: number): string {
  if (score >= 80) return colors.safe;
  if (score >= 60) return colors.caution;
  return colors.alert;
}

export function TrustBadge({ score, verified = false, style }: TrustBadgeProps) {
  const color = scoreColor(score);
  return (
    <View style={[styles.row, style]}>
      {/* Score chip */}
      <View style={[styles.chip, { borderColor: color }]}>
        <Text style={[styles.score, { color }]}>{score}</Text>
        <Text style={styles.max}>/100</Text>
      </View>
      {/* Trinity verification tick */}
      {verified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>TRINITY ✓</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderWidth: 1.5,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  score: {
    fontSize: typography.h3.size,
    fontWeight: '700',
  },
  max: {
    fontSize: typography.caption.size,
    color: colors.stone,
    fontWeight: '600',
    marginLeft: 1,
  },
  verifiedBadge: {
    backgroundColor: colors.safeBg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  verifiedText: {
    fontSize: typography.caption.size,
    fontWeight: '700',
    color: colors.safe,
    letterSpacing: 0.5,
  },
});
