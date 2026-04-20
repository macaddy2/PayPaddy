/**
 * Agents tab — nearby PayPaddy cash-in/cash-out agents.
 *
 * The map tile is a placeholder per the README ("stub tile, not react-native-maps
 * rendered — swap when Google Maps key is provisioned"). The agent list below
 * the stub is fully functional with the mock data.
 */

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card, Screen, TrustBadge } from '@/ui';
import { api } from '@/services/api';
import { colors, spacing, typography } from '@/theme';
import { useState } from 'react';
import type { Agent } from '@/domain/schema';

export default function AgentsTab() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.agents.near('').then((list) => {
      setAgents(list);
      setLoading(false);
    });
  }, []);

  return (
    <Screen bg={colors.ink} padH={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Agents</Text>
        <Text style={styles.sub}>Physical touchpoints for cash-in and withdrawal</Text>
      </View>

      {/* Map placeholder — swap with react-native-maps when key is ready */}
      <View style={styles.mapStub}>
        <Text style={styles.mapIcon}>🗺</Text>
        <Text style={styles.mapText}>Map coming soon — Google Maps key needed</Text>
      </View>

      {loading ? (
        <Text style={styles.loading}>Finding agents near you…</Text>
      ) : (
        <FlatList
          data={agents}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: '/(app)/agent/[id]', params: { id: item.id } })
              }
              activeOpacity={0.85}
            >
              <Card light>
                <View style={styles.agentRow}>
                  <View style={styles.agentAvatar}>
                    <Text style={styles.agentInitial}>{item.name[0]}</Text>
                  </View>
                  <View style={styles.agentInfo}>
                    <Text style={styles.agentName}>{item.name}</Text>
                    <Text style={styles.agentAddress} numberOfLines={1}>{item.address}</Text>
                    <View style={styles.capabilities}>
                      {item.cashInCapable && (
                        <Text style={styles.cap}>↓ Cash-in</Text>
                      )}
                      {item.cashOutCapable && (
                        <Text style={styles.cap}>↑ Cash-out</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.agentMeta}>
                    <Text style={styles.distance}>{item.distanceKm.toFixed(1)} km</Text>
                    <Text style={styles.rating}>⭐ {item.rating}</Text>
                    <TrustBadge score={item.trustScore} />
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
  sub: { fontSize: typography.caption.size, color: colors.stone, marginTop: 2 },
  mapStub: {
    height: 140,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.forest,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  mapIcon: { fontSize: 36 },
  mapText: { fontSize: typography.caption.size, color: colors.stone },
  loading: {
    textAlign: 'center',
    marginTop: spacing.xxl,
    color: colors.stone,
    fontSize: typography.body.size,
  },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  agentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  agentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentInitial: { fontSize: 18, fontWeight: '700', color: '#fff' },
  agentInfo: { flex: 1 },
  agentName: {
    fontSize: typography.body.size,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 2,
  },
  agentAddress: {
    fontSize: typography.caption.size,
    color: colors.stone,
    marginBottom: spacing.xs,
  },
  capabilities: { flexDirection: 'row', gap: spacing.sm },
  cap: {
    fontSize: typography.caption.size,
    color: colors.emerald,
    fontWeight: '600',
  },
  agentMeta: { alignItems: 'flex-end', gap: 4 },
  distance: { fontSize: typography.caption.size, color: colors.stone, fontWeight: '600' },
  rating: { fontSize: typography.caption.size, color: colors.caution },
});
