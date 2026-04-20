/**
 * Card — the standard container surface.
 *
 * Used for deal rows, escrow balance display, agent cards, etc.
 * Pass `accent` to draw a left-edge colour strip (used for urgent deals).
 */

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, elevation, radii, spacing } from '@/theme';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Draws a 4px left strip in this colour — used for urgency / status. */
  accent?: string;
  /** When true, background is cream (light card on dark screen). */
  light?: boolean;
};

export function Card({ children, style, accent, light = false }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        light ? styles.cardLight : styles.cardDark,
        accent ? styles.hasAccent : null,
        style,
      ]}
    >
      {/* Left accent strip */}
      {accent && <View style={[styles.accent, { backgroundColor: accent }]} />}
      <View style={[styles.content, accent ? styles.contentPadded : null]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    overflow: 'hidden',
    ...elevation.card,
  },
  cardDark: { backgroundColor: colors.forest },
  cardLight: { backgroundColor: colors.cream },
  hasAccent: { flexDirection: 'row' },
  accent: { width: 4 },
  content: { flex: 1, padding: spacing.lg },
  contentPadded: { paddingLeft: spacing.md },
});
