/**
 * Phone entry screen — step 1 of the auth flow.
 *
 * The user types their NG phone number and taps "Send OTP". The store calls
 * Termii (mocked) and returns a requestId we pass to the OTP screen.
 *
 * Design notes from UX research:
 *  • Flag prefix (+234) is pre-filled and non-editable — reduces friction.
 *  • "We never share your number" copy addresses the privacy concern flagged
 *    in the UX research focus groups.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackHeader, Button, Screen } from '@/ui';
import { useAuth } from '@/state';
import { colors, spacing, typography } from '@/theme';
import { track } from '@/services/analytics';

export default function PhoneScreen() {
  const router = useRouter();
  // `?next=<path>` is propagated through the OTP step so post-verify routing
  // can return the user to wherever they came from (e.g. an invite link).
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { requestOtp, loading } = useAuth();
  const [local, setLocal] = useState(''); // digits after +234

  // Normalise input: strip leading 0 if user types 080…, prepend +234
  function normalised(): string {
    const stripped = local.replace(/\D/g, '').replace(/^0/, '');
    return `+234${stripped}`;
  }

  function isValid(): boolean {
    const digits = local.replace(/\D/g, '').replace(/^0/, '');
    return digits.length >= 10;
  }

  async function handleSend() {
    if (!isValid()) return;
    track('auth.otp_requested', { method: 'phone' });
    try {
      const requestId = await requestOtp(normalised());
      router.push({
        pathname: '/auth/otp',
        params: { requestId, phone: normalised(), ...(next ? { next } : {}) },
      });
    } catch {
      Alert.alert('Error', 'Could not send OTP. Please try again.');
    }
  }

  return (
    <Screen bg={colors.ink} padH>
      <BackHeader />

      <View style={styles.body}>
        <Text style={styles.heading}>Enter your number</Text>
        <Text style={styles.sub}>
          We go send you a one-time code. We never share your number.
        </Text>

        {/* Phone input with locked prefix */}
        <View style={styles.inputRow}>
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>🇳🇬 +234</Text>
          </View>
          <TextInput
            style={styles.input}
            value={local}
            onChangeText={setLocal}
            keyboardType="phone-pad"
            maxLength={11}
            placeholder="8012345678"
            placeholderTextColor={colors.stone}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSend}
            accessibilityLabel="Phone number"
          />
        </View>

        <Button
          label="Send OTP"
          onPress={handleSend}
          loading={loading}
          disabled={!isValid()}
          style={styles.btn}
        />

        <Text style={styles.terms}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
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
    marginBottom: spacing.xxl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.sand,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors.sand,
  },
  prefixText: {
    fontSize: typography.body.size,
    color: colors.cream,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    fontSize: typography.h3.size,
    color: colors.cream,
    fontWeight: '600',
    letterSpacing: 1,
  },
  btn: { marginBottom: spacing.lg },
  terms: {
    fontSize: typography.caption.size,
    color: colors.stone,
    textAlign: 'center',
    lineHeight: 18,
  },
});
