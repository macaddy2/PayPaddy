/**
 * Payout screen — withdraw available wallet balance via NIP (NIBSS Instant Payment).
 *
 * Takes bank code + account number + amount. In mock: decrements the wallet
 * and shows success. Real implementation calls Paystack Transfer API.
 */

import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { BackHeader, Button, Screen } from '@/ui';
import { useAuth, useWallet } from '@/state';
import { formatNaira } from '@/domain/money';
import { colors, spacing, typography } from '@/theme';

const BANKS = [
  { code: '058', name: 'GTBank' },
  { code: '011', name: 'First Bank' },
  { code: '033', name: 'UBA' },
  { code: '057', name: 'Zenith' },
  { code: '063', name: 'Access Bank' },
] as const;

const schema = z.object({
  accountNumber: z.string().regex(/^\d{10}$/, '10-digit account number required'),
  amountNaira: z.string().refine((v) => /^\d+$/.test(v) && parseInt(v) >= 100, 'Minimum ₦100'),
});
type FormData = z.infer<typeof schema>;

export default function PayoutScreen() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { wallet, payout, loading } = useWallet();
  const [selectedBank, setSelectedBank] = useState('058');
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const availableNaira = Math.floor((wallet?.availableKobo ?? 0) / 100);

  async function onSubmit(data: FormData) {
    if (!user) return;
    const amountKobo = parseInt(data.amountNaira) * 100;
    if (amountKobo > (wallet?.availableKobo ?? 0)) {
      Alert.alert('Insufficient balance', `You only have ${formatNaira(wallet?.availableKobo ?? 0)} available.`);
      return;
    }
    try {
      await payout(user.id, { amountKobo, bankCode: selectedBank, accountNumber: data.accountNumber });
      Alert.alert('Payout sent! 🎉', `${formatNaira(amountKobo)} is on its way to your account.`, [
        { text: 'OK', onPress: () => router.replace('/(app)/(tabs)') },
      ]);
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Withdraw Funds" />

      <View style={styles.body}>
        <Text style={styles.available}>Available: {formatNaira(wallet?.availableKobo ?? 0)}</Text>

        <Text style={styles.label}>SELECT BANK</Text>
        <View style={styles.banks}>
          {BANKS.map((b) => (
            <TouchableOpacity
              key={b.code}
              style={[styles.bankChip, selectedBank === b.code && styles.bankChipActive]}
              onPress={() => setSelectedBank(b.code)}
            >
              <Text style={[styles.bankChipText, selectedBank === b.code && styles.bankChipTextActive]}>
                {b.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>ACCOUNT NUMBER</Text>
        <Controller control={control} name="accountNumber" render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.accountNumber && styles.inputError]}
            value={value} onChangeText={onChange}
            keyboardType="number-pad" maxLength={10}
            placeholder="10 digits" placeholderTextColor={colors.stone}
          />
        )} />
        {errors.accountNumber && <Text style={styles.errText}>{errors.accountNumber.message}</Text>}

        <Text style={styles.label}>AMOUNT (₦)</Text>
        <View style={styles.amountRow}>
          <Text style={styles.nairaSign}>₦</Text>
          <Controller control={control} name="amountNaira" render={({ field: { onChange, value } }) => (
            <TextInput style={styles.amountInput} value={value} onChangeText={onChange}
              keyboardType="number-pad" placeholder={String(availableNaira)} placeholderTextColor={colors.stone} />
          )} />
        </View>
        {errors.amountNaira && <Text style={styles.errText}>{errors.amountNaira.message}</Text>}

        <View style={styles.note}>
          <Text style={styles.noteText}>
            Transfers arrive via NIBSS Instant Payment (NIP) within 5 minutes.
            Minimum withdrawal ₦100. No transfer fee.
          </Text>
        </View>

        <Button label={loading ? 'Sending…' : 'Withdraw Now'} onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>
    </Screen>
  );
}

import { useState } from 'react';

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.md },
  available: { fontSize: typography.h3.size, fontWeight: '700', color: colors.lime },
  label: { fontSize: typography.caption.size, fontWeight: '700', color: colors.stone, letterSpacing: 0.8 },
  banks: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  bankChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999, backgroundColor: colors.forest, borderWidth: 1.5, borderColor: 'transparent' },
  bankChipActive: { borderColor: colors.lime },
  bankChipText: { fontSize: typography.bodySm.size, color: colors.stone, fontWeight: '600' },
  bankChipTextActive: { color: colors.lime },
  input: { backgroundColor: colors.forest, borderRadius: 12, borderWidth: 1.5, borderColor: colors.sand, padding: spacing.lg, fontSize: typography.body.size, color: colors.cream },
  inputError: { borderColor: colors.alert },
  amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.forest, borderRadius: 12, borderWidth: 1.5, borderColor: colors.sand, overflow: 'hidden' },
  nairaSign: { paddingHorizontal: spacing.md, fontSize: typography.h2.size, fontWeight: '700', color: colors.lime },
  amountInput: { flex: 1, padding: spacing.lg, fontSize: typography.h2.size, fontWeight: '700', color: colors.cream },
  errText: { fontSize: typography.caption.size, color: colors.alert },
  note: { backgroundColor: colors.forest, borderRadius: 12, padding: spacing.lg },
  noteText: { fontSize: typography.bodySm.size, color: colors.stone, lineHeight: 20 },
});
