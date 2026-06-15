import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { DealCard, Eyebrow, IntegrationCard, MetricCard, Screen, TrustPill, VaultCard } from '@/ui';
import { DEAL_CATEGORIES, type DealCategoryKey } from '@/domain/constants';
import type { CommerceIntentDetail, IntegrationPartner } from '@/domain/schema';
import { api } from '@/services/api';
import { colors, radii, spacing, typography } from '@/theme';

type CategoryFilter = 'all' | DealCategoryKey;

export default function CommerceTab() {
  const router = useRouter();
  const [intents, setIntents] = useState<CommerceIntentDetail[]>([]);
  const [partners, setPartners] = useState<IntegrationPartner[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  useEffect(() => {
    void api.commerce.listPartners().then(setPartners);
  }, []);

  useEffect(() => {
    void api.commerce.listIntents({
      query,
      category: category === 'all' ? undefined : category,
    }).then(setIntents);
  }, [query, category]);

  const lockedPreview = useMemo(
    () => intents.slice(0, 2).reduce((sum, intent) => sum + intent.amountKobo, 0),
    [intents],
  );

  return (
    <Screen bg={colors.cream} padH={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroHello}>Plug PayPaddy into any sale.</Text>
              <Text style={styles.heroSub}>WhatsApp, storefront, API, plugin. We only handle the trust layer.</Text>
            </View>
            <TrustPill label="ESCROW API" tone="safe" />
          </View>
          <VaultCard amountKobo={lockedPreview} label="READY CHECKOUT INTENTS" bank="External commerce, PayPaddy escrow" />
        </View>

        <View style={styles.body}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search payment link, checkout, API order..."
            placeholderTextColor={colors.stone}
            style={styles.search}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip label="All" active={category === 'all'} onPress={() => setCategory('all')} />
            {DEAL_CATEGORIES.map((cat) => (
              <Chip
                key={cat.key}
                label={cat.label}
                active={category === cat.key}
                onPress={() => setCategory(cat.key)}
              />
            ))}
          </ScrollView>

          <View style={styles.metricRow}>
            <MetricCard label="integration modes" value="4" tone="safe" />
            <MetricCard label="collateral staked" value="NGN 2.1M" tone="caution" />
            <MetricCard label="handoff SLA" value="24h" tone="info" />
          </View>

          <View style={styles.card}>
            <Eyebrow>How platforms initiate deals</Eyebrow>
            <Text style={styles.copy}>
              External checkout creates a PayPaddy intent with amount, seller, buyer reference, and return URL.
              Buyer funds escrow here, then goes back to the platform after settlement.
            </Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>POST /commerce/intents</Text>
              <Text style={styles.codeMuted}>amountKobo, sellerId, externalRef, returnUrl</Text>
            </View>
          </View>

          <View style={styles.sectionHead}>
            <Eyebrow>Connected channels</Eyebrow>
            <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/agents')}>
              <Text style={styles.link}>Offline agents</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.stack}>
            {partners.map((partner) => (
              <IntegrationCard
                key={partner.id}
                name={partner.name}
                category={`${partner.integrationMode.replace('_', ' ')} · ${partner.city}`}
                trustScore={partner.trustScore}
                tier={partner.tier}
                onPress={() => router.push({ pathname: '/(app)/commerce/partner/[id]', params: { id: partner.id } })}
              />
            ))}
          </View>

          <View style={styles.sectionHead}>
            <Eyebrow>Escrow handoff demos</Eyebrow>
            <Text style={styles.count}>{intents.length} ready</Text>
          </View>
          <View style={styles.stack}>
            {intents.map((intent) => (
              <TouchableOpacity
                key={intent.id}
                activeOpacity={0.88}
                onPress={() => router.push({ pathname: '/(app)/commerce/intent/[id]', params: { id: intent.id } })}
                style={styles.intentCard}
              >
                <View style={styles.intentIcon}>
                  <Text style={styles.intentEmoji}>{intent.imageEmoji}</Text>
                </View>
                <View style={styles.intentBody}>
                  <Text style={styles.intentTitle} numberOfLines={1}>{intent.title}</Text>
                  <Text style={styles.intentMeta}>{intent.partner.name} · {intent.externalRef}</Text>
                  <View style={styles.pills}>
                    <TrustPill label="TRINITY" tone="safe" />
                    <TrustPill label={intent.partner.integrationMode.toUpperCase().replace('_', ' ')} tone="info" />
                  </View>
                </View>
                <Text style={styles.price}>{formatShort(intent.amountKobo)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <DealCard
            title="Create manual escrow link"
            meta="For IG, WhatsApp, invoices, DMs"
            amountKobo={0}
            onPress={() => router.push('/(app)/deal/new')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function formatShort(kobo: number) {
  const naira = kobo / 100;
  if (naira >= 1_000_000) return `NGN ${(naira / 1_000_000).toFixed(2)}M`;
  if (naira >= 1_000) return `NGN ${Math.round(naira / 1_000)}K`;
  return `NGN ${naira}`;
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 110 },
  hero: {
    backgroundColor: colors.forest,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, alignItems: 'flex-start' },
  heroHello: {
    color: colors.cream,
    fontSize: typography.h1.size,
    lineHeight: typography.h1.lineHeight,
    fontWeight: typography.h1.weight,
    letterSpacing: -0.8,
    maxWidth: 250,
  },
  heroSub: { color: 'rgba(250,247,242,0.68)', marginTop: 4, maxWidth: 285, lineHeight: 20, fontWeight: '600' },
  body: { padding: spacing.lg, gap: spacing.md },
  search: {
    minHeight: 48,
    borderRadius: radii.md,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.sand,
    paddingHorizontal: spacing.lg,
    color: colors.charcoal,
    fontSize: typography.body.size,
    fontWeight: '700',
  },
  chips: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.sand },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { color: colors.stone, fontWeight: '800', fontSize: typography.caption.size },
  chipTextActive: { color: colors.lime },
  metricRow: { flexDirection: 'row', gap: spacing.sm },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  link: { color: colors.emerald, fontWeight: '900', fontSize: typography.bodySm.size },
  count: { color: colors.stone, fontWeight: '800', fontSize: typography.caption.size },
  stack: { gap: spacing.sm },
  card: { gap: spacing.sm, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.sand, borderRadius: radii.md, padding: spacing.lg },
  copy: { color: colors.stone, fontSize: typography.body.size, lineHeight: 22, fontWeight: '600' },
  codeBox: { backgroundColor: colors.ink, borderRadius: radii.sm, padding: spacing.md, gap: 3 },
  codeText: { color: colors.lime, fontFamily: typography.monoFamily, fontWeight: '900' },
  codeMuted: { color: 'rgba(250,247,242,0.64)', fontFamily: typography.monoFamily, fontSize: typography.caption.size },
  intentCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.sand,
  },
  intentIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.safeBg },
  intentEmoji: { fontSize: 24 },
  intentBody: { flex: 1, minWidth: 0 },
  intentTitle: { color: colors.charcoal, fontSize: typography.body.size, fontWeight: '900', letterSpacing: -0.2 },
  intentMeta: { color: colors.stone, fontSize: typography.caption.size, fontWeight: '700', marginTop: 2 },
  pills: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm, flexWrap: 'wrap' },
  price: { color: colors.ink, fontWeight: '900', fontSize: typography.bodySm.size, maxWidth: 76, textAlign: 'right' },
});
