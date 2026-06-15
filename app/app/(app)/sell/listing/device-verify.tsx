/**
 * Device IMEI Verification — Moat #4.
 *
 * Checks the NCC (Nigerian Communications Commission) stolen-goods database
 * via the mock `api.device.verifyIMEIViaNCC`. Electronics listings are
 * blocked from publishing until IMEI passes.
 *
 * Canned failure: any IMEI starting with "999" is returned as stolen so
 * the error path can be exercised without a real backend.
 *
 * To find your IMEI: dial *#06# on the device.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackHeader, Button, Screen } from '@/ui';
import { api } from '@/services/api';
import { colors, spacing, typography } from '@/theme';

export default function DeviceVerifyScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const [imei, setImei] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; reason?: string } | null>(null);

  function isValid() {
    return /^\d{15}$/.test(imei);
  }

  async function handleCheck() {
    if (!isValid()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.device.verifyIMEIViaNCC(imei);
      setResult(res);
      if (res.ok) {
        if (listingId) await api.listings.markImeiVerified(listingId, imei);
        // Update the listing with verified IMEI then navigate to publish.
        router.push({ pathname: '/(app)/sell/listing/publish', params: { listingId, imei, imeiVerified: 'true' } });
      }
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Device Verification" />

      <View style={styles.body}>
        <Text style={styles.heading}>Verify the device IMEI</Text>
        <Text style={styles.sub}>
          We check the NCC database to confirm this device isn't stolen.
          Verified payment links earn a badge that dramatically increases buyer trust.
        </Text>

        <View style={styles.howTo}>
          <Text style={styles.howToTitle}>How to find the IMEI</Text>
          <Text style={styles.howToText}>Dial *#06# on the device. A 15-digit number appears.</Text>
        </View>

        <TextInput
          style={[styles.input, result?.ok === false && styles.inputError]}
          value={imei}
          onChangeText={(v) => { setImei(v.replace(/\D/g, '')); setResult(null); }}
          keyboardType="number-pad"
          maxLength={15}
          placeholder="15-digit IMEI"
          placeholderTextColor={colors.stone}
          autoFocus
        />

        {/* Result states */}
        {result?.ok === false && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>⚠️ IMEI Flagged</Text>
            <Text style={styles.errorText}>{result.reason}</Text>
            <Text style={styles.errorSub}>
              This device cannot be listed on PayPaddy. If you believe this is
              an error, contact NCC on 0800-900-9900.
            </Text>
          </View>
        )}

        {result?.ok === true && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ IMEI is clean — this device is not flagged.</Text>
          </View>
        )}

        <Text style={styles.hint}>[DEV] Use an IMEI starting with "999" to trigger a stolen flag.</Text>

        <Button
          label={loading ? 'Checking NCC…' : 'Check IMEI'}
          onPress={handleCheck}
          loading={loading}
          disabled={!isValid()}
        />

        <Button
          label="Skip (list without IMEI badge)"
          onPress={() => router.push({ pathname: '/(app)/sell/listing/publish', params: { listingId } })}
          variant="ghost"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.lg },
  heading: { fontSize: typography.h2.size, fontWeight: typography.h2.weight, color: colors.cream },
  sub: { fontSize: typography.body.size, color: colors.stone, lineHeight: 22 },
  howTo: { backgroundColor: colors.forest, borderRadius: 12, padding: spacing.lg, gap: spacing.xs },
  howToTitle: { fontSize: typography.bodySm.size, fontWeight: '700', color: colors.cream },
  howToText: { fontSize: typography.bodySm.size, color: colors.stone },
  input: {
    backgroundColor: colors.forest, borderRadius: 12, borderWidth: 1.5, borderColor: colors.sand,
    padding: spacing.lg, fontSize: typography.mono.size, fontWeight: '700', color: colors.cream, letterSpacing: 2,
  },
  inputError: { borderColor: colors.alert },
  errorBox: { backgroundColor: colors.alertBg, borderRadius: 12, padding: spacing.lg, gap: spacing.sm },
  errorTitle: { fontSize: typography.body.size, fontWeight: '700', color: colors.alert },
  errorText: { fontSize: typography.bodySm.size, color: colors.cream },
  errorSub: { fontSize: typography.caption.size, color: colors.stone },
  successBox: { backgroundColor: colors.safeBg, borderRadius: 12, padding: spacing.lg },
  successText: { fontSize: typography.body.size, color: colors.safe, fontWeight: '600' },
  hint: { fontSize: typography.caption.size, color: colors.caution, textAlign: 'center' },
});
