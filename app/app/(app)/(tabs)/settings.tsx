/**
 * Settings / Me tab — profile, tier, sign-out, and entry to seller onboarding.
 *
 * This screen is the hub for identity (Trinity status), seller tier, payout,
 * and legal links. Keep it intentionally simple — no nested navigator here.
 */

import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card, Pill, Screen, TrustBadge } from '@/ui';
import { useAuth, useSeller, useWallet } from '@/state';
import { formatNaira } from '@/domain/money';
import { colors, spacing, typography } from '@/theme';

export default function SettingsTab() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { wallet } = useWallet();
  const { seller } = useSeller();

  function handleSignOut() {
    Alert.alert('Sign out', 'You go leave PayPaddy?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  if (!user) return null;

  const trinityVerified =
    user.trinity.bvn === 'verified' &&
    user.trinity.nin === 'verified' &&
    user.trinity.liveness === 'verified';

  return (
    <Screen bg={colors.ink} padH scroll>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {user.firstName ? user.firstName[0] : user.phone.slice(-2)}
          </Text>
        </View>
        <Text style={styles.name}>{user.firstName ?? user.phone}</Text>
        <TrustBadge score={seller?.trustScore ?? 0} verified={trinityVerified} />
      </View>

      {/* Wallet balance */}
      {wallet && (
        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>WALLET</Text>
          <Text style={styles.balanceAmount}>{formatNaira(wallet.availableKobo)}</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/payout')} style={styles.payoutBtn}>
            <Text style={styles.payoutBtnLabel}>Withdraw →</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Trinity status */}
      <Card style={styles.section}>
        <Text style={styles.sectionLabel}>TRINITY STATUS</Text>
        <View style={styles.trinityRow}>
          <TrinityItem label="BVN" status={user.trinity.bvn} />
          <TrinityItem label="NIN" status={user.trinity.nin} />
          <TrinityItem label="Face" status={user.trinity.liveness} />
        </View>
      </Card>

      {/* Seller tier */}
      <Card style={styles.section}>
        <Text style={styles.sectionLabel}>SELLER TIER</Text>
        {seller ? (
          <View style={styles.tierRow}>
            <Pill
              label={seller.tier.toUpperCase()}
              tone={seller.tier === 'gold' ? 'caution' : 'neutral'}
            />
            <Text style={styles.tierCollateral}>
              Collateral: {formatNaira(seller.collateralKobo)}
            </Text>
          </View>
        ) : (
          <TouchableOpacity onPress={() => router.push('/(app)/sell/tier')}>
            <Text style={styles.becomeSellerLink}>Become a seller →</Text>
          </TouchableOpacity>
        )}
      </Card>

      {/* Settings links */}
      <Card style={styles.section}>
        <Text style={styles.sectionLabel}>MORE</Text>
        <SettingRow label="Start selling" onPress={() => router.push('/(app)/sell/tier')} />
        <SettingRow label="My listings" onPress={() => router.push('/(app)/sell/dashboard')} />
        <SettingRow label="Terms of Service" onPress={() => {}} />
        <SettingRow label="Privacy Policy" onPress={() => {}} />
        <SettingRow label="Sign out" onPress={handleSignOut} danger />
      </Card>
    </Screen>
  );
}

function TrinityItem({ label, status }: { label: string; status: string }) {
  const tone = status === 'verified' ? 'safe' : status === 'failed' ? 'alert' : 'caution';
  return (
    <View style={styles.trinityItem}>
      <Text style={styles.trinityLabel}>{label}</Text>
      <Pill label={status} tone={tone} />
    </View>
  );
}

function SettingRow({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.settingRow}>
      <Text style={[styles.settingLabel, danger && styles.settingDanger]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 28, fontWeight: '800', color: '#fff' },
  name: {
    fontSize: typography.h2.size,
    fontWeight: '700',
    color: colors.cream,
  },
  section: { marginBottom: spacing.md },
  sectionLabel: {
    fontSize: typography.caption.size,
    fontWeight: '700',
    color: colors.stone,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  balanceAmount: {
    fontSize: typography.h1.size,
    fontWeight: '800',
    color: colors.lime,
    marginBottom: spacing.md,
  },
  payoutBtn: { alignSelf: 'flex-start' },
  payoutBtnLabel: {
    fontSize: typography.body.size,
    color: colors.emerald,
    fontWeight: '600',
  },
  trinityRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  trinityItem: { gap: spacing.xs },
  trinityLabel: {
    fontSize: typography.caption.size,
    color: colors.stone,
    fontWeight: '600',
  },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tierCollateral: { fontSize: typography.bodySm.size, color: colors.stone },
  becomeSellerLink: {
    fontSize: typography.body.size,
    color: colors.lime,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand,
  },
  settingLabel: {
    fontSize: typography.body.size,
    color: colors.charcoal,
    fontWeight: '500',
  },
  settingDanger: { color: colors.alert },
  chevron: { fontSize: 18, color: colors.stone },
});
