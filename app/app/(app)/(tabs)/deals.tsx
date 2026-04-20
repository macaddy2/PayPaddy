/**
 * Deals tab — full deal list with filter chips.
 *
 * Shows all deals (active + historical) for the current user. Chips filter by
 * status category. Tapping a deal navigates to its Deal Room.
 */

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Card, Pill, Screen } from '@/ui';
import { useAuth, useDeals } from '@/state';
import { formatNaira } from '@/domain/money';
import { colors, radii, spacing, typography } from '@/theme';
import type { DealStatus } from '@/domain/schema';

type FilterKey = 'all' | 'active' | 'settled' | 'disputed';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'settled', label: 'Settled' },
  { key: 'disputed', label: 'Disputed' },
];

const ACTIVE_STATUSES: DealStatus[] = ['awaiting_funds', 'funded', 'in_progress', 'delivered'];

export default function DealsTab() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { byId, listLoading, loadAll } = useDeals();
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    if (user) void loadAll(user.id);
  }, [user, loadAll]);

  const allDeals = Object.values(byId);
  const filtered = allDeals.filter((d) => {
    if (filter === 'active') return ACTIVE_STATUSES.includes(d.status);
    if (filter === 'settled') return d.status === 'settled' || d.status === 'refunded';
    if (filter === 'disputed') return d.status === 'disputed';
    return true;
  });

  return (
    <Screen bg={colors.ink} padH={false}>
      <View style={styles.header}>
        <Text style={styles.title}>My Deals</Text>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.chip, filter === f.key && styles.chipActive]}
          >
            <Text style={[styles.chipLabel, filter === f.key && styles.chipLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {listLoading ? (
        <Text style={styles.loadingText}>Loading deals…</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No deals in this category yet.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: '/(app)/deal/[id]', params: { id: item.id } })
              }
              activeOpacity={0.85}
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.info}>
                    <Text style={styles.dealTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.category}>{item.category}</Text>
                  </View>
                  <View style={styles.right}>
                    <Text style={styles.amount}>{formatNaira(item.grossKobo)}</Text>
                    <StatusPill status={item.status} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

function StatusPill({ status }: { status: DealStatus }) {
  const toneMap: Partial<Record<DealStatus, 'safe' | 'caution' | 'alert' | 'info' | 'neutral'>> = {
    awaiting_funds: 'caution',
    funded: 'safe',
    in_progress: 'info',
    delivered: 'caution',
    disputed: 'alert',
    settled: 'safe',
    refunded: 'neutral',
  };
  const tone = toneMap[status] ?? 'neutral';
  return <Pill label={status.replace('_', ' ')} tone={tone} />;
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.h2.size,
    fontWeight: typography.h2.weight,
    color: colors.cream,
  },
  chips: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.forest,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: { borderColor: colors.lime },
  chipLabel: {
    fontSize: typography.bodySm.size,
    fontWeight: '600',
    color: colors.stone,
  },
  chipLabelActive: { color: colors.lime },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  card: {},
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  info: { flex: 1, marginRight: spacing.md },
  dealTitle: {
    fontSize: typography.body.size,
    fontWeight: '600',
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: typography.caption.size,
    color: colors.stone,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  right: { alignItems: 'flex-end', gap: spacing.xs },
  amount: {
    fontSize: typography.body.size,
    fontWeight: '700',
    color: colors.lime,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: spacing.xxl,
    color: colors.stone,
    fontSize: typography.body.size,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.xxxl,
    color: colors.stone,
    fontSize: typography.body.size,
  },
});
