import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { BackHeader, Eyebrow, Screen, TrustPill } from '@/ui';
import { api } from '@/services/api';
import { colors, radii, spacing, typography } from '@/theme';
import type { DisputeReason } from '@/domain/schema';

const reasons: { key: DisputeReason; label: string; detail: string }[] = [
  { key: 'not_delivered', label: 'Item no show', detail: 'Seller has not delivered' },
  { key: 'wrong_item', label: 'Wrong item', detail: 'Different from the order' },
  { key: 'damaged', label: 'Damaged', detail: 'Arrived broken or incomplete' },
  { key: 'fake', label: 'Fake item', detail: 'Counterfeit or stolen concern' },
  { key: 'other', label: 'Something else', detail: 'Tell us wetin happen' },
];

const schema = z.object({
  description: z.string().min(10, 'Tell us a little more so a human paddy can help.'),
});

type FormData = z.infer<typeof schema>;

export default function DisputeOpenScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [reason, setReason] = useState<DisputeReason>('wrong_item');
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    if (!id) return;
    setSubmitting(true);
    try {
      const dispute = await api.disputes.open({ dealId: id, reason, description: data.description });
      router.replace({ pathname: '/(app)/deal/[id]/dispute/evidence', params: { id, disputeId: dispute.id } });
    } catch (error) {
      Alert.alert('No wahala', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen bg={colors.cream} padH={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <BackHeader title="Report a Problem" />
          <Text style={styles.heroTitle}>Money no go waka.</Text>
          <Text style={styles.heroSub}>Your money is still locked. A human paddy will review within 24h.</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.safeBox}>
            <TrustPill label="ESCROW STILL LOCKED" tone="safe" />
            <Text style={styles.safeText}>Nobody can release the funds while this report is open. Breathe first, then tell us what happened.</Text>
          </View>

          <Eyebrow>Wetin happen?</Eyebrow>
          <View style={styles.reasonStack}>
            {reasons.map((item) => (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.86}
                onPress={() => setReason(item.key)}
                style={[styles.reason, reason === item.key && styles.reasonActive]}
              >
                <View style={[styles.radio, reason === item.key && styles.radioActive]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reasonLabel}>{item.label}</Text>
                  <Text style={styles.reasonDetail}>{item.detail}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Eyebrow>Tell us exactly</Eyebrow>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                multiline
                placeholder="E.g. Seller sent 128GB instead of 256GB and has not replied..."
                placeholderTextColor={colors.stone}
                style={[styles.textarea, errors.description && styles.inputError]}
                textAlignVertical="top"
              />
            )}
          />
          {errors.description ? <Text style={styles.error}>{errors.description.message}</Text> : null}

          <TouchableOpacity activeOpacity={0.88} onPress={handleSubmit(onSubmit)} style={styles.submit}>
            <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Dispute'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  hero: { backgroundColor: colors.alert, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: spacing.xl },
  heroTitle: { color: '#fff', paddingHorizontal: spacing.lg, fontSize: typography.h1.size, lineHeight: typography.h1.lineHeight, fontWeight: '900', letterSpacing: -0.8 },
  heroSub: { color: 'rgba(255,255,255,0.76)', paddingHorizontal: spacing.lg, marginTop: 5, lineHeight: 20, fontWeight: '700' },
  body: { padding: spacing.lg, gap: spacing.md },
  safeBox: { backgroundColor: colors.safeBg, borderRadius: radii.md, padding: spacing.lg, gap: spacing.sm, borderLeftWidth: 4, borderLeftColor: colors.emerald },
  safeText: { color: colors.charcoal, lineHeight: 21, fontWeight: '700' },
  reasonStack: { gap: spacing.sm },
  reason: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.sand, borderRadius: radii.sm, padding: spacing.md },
  reasonActive: { borderColor: colors.alert, backgroundColor: colors.alertBg },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.stone },
  radioActive: { borderColor: colors.alert, backgroundColor: colors.alert },
  reasonLabel: { color: colors.charcoal, fontSize: typography.body.size, fontWeight: '900' },
  reasonDetail: { color: colors.stone, fontSize: typography.caption.size, fontWeight: '700', marginTop: 2 },
  textarea: { minHeight: 118, backgroundColor: '#fff', borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.sand, padding: spacing.lg, color: colors.charcoal, fontSize: typography.body.size, fontWeight: '700', lineHeight: 22 },
  inputError: { borderColor: colors.alert },
  error: { color: colors.alert, fontWeight: '700', fontSize: typography.caption.size },
  submit: { minHeight: 54, borderRadius: radii.md, backgroundColor: colors.alert, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontWeight: '900', fontSize: typography.body.size },
});
