import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionBar, BackHeader, Eyebrow, MetricCard, Screen, TrustPill, VaultCard } from '@/ui';
import type { CommerceIntentDetail } from '@/domain/schema';
import { api } from '@/services/api';
import { useAuth, useDeals } from '@/state';
import { colors, radii, spacing, typography } from '@/theme';

export default function CommerceIntentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { createDealFromIntent } = useDeals();
  const [intent, setIntent] = useState<CommerceIntentDetail | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (id) void api.commerce.getIntent(id).then(setIntent);
  }, [id]);

  async function startEscrow() {
    if (!intent) return;
    if (!user) {
      router.push('/auth/phone');
      return;
    }
    setCreating(true);
    try {
      const deal = await createDealFromIntent({ intentId: intent.id, buyerId: user.id });
      router.push({ pathname: '/(app)/deal/[id]/fund/method', params: { id: deal.id } });
    } catch (error) {
      Alert.alert('No wahala', (error as Error).message);
    } finally {
      setCreating(false);
    }
  }

  if (!intent) {
    return (
      <Screen bg={colors.cream} padH>
        <BackHeader title="Checkout handoff" />
        <Text style={styles.loading}>Loading commerce intent...</Text>
      </Screen>
    );
  }

  return (
    <Screen bg={colors.cream} padH={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackHeader title="Checkout handoff" />
          <View style={styles.productHero}>
            <Text style={styles.emoji}>{intent.imageEmoji}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{intent.title}</Text>
              <Text style={styles.location}>{intent.partner.name} · {intent.externalRef}</Text>
            </View>
            <TrustPill label={intent.partner.integrationMode.toUpperCase().replace('_', ' ')} tone="info" />
          </View>

          <VaultCard amountKobo={intent.amountKobo} label="PAYPADDY ESCROW HANDOFF" bank="Funds stay locked until buyer confirms" />

          <View style={styles.metricRow}>
            <MetricCard label="trust score" value={`${intent.partner.trustScore}`} tone="safe" />
            <MetricCard label="successful deals" value={`${intent.partner.successfulDeals}`} tone="info" />
            <MetricCard label="disputes" value={`${intent.partner.disputeRatePct}%`} tone="caution" />
          </View>

          <View style={styles.card}>
            <Eyebrow>External checkout payload</Eyebrow>
            <Text style={styles.description}>{intent.description}</Text>
            <View style={styles.pills}>
              <TrustPill label="TRINITY" tone="safe" />
              <TrustPill label={`${intent.partner.tier.toUpperCase()} COLLATERAL`} tone="caution" />
              <TrustPill label="SAFEGUARD" tone="info" />
            </View>
          </View>

          <View style={styles.note}>
            <Text style={styles.noteTitle}>No wahala. Your money is safe.</Text>
            <Text style={styles.noteText}>PayPaddy is not the shop. We lock the money, verify the seller trust layer, and return you to the original commerce flow after settlement.</Text>
          </View>

          <ActionBar
            primaryLabel={creating ? 'Creating escrow...' : 'Fund protected deal'}
            onPrimary={startEscrow}
            secondaryLabel="View partner trust"
            onSecondary={() => router.push({ pathname: '/(app)/commerce/partner/[id]', params: { id: intent.partner.id } })}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 110 },
  header: { backgroundColor: colors.forest, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: spacing.lg },
  productHero: { marginHorizontal: spacing.lg, height: 180, borderRadius: 24, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  emoji: { fontSize: 72 },
  body: { padding: spacing.lg, gap: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  title: { color: colors.charcoal, fontSize: typography.h1.size, lineHeight: typography.h1.lineHeight, fontWeight: '900', letterSpacing: -0.8 },
  location: { color: colors.stone, fontWeight: '700', marginTop: 3 },
  metricRow: { flexDirection: 'row', gap: spacing.sm },
  card: { gap: spacing.sm, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.sand, borderRadius: radii.md, padding: spacing.lg },
  description: { color: colors.stone, fontSize: typography.body.size, lineHeight: 22, fontWeight: '600' },
  pills: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  note: { backgroundColor: colors.safeBg, borderRadius: radii.md, padding: spacing.lg, borderLeftWidth: 4, borderLeftColor: colors.emerald },
  noteTitle: { color: colors.emerald, fontSize: typography.h3.size, fontWeight: '900' },
  noteText: { color: colors.charcoal, marginTop: 4, lineHeight: 21, fontWeight: '600' },
  loading: { color: colors.stone, marginTop: spacing.xl, fontWeight: '700' },
});
