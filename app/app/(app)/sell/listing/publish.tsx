import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BackHeader, Button, Card, Pill, Screen } from '@/ui';
import { useSeller } from '@/state';
import { api } from '@/services/api';
import { colors, spacing, typography } from '@/theme';

export default function PublishScreen() {
  const { listingId, imeiVerified } = useLocalSearchParams<{ listingId: string; imeiVerified?: string }>();
  const router = useRouter();
  const { listings } = useSeller();
  const [intentId, setIntentId] = useState<string | null>(null);

  const listing = listings.find((l) => l.id === listingId);
  const shareLink = `https://paypaddy.app/commerce/intent/${intentId ?? listingId ?? 'new'}`;

  useEffect(() => {
    if (!listing || intentId) return;
    void api.commerce.createIntent({
      source: 'individual_link',
      externalRef: listing.id,
      partnerId: 'partner_ig_tolu',
      sellerId: listing.sellerId,
      title: listing.title,
      description: listing.description,
      amountKobo: listing.priceKobo,
      category: listing.category,
      returnUrl: 'https://paypaddy.app/seller/links',
    }).then((intent) => setIntentId(intent.id));
  }, [intentId, listing]);

  async function handleShare() {
    await Share.share({
      message: `Pay safely with PayPaddy escrow - ${listing?.title ?? 'New deal'}: ${shareLink}`,
    });
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Payment Link" />

      <View style={styles.body}>
        <View style={styles.successBanner}>
          <Text style={styles.successIcon}>OK</Text>
          <View>
            <Text style={styles.successTitle}>Payment link ready!</Text>
            <Text style={styles.successSub}>Share it anywhere. Buyers fund escrow inside PayPaddy.</Text>
          </View>
        </View>

        {listing ? (
          <Card light>
            <Text style={styles.previewTitle}>{listing.title}</Text>
            <Text style={styles.previewDesc} numberOfLines={3}>{listing.description}</Text>
            <Text style={styles.previewPrice}>
              NGN {Math.floor(listing.priceKobo / 100).toLocaleString('en-NG')}
            </Text>
            <View style={styles.badges}>
              <Pill label={listing.category} tone="info" />
              {imeiVerified === 'true' && <Pill label="IMEI Verified" tone="safe" />}
            </View>
          </Card>
        ) : null}

        <View style={styles.linkBox}>
          <Text style={styles.linkLabel}>COMMERCE INTENT LINK</Text>
          <TouchableOpacity onPress={handleShare}>
            <Text style={styles.link}>{shareLink}</Text>
          </TouchableOpacity>
        </View>

        <Button label="Share on WhatsApp / Instagram" onPress={handleShare} />
        <Button label="Back to Dashboard" onPress={() => router.replace('/(app)/sell/dashboard')} variant="secondary" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.lg },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.safeBg,
    borderRadius: 14,
    padding: spacing.lg,
  },
  successIcon: { fontSize: 16, fontWeight: '900', color: colors.safe },
  successTitle: { fontSize: typography.body.size, fontWeight: '700', color: colors.safe, marginBottom: 4 },
  successSub: { fontSize: typography.bodySm.size, color: colors.cream },
  previewTitle: { fontSize: typography.h3.size, fontWeight: '700', color: colors.charcoal, marginBottom: 4 },
  previewDesc: { fontSize: typography.bodySm.size, color: colors.stone, lineHeight: 20, marginBottom: spacing.sm },
  previewPrice: { fontSize: typography.h2.size, fontWeight: '800', color: colors.emerald, marginBottom: spacing.sm },
  badges: { flexDirection: 'row', gap: spacing.sm },
  linkBox: { backgroundColor: colors.forest, borderRadius: 12, padding: spacing.lg, gap: spacing.xs },
  linkLabel: { fontSize: typography.caption.size, fontWeight: '700', color: colors.stone, letterSpacing: 0.6 },
  link: { fontSize: typography.bodySm.size, color: colors.lime, fontWeight: '500' },
});
