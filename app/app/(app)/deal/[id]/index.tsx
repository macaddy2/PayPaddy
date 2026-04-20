/**
 * Deal Room — the heart of the PayPaddy experience.
 *
 * Shows the vault metaphor (lock icon, escrow status), a 4-stage progress
 * timeline, party cards (buyer + seller), an activity feed, and state-aware
 * CTAs. Polls the deal store every 5s while the deal is in a transitional
 * state (awaiting_funds → funded) to pick up mock webhook transitions.
 *
 * autoReleaseAt countdown is shown when the deal is delivered — the buyer has
 * until then to raise a dispute before funds auto-release to the seller.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BackHeader, Button, Card, Pill, Screen } from '@/ui';
import { useDeal, useDeals } from '@/state';
import { formatNaira, computeFees } from '@/domain/money';
import { colors, spacing, typography } from '@/theme';
import { DEAL_CATEGORIES } from '@/domain/constants';
import type { DealStatus } from '@/domain/schema';

// Status → stage index (0-3) for the progress track.
const STATUS_STAGE: Partial<Record<DealStatus, number>> = {
  awaiting_funds: 0,
  funded: 1,
  in_progress: 1,
  delivered: 2,
  settled: 3,
  refunded: 3,
  disputed: 2,
};

const STAGE_LABELS = ['Created', 'Funded', 'Delivered', 'Done'];

export default function DealRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deal = useDeal(id ?? '');
  const { loadOne, confirmReceipt } = useDeals();
  const [confirming, setConfirming] = useState(false);
  const [countdown, setCountdown] = useState('');

  // Poll while in a transitional state (awaiting_funds waits for mock webhook).
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => {
      if (deal?.status === 'awaiting_funds') void loadOne(id);
    }, 3000);
    return () => clearInterval(interval);
  }, [id, deal?.status, loadOne]);

  // Countdown timer for auto-release window.
  useEffect(() => {
    if (!deal?.autoReleaseAt) return;
    const tick = () => {
      const diff = new Date(deal.autoReleaseAt!).getTime() - Date.now();
      if (diff <= 0) { setCountdown('Releasing funds…'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setCountdown(`${h}h ${m}m until auto-release`);
    };
    tick();
    const id2 = setInterval(tick, 60_000);
    return () => clearInterval(id2);
  }, [deal?.autoReleaseAt]);

  if (!deal) {
    return (
      <Screen bg={colors.ink} padH>
        <BackHeader />
        <ActivityIndicator color={colors.lime} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  const stage = STATUS_STAGE[deal.status] ?? 0;
  const fees = computeFees(deal.grossKobo, deal.sellerTier);
  const catInfo = DEAL_CATEGORIES.find((c) => c.key === deal.category);

  async function handleConfirm() {
    setConfirming(true);
    await confirmReceipt(deal.id);
    setConfirming(false);
    router.push({ pathname: '/(app)/deal/[id]/complete', params: { id: deal.id } });
  }

  return (
    <Screen bg={colors.ink} padH={false}>
      <BackHeader title="Deal Room" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Vault card */}
        <View style={styles.pad}>
          <Card style={styles.vaultCard}>
            <View style={styles.vaultTop}>
              <Text style={styles.vaultIcon}>🔒</Text>
              <View style={styles.vaultAmount}>
                <Text style={styles.vaultLabel}>LOCKED IN ESCROW</Text>
                <Text style={styles.vaultValue}>{formatNaira(deal.grossKobo)}</Text>
              </View>
              <Pill
                label={deal.status.replace('_', ' ')}
                tone={deal.status === 'funded' || deal.status === 'settled' ? 'safe'
                  : deal.status === 'disputed' ? 'alert'
                  : deal.status === 'awaiting_funds' ? 'caution' : 'info'}
              />
            </View>
            {countdown ? (
              <Text style={styles.countdown}>⏱ {countdown}</Text>
            ) : null}
          </Card>
        </View>

        {/* Progress track */}
        <View style={styles.pad}>
          <View style={styles.track}>
            {STAGE_LABELS.map((label, i) => (
              <View key={label} style={styles.stageCol}>
                <View style={[styles.stageDot, i <= stage && styles.stageDotActive]}>
                  {i < stage && <Text style={styles.stageTick}>✓</Text>}
                  {i === stage && <View style={styles.stagePulse} />}
                </View>
                {i < STAGE_LABELS.length - 1 && (
                  <View style={[styles.connector, i < stage && styles.connectorActive]} />
                )}
                <Text style={[styles.stageLabel, i <= stage && styles.stageLabelActive]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Deal details */}
        <View style={styles.pad}>
          <Card>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Deal</Text>
              <Text style={styles.detailValue} numberOfLines={2}>{deal.title}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{catInfo?.icon} {catInfo?.label}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Seller fee</Text>
              <Text style={styles.detailValue}>{formatNaira(fees.escrowFeeKobo)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>SafeGuard</Text>
              <Text style={styles.detailValue}>{formatNaira(fees.safeguardKobo)}</Text>
            </View>
            <View style={[styles.detailRow, styles.detailRowLast]}>
              <Text style={styles.detailLabel}>Seller receives</Text>
              <Text style={[styles.detailValue, styles.netAmount]}>
                {formatNaira(fees.netToSellerKobo)}
              </Text>
            </View>
          </Card>
        </View>

        {/* Timeline / activity feed */}
        <View style={styles.pad}>
          <Text style={styles.feedTitle}>Activity</Text>
          {deal.timeline.map((ev, i) => (
            <View key={i} style={styles.feedRow}>
              <View style={styles.feedDot} />
              <View>
                <Text style={styles.feedEvent}>{ev.kind.replace(/_/g, ' ')}</Text>
                <Text style={styles.feedTime}>
                  {new Date(ev.at).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* State-aware CTAs */}
        <View style={styles.actions}>
          {deal.status === 'awaiting_funds' && (
            <Button
              label="Fund this Deal"
              onPress={() =>
                router.push({ pathname: '/(app)/deal/[id]/fund/method', params: { id: deal.id } })
              }
            />
          )}
          {(deal.status === 'funded' || deal.status === 'in_progress' || deal.status === 'delivered') && (
            <>
              <Button
                label={confirming ? 'Confirming…' : 'I received it ✓'}
                onPress={handleConfirm}
                loading={confirming}
              />
              <Button
                label="Open a Dispute"
                onPress={() =>
                  router.push({ pathname: '/(app)/deal/[id]/dispute/open', params: { id: deal.id } })
                }
                variant="danger"
              />
            </>
          )}
          {deal.status === 'settled' && (
            <Button
              label="View Receipt"
              onPress={() =>
                router.push({ pathname: '/(app)/deal/[id]/receipt', params: { id: deal.id } })
              }
              variant="secondary"
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  pad: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  vaultCard: { backgroundColor: colors.forest },
  vaultTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  vaultIcon: { fontSize: 32 },
  vaultAmount: { flex: 1 },
  vaultLabel: {
    fontSize: typography.caption.size,
    fontWeight: '700',
    color: colors.stone,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  vaultValue: {
    fontSize: typography.h2.size,
    fontWeight: '800',
    color: colors.cream,
  },
  countdown: {
    fontSize: typography.caption.size,
    color: colors.caution,
    fontWeight: '600',
    marginTop: spacing.md,
    textAlign: 'center',
  },

  track: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: spacing.md },
  stageCol: { alignItems: 'center', flex: 1 },
  stageDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.stone,
  },
  stageDotActive: { backgroundColor: colors.lime, borderColor: colors.lime },
  stageTick: { fontSize: 11, fontWeight: '800', color: colors.ink },
  stagePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ink,
  },
  connector: { height: 2, width: '100%', backgroundColor: colors.stone, opacity: 0.3 },
  connectorActive: { backgroundColor: colors.lime, opacity: 1 },
  stageLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.stone,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  stageLabelActive: { color: colors.lime },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: typography.bodySm.size, color: colors.stone, fontWeight: '500' },
  detailValue: { fontSize: typography.bodySm.size, color: colors.cream, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  netAmount: { color: colors.lime },

  feedTitle: {
    fontSize: typography.bodySm.size,
    fontWeight: '700',
    color: colors.stone,
    letterSpacing: 0.6,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  feedRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  feedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.emerald, marginTop: 5 },
  feedEvent: { fontSize: typography.body.size, color: colors.cream, fontWeight: '500', textTransform: 'capitalize' },
  feedTime: { fontSize: typography.caption.size, color: colors.stone },

  actions: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
});
