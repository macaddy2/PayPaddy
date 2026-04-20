/**
 * Fund method picker — bank transfer / card / USSD / cash-in at agent.
 *
 * USSD is listed as a first-class option per the PRD's offline-first requirement
 * (critical for unbanked buyers). For MVP, all paths route to the virtual
 * account screen since they all ultimately result in a bank transfer.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BackHeader, Screen } from '@/ui';
import { colors, radii, spacing, typography } from '@/theme';

const METHODS = [
  { key: 'bank', icon: '🏦', label: 'Bank Transfer', sub: 'Send to a virtual account (Providus)' },
  { key: 'card', icon: '💳', label: 'Debit Card', sub: 'Visa, Mastercard, Verve' },
  { key: 'ussd', icon: '📱', label: 'USSD', sub: 'Works offline — *737#, *919#, etc.' },
  { key: 'agent', icon: '🏪', label: 'Cash at Agent', sub: 'Find a nearby PayPaddy agent' },
] as const;

export default function FundMethodScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  function handleSelect(method: string) {
    if (method === 'agent') {
      router.push('/(app)/(tabs)/agents');
      return;
    }
    // All payment methods converge on the virtual account screen for MVP.
    router.push({ pathname: '/(app)/deal/[id]/fund/virtual-account', params: { id } });
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Fund Deal" />

      <View style={styles.body}>
        <Text style={styles.heading}>How do you want to pay?</Text>
        <Text style={styles.sub}>
          Your money goes into a CBN-licensed escrow — not our account.
          It's only released when you confirm the deal is done.
        </Text>

        <View style={styles.methods}>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={styles.method}
              onPress={() => handleSelect(m.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.methodIcon}>{m.icon}</Text>
              <View style={styles.methodText}>
                <Text style={styles.methodLabel}>{m.label}</Text>
                <Text style={styles.methodSub}>{m.sub}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.xl },
  heading: {
    fontSize: typography.h2.size,
    fontWeight: typography.h2.weight,
    color: colors.cream,
  },
  sub: {
    fontSize: typography.body.size,
    color: colors.stone,
    lineHeight: 22,
  },
  methods: { gap: spacing.md },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  methodIcon: { fontSize: 28, width: 36, textAlign: 'center' },
  methodText: { flex: 1 },
  methodLabel: {
    fontSize: typography.body.size,
    fontWeight: '600',
    color: colors.cream,
    marginBottom: 2,
  },
  methodSub: {
    fontSize: typography.caption.size,
    color: colors.stone,
    lineHeight: 16,
  },
  chevron: { fontSize: 20, color: colors.stone },
});
