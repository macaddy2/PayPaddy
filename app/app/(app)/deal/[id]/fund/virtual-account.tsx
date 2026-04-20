/**
 * Virtual Account screen — Providus Bank escrow funding.
 *
 * Displays the one-time virtual account number and the exact amount to
 * transfer. The mock API transitions the deal awaiting_funds → funded after
 * SLA_MS.paymentSettle (~3.5s) via a setTimeout, so this screen polls the
 * deal store and auto-advances to the Deal Room once the transition fires.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { BackHeader, Card, Screen } from '@/ui';
import { useDeal, useDeals } from '@/state';
import { formatNaira } from '@/domain/money';
import { colors, spacing, typography } from '@/theme';
import type { VirtualAccount } from '@/domain/schema';

export default function VirtualAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deal = useDeal(id ?? '');
  const { fundViaVirtualAccount, loadOne } = useDeals();
  const [va, setVa] = useState<VirtualAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch virtual account on mount.
  useEffect(() => {
    if (!id) return;
    void fundViaVirtualAccount(id).then((account) => {
      setVa(account);
      setLoading(false);
    });
  }, [id, fundViaVirtualAccount]);

  // Poll the deal store every 2s — once funded, navigate to deal room.
  useEffect(() => {
    if (!id) return;
    pollingRef.current = setInterval(() => {
      void loadOne(id);
      if (deal?.status === 'funded') {
        clearInterval(pollingRef.current!);
        router.replace({ pathname: '/(app)/deal/[id]', params: { id } });
      }
    }, 2000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [id, deal?.status, loadOne, router]);

  function copyToClipboard(text: string, label: string) {
    Clipboard.setString(text);
    Alert.alert('Copied!', `${label} copied to clipboard.`);
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Transfer Details" />

      <View style={styles.body}>
        <Text style={styles.heading}>Make the transfer</Text>
        <Text style={styles.sub}>
          Send the exact amount to the account below. Funds go directly into
          CBN-licensed escrow — not our wallet.
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.lime} size="large" />
        ) : va ? (
          <>
            <Card style={styles.vaCard}>
              {/* Bank name */}
              <View style={styles.vaRow}>
                <Text style={styles.vaLabel}>Bank</Text>
                <Text style={styles.vaValue}>{va.bankName}</Text>
              </View>

              {/* Account name */}
              <View style={styles.vaRow}>
                <Text style={styles.vaLabel}>Account Name</Text>
                <Text style={styles.vaValue}>{va.accountName}</Text>
              </View>

              {/* Account number with copy */}
              <View style={styles.vaRow}>
                <Text style={styles.vaLabel}>Account Number</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(va.accountNumber, 'Account number')}
                  style={styles.copyRow}
                >
                  <Text style={styles.vaNumber}>{va.accountNumber}</Text>
                  <Text style={styles.copyIcon}>📋</Text>
                </TouchableOpacity>
              </View>

              {/* Amount */}
              <View style={[styles.vaRow, styles.vaRowLast]}>
                <Text style={styles.vaLabel}>Amount (exact)</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(
                    String(Math.floor(va.amountKobo / 100)),
                    'Amount',
                  )}
                  style={styles.copyRow}
                >
                  <Text style={styles.vaAmount}>{formatNaira(va.amountKobo)}</Text>
                  <Text style={styles.copyIcon}>📋</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Waiting indicator */}
            <View style={styles.waiting}>
              <ActivityIndicator color={colors.lime} />
              <Text style={styles.waitingText}>Waiting for your transfer…</Text>
            </View>

            <Text style={styles.expiry}>
              This account expires at{' '}
              {new Date(va.expiresAt).toLocaleTimeString('en-NG', { timeStyle: 'short' })}.
              Generate a new one if it expires.
            </Text>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.xl, alignItems: 'stretch' },
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
  vaCard: {},
  vaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand,
  },
  vaRowLast: { borderBottomWidth: 0 },
  vaLabel: { fontSize: typography.bodySm.size, color: colors.stone, fontWeight: '500' },
  vaValue: { fontSize: typography.bodySm.size, color: colors.cream, fontWeight: '600' },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  vaNumber: {
    fontSize: typography.h3.size,
    fontWeight: '700',
    color: colors.lime,
    letterSpacing: 1.5,
  },
  vaAmount: {
    fontSize: typography.h3.size,
    fontWeight: '800',
    color: colors.lime,
  },
  copyIcon: { fontSize: 16 },
  waiting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
  },
  waitingText: {
    fontSize: typography.body.size,
    color: colors.stone,
    fontWeight: '500',
  },
  expiry: {
    fontSize: typography.caption.size,
    color: colors.stone,
    textAlign: 'center',
  },
});
