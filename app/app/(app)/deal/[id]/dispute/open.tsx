/**
 * Dispute — Step 1: Reason + Description.
 *
 * Design note (from UX research): funds-are-safe messaging must come FIRST —
 * before forms — to prevent panic. "Your money is still locked in escrow."
 *
 * Description minimum 10 characters enforced by zod + the PRD's requirement
 * for substantiated dispute reasons.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { BackHeader, Button, Screen } from '@/ui';
import { api } from '@/services/api';
import { colors, radii, spacing, typography } from '@/theme';
import type { DisputeReason } from '@/domain/schema';

const REASONS: { key: DisputeReason; label: string; icon: string }[] = [
  { key: 'not_delivered', label: 'Item not delivered', icon: '📦' },
  { key: 'wrong_item', label: 'Wrong item received', icon: '❌' },
  { key: 'damaged', label: 'Item arrived damaged', icon: '💔' },
  { key: 'fake', label: 'Item is fake / counterfeit', icon: '⚠️' },
  { key: 'other', label: 'Something else', icon: '💬' },
];

const schema = z.object({
  description: z.string().min(10, 'Please describe the issue in at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

export default function DisputeOpenScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [reason, setReason] = useState<DisputeReason>('not_delivered');
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
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Open Dispute" />

      <View style={styles.body}>
        {/* Reassurance first — critical per UX research */}
        <View style={styles.safeBox}>
          <Text style={styles.safeIcon}>🔒</Text>
          <View>
            <Text style={styles.safeTitle}>Your money is still locked</Text>
            <Text style={styles.safeSub}>
              Funds remain in CBN-licensed escrow until this dispute is resolved.
              Nobody can touch it. Breathe.
            </Text>
          </View>
        </View>

        <Text style={styles.heading}>What happened?</Text>

        {/* Reason picker */}
        <View style={styles.reasons}>
          {REASONS.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.reasonRow, reason === r.key && styles.reasonRowActive]}
              onPress={() => setReason(r.key)}
            >
              <Text style={styles.reasonIcon}>{r.icon}</Text>
              <Text style={[styles.reasonLabel, reason === r.key && styles.reasonLabelActive]}>
                {r.label}
              </Text>
              <View style={[styles.radio, reason === r.key && styles.radioActive]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.fieldLabel}>Describe what went wrong</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.textarea, errors.description && styles.inputError]}
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              placeholder="Tell us exactly what happened (minimum 10 characters)..."
              placeholderTextColor={colors.stone}
              textAlignVertical="top"
            />
          )}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description.message}</Text>
        )}

        {/* Human arbitration promise */}
        <View style={styles.humanNote}>
          <Text style={styles.humanText}>
            👤 A human paddy (not a bot) go review your case. We target resolution
            within 5–7 days — faster than any competitor.
          </Text>
        </View>

        <Button
          label={submitting ? 'Submitting…' : 'Submit Dispute'}
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          variant="danger"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.lg },
  safeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.safeBg,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.safe,
  },
  safeIcon: { fontSize: 24 },
  safeTitle: {
    fontSize: typography.body.size,
    fontWeight: '700',
    color: colors.safe,
    marginBottom: 4,
  },
  safeSub: { fontSize: typography.bodySm.size, color: colors.cream, lineHeight: 20 },
  heading: {
    fontSize: typography.h2.size,
    fontWeight: typography.h2.weight,
    color: colors.cream,
  },
  reasons: { gap: spacing.sm },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.forest,
    borderRadius: radii.sm,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  reasonRowActive: { borderColor: colors.alert },
  reasonIcon: { fontSize: 20, width: 28 },
  reasonLabel: { flex: 1, fontSize: typography.body.size, color: colors.stone, fontWeight: '500' },
  reasonLabelActive: { color: colors.cream },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.stone,
  },
  radioActive: { borderColor: colors.alert, backgroundColor: colors.alert },
  fieldLabel: { fontSize: typography.bodySm.size, fontWeight: '600', color: colors.stone },
  textarea: {
    backgroundColor: colors.forest,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.sand,
    padding: spacing.lg,
    fontSize: typography.body.size,
    color: colors.cream,
    minHeight: 100,
  },
  inputError: { borderColor: colors.alert },
  errorText: { fontSize: typography.caption.size, color: colors.alert },
  humanNote: {
    backgroundColor: colors.forest,
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  humanText: { fontSize: typography.bodySm.size, color: colors.cream, lineHeight: 20 },
});
