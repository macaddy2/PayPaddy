/**
 * Publish — listing preview and share link.
 *
 * Shows a preview card of the listing and a generated deep link that the
 * seller can share on WhatsApp / Instagram to drive buyers to the deal.
 * The "share link" uses RN's built-in Share API.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BackHeader, Button, Card, Pill, Screen } from '@/ui';
import { useSeller } from '@/state';
import { colors, spacing, typography } from '@/theme';

export default function PublishScreen() {
  const { listingId, imeiVerified } = useLocalSearchParams<{ listingId: string; imeiVerified?: string }>();
  const router = useRouter();
  const { listings } = useSeller();

  const listing = listings.find((l) => l.id === listingId);
  // Simulate a share link — in production this would be a dynamic deep link.
  const shareLink = `https://paypaddy.app/deal?listing=${listingId ?? 'new'}`;

  async function handleShare() {
    await Share.share({
      message: `Check out this listing on PayPaddy — ${listing?.title ?? 'New Item'}: ${shareLink}`,
    });
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Your Listing" />

      <View style={styles.body}>
        <View style={styles.successBanner}>
          <Text style={styles.successIcon}>🎉</Text>
          <View>
            <Text style={styles.successTitle}>Listing published!</Text>
            <Text style={styles.successSub}>Share the link below to start getting buyers.</Text>
          </View>
        </View>

        {/* Preview card */}
        {listing ? (
          <Card light>
            <Text style={styles.previewTitle}>{listing.title}</Text>
            <Text style={styles.previewDesc} numberOfLines={3}>{listing.description}</Text>
            <Text style={styles.previewPrice}>₦{Math.floor(listing.priceKobo / 100).toLocaleString('en-NG')}</Text>
            <View style={styles.badges}>
              <Pill label={listing.category} tone="info" />
              {imeiVerified === 'true' && <Pill label="IMEI Verified" tone="safe" />}
            </View>
          </Card>
        ) : null}

        {/* Share link */}
        <View style={styles.linkBox}>
          <Text style={styles.linkLabel}>SHARE LINK</Text>
          <TouchableOpacity onPress={handleShare}>
            <Text style={styles.link}>{shareLink}</Text>
          </TouchableOpacity>
        </View>

        <Button label="📤 Share on WhatsApp / Instagram" onPress={handleShare} />
        <Button label="Back to Dashboard" onPress={() => router.replace('/(app)/sell/dashboard')} variant="secondary" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.lg },
  successBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md,
    backgroundColor: colors.safeBg, borderRadius: 14, padding: spacing.lg,
  },
  successIcon: { fontSize: 28 },
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
