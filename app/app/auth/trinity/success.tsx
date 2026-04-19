/**
 * Trinity Success screen — shown when all three checks pass.
 *
 * A celebratory moment before dropping into the home tab.
 * Pidgin copy ("We see you, paddy!") maintains the friendly brand voice.
 */

import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Screen } from '@/ui';
import { colors, spacing, typography } from '@/theme';
import { track } from '@/services/analytics';

export default function TrinitySuccessScreen() {
  const router = useRouter();

  function handleContinue() {
    track('trinity.completed');
    router.replace('/(app)/(tabs)');
  }

  return (
    <Screen bg={colors.ink} padH>
      <View style={styles.body}>
        {/* Victory mark */}
        <View style={styles.badge}>
          <Text style={styles.tick}>✓</Text>
        </View>

        <Text style={styles.heading}>TRINITY ✓</Text>
        <Text style={styles.sub}>We see you, paddy!</Text>
        <Text style={styles.detail}>
          Your BVN, NIN, and face dey verified. Your trust score don start
          increasing. You fit now do deals with full protection.
        </Text>

        {/* The three checks summary */}
        <View style={styles.checks}>
          <CheckRow label="BVN" />
          <CheckRow label="NIN" />
          <CheckRow label="Face check" />
        </View>

        <Button label="Enter PayPaddy" onPress={handleContinue} />
      </View>
    </Screen>
  );
}

function CheckRow({ label }: { label: string }) {
  return (
    <View style={styles.checkRow}>
      <View style={styles.checkDot} />
      <Text style={styles.checkLabel}>{label}</Text>
      <Text style={styles.checkVerified}>Verified</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.safeBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.safe,
  },
  tick: { fontSize: 40, color: colors.safe },
  heading: {
    fontSize: typography.h1.size,
    fontWeight: '800',
    color: colors.lime,
    letterSpacing: 1,
  },
  sub: {
    fontSize: typography.h2.size,
    fontWeight: '700',
    color: colors.cream,
    textAlign: 'center',
  },
  detail: {
    fontSize: typography.body.size,
    color: colors.stone,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  checks: {
    alignSelf: 'stretch',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.safe,
  },
  checkLabel: {
    flex: 1,
    fontSize: typography.body.size,
    color: colors.cream,
    fontWeight: '500',
  },
  checkVerified: {
    fontSize: typography.bodySm.size,
    color: colors.safe,
    fontWeight: '700',
  },
});
