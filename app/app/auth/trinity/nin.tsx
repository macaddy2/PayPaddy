/**
 * Trinity Step 2 — NIN verification via Dojah (mocked).
 *
 * SLA: ≤ 10s. Uses the digit-cell UI from the v2 prototype (11 cells).
 */

import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BackHeader, Button, Screen, StepBar } from '@/ui';
import { useAuth } from '@/state';
import { colors, radii, spacing, typography } from '@/theme';
import { track } from '@/services/analytics';

const STEPS = ['BVN', 'NIN', 'Face'];
const NIN_LEN = 11;

export default function NinScreen() {
  const router = useRouter();
  const { verifyNin, trinityLoading } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(NIN_LEN).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);
  const loading = trinityLoading.nin;

  function handleDigit(v: string, idx: number) {
    const char = v.slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    if (char && idx < NIN_LEN - 1) inputs.current[idx + 1]?.focus();
    if (char && idx === NIN_LEN - 1) void handleVerify(next.join(''));
  }

  function handleKey(key: string, idx: number) {
    if (key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  }

  async function handleVerify(nin?: string) {
    const final = nin ?? digits.join('');
    if (final.length < NIN_LEN) return;
    track('trinity.nin_attempted');
    const status = await verifyNin(final);
    if (status === 'verified') {
      track('trinity.nin_verified');
      router.push('/auth/trinity/liveness');
    }
  }

  const full = digits.join('').length === NIN_LEN;

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Identity Check" />
      <StepBar steps={STEPS} activeIndex={1} />

      <View style={styles.body}>
        <Text style={styles.heading}>Enter your NIN</Text>
        <Text style={styles.sub}>
          Your National Identification Number (NIN) from NIMC.
          Dial *346# to get your NIN for free.
        </Text>

        {/* 11-cell digit input — mirrors v2 mockup */}
        <View style={styles.cells}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              style={[styles.cell, d ? styles.cellFilled : null]}
              value={d}
              onChangeText={(v) => handleDigit(v, i)}
              onKeyPress={({ nativeEvent }) => handleKey(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              accessibilityLabel={`NIN digit ${i + 1}`}
            />
          ))}
        </View>

        <View style={styles.explainer}>
          <Text style={styles.explainerText}>
            🇳🇬 Your NIN is checked against the NIMC database. We only keep
            a masked reference — no raw digits stored.
          </Text>
        </View>

        <Button
          label={loading ? 'Verifying...' : 'Verify NIN'}
          onPress={() => void handleVerify()}
          loading={loading}
          disabled={!full}
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
  cells: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    width: 40,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.forest,
    borderWidth: 1.5,
    borderColor: colors.sand,
    textAlign: 'center',
    fontSize: typography.h3.size,
    fontWeight: '700',
    color: colors.cream,
  },
  cellFilled: { borderColor: colors.lime },
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
});
