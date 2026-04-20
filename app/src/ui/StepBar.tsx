/**
 * StepBar — a horizontal progress indicator for multi-step flows.
 *
 * Used on the Trinity verification flow (3 steps) and any wizard-style screen.
 * Completed steps are filled lime; the active step is emerald; upcoming steps
 * are dim stone.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

type StepBarProps = {
  steps: string[];
  /** 0-based index of the currently active step. */
  activeIndex: number;
};

export function StepBar({ steps, activeIndex }: StepBarProps) {
  return (
    <View style={styles.row}>
      {steps.map((label, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <React.Fragment key={label}>
            {/* Connector line between dots */}
            {i > 0 && (
              <View
                style={[styles.connector, done && styles.connectorDone]}
              />
            )}
            <View style={styles.stepCol}>
              {/* Circle dot */}
              <View
                style={[
                  styles.dot,
                  done && styles.dotDone,
                  active && styles.dotActive,
                ]}
              >
                {done && <Text style={styles.check}>✓</Text>}
                {!done && (
                  <Text
                    style={[
                      styles.dotNumber,
                      active && styles.dotNumberActive,
                    ]}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              {/* Label below the dot */}
              <Text
                style={[
                  styles.label,
                  done && styles.labelDone,
                  active && styles.labelActive,
                ]}
              >
                {label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  stepCol: { alignItems: 'center', width: 64 },
  connector: {
    height: 2,
    flex: 1,
    marginTop: 14, // aligns to centre of dot
    backgroundColor: colors.stone,
    opacity: 0.3,
  },
  connectorDone: { backgroundColor: colors.lime, opacity: 1 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.lime },
  dotActive: { backgroundColor: colors.emerald },
  dotNumber: {
    fontSize: typography.caption.size,
    fontWeight: '700',
    color: colors.stone,
  },
  dotNumberActive: { color: '#fff' },
  check: { fontSize: 12, fontWeight: '700', color: colors.ink },
  label: {
    marginTop: spacing.xs,
    fontSize: typography.caption.size,
    fontWeight: '600',
    color: colors.stone,
    textAlign: 'center',
  },
  labelDone: { color: colors.lime },
  labelActive: { color: colors.cream },
});
