/**
 * New Listing — title, description, price, category.
 *
 * If the category is "commerce" (electronics/goods), the user is sent to
 * device-verify for an IMEI check before publishing. All other categories
 * skip directly to publish.
 */

import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { BackHeader, Button, Screen } from '@/ui';
import { useAuth, useSeller } from '@/state';
import { nairaToKobo } from '@/domain/money';
import { DEAL_CATEGORIES, type DealCategoryKey } from '@/domain/constants';
import { colors, radii, spacing, typography } from '@/theme';
import { useState } from 'react';

const schema = z.object({
  title: z.string().min(3, 'Minimum 3 characters'),
  description: z.string().min(10, 'Minimum 10 characters'),
  priceNaira: z.string().refine((v) => /^\d+$/.test(v) && parseInt(v) >= 100, 'Minimum ₦100'),
});
type FormData = z.infer<typeof schema>;

export default function NewListingScreen() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { createListing, loading } = useSeller();
  const [category, setCategory] = useState<DealCategoryKey>('commerce');

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    if (!user) return;
    try {
      const listing = await createListing({
        sellerId: user.id,
        title: data.title,
        description: data.description,
        priceKobo: nairaToKobo(parseInt(data.priceNaira)),
        category,
      });
      // Commerce listings need device verification, others go to publish.
      if (category === 'commerce') {
        router.push({ pathname: '/(app)/sell/listing/device-verify', params: { listingId: listing.id } });
      } else {
        router.push({ pathname: '/(app)/sell/listing/publish', params: { listingId: listing.id } });
      }
    } catch {
      Alert.alert('Error', 'Could not create listing. Please try again.');
    }
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="New Listing" />
      <View style={styles.body}>
        <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
          <TextInput style={[styles.input, errors.title && styles.err]} value={value} onChangeText={onChange}
            placeholder="Listing title" placeholderTextColor={colors.stone} autoFocus />
        )} />
        {errors.title && <Text style={styles.errText}>{errors.title.message}</Text>}

        <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
          <TextInput style={[styles.textarea, errors.description && styles.err]} value={value}
            onChangeText={onChange} multiline numberOfLines={4} textAlignVertical="top"
            placeholder="Describe the item or service..." placeholderTextColor={colors.stone} />
        )} />
        {errors.description && <Text style={styles.errText}>{errors.description.message}</Text>}

        <View style={styles.amountRow}>
          <Text style={styles.nairaSign}>₦</Text>
          <Controller control={control} name="priceNaira" render={({ field: { onChange, value } }) => (
            <TextInput style={styles.amountInput} value={value} onChangeText={onChange}
              keyboardType="number-pad" placeholder="Price" placeholderTextColor={colors.stone} />
          )} />
        </View>
        {errors.priceNaira && <Text style={styles.errText}>{errors.priceNaira.message}</Text>}

        <Text style={styles.catLabel}>CATEGORY</Text>
        <View style={styles.catGrid}>
          {DEAL_CATEGORIES.map((c) => (
            <TouchableOpacity key={c.key} style={[styles.catCell, category === c.key && styles.catActive]}
              onPress={() => setCategory(c.key)}>
              <Text style={styles.catIcon}>{c.icon}</Text>
              <Text style={[styles.catText, category === c.key && styles.catTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {category === 'commerce' && (
          <View style={styles.imeiNote}>
            <Text style={styles.imeiText}>
              📱 Electronics require an NCC IMEI check on the next step — protects
              buyers from stolen goods and builds your trust score.
            </Text>
          </View>
        )}

        <Button label={loading ? 'Creating…' : 'Next →'} onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.md },
  input: { backgroundColor: colors.forest, borderRadius: 12, borderWidth: 1.5, borderColor: colors.sand, padding: spacing.lg, fontSize: typography.body.size, color: colors.cream },
  textarea: { backgroundColor: colors.forest, borderRadius: 12, borderWidth: 1.5, borderColor: colors.sand, padding: spacing.lg, fontSize: typography.body.size, color: colors.cream, minHeight: 90 },
  amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.forest, borderRadius: 12, borderWidth: 1.5, borderColor: colors.sand, overflow: 'hidden' },
  nairaSign: { paddingHorizontal: spacing.md, fontSize: typography.h2.size, fontWeight: '700', color: colors.lime },
  amountInput: { flex: 1, padding: spacing.lg, fontSize: typography.h2.size, fontWeight: '700', color: colors.cream },
  err: { borderColor: colors.alert },
  errText: { fontSize: typography.caption.size, color: colors.alert },
  catLabel: { fontSize: typography.caption.size, fontWeight: '700', color: colors.stone, letterSpacing: 0.8 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catCell: { width: '47%', paddingVertical: spacing.lg, borderRadius: radii.md, backgroundColor: colors.forest, borderWidth: 1.5, borderColor: 'transparent', alignItems: 'center', gap: spacing.xs },
  catActive: { borderColor: colors.lime },
  catIcon: { fontSize: 24 },
  catText: { fontSize: typography.caption.size, color: colors.stone, fontWeight: '600' },
  catTextActive: { color: colors.lime },
  imeiNote: { backgroundColor: colors.forest, borderRadius: 12, padding: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.info },
  imeiText: { fontSize: typography.bodySm.size, color: colors.cream, lineHeight: 20 },
});
