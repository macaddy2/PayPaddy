/**
 * Pill — a small inline badge used for statuses, tier labels, and filter chips.
 *
 * Renders uppercase text inside a rounded container. The `tone` prop maps to
 * semantic colours so "verified" is always green, "pending" always amber, etc.
 */

import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

type Tone = 'safe' | 'caution' | 'alert' | 'info' | 'neutral';

type PillProps = {
  label: string;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
};

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  safe: { bg: colors.safeBg, fg: colors.safe },
  caution: { bg: colors.cautionBg, fg: colors.caution },
  alert: { bg: colors.alertBg, fg: colors.alert },
  info: { bg: colors.infoBg, fg: colors.info },
  neutral: { bg: 'rgba(255,255,255,0.08)', fg: colors.stone },
};

export function Pill({ label, tone = 'neutral', style }: PillProps) {
  const { bg, fg } = toneStyles[tone];
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    letterSpacing: 0.6,
  },
});
