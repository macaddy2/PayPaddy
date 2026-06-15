/**
 * Create Deal screen — title, amount, category picker.
 *
 * The 4-deal-category grid (Commerce / Service / Contract / Bet) mirrors the
 * v2 prototype's 2×2 layout. After creation the user is taken straight to the
 * Deal Room for the newly created deal.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { BackHeader, Button, Screen } from '@/ui';
import { useAuth, useDeals } from '@/state';
import { DEAL_CATEGORIES, type DealCategoryKey } from '@/domain/constants';
import { nairaToKobo } from '@/domain/money';
import { colors, radii, spacing, typography } from '@/theme';
import { track } from '@/services/analytics';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  amountNaira: z
    .string()
    .min(1, 'Enter an amount')
    .refine((v) => /^\d+$/.test(v) && parseInt(v) >= 100, 'Minimum deal is ₦100'),
});

type FormData = z.infer<typeof schema>;

export default function NewDealScreen() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { createDeal, listLoading } = useDeals();
  const [category, setCategory] = useState<DealCategoryKey>('commerce');

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    if (!user) return;
    track('deal.create_attempted', { category });
    try {
      const deal = await createDeal({
        buyerId: user.id,
        title: data.title,
        grossKobo: nairaToKobo(parseInt(data.amountNaira)),
        category,
      });
      track('deal.created', { dealId: deal.id, category });
      router.replace({ pathname: '/(app)/deal/[id]', params: { id: deal.id } });
    } catch {
      Alert.alert('Error', 'Could not create deal. Please try again.');
    }
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="New Deal" />

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>WHAT'S THE DEAL?</Text>

        {/* Title field */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={value}
              onChangeText={onChange}
              placeholder="e.g. MacBook Pro M2, Logo Design..."
              placeholderTextColor={colors.stone}
              autoFocus
              maxLength={120}
            />
          )}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

        {/* Amount field */}
        <Text style={styles.sectionLabel}>AMOUNT (₦)</Text>
        <Controller
          control={control}
          name="amountNaira"
          render={({ field: { onChange, value } }) => (
            <View style={styles.amountRow}>
              <Text style={styles.nairaSign}>₦</Text>
              <TextInput
                style={[styles.amountInput, errors.amountNaira && styles.inputError]}
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                placeholder="50000"
                placeholderTextColor={colors.stone}
                maxLength={10}
              />
            </View>
          )}
        />
        {errors.amountNaira && <Text style={styles.errorText}>{errors.amountNaira.message}</Text>}

        {/* Category grid */}
        <Text style={styles.sectionLabel}>DEAL TYPE</Text>
        <View style={styles.grid}>
          {DEAL_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catCell, category === cat.key && styles.catCellActive]}
              onPress={() => setCategory(cat.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={[styles.catLabel, category === cat.key && styles.catLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Escrow explainer */}
        <View style={styles.escrowNote}>
          <Text style={styles.escrowNoteText}>
            🔒 PayPaddy holds the funds in a CBN-licensed escrow account until both
            parties confirm the deal is done. Your money is safe.
          </Text>
        </View>

        <Button
          label="Create Deal"
          onPress={handleSubmit(onSubmit)}
          loading={listLoading}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.lg },
  sectionLabel: {
    fontSize: typography.caption.size,
    fontWeight: '700',
    color: colors.stone,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.forest,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.sand,
    padding: spacing.lg,
    fontSize: typography.body.size,
    color: colors.cream,
    fontWeight: '500',
  },
  inputError: { borderColor: colors.alert },
  errorText: { fontSize: typography.caption.size, color: colors.alert },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.sand,
    overflow: 'hidden',
  },
  nairaSign: {
    paddingHorizontal: spacing.md,
    fontSize: typography.h2.size,
    fontWeight: '700',
    color: colors.lime,
  },
  amountInput: {
    flex: 1,
    padding: spacing.lg,
    fontSize: typography.h2.size,
    fontWeight: '700',
    color: colors.cream,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  catCell: {
    width: '47%',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: spacing.sm,
  },
  catCellActive: { borderColor: colors.lime },
  catIcon: { fontSize: 28 },
  catLabel: {
    fontSize: typography.bodySm.size,
    fontWeight: '600',
    color: colors.stone,
    textAlign: 'center',
  },
  catLabelActive: { color: colors.lime },
  escrowNote: {
    backgroundColor: colors.forest,
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.emerald,
  },
  escrowNoteText: {
    fontSize: typography.bodySm.size,
    color: colors.cream,
    lineHeight: 20,
  },
});
