/**
 * Button — the primary interactive control in the app.
 *
 * Variants map to the v2 design language:
 *   • primary   — lime background, ink text (the CTA of a screen)
 *   • secondary — ink/forest background, cream text (supporting action)
 *   • danger    — alert-red background, white text (destructive / disputes)
 *   • ghost     — transparent, lime-text label (lowest-weight option)
 */

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Full-width by default. Set false to let it size to content. */
  fullWidth?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.ink : colors.lime} size="small" />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label` as `${Variant}Label`]]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.4 },

  // --- variant backgrounds ---
  primary: { backgroundColor: colors.lime },
  secondary: { backgroundColor: colors.forest },
  danger: { backgroundColor: colors.alert },
  ghost: { backgroundColor: 'transparent' },

  // --- variant label colours ---
  primaryLabel: {
    color: colors.ink,
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
    letterSpacing: -0.3,
  },
  secondaryLabel: {
    color: colors.cream,
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
  },
  dangerLabel: {
    color: '#fff',
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
  },
  ghostLabel: {
    color: colors.lime,
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
  },
});
