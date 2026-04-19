/**
 * BackHeader — a minimal navigation header with a back arrow and optional title.
 *
 * Placed at the top of stack screens where expo-router's default header is
 * hidden (headerShown: false) so we control exact layout.
 */

import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type BackHeaderProps = {
  title?: string;
  /** Override the back destination. Default: `router.back()`. */
  onBack?: () => void;
  /** Right-side element (e.g. a share icon). */
  right?: React.ReactNode;
};

export function BackHeader({ title, onBack, right }: BackHeaderProps) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={onBack ?? (() => router.back())}
        style={styles.backBtn}
        hitSlop={16}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        {/* Chevron using a simple drawn shape avoids an icon-font dependency. */}
        <Text style={styles.arrow}>←</Text>
      </TouchableOpacity>

      {title ? <Text style={styles.title}>{title}</Text> : <View style={styles.flex} />}

      <View style={styles.rightSlot}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: { padding: spacing.xs },
  arrow: {
    fontSize: 22,
    color: colors.cream,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.h3.size,
    fontWeight: typography.h3.weight,
    color: colors.cream,
    marginHorizontal: spacing.sm,
  },
  flex: { flex: 1 },
  rightSlot: { minWidth: 36, alignItems: 'flex-end' },
});
