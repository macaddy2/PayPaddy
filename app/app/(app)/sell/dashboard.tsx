/**
 * Seller Dashboard — collateral health indicator and listing management.
 *
 * Shows the seller's current collateral balance vs the tier minimum,
 * a visual health bar, and their active listings.
 */

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BackHeader, Button, Card, Pill, Screen, TrustBadge } from '@/ui';
import { useAuth, useSeller } from '@/state';
import { TIERS } from '@/domain/constants';
import { formatNaira } from '@/domain/money';
import { colors, spacing, typography } from '@/theme';

export default function SellerDashboard() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { seller, listings, load, loadListings } = useSeller();

  useEffect(() => {
    if (!user) return;
    void load(user.id);
    void loadListings(user.id);
  }, [user, load, loadListings]);

  if (!seller) {
    return (
      <Screen bg={colors.ink} padH>
        <BackHeader title="Seller Dashboard" />
        <Text style={styles.notSeller}>You're not a seller yet.</Text>
        <Button label="Become a Seller" onPress={() => router.push('/(app)/sell/tier')} />
      </Screen>
    );
  }

  const cfg = TIERS[seller.tier];
  // Collateral health as a percentage of the tier minimum.
  const healthPct = Math.min(1, seller.collateralKobo / cfg.stakeKobo);

  return (
    <Screen bg={colors.ink} padH={false}>
      <BackHeader title="Seller Dashboard" />

      <FlatList
        data={listings}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={
          <>
            {/* Collateral health */}
            <View style={styles.pad}>
              <Card style={styles.healthCard}>
                <View style={styles.healthHeader}>
                  <View>
                    <Text style={styles.healthLabel}>COLLATERAL BALANCE</Text>
                    <Text style={styles.healthAmount}>{formatNaira(seller.collateralKobo)}</Text>
                  </View>
                  <Pill label={seller.tier} tone={seller.tier === 'gold' ? 'caution' : 'neutral'} />
                </View>
                {/* Health bar */}
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${healthPct * 100}%` }]} />
                </View>
                <View style={styles.barLabels}>
                  <Text style={styles.barLabel}>Min: {formatNaira(cfg.stakeKobo)}</Text>
                  <Text style={styles.barLabel}>Health: {Math.round(healthPct * 100)}%</Text>
                </View>
              </Card>

              {/* Trust score */}
              <View style={styles.trustRow}>
                <TrustBadge score={seller.trustScore} verified />
                <Text style={styles.trustDetail}>
                  {seller.listingsCount} link{seller.listingsCount !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Listings header */}
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>My Payment Links</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/sell/listing/new')}>
                <Text style={styles.addLink}>+ New link</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.pad}>
            <Text style={styles.emptyText}>No payment links yet. Create your first one!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.pad}>
            <Card light>
              <Text style={styles.listingTitle}>{item.title}</Text>
              <Text style={styles.listingPrice}>{formatNaira(item.priceKobo)}</Text>
              <Text style={styles.listingCat}>{item.category}</Text>
              {item.imeiVerified === true && (
                <Pill label="IMEI Verified" tone="safe" style={styles.imeiBadge} />
              )}
            </Card>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  pad: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  healthCard: { marginBottom: spacing.md },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  healthLabel: { fontSize: typography.caption.size, fontWeight: '700', color: colors.stone, letterSpacing: 0.6, marginBottom: 4 },
  healthAmount: { fontSize: typography.h2.size, fontWeight: '800', color: colors.lime },
  barTrack: { height: 8, backgroundColor: colors.sand, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.emerald, borderRadius: 4 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  barLabel: { fontSize: typography.caption.size, color: colors.stone },
  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trustDetail: { fontSize: typography.bodySm.size, color: colors.stone },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listTitle: { fontSize: typography.h3.size, fontWeight: '700', color: colors.cream },
  addLink: { fontSize: typography.body.size, color: colors.lime, fontWeight: '600' },
  listingTitle: { fontSize: typography.body.size, fontWeight: '600', color: colors.charcoal, marginBottom: 4 },
  listingPrice: { fontSize: typography.h3.size, fontWeight: '800', color: colors.emerald },
  listingCat: { fontSize: typography.caption.size, color: colors.stone, marginTop: 2 },
  imeiBadge: { marginTop: spacing.sm },
  notSeller: { fontSize: typography.body.size, color: colors.stone, marginBottom: spacing.lg },
  emptyText: { fontSize: typography.body.size, color: colors.stone, textAlign: 'center' },
});
