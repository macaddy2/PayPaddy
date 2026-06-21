/**
 * OTP verification screen — step 2 of the auth flow.
 *
 * Shows 6 individual digit cells that auto-advance as the user types,
 * mimicking the design's native OTP feel without a third-party library.
 *
 * In dev mode a hint shows the mock code (always "000000") so testers
 * don't have to check the logger.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { BackHeader, Button, Screen } from '@/ui';
import { useAuth } from '@/state';
import { api } from '@/services/api';
import { colors, radii, spacing, typography } from '@/theme';

const CODE_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const { requestId, phone, next } = useLocalSearchParams<{ requestId: string; phone: string; next?: string }>();
  const { verifyOtp, loading } = useAuth();

  // Store each digit separately for the split-cell UI.
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  function handleDigit(value: string, idx: number) {
    const char = value.slice(-1); // take last char in case paste
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    // Auto-advance to next cell
    if (char && idx < CODE_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
    // Auto-submit when all cells are filled
    if (char && idx === CODE_LENGTH - 1) {
      void handleVerify(next.join(''));
    }
  }

  function handleKeyPress(key: string, idx: number) {
    // Backspace on empty cell moves focus left
    if (key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  }

  async function handleVerify(code?: string) {
    const finalCode = code ?? digits.join('');
    if (finalCode.length < CODE_LENGTH) return;
    if (!requestId) return;
    try {
      const user = await verifyOtp(requestId, finalCode);
      // If the user came from an invite link (or any other deep link via
      // `?next=`), honour it: the invite landing is public and reads as the
      // signed-in user. Trinity can be completed later.
      if (next) {
        router.replace(next as never);
        return;
      }
      const { bvn, nin, liveness } = user.trinity;
      const trinityDone = bvn === 'verified' && nin === 'verified' && liveness === 'verified';
      if (trinityDone) {
        router.replace('/(app)/(tabs)');
      } else {
        router.replace('/auth/trinity/bvn');
      }
    } catch {
      Alert.alert('Incorrect code', 'Please check the code and try again.');
      setDigits(Array(CODE_LENGTH).fill(''));
      inputs.current[0]?.focus();
    }
  }

  // Mock-build helper: surface the deterministic OTP code so anyone
  // demoing the live web build can complete the login flow without
  // having to dig into the mock backend.
  const mockHint = requestId ? api.auth.peekOtp(requestId) : null;

  return (
    <Screen bg={colors.ink} padH>
      <BackHeader />

      <View style={styles.body}>
        <Text style={styles.heading}>Enter the code</Text>
        <Text style={styles.sub}>
          We sent a 6-digit code to{' '}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        {/* 6-cell OTP input */}
        <View style={styles.cells}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              style={[styles.cell, d ? styles.cellFilled : null]}
              value={d}
              onChangeText={(v) => handleDigit(v, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              accessibilityLabel={`Digit ${i + 1}`}
            />
          ))}
        </View>

        {/* Mock hint */}
        {mockHint && (
          <Text style={styles.devHint}>
            Demo mode: any 6 digits work (e.g. {mockHint})
          </Text>
        )}

        <Button
          label="Verify"
          onPress={() => void handleVerify()}
          loading={loading}
          disabled={digits.join('').length < CODE_LENGTH}
          style={styles.btn}
        />

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.resend}>Didn't get it? Resend code</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingTop: spacing.xxxl },
  heading: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.cream,
    marginBottom: spacing.md,
  },
  sub: {
    fontSize: typography.body.size,
    color: colors.stone,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  phone: { color: colors.cream, fontWeight: '600' },
  cells: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  cell: {
    flex: 1,
    height: 56,
    borderRadius: radii.sm,
    backgroundColor: colors.forest,
    borderWidth: 1.5,
    borderColor: colors.sand,
    textAlign: 'center',
    fontSize: typography.mono.size,
    fontWeight: typography.mono.weight,
    color: colors.cream,
  },
  cellFilled: { borderColor: colors.lime },
  devHint: {
    fontSize: typography.caption.size,
    color: colors.caution,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  btn: { marginBottom: spacing.lg },
  resend: {
    textAlign: 'center',
    fontSize: typography.bodySm.size,
    color: colors.lime,
    fontWeight: '600',
  },
});
