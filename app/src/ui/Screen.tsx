/**
 * Screen — the root wrapper every screen renders inside.
 *
 * Handles SafeAreaView, background color, the optional scroll variant, and
 * the responsive web shell. On mobile the column is full-bleed; on a wide
 * web viewport the column is capped at a phone-ish width, centred on a dim
 * stage with rounded corners — so the deployed site looks intentional
 * instead of a stretched mobile screen.
 */

import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, radii, spacing } from '@/theme';

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

const WEB_COLUMN_MAX = 480;
const WEB_FRAME_BREAKPOINT = 600;
const STAGE_BG = '#050D0B';

export function Screen({
  children,
  bg = colors.ink,
  padH = true,
  scroll = false,
  edges = ['top', 'bottom'],
  style,
}: ScreenProps) {
  const { width } = useWindowDimensions();
  const isWebFrame = Platform.OS === 'web' && width >= WEB_FRAME_BREAKPOINT;

  // On a wide web viewport the outer SafeArea becomes the "stage" behind
  // the centred column; on mobile (or narrow web) the stage matches the
  // screen bg so there is no visible chrome.
  const stageBg = isWebFrame ? STAGE_BG : bg;

  const inner = (
    <View
      style={[
        styles.inner,
        padH && styles.padH,
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: stageBg }]} edges={edges}>
      <View
        style={[
          styles.column,
          { backgroundColor: bg },
          isWebFrame && styles.columnFramed,
        ]}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.scrollInner, padH && styles.padH, style]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          inner
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center' },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? WEB_COLUMN_MAX : undefined,
  },
  columnFramed: {
    borderRadius: radii.lg,
    marginVertical: spacing.xl,
    overflow: 'hidden',
    // Lift the column off the stage. RN-web converts shadow* props into a
    // CSS box-shadow; on native this branch is never reached (isWebFrame
    // requires Platform.OS === 'web').
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 20 },
  },
  inner: { flex: 1 },
  scrollInner: { flexGrow: 1 },
  padH: { paddingHorizontal: spacing.lg },
});
