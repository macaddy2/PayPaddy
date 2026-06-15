import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DealCard, Eyebrow, MetricCard, Screen, TrustPill, VaultCard } from '@/ui';
import { useAuth, useDeals, useWallet } from '@/state';
import { colors, radii, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { wallet, load: loadWallet } = useWallet();
  const { byId, loadAll } = useDeals();

  const deals = Object.values(byId);
  const activeDeals = deals.filter((d) => !['settled', 'refunded'].includes(d.status));
  const lockedKobo = activeDeals
    .filter((d) => ['funded', 'in_progress', 'delivered', 'disputed'].includes(d.status))
    .reduce((sum, d) => sum + d.grossKobo, 0);

  useEffect(() => {
    if (!user) return;
    void loadWallet(user.id);
    void loadAll(user.id);
  }, [user, loadWallet, loadAll]);

  return (
    <Screen bg={colors.cream} padH={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.collar}>
          <View style={styles.topRow}>
            <View style={styles.identity}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(user?.firstName ?? 'AO').slice(0, 2).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.welcome}>Welcome back, {user?.firstName ?? 'Ade'} 👋</Text>
                <Text style={styles.sub}>Money no go waka.</Text>
              </View>
            </View>
            <Text style={styles.bell}>🔔</Text>
          </View>
          <VaultCard amountKobo={lockedKobo} label="LOCKED IN ESCROW" bank={`across ${activeDeals.length} active deals`} />
        </View>

        <View style={styles.body}>
          <TouchableOpacity activeOpacity={0.88} style={styles.primaryCta} onPress={() => router.push('/(app)/deal/new')}>
            <View style={styles.plus}><Text style={styles.plusText}>+</Text></View>
            <Text style={styles.primaryCtaText}>Start a New Deal</Text>
          </TouchableOpacity>

          <View style={styles.quickRow}>
            <QuickChip label="Integrations" onPress={() => router.push('/(app)/(tabs)/commerce')} />
            <QuickChip label="Pay Offline" onPress={() => router.push('/(app)/(tabs)/agents')} />
            <QuickChip label="Admin" onPress={() => router.push('/(app)/admin/disputes')} />
          </View>

          <View style={styles.metricRow}>
            <MetricCard label="available" value={shortNaira(wallet?.availableKobo ?? 0)} tone="safe" />
            <MetricCard label="Trust Score" value="92" tone="info" />
            <MetricCard label="SafeGuard" value="Live" tone="caution" />
          </View>

          <View style={styles.sectionHead}>
            <Eyebrow>Active Deals · {activeDeals.length}</Eyebrow>
            <TrustPill label="TRINITY ✓" tone="safe" />
          </View>

          <View style={styles.stack}>
            {activeDeals.map((deal) => (
              <DealCard
                key={deal.id}
                title={deal.title}
                meta={`${deal.category.replace('_', ' ')} · ${deal.status.replace('_', ' ')}`}
                amountKobo={deal.grossKobo}
                urgent={deal.status === 'disputed'}
                onPress={() => router.push({ pathname: '/(app)/deal/[id]', params: { id: deal.id } })}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function QuickChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.quickChip}>
      <Text style={styles.quickChipText}>{label}</Text>
    </TouchableOpacity>
  );
}

function shortNaira(kobo: number) {
  const naira = kobo / 100;
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`;
  if (naira >= 1_000) return `₦${Math.round(naira / 1_000)}K`;
  return `₦${naira}`;
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 110 },
  collar: {
    backgroundColor: colors.forest,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.apricot, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.ink, fontWeight: '900' },
  welcome: { color: colors.cream, fontSize: typography.body.size, fontWeight: '900' },
  sub: { color: colors.lime, fontSize: typography.caption.size, fontWeight: '800', marginTop: 2 },
  bell: { fontSize: 20 },
  body: { padding: spacing.lg, gap: spacing.md },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 54,
    borderRadius: radii.md,
    backgroundColor: colors.ink,
  },
  plus: { width: 24, height: 24, borderRadius: 7, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  plusText: { color: colors.ink, fontWeight: '900', fontSize: 16 },
  primaryCtaText: { color: colors.cream, fontSize: typography.body.size, fontWeight: '900' },
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quickChip: { flex: 1, minHeight: 42, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.sand, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xs },
  quickChipText: { color: colors.charcoal, fontSize: typography.caption.size, fontWeight: '900' },
  metricRow: { flexDirection: 'row', gap: spacing.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  stack: { gap: spacing.sm },
});
