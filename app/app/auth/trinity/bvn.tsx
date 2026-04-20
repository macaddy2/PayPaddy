/**
 * Trinity Step 1 — BVN verification via Dojah (mocked).
 *
 * SLA: PRD requires the BVN check to complete in ≤ 5s. The mock adapter
 * takes ~4.5s so loading-state UX can be tested realistically.
 *
 * The whole Trinity wall must complete in < 30s (PRD account-creation budget),
 * so this screen pre-warms the NIN lookup (deferred placeholder — in a real
 * app this would prefetch a session token).
 *
 * Failure path: BVN `00000000000` shows an explicit failed state with a
 * retry option so the UI is never a dead end.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BackHeader, Button, Screen, StepBar } from '@/ui';
import { useAuth } from '@/state';
import { colors, spacing, typography } from '@/theme';
import { track } from '@/services/analytics';

const STEPS = ['BVN', 'NIN', 'Face'];

export default function BvnScreen() {
  const router = useRouter();
  const { verifyBvn, trinityLoading } = useAuth();
  const [bvn, setBvn] = useState('');
  const [failed, setFailed] = useState(false);

  const loading = trinityLoading.bvn;

  function isValid() {
    return /^\d{11}$/.test(bvn);
  }

  async function handleVerify() {
    if (!isValid()) return;
    setFailed(false);
    track('trinity.bvn_attempted');
    const status = await verifyBvn(bvn);
    if (status === 'verified') {
      track('trinity.bvn_verified');
      router.push('/auth/trinity/nin');
    } else {
      setFailed(true);
      track('trinity.bvn_failed');
    }
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Identity Check" />
      <StepBar steps={STEPS} activeIndex={0} />

      <View style={styles.body}>
        <Text style={styles.heading}>Enter your BVN</Text>
        <Text style={styles.sub}>
          Your Bank Verification Number (BVN) confirms you're a real person.
          We don't store the raw number — only a masked reference.
        </Text>

        {/* Why BVN explainer */}
        <View style={styles.explainer}>
          <Text style={styles.explainerText}>
            🔒 Your BVN is verified with NIBSS, not stored on our servers.
            Nobody go see your BVN. Trust your paddy.
          </Text>
        </View>

        <TextInput
          style={[styles.input, failed && styles.inputError]}
          value={bvn}
          onChangeText={(v) => { setBvn(v); setFailed(false); }}
          keyboardType="number-pad"
          maxLength={11}
          placeholder="11-digit BVN"
          placeholderTextColor={colors.stone}
          autoFocus
          accessibilityLabel="BVN input"
        />

        {/* Error state */}
        {failed && (
          <Text style={styles.errorText}>
            We couldn't verify that BVN. Please check and try again.
          </Text>
        )}

        <Text style={styles.hint}>Dial *565*0# to get your BVN</Text>

        <Button
          label={loading ? 'Checking...' : 'Verify BVN'}
          onPress={handleVerify}
          loading={loading}
          disabled={!isValid()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.lg },
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
  explainer: {
    backgroundColor: colors.forest,
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.emerald,
  },
  explainerText: {
    fontSize: typography.bodySm.size,
    color: colors.cream,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.forest,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.sand,
    padding: spacing.lg,
    fontSize: typography.h3.size,
    fontWeight: '600',
    color: colors.cream,
    letterSpacing: 2,
  },
  inputError: { borderColor: colors.alert },
  errorText: {
    fontSize: typography.bodySm.size,
    color: colors.alert,
    marginTop: -spacing.sm,
  },
  hint: {
    fontSize: typography.caption.size,
    color: colors.stone,
    textAlign: 'center',
  },
});
