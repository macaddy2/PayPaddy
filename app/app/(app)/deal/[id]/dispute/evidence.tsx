import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BackHeader, Button, Eyebrow, Screen, TrustPill } from '@/ui';
import { api } from '@/services/api';
import { colors, radii, spacing, typography } from '@/theme';

const maxSlots = 6;

export default function EvidenceScreen() {
  const { disputeId } = useLocalSearchParams<{ id: string; disputeId: string }>();
  const router = useRouter();
  const [slots, setSlots] = useState<(string | null)[]>(Array(maxSlots).fill(null));
  const [submitting, setSubmitting] = useState(false);

  function toggleSlot(index: number) {
    const next = [...slots];
    next[index] = next[index] ? null : `mock-evidence-${index + 1}.jpg`;
    setSlots(next);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      for (const item of slots.filter(Boolean)) {
        await api.disputes.addEvidence(disputeId ?? '', item ?? '');
      }
      router.replace('/(app)/admin/disputes');
    } catch (error) {
      Alert.alert('No wahala', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const filled = slots.filter(Boolean).length;

  return (
    <Screen bg={colors.cream} padH={false}>
      <View style={styles.hero}>
        <BackHeader title="Add Evidence" />
        <Text style={styles.heading}>Show us wetin happen.</Text>
        <Text style={styles.sub}>Photos, chats, delivery notes. A human paddy will review the whole story.</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.safeBox}>
          <TrustPill label="MONEY STILL LOCKED" tone="safe" />
          <Text style={styles.safeText}>Evidence strengthens your case, but your escrow is already frozen while review is active.</Text>
        </View>

        <Eyebrow>Add Evidence (Optional)</Eyebrow>
        <View style={styles.grid}>
          {slots.map((slot, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.84}
              onPress={() => toggleSlot(index)}
              style={[styles.slot, Boolean(slot) && styles.slotFilled]}
            >
              <Text style={slot ? styles.slotFilledIcon : styles.slotIcon}>{slot ? '📎' : '+'}</Text>
              {slot ? <Text style={styles.slotLabel}>Evidence {index + 1}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.hint}>{filled} / {maxSlots} items added. Tap a slot to add or remove.</Text>

        <View style={styles.chatNote}>
          <Text style={styles.chatNoteText}>You can attach WhatsApp screenshots or delivery chats. The clearer the evidence, the faster the review.</Text>
        </View>

        <Button
          label={submitting ? 'Submitting...' : 'Submit Evidence'}
          onPress={handleSubmit}
          loading={submitting}
          variant="danger"
        />
        <Button label="Skip to human review" onPress={handleSubmit} variant="ghost" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.alert, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: spacing.xl },
  body: { padding: spacing.lg, gap: spacing.lg },
  heading: { paddingHorizontal: spacing.lg, fontSize: typography.h1.size, fontWeight: '900', color: '#fff', letterSpacing: -0.8 },
  sub: { paddingHorizontal: spacing.lg, fontSize: typography.body.size, color: 'rgba(255,255,255,0.76)', lineHeight: 22, fontWeight: '700', marginTop: 4 },
  safeBox: { backgroundColor: colors.safeBg, borderRadius: radii.md, padding: spacing.lg, gap: spacing.sm, borderLeftWidth: 4, borderLeftColor: colors.emerald },
  safeText: { color: colors.charcoal, lineHeight: 21, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  slot: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.sand,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  slotFilled: { borderColor: colors.emerald, borderStyle: 'solid', backgroundColor: colors.safeBg },
  slotIcon: { fontSize: 28, color: colors.stone },
  slotFilledIcon: { fontSize: 24 },
  slotLabel: { fontSize: typography.caption.size, color: colors.emerald, fontWeight: '800' },
  hint: { fontSize: typography.caption.size, color: colors.stone, textAlign: 'center', fontWeight: '700' },
  chatNote: { backgroundColor: '#fff', borderRadius: 12, padding: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.info },
  chatNoteText: { fontSize: typography.bodySm.size, color: colors.charcoal, lineHeight: 20, fontWeight: '700' },
});
