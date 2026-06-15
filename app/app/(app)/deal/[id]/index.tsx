import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionBar, BackHeader, Eyebrow, MilestoneBar, Screen, TrustPill, VaultCard } from '@/ui';
import { useDeal, useDeals } from '@/state';
import { computeFees, formatNaira } from '@/domain/money';
import { colors, radii, spacing, typography } from '@/theme';
import type { DealStatus } from '@/domain/schema';

const STATUS_STAGE: Partial<Record<DealStatus, number>> = {
  awaiting_funds: 0,
  funded: 1,
  in_progress: 2,
  delivered: 2,
  disputed: 2,
  settled: 3,
  refunded: 3,
};

const steps = ['Created', 'Funded', 'Delivery', 'Done'];

export default function DealRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deal = useDeal(id ?? '');
  const { loadOne, confirmReceipt } = useDeals();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!id) return;
    void loadOne(id);
    const interval = setInterval(() => {
      if (deal?.status === 'awaiting_funds') void loadOne(id);
    }, 3000);
    return () => clearInterval(interval);
  }, [id, deal?.status, loadOne]);

  if (!deal) {
    return (
      <Screen bg={colors.cream} padH>
        <BackHeader title="Deal Room" />
        <ActivityIndicator color={colors.emerald} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  const currentDeal = deal;
  const stage = STATUS_STAGE[currentDeal.status] ?? 0;
  const fees = computeFees(currentDeal.grossKobo, currentDeal.sellerTier);

  async function handleConfirm() {
    setConfirming(true);
    await confirmReceipt(currentDeal.id);
    setConfirming(false);
    router.push({ pathname: '/(app)/deal/[id]/complete', params: { id: currentDeal.id } });
  }

  return (
    <Screen bg={colors.cream} padH={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <BackHeader title={currentDeal.title} />
          <View style={styles.pad}>
            <VaultCard amountKobo={currentDeal.grossKobo} bank="with GTBank (CBN Licensed)" />
          </View>
        </View>

        <View style={styles.body}>
          <MilestoneBar steps={steps} activeIndex={stage} />

          <View style={styles.parties}>
            <Party initials="AO" name="You" state="Paid" tone="buyer" />
            <View style={styles.partyLine} />
            <Text style={styles.handshake}>🤝</Text>
            <View style={styles.partyLine} />
            <Party initials="TH" name="Seller" state={deal.status === 'settled' ? 'Paid' : 'Delivering'} tone="seller" />
          </View>

          <View style={styles.feeCard}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Seller fee</Text>
              <Text style={styles.feeValue}>{formatNaira(fees.escrowFeeKobo)}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>SafeGuard contribution</Text>
              <Text style={styles.feeValue}>{formatNaira(fees.safeguardKobo)}</Text>
            </View>
            <View style={[styles.feeRow, styles.lastFee]}>
              <Text style={styles.feeLabel}>Seller receives</Text>
              <Text style={[styles.feeValue, styles.safeValue]}>{formatNaira(fees.netToSellerKobo)}</Text>
            </View>
          </View>

          <View style={styles.sectionHead}>
            <Eyebrow>Activity</Eyebrow>
            <TrustPill label={currentDeal.status.replace('_', ' ').toUpperCase()} tone={currentDeal.status === 'disputed' ? 'alert' : 'safe'} />
          </View>

          <View style={styles.feed}>
            {currentDeal.timeline.map((event, index) => (
              <View key={`${event.kind}-${index}`} style={event.actor === 'seller' ? styles.sellerBubble : styles.systemBubble}>
                <Text style={styles.feedActor}>{event.actor === 'system' ? 'PayPaddy' : event.actor}</Text>
                <Text style={styles.feedText}>{event.note ?? event.kind.replace(/_/g, ' ')}</Text>
              </View>
            ))}
          </View>

          {currentDeal.status === 'awaiting_funds' ? (
            <ActionBar
              primaryLabel="Fund this Deal"
              onPrimary={() => router.push({ pathname: '/(app)/deal/[id]/fund/method', params: { id: currentDeal.id } })}
              secondaryLabel="Pay Offline"
              onSecondary={() => router.push('/(app)/(tabs)/agents')}
            />
          ) : ['funded', 'in_progress', 'delivered'].includes(currentDeal.status) ? (
            <ActionBar
              primaryLabel={confirming ? 'Confirming...' : '✓ I got the item'}
              onPrimary={handleConfirm}
              secondaryLabel="Chat"
              onSecondary={() => undefined}
              dangerLabel="Report"
              onDanger={() => router.push({ pathname: '/(app)/deal/[id]/dispute/open', params: { id: currentDeal.id } })}
            />
          ) : currentDeal.status === 'disputed' ? (
            <ActionBar
              primaryLabel="Add Evidence"
              onPrimary={() => router.push({ pathname: '/(app)/deal/[id]/dispute/evidence', params: { id: currentDeal.id, disputeId: 'disp_sneakers' } })}
              secondaryLabel="Admin Review"
              onSecondary={() => router.push('/(app)/admin/disputes')}
            />
          ) : (
            <ActionBar
              primaryLabel="View Receipt"
              onPrimary={() => router.push({ pathname: '/(app)/deal/[id]/receipt', params: { id: currentDeal.id } })}
              secondaryLabel="Back to integrations"
              onSecondary={() => router.push('/(app)/(tabs)/commerce')}
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function Party({ initials, name, state, tone }: { initials: string; name: string; state: string; tone: 'buyer' | 'seller' }) {
  return (
    <View style={styles.party}>
      <View style={[styles.partyAvatar, tone === 'seller' && styles.sellerAvatar]}>
        <Text style={[styles.partyInitials, tone === 'seller' && styles.sellerInitials]}>{initials}</Text>
      </View>
      <Text style={styles.partyName}>{name}</Text>
      <Text style={[styles.partyState, tone === 'buyer' ? styles.paid : styles.delivering]}>{state}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  header: { backgroundColor: colors.cream },
  pad: { paddingHorizontal: spacing.lg },
  body: { padding: spacing.lg, gap: spacing.md },
  parties: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radii.md, borderWidth: 1, borderColor: colors.sand, padding: spacing.md },
  party: { alignItems: 'center', width: 62 },
  partyAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.apricot, alignItems: 'center', justifyContent: 'center' },
  sellerAvatar: { backgroundColor: colors.forest },
  partyInitials: { color: colors.ink, fontWeight: '900', fontSize: 11 },
  sellerInitials: { color: colors.cream },
  partyName: { color: colors.charcoal, fontSize: 10, fontWeight: '900', marginTop: 4 },
  partyState: { fontSize: 9, fontWeight: '900', marginTop: 2 },
  paid: { color: colors.emerald },
  delivering: { color: colors.apricot },
  partyLine: { flex: 1, height: 1, backgroundColor: colors.sand },
  handshake: { paddingHorizontal: spacing.sm },
  feeCard: { backgroundColor: '#fff', borderRadius: radii.md, borderWidth: 1, borderColor: colors.sand, padding: spacing.lg },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.sand },
  lastFee: { borderBottomWidth: 0 },
  feeLabel: { color: colors.stone, fontWeight: '700' },
  feeValue: { color: colors.charcoal, fontWeight: '900' },
  safeValue: { color: colors.emerald },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feed: { gap: spacing.sm },
  systemBubble: { backgroundColor: colors.safeBg, borderRadius: radii.sm, padding: spacing.md },
  sellerBubble: { backgroundColor: '#fff', borderRadius: radii.sm, borderWidth: 1, borderColor: colors.sand, padding: spacing.md },
  feedActor: { color: colors.emerald, fontSize: typography.caption.size, fontWeight: '900', textTransform: 'capitalize' },
  feedText: { color: colors.charcoal, fontSize: typography.bodySm.size, fontWeight: '700', marginTop: 2, textTransform: 'capitalize' },
});
