/**
 * Screen — the root wrapper every screen renders inside.
 *
 * Handles SafeAreaView, background color, and the optional scroll variant.
 * Screens should not import SafeAreaView directly; use this instead so we
 * have one place to tweak global screen padding.
 */

import React from 'react';
import { Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

type ScreenProps = {
  children: React.ReactNode;
  /** Defaults to `colors.ink` (dark). Pass `colors.cream` for light screens. */
  bg?: string;
  /** Pad horizontal sides. Default true. */
  padH?: boolean;
  /** Wrap content in a ScrollView. Default false. */
  scroll?: boolean;
  /** Safe-area edges to inset. Default ['top','bottom']. */
  edges?: Edge[];
  style?: ViewStyle;
};

export function Screen({
  children,
  bg = colors.ink,
  padH = true,
  scroll = false,
  edges = ['top', 'bottom'],
  style,
}: ScreenProps) {
  const inner = (
    <View
      style={[
        styles.inner,
        padH && styles.padH,
        { backgroundColor: bg },
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: bg }]} edges={edges}>
      {scroll ? (
        <View style={styles.webShell}>
          <ScrollView
            contentContainerStyle={[styles.scrollInner, padH && styles.padH, style]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.webShell}>{inner}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center' },
  webShell: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
  },
  inner: { flex: 1 },
  scrollInner: { flexGrow: 1 },
  padH: { paddingHorizontal: spacing.lg },
});
