/**
 * Agent Detail — agent info + cash-in code generation.
 *
 * The buyer selects an agent from the Agents tab, lands here, and generates a
 * 6-digit cash-in code valid for 15 minutes. The code is shown large and
 * monospace so it's easy to read aloud or show to the agent.
 *
 * The code is produced by the mock `api.agents.generateCashInCode` which returns
 * a realistic random 6-digit string with an expiry time.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Clipboard } from 'react-native';

import { BackHeader, Button, Card, Screen, TrustBadge } from '@/ui';
import { api } from '@/services/api';
import { colors, spacing, typography } from '@/theme';
import type { Agent, CashInCode } from '@/domain/schema';

export default function AgentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [cashInCode, setCashInCode] = useState<CashInCode | null>(null);
  const [generating, setGenerating] = useState(false);
  const [amountNaira, setAmountNaira] = useState('');

  useEffect(() => {
    if (!id) return;
    void api.agents.get(id).then(setAgent);
  }, [id]);

  async function handleGenerateCode() {
    const amount = parseInt(amountNaira);
    if (!amount || amount < 100) {
      Alert.alert('Enter an amount', 'Minimum cash-in is ₦100');
      return;
    }
    setGenerating(true);
    try {
      const code = await api.agents.generateCashInCode({
        agentId: id ?? '',
        amountKobo: amount * 100,
      });
      setCashInCode(code);
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  function copyCode() {
    if (!cashInCode) return;
    Clipboard.setString(cashInCode.code);
    Alert.alert('Copied!', 'Code copied to clipboard.');
  }

  if (!agent) {
    return (
      <Screen bg={colors.ink} padH>
        <BackHeader />
        <Text style={styles.loading}>Loading agent…</Text>
      </Screen>
    );
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Cash-In at Agent" />

      <View style={styles.body}>
        {/* Agent card */}
        <Card light>
          <View style={styles.agentHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{agent.name[0]}</Text>
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <Text style={styles.agentAddress}>{agent.address}</Text>
              <Text style={styles.agentDist}>{agent.distanceKm.toFixed(1)} km away · ⭐ {agent.rating}</Text>
            </View>
          </View>
          <TrustBadge score={agent.trustScore} style={styles.trustBadge} />
        </Card>

        {/* Cash-in code generator */}
        <Card>
          <Text style={styles.sectionTitle}>Generate Cash-In Code</Text>
          <Text style={styles.sectionSub}>
            Show this 6-digit code to the agent. It expires in 15 minutes.
          </Text>

          {/* Amount input */}
          {!cashInCode && (
            <>
              <View style={styles.amountRow}>
                <Text style={styles.nairaSign}>₦</Text>
                <Text
                  style={styles.amountInput}
                  onPress={() => {
                    // Simple inline prompt since we can't import TextInput without extra boilerplate
                    Alert.prompt('Enter amount (₦)', 'Minimum ₦100', (val) => setAmountNaira(val ?? ''), 'plain-text', amountNaira, 'number-pad');
                  }}
                >
                  {amountNaira || 'Tap to enter amount'}
                </Text>
              </View>

              <Button
                label={generating ? 'Generating…' : 'Generate Code'}
                onPress={handleGenerateCode}
                loading={generating}
              />
            </>
          )}

          {/* Generated code display */}
          {cashInCode && (
            <View style={styles.codeBox}>
              <TouchableOpacity onPress={copyCode} style={styles.codeRow}>
                <Text style={styles.code}>{cashInCode.code}</Text>
                <Text style={styles.copyIcon}>📋</Text>
              </TouchableOpacity>
              <Text style={styles.codeExpiry}>
                Expires at {new Date(cashInCode.expiresAt).toLocaleTimeString('en-NG', { timeStyle: 'short' })}
              </Text>
              <Button
                label="Generate New Code"
                onPress={() => setCashInCode(null)}
                variant="ghost"
              />
            </View>
          )}
        </Card>

        {/* How it works */}
        <View style={styles.howTo}>
          <Text style={styles.howToTitle}>How to cash in</Text>
          <Text style={styles.howToStep}>1. Go to the agent address above.</Text>
          <Text style={styles.howToStep}>2. Show the code and hand over cash.</Text>
          <Text style={styles.howToStep}>3. Agent confirms; funds credit your wallet instantly.</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { fontSize: typography.body.size, color: colors.stone, marginTop: 40, textAlign: 'center' },
  body: { paddingTop: spacing.lg, gap: spacing.lg },
  agentHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.emerald, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  agentInfo: { flex: 1 },
  agentName: { fontSize: typography.body.size, fontWeight: '700', color: colors.charcoal },
  agentAddress: { fontSize: typography.bodySm.size, color: colors.stone },
  agentDist: { fontSize: typography.caption.size, color: colors.stone },
  trustBadge: {},
  sectionTitle: { fontSize: typography.h3.size, fontWeight: '700', color: colors.cream, marginBottom: spacing.xs },
  sectionSub: { fontSize: typography.bodySm.size, color: colors.stone, marginBottom: spacing.lg, lineHeight: 20 },
  amountRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.forest,
    borderRadius: 12, borderWidth: 1.5, borderColor: colors.sand, overflow: 'hidden', marginBottom: spacing.lg,
  },
  nairaSign: { paddingHorizontal: spacing.md, fontSize: typography.h2.size, fontWeight: '700', color: colors.lime },
  amountInput: { flex: 1, padding: spacing.lg, fontSize: typography.h2.size, fontWeight: '700', color: colors.cream },
  codeBox: { alignItems: 'center', gap: spacing.md },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  code: { fontSize: 48, fontWeight: '800', color: colors.lime, letterSpacing: 8, fontFamily: 'monospace' },
  copyIcon: { fontSize: 22 },
  codeExpiry: { fontSize: typography.bodySm.size, color: colors.caution, fontWeight: '600' },
  howTo: { backgroundColor: colors.forest, borderRadius: 12, padding: spacing.lg, gap: spacing.sm },
  howToTitle: { fontSize: typography.body.size, fontWeight: '700', color: colors.cream, marginBottom: spacing.xs },
  howToStep: { fontSize: typography.bodySm.size, color: colors.stone, lineHeight: 20 },
});
