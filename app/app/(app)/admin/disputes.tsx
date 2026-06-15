import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BackHeader, Eyebrow, MetricCard, Screen, TrustPill } from '@/ui';
import type { Deal, Dispute, DisputeVerdict } from '@/domain/schema';
import { formatNaira } from '@/domain/money';
import { api } from '@/services/api';
import { colors, radii, spacing, typography } from '@/theme';

type QueueItem = { dispute: Dispute; deal: Deal | null };

export default function AdminDisputesScreen() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadQueue() {
    const disputes = await api.disputes.listAdminQueue();
    const enriched = await Promise.all(
      disputes.map(async (dispute) => {
        try {
          return { dispute, deal: await api.deals.get(dispute.dealId) };
        } catch {
          return { dispute, deal: null };
        }
      }),
    );
    setItems(enriched);
  }

  useEffect(() => {
    void loadQueue();
  }, []);

  async function resolve(disputeId: string, verdict: DisputeVerdict) {
    setBusyId(disputeId);
    try {
      await api.disputes.resolve(disputeId, verdict);
      await loadQueue();
    } catch (error) {
      Alert.alert('Resolution failed', (error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen bg={colors.cream} padH={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <BackHeader title="Arbitration" />
          <Text style={styles.title}>Human paddy review</Text>
          <Text style={styles.sub}>Dispute-transparent, collateral-backed decisions for the trust layer.</Text>
          <View style={styles.metrics}>
            <MetricCard label="open cases" value={`${items.length}`} tone="alert" />
            <MetricCard label="review SLA" value="24h" tone="info" />
            <MetricCard label="SafeGuard" value="live" tone="safe" />
          </View>
        </View>

        <View style={styles.body}>
          <Eyebrow>Queue</Eyebrow>
          {items.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No wahala.</Text>
              <Text style={styles.emptyText}>All disputes are resolved. The trust layer is quiet.</Text>
            </View>
          ) : (
            items.map(({ dispute, deal }) => (
              <View key={dispute.id} style={styles.caseCard}>
                <View style={styles.caseHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.caseTitle}>{deal?.title ?? dispute.dealId}</Text>
                    <Text style={styles.caseMeta}>{dispute.reason.replace('_', ' ')} · {dispute.status.replace('_', ' ')}</Text>
                  </View>
                  <TrustPill label={deal ? formatNaira(deal.grossKobo) : 'Review'} tone="alert" />
                </View>
                <Text style={styles.description}>{dispute.description}</Text>
                <View style={styles.evidenceBox}>
                  <Eyebrow>Evidence</Eyebrow>
                  {dispute.evidenceUrls.length === 0 ? (
                    <Text style={styles.evidence}>No attachments yet</Text>
                  ) : (
                    dispute.evidenceUrls.map((item) => <Text key={item} style={styles.evidence}>• {item}</Text>)
                  )}
                </View>
                <View style={styles.actions}>
                  <ResolveButton label="Buyer wins" disabled={busyId === dispute.id} onPress={() => resolve(dispute.id, 'buyer_wins')} />
                  <ResolveButton label="Split" disabled={busyId === dispute.id} onPress={() => resolve(dispute.id, 'split')} />
                  <ResolveButton label="Seller wins" disabled={busyId === dispute.id} onPress={() => resolve(dispute.id, 'seller_wins')} />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function ResolveButton({ label, disabled, onPress }: { label: string; disabled?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.resolveButton, disabled && styles.disabled]}>
      <Text style={styles.resolveText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 80 },
  hero: { backgroundColor: colors.alert, paddingBottom: spacing.xl, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  title: { color: '#fff', fontSize: typography.h1.size, fontWeight: '900', paddingHorizontal: spacing.lg, letterSpacing: -0.8 },
  sub: { color: 'rgba(255,255,255,0.76)', paddingHorizontal: spacing.lg, marginTop: 4, lineHeight: 20, fontWeight: '700' },
  metrics: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  body: { padding: spacing.lg, gap: spacing.md },
  empty: { backgroundColor: '#fff', borderRadius: radii.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.sand },
  emptyTitle: { color: colors.emerald, fontWeight: '900', fontSize: typography.h3.size },
  emptyText: { color: colors.stone, marginTop: 4, fontWeight: '600' },
  caseCard: { backgroundColor: '#fff', borderRadius: radii.md, borderWidth: 1, borderColor: colors.sand, padding: spacing.lg, gap: spacing.md },
  caseHead: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  caseTitle: { color: colors.charcoal, fontSize: typography.h3.size, fontWeight: '900' },
  caseMeta: { color: colors.stone, fontSize: typography.caption.size, fontWeight: '800', marginTop: 3, textTransform: 'capitalize' },
  description: { color: colors.charcoal, lineHeight: 21, fontWeight: '600' },
  evidenceBox: { backgroundColor: colors.alertBg, borderRadius: radii.sm, padding: spacing.md, gap: spacing.xs },
  evidence: { color: colors.charcoal, fontSize: typography.bodySm.size, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  resolveButton: { flexGrow: 1, minHeight: 42, borderRadius: radii.sm, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  resolveText: { color: colors.cream, fontWeight: '900', fontSize: typography.caption.size },
  disabled: { opacity: 0.5 },
});
