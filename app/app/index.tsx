/**
 * Splash / entry redirect.
 *
 * This is the first screen expo-router renders. It reads the auth state and
 * sends the user to the right place:
 *   • Signed in + Trinity complete  →  /(app)/(tabs)  (home)
 *   • Signed in + Trinity pending   →  /auth/trinity/bvn
 *   • Signed out                    →  /welcome
 *
 * The splash is rendered during the brief moment before the auth check
 * resolves so the user never sees a blank screen.
 */

import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/state';
import { colors, typography } from '@/theme';

export default function Index() {
  const { user, loading } = useAuth();

  // Show branded splash while the session is resolving.
  if (loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>PayPaddy</Text>
        <Text style={styles.tagline}>Trust, Locked.</Text>
        {/* Regulatory trust badges — per v2 design requirement */}
        <View style={styles.badges}>
          <Text style={styles.badge}>CBN Licensed</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.badge}>NDIC Protected</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.badge}>NDPR Compliant</Text>
        </View>
        <ActivityIndicator color={colors.lime} style={styles.spinner} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  const { bvn, nin, liveness } = user.trinity;
  const trinityComplete = bvn === 'verified' && nin === 'verified' && liveness === 'verified';

  if (!trinityComplete) {
    // Resume Trinity where the user left off.
    if (bvn !== 'verified') return <Redirect href="/auth/trinity/bvn" />;
    if (nin !== 'verified') return <Redirect href="/auth/trinity/nin" />;
    return <Redirect href="/auth/trinity/liveness" />;
  }

  return <Redirect href="/(app)/(tabs)" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.lime,
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: typography.h3.size,
    fontWeight: '600',
    color: colors.emerald,
    marginBottom: 24,
    letterSpacing: 0.2,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 48,
  },
  badge: {
    fontSize: typography.caption.size,
    color: colors.stone,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dot: { color: colors.stone, fontSize: 12 },
  spinner: { marginTop: 16 },
});
