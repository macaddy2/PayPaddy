import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionBar, BackHeader, Eyebrow, MetricCard, Screen, TrustPill, VaultCard } from '@/ui';
import type { CommerceIntentDetail, IntegrationPartner } from '@/domain/schema';
import { api } from '@/services/api';
import { colors, radii, spacing, typography } from '@/theme';

export default function IntegrationPartnerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [partner, setPartner] = useState<IntegrationPartner | null>(null);
  const [intents, setIntents] = useState<CommerceIntentDetail[]>([]);

  useEffect(() => {
    if (!id) return;
    void api.commerce.getPartner(id).then(setPartner);
    void api.commerce.listIntents({ partnerId: id }).then(setIntents);
  }, [id]);

  if (!partner) {
    return (
      <Screen bg={colors.cream} padH>
        <BackHeader title="Integration" />
        <Text style={styles.loading}>Loading integration...</Text>
      </Screen>
    );
  }

  return (
    <Screen bg={colors.cream} padH={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <BackHeader title="Integration" />
          <View style={styles.avatar}><Text style={styles.avatarText}>{partner.name.slice(0, 2).toUpperCase()}</Text></View>
          <Text style={styles.name}>{partner.name}</Text>
          <Text style={styles.sub}>{partner.kind} · {partner.integrationMode.replace('_', ' ')} · {partner.city}</Text>
          <View style={styles.heroPills}>
            <TrustPill label="TRINITY" tone="safe" />
            <TrustPill label={`${partner.tier.toUpperCase()} COLLATERAL`} tone="caution" />
          </View>
        </View>

        <View style={styles.body}>
          <VaultCard amountKobo={partner.collateralKobo} label="PARTNER COLLATERAL" bank="Slashed if fraud is proven" />
          <View style={styles.metrics}>
            <MetricCard label="trust score" value={`${partner.trustScore}`} tone="safe" />
            <MetricCard label="successful deals" value={`${partner.successfulDeals}`} tone="info" />
            <MetricCard label="dispute rate" value={`${partner.disputeRatePct}%`} tone="caution" />
          </View>

          <View style={styles.card}>
            <Eyebrow>Integration contract</Eyebrow>
            <Text style={styles.copy}>This partner keeps their storefront and customer relationship. PayPaddy receives only the escrow payload, protects the funds, and emits status updates back to their return URL/webhook.</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{partner.apiKeyLabel ?? 'pp_live_partner_key'}</Text>
              <Text style={styles.codeMuted}>{partner.externalBaseUrl ?? 'External checkout URL'}</Text>
            </View>
          </View>

          <Eyebrow>Ready intents</Eyebrow>
          {intents.map((intent) => (
            <View key={intent.id} style={styles.intent}>
              <Text style={styles.intentEmoji}>{intent.imageEmoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.intentTitle}>{intent.title}</Text>
                <Text style={styles.intentMeta}>{intent.externalRef}</Text>
              </View>
              <Text style={styles.intentArrow}>→</Text>
            </View>
          ))}

          <ActionBar
            primaryLabel="Open demo handoff"
            onPrimary={() => {
              const firstIntent = intents[0];
              if (firstIntent) {
                router.push({ pathname: '/(app)/commerce/intent/[id]', params: { id: firstIntent.id } });
              }
            }}
            secondaryLabel="Manual deal"
            onSecondary={() => router.push('/(app)/deal/new')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 110 },
  hero: { backgroundColor: colors.forest, paddingBottom: spacing.xl, alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  avatar: { width: 74, height: 74, borderRadius: 37, backgroundColor: colors.apricot, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  avatarText: { color: colors.ink, fontSize: 22, fontWeight: '900' },
  name: { color: colors.cream, fontSize: typography.h1.size, fontWeight: '900', marginTop: spacing.md, textAlign: 'center', paddingHorizontal: spacing.lg },
  sub: { color: 'rgba(250,247,242,0.68)', fontWeight: '700', marginTop: 4 },
  heroPills: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  body: { padding: spacing.lg, gap: spacing.md },
  metrics: { flexDirection: 'row', gap: spacing.sm },
  card: { backgroundColor: '#fff', borderRadius: radii.md, borderWidth: 1, borderColor: colors.sand, padding: spacing.lg, gap: spacing.sm },
  copy: { color: colors.stone, fontSize: typography.body.size, lineHeight: 22, fontWeight: '600' },
  codeBox: { backgroundColor: colors.ink, borderRadius: radii.sm, padding: spacing.md, gap: 3 },
  codeText: { color: colors.lime, fontFamily: typography.monoFamily, fontWeight: '900' },
  codeMuted: { color: 'rgba(250,247,242,0.64)', fontFamily: typography.monoFamily, fontSize: typography.caption.size },
  intent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: '#fff', borderRadius: radii.sm, borderWidth: 1, borderColor: colors.sand, padding: spacing.md },
  intentEmoji: { fontSize: 24 },
  intentTitle: { color: colors.charcoal, fontWeight: '900' },
  intentMeta: { color: colors.stone, fontSize: typography.caption.size, fontWeight: '700', marginTop: 2 },
  intentArrow: { color: colors.emerald, fontWeight: '900', fontSize: 18 },
  loading: { color: colors.stone, marginTop: spacing.xl, fontWeight: '700' },
});
