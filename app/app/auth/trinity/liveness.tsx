/**
 * Trinity Step 3 — Liveness check via Smile ID (mocked).
 *
 * SLA: ≤ 8s (PRD). The mock finishes in ~7.5s so the loading indicator
 * accurately represents the real provider latency.
 *
 * In a real app this screen would open a Smile ID hosted WebView session URL
 * and wait for its completion callback. The mock skips that and simply marks
 * liveness as verified after the delay.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BackHeader, Button, Screen, StepBar } from '@/ui';
import { useAuth } from '@/state';
import { colors, spacing, typography } from '@/theme';
import { track } from '@/services/analytics';

const STEPS = ['BVN', 'NIN', 'Face'];

export default function LivenessScreen() {
  const router = useRouter();
  const { verifyLiveness, trinityLoading } = useAuth();
  const [started, setStarted] = useState(false);
  const loading = trinityLoading.liveness;

  async function handleStart() {
    setStarted(true);
    track('trinity.liveness_started');
    const status = await verifyLiveness();
    if (status === 'verified') {
      track('trinity.liveness_verified');
      router.replace('/auth/trinity/success');
    }
  }

  return (
    <Screen bg={colors.ink} padH>
      <BackHeader title="Identity Check" />
      <StepBar steps={STEPS} activeIndex={2} />

      <View style={styles.body}>
        {/* Camera placeholder — real Smile ID SDK replaces this View. */}
        <View style={styles.cameraBox}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color={colors.lime} />
              <Text style={styles.scanningText}>Scanning your face…</Text>
            </>
          ) : started ? (
            <Text style={styles.doneText}>✓</Text>
          ) : (
            <Text style={styles.cameraIcon}>📷</Text>
          )}
        </View>

        <Text style={styles.heading}>Face verification</Text>
        <Text style={styles.sub}>
          We dey take a quick selfie to confirm say na you. This go take less
          than 8 seconds. Make sure your face is well-lit.
        </Text>

        <View style={styles.tips}>
          <Text style={styles.tip}>✓ Remove glasses or hats</Text>
          <Text style={styles.tip}>✓ Good lighting, no shadow</Text>
          <Text style={styles.tip}>✓ Hold phone at eye level</Text>
        </View>

        <Button
          label={loading ? 'Verifying...' : 'Start Face Check'}
          onPress={handleStart}
          loading={loading}
          disabled={started && !loading}
        />

        <Text style={styles.privacy}>
          🔒 Your biometric data is processed by Smile ID and never stored by PayPaddy.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingTop: spacing.lg, gap: spacing.lg, justifyContent: 'center' },
  cameraBox: {
    height: 200,
    backgroundColor: colors.forest,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.sand,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  cameraIcon: { fontSize: 48 },
  scanningText: {
    fontSize: typography.body.size,
    color: colors.lime,
    fontWeight: '600',
  },
  doneText: { fontSize: 48, color: colors.safe },
  heading: {
    fontSize: typography.h2.size,
    fontWeight: typography.h2.weight,
    color: colors.cream,
  },
  sub: {
    fontSize: typography.body.size,
    color: colors.stone,
    lineHeight: 22,
  },
  tips: { gap: spacing.sm },
  tip: {
    fontSize: typography.bodySm.size,
    color: colors.emerald,
    fontWeight: '500',
  },
  privacy: {
    fontSize: typography.caption.size,
    color: colors.stone,
    textAlign: 'center',
    lineHeight: 18,
  },
});
