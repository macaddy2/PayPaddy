/**
 * Receipt screen — formal settlement confirmation shown after a deal is settled.
 *
 * Designed to be printable / shareable as social proof of a safe transaction.
 * Shows the full fee breakdown, parties, and a deal ID for reference.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, Card, Screen } from '@/ui';
import { useDeal } from '@/state';
import { formatNaira, computeFees } from '@/domain/money';
import { colors, spacing, typography } from '@/theme';

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deal = useDeal(id ?? '');

  if (!deal) return null;

  const fees = computeFees(deal.grossKobo, deal.sellerTier);
  const settledAt = deal.confirmedAt
    ? new Date(deal.confirmedAt).toLocaleString('en-NG', { dateStyle: 'long', timeStyle: 'short' })
    : 'Now';

  async function handleShare() {
    await Share.share({
      message:
        `PayPaddy Receipt — ${deal.title}\n` +
        `Amount: ${formatNaira(fees.grossKobo)}\n` +
        `Deal ID: ${deal.id}\n` +
        `Status: Settled ✓`,
    });
  }

  return (
    <Screen bg={colors.cream} padH scroll>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>PayPaddy</Text>
        <Text style={styles.headerSub}>SETTLEMENT RECEIPT</Text>
      </View>

      {/* Status badge */}
      <View style={styles.statusBadge}>
        <Text style={styles.statusTick}>✓</Text>
        <Text style={styles.statusText}>Deal Settled</Text>
      </View>

      {/* Main details */}
      <Card light style={styles.section}>
        <ReceiptRow label="Deal" value={deal.title} />
        <ReceiptRow label="Category" value={deal.category} />
        <ReceiptRow label="Deal ID" value={deal.id.slice(0, 16) + '…'} mono />
        <ReceiptRow label="Settled at" value={settledAt} />
      </Card>

      {/* Fee breakdown */}
      <Card light style={styles.section}>
        <Text style={styles.sectionLabel}>PAYMENT BREAKDOWN</Text>
        <ReceiptRow label="Buyer paid" value={formatNaira(fees.grossKobo)} />
        <ReceiptRow label="Escrow fee" value={`-${formatNaira(fees.escrowFeeKobo)}`} />
        <ReceiptRow label="SafeGuard levy" value={`-${formatNaira(fees.safeguardKobo)}`} />
        <View style={styles.divider} />
        <ReceiptRow label="Seller received" value={formatNaira(fees.netToSellerKobo)} highlight />
      </Card>

      {/* Trust note */}
      <View style={styles.trustNote}>
        <Text style={styles.trustText}>
          🔒 This transaction was protected by PayPaddy CBN-licensed escrow.
          Seller tier: {deal.sellerTier.toUpperCase()}.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button label="Share Receipt" onPress={handleShare} variant="secondary" />
        <TouchableOpacity onPress={() => router.replace('/(app)/(tabs)')}>
          <Text style={styles.homeLink}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

function ReceiptRow({
  label,
  value,
  highlight,
  mono,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowHighlight, mono && styles.rowMono]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: spacing.xxl, paddingBottom: spacing.md },
  logo: {
    fontSize: typography.h2.size,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: typography.caption.size,
    fontWeight: '700',
    color: colors.stone,
    letterSpacing: 2,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  statusTick: { fontSize: 20, color: colors.safe },
  statusText: {
    fontSize: typography.h3.size,
    fontWeight: '700',
    color: colors.safe,
  },
  section: { marginBottom: spacing.md },
  sectionLabel: {
    fontSize: typography.caption.size,
    fontWeight: '700',
    color: colors.stone,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand,
  },
  rowLabel: { fontSize: typography.bodySm.size, color: colors.stone, fontWeight: '500' },
  rowValue: { fontSize: typography.bodySm.size, color: colors.charcoal, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  rowHighlight: { color: colors.emerald, fontSize: typography.body.size, fontWeight: '700' },
  rowMono: { fontFamily: 'monospace', letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: colors.sand, marginVertical: spacing.xs },
  trustNote: {
    backgroundColor: colors.safeBg,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  trustText: { fontSize: typography.bodySm.size, color: colors.safe, lineHeight: 20 },
  actions: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  homeLink: {
    textAlign: 'center',
    fontSize: typography.body.size,
    color: colors.stone,
    fontWeight: '500',
  },
});
