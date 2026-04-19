/**
 * Welcome screen — the value proposition page shown to new / signed-out users.
 *
 * Follows the v2 design: dark ink background, lime CTA, Pidgin micro-copy,
 * trust badges prominent at the bottom.
 *
 * The "Create Account" button routes to phone entry; the sign-in link goes
 * to the same phone screen (OTP flow is the same for new vs returning users).
 */

import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Screen } from '@/ui';
import { colors, spacing, typography } from '@/theme';
import { track } from '@/services/analytics';

export default function WelcomeScreen() {
  const router = useRouter();

  function handleGetStarted() {
    track('welcome.cta_tapped', { variant: 'create_account' });
    router.push('/auth/phone');
  }

  return (
    <Screen bg={colors.ink} padH>
      {/* ---- Hero section ---- */}
      <View style={styles.hero}>
        {/* Logo mark */}
        <View style={styles.logoMark}>
          <Text style={styles.logoEmoji}>🔒</Text>
        </View>
        <Text style={styles.appName}>PayPaddy</Text>
        <Text style={styles.headline}>No wahala.{'\n'}Your money is safe.</Text>
        <Text style={styles.sub}>
          Escrow wey you fit trust for buying, selling, contracts, and even bets.
          Your paddy dey hold the cash until both sides happy.
        </Text>
      </View>

      {/* ---- Moat highlights ---- */}
      <View style={styles.features}>
        <FeatureRow icon="🪪" label="Trinity Verification — BVN + NIN + Face" />
        <FeatureRow icon="🏦" label="CBN-licensed escrow — not our pocket" />
        <FeatureRow icon="🛡" label="SafeGuard Pool — covers you when things go wrong" />
        <FeatureRow icon="📵" label="Works offline via USSD" />
      </View>

      {/* ---- CTA ---- */}
      <View style={styles.cta}>
        <Button label="Create Account" onPress={handleGetStarted} variant="primary" />

        <Text style={styles.signinText}>
          Already get account?{' '}
          <Text
            style={styles.signinLink}
            onPress={() => router.push('/auth/phone')}
          >
            Sign in
          </Text>
        </Text>
      </View>

      {/* ---- Regulatory trust strip ---- */}
      <View style={styles.trustStrip}>
        <Text style={styles.trustItem}>CBN Licensed</Text>
        <Text style={styles.trustDot}>·</Text>
        <Text style={styles.trustItem}>NDIC Protected</Text>
        <Text style={styles.trustDot}>·</Text>
        <Text style={styles.trustItem}>NDPR Compliant</Text>
      </View>
    </Screen>
  );
}

/** Single feature highlight row. */
function FeatureRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: spacing.xxxl,
  },
  logoMark: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoEmoji: { fontSize: 32 },
  appName: {
    fontSize: typography.h2.size,
    fontWeight: '700',
    color: colors.lime,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  headline: {
    fontSize: typography.display.size,
    fontWeight: typography.display.weight,
    color: colors.cream,
    lineHeight: typography.display.lineHeight + 4,
    marginBottom: spacing.lg,
  },
  sub: {
    fontSize: typography.body.size,
    fontWeight: '500',
    color: colors.stone,
    lineHeight: 22,
  },

  features: {
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  featureLabel: {
    fontSize: typography.bodySm.size,
    color: colors.cream,
    fontWeight: '500',
    flex: 1,
  },

  cta: { gap: spacing.lg, paddingBottom: spacing.xl },
  signinText: {
    textAlign: 'center',
    fontSize: typography.bodySm.size,
    color: colors.stone,
  },
  signinLink: { color: colors.lime, fontWeight: '600' },

  trustStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  trustItem: {
    fontSize: typography.caption.size,
    color: colors.stone,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  trustDot: { color: colors.stone, fontSize: 10 },
});
