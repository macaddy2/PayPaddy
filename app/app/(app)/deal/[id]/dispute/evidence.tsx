/**
 * Dispute — Step 2: Evidence upload.
 *
 * Up to 6 photo slots. In MVP there is no real upload — tapping a slot shows
 * a placeholder (real implementation uses expo-image-picker + S3 or similar).
 * The mock dispute already exists at this point; "Submit Evidence" navigates
 * to the resolved stub so the full flow is walkable.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BackHeader, Button, Screen } from '@/ui';
import { api } from '@/services/api';
import { colors, radii, spacing, typography } from '@/theme';

const MAX_SLOTS = 6;

export default function EvidenceScreen() {
  const { id, disputeId } = useLocalSearchParams<{ id: string; disputeId: string }>();
  const router = useRouter();
  // Simulate filled slots with placeholder strings.
  const [slots, setSlots] = useState<(string | null)[]>(Array(MAX_SLOTS).fill(null));
  const [submitting, setSubmitting] = useState(false);

  function handleSlotTap(idx: number) {
    // In production: open expo-image-picker here.
    const next = [...slots];
    next[idx] = next[idx] ? null : `mock-evidence-${idx + 1}.jpg`;
    setSlots(next);
  }

  async function handleSubmit() {
    setSubmitting(true);
    // Mock: resolve the dispute in buyer's favour for demo purposes.
    try {
      await api.disputes.resolveBuyerWins(disputeId ?? '');
      router.replace({ pathname: '/(app)/deal/[id]/dispute/resolved', params: { id, disputeId } });
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const filled = slots.filter(Boolean).length;

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Add Evidence" />

      <View style={styles.body}>
        <Text style={styles.heading}>Add photos or attachments</Text>
        <Text style={styles.sub}>
          Photos of damaged goods, screenshots of chats, delivery notes — anything
          that shows what happened. Up to 6 items.
        </Text>

        {/* Photo slot grid */}
        <View style={styles.grid}>
          {slots.map((slot, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.slot, slot && styles.slotFilled]}
              onPress={() => handleSlotTap(i)}
              activeOpacity={0.8}
            >
              {slot ? (
                <Text style={styles.slotFilledIcon}>📎</Text>
              ) : (
                <Text style={styles.slotIcon}>+</Text>
              )}
              {slot && (
                <Text style={styles.slotLabel} numberOfLines={1}>
                  Evidence {i + 1}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.hint}>
          {filled} / {MAX_SLOTS} items added. Tap a slot to add or remove.
        </Text>

        {/* Chat attach note */}
        <View style={styles.chatNote}>
          <Text style={styles.chatNoteText}>
            💬 You can also attach screenshots from WhatsApp or other chats.
            The more evidence, the stronger your case.
          </Text>
        </View>

        <Button
          label={submitting ? 'Submitting…' : 'Submit Evidence'}
          onPress={handleSubmit}
          loading={submitting}
          variant="danger"
        />
        <Button
          label="Skip for now"
          onPress={handleSubmit}
          variant="ghost"
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
  sub: { fontSize: typography.body.size, color: colors.stone, lineHeight: 22 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  slot: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.sand,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  slotFilled: {
    borderColor: colors.emerald,
    borderStyle: 'solid',
    backgroundColor: colors.safeBg,
  },
  slotIcon: { fontSize: 28, color: colors.stone },
  slotFilledIcon: { fontSize: 24 },
  slotLabel: {
    fontSize: typography.caption.size,
    color: colors.emerald,
    fontWeight: '600',
  },
  hint: {
    fontSize: typography.caption.size,
    color: colors.stone,
    textAlign: 'center',
  },
  chatNote: {
    backgroundColor: colors.forest,
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  chatNoteText: { fontSize: typography.bodySm.size, color: colors.cream, lineHeight: 20 },
});
