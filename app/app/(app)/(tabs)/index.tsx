/**
 * Home tab — the primary dashboard.
 *
 * Shows:
 *  1. Escrow balance card (locked funds + available wallet balance)
 *  2. Primary CTA — "Start a New Deal"
 *  3. Active deals list
 *
 * Data is loaded from the wallet and deals stores on mount. The escrow
 * balance card uses the vault metaphor from the v2 design prototype.
 */

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, Card, Pill, Screen } from '@/ui';
import { useAuth, useDeals, useWallet } from '@/state';
import { formatNaira } from '@/domain/money';
import { colors, spacing, typography } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { wallet, load: loadWallet } = useWallet();
  const { byId, listLoading, loadAll } = useDeals();

  const deals = Object.values(byId);
  const activeDeals = deals.filter((d) => !['settled', 'refunded'].includes(d.status));

  // How much is currently locked in escrow (funded + in_progress + delivered deals)
  const lockedKobo = activeDeals
    .filter((d) => ['funded', 'in_progress', 'delivered', 'disputed'].includes(d.status))
    .reduce((sum, d) => sum + d.grossKobo, 0);

  useEffect(() => {
    if (!user) return;
    void loadWallet(user.id);
    void loadAll(user.id);
  }, [user, loadWallet, loadAll]);

  return (
    <Screen bg={colors.ink} padH={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day{user?.firstName ? `, ${user.firstName}` : ''} 👋</Text>
          <Text style={styles.sub}>Your escrow wallet</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Text style={styles.notifIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Escrow balance card */}
      <View style={styles.pad}>
        <Card style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>LOCKED IN ESCROW</Text>
              <Text style={styles.balanceAmount}>{formatNaira(lockedKobo)}</Text>
            </View>
            <Text style={styles.vaultIcon}>🔒</Text>
          </View>
          <View style={styles.availableRow}>
            <Text style={styles.availableLabel}>Available</Text>
            <Text style={styles.availableAmount}>
              {formatNaira(wallet?.availableKobo ?? 0)}
            </Text>
          </View>
        </Card>

        {/* Primary CTA */}
        <Button
          label="Start a New Deal"
          onPress={() => router.push('/(app)/deal/new')}
          style={styles.cta}
        />
      </View>

      {/* Active deals */}
      <Text style={[styles.sectionTitle, styles.pad]}>Active Deals</Text>

      {activeDeals.length === 0 && !listLoading ? (
        <View style={[styles.empty, styles.pad]}>
          <Text style={styles.emptyText}>No active deals. Start one above!</Text>
        </View>
      ) : (
        <FlatList
          data={activeDeals}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(app)/deal/[id]', params: { id: item.id } })}
              activeOpacity={0.85}
            >
              <Card
                style={styles.dealCard}
                // Urgent: deals approaching auto-release get a coral accent
                accent={
                  item.autoReleaseAt && new Date(item.autoReleaseAt).getTime() - Date.now() < 3 * 60 * 60 * 1000
                    ? colors.coral
                    : undefined
                }
              >
                <View style={styles.dealRow}>
                  <View style={styles.dealInfo}>
                    <Text style={styles.dealTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.dealAmount}>{formatNaira(item.grossKobo)}</Text>
                  </View>
                  <StatusPill status={item.status} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

/** Maps deal status → Pill tone + human label. */
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; tone: 'safe' | 'caution' | 'alert' | 'info' | 'neutral' }> = {
    awaiting_funds: { label: 'Awaiting Funds', tone: 'caution' },
    funded: { label: 'Funded', tone: 'safe' },
    in_progress: { label: 'In Progress', tone: 'info' },
    delivered: { label: 'Delivered', tone: 'caution' },
    disputed: { label: 'Disputed', tone: 'alert' },
    settled: { label: 'Settled', tone: 'safe' },
    refunded: { label: 'Refunded', tone: 'neutral' },
  };
  const { label, tone } = map[status] ?? { label: status, tone: 'neutral' as const };
  return <Pill label={label} tone={tone} />;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.h3.size,
    fontWeight: '700',
    color: colors.cream,
  },
  sub: { fontSize: typography.caption.size, color: colors.stone, marginTop: 2 },
  notifBtn: { padding: spacing.xs },
  notifIcon: { fontSize: 22 },
  pad: { paddingHorizontal: spacing.lg },

  balanceCard: {
    backgroundColor: colors.emerald,
    marginBottom: spacing.lg,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  balanceLabel: {
    fontSize: typography.caption.size,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: typography.display.size,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  vaultIcon: { fontSize: 28 },
  availableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: spacing.md,
  },
  availableLabel: {
    fontSize: typography.bodySm.size,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  availableAmount: {
    fontSize: typography.body.size,
    fontWeight: '700',
    color: '#fff',
  },
  cta: { marginBottom: spacing.md },

  sectionTitle: {
    fontSize: typography.bodySm.size,
    fontWeight: '700',
    color: colors.stone,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  dealCard: {},
  dealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  dealInfo: { flex: 1, marginRight: spacing.md },
  dealTitle: {
    fontSize: typography.body.size,
    fontWeight: '600',
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  dealAmount: {
    fontSize: typography.bodySm.size,
    color: colors.stone,
    fontWeight: '500',
  },
  empty: { paddingTop: spacing.xxl },
  emptyText: {
    fontSize: typography.body.size,
    color: colors.stone,
    textAlign: 'center',
  },
});
