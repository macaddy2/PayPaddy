/**
 * Create Deal screen — title, amount, category picker, and an optional
 * milestone split.
 *
 * Single-payout deals are the default (toggle off). When the buyer enables
 * "Split into stages", a small editor appears so they can break the deal
 * into N milestones with percentage shares — at submit each percent is
 * converted to basis points and handed to `api.deals.create({ milestones })`,
 * which already validates Σ shares === 10_000 and seeds the ledger with
 * `deal_created`.
 */

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { BackHeader, Button, Screen } from '@/ui';
import { useAuth, useDeals } from '@/state';
import { DEAL_CATEGORIES, type DealCategoryKey } from '@/domain/constants';
import { nairaToKobo } from '@/domain/money';
import { colors, radii, spacing, typography } from '@/theme';
import { track } from '@/services/analytics';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  amountNaira: z
    .string()
    .min(1, 'Enter an amount')
    .refine((v) => /^\d+$/.test(v) && parseInt(v) >= 100, 'Minimum deal is ₦100'),
});

type FormData = z.infer<typeof schema>;

type MilestoneDraft = { id: string; title: string; sharePct: number };

const MAX_STAGES = 8;
const newDraftId = () => `m_${Math.random().toString(36).slice(2, 8)}`;

function makeInitialMilestones(): MilestoneDraft[] {
  return [
    { id: newDraftId(), title: 'Stage 1', sharePct: 50 },
    { id: newDraftId(), title: 'Stage 2', sharePct: 50 },
  ];
}

export default function NewDealScreen() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { createDeal, invite, listLoading } = useDeals();
  const [category, setCategory] = useState<DealCategoryKey>('commerce');
  const [milestonesEnabled, setMilestonesEnabled] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneDraft[]>(makeInitialMilestones);

  // Two-party contract fields. Off by default → solo / single-party legacy deals
  // behave exactly as before.
  const [cpEnabled, setCpEnabled] = useState(false);
  const [cpRole, setCpRole] = useState<'buyer' | 'seller'>('seller'); // i.e. *they* are seller, *I* am buyer
  const [cpName, setCpName] = useState('');
  const [cpContact, setCpContact] = useState(''); // phone or email
  const [fundingMode, setFundingMode] = useState<'fund_first' | 'fund_after_lock'>('fund_after_lock');

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const sharesTotal = useMemo(
    () => milestones.reduce((sum, m) => sum + (Number.isFinite(m.sharePct) ? m.sharePct : 0), 0),
    [milestones],
  );
  const sharesValid = sharesTotal === 100 && milestones.every((m) => m.title.trim().length >= 2 && m.sharePct > 0);

  function addStage() {
    if (milestones.length >= MAX_STAGES) return;
    setMilestones((prev) => [
      ...prev,
      { id: newDraftId(), title: `Stage ${prev.length + 1}`, sharePct: 0 },
    ]);
  }

  function removeStage(id: string) {
    setMilestones((prev) => (prev.length <= 1 ? prev : prev.filter((m) => m.id !== id)));
  }

  function updateStage(id: string, patch: Partial<MilestoneDraft>) {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function evenSplit() {
    const n = milestones.length;
    if (n === 0) return;
    const base = Math.floor(100 / n);
    const remainder = 100 - base * n;
    setMilestones((prev) =>
      prev.map((m, i) => ({ ...m, sharePct: base + (i < remainder ? 1 : 0) })),
    );
  }

  async function onSubmit(data: FormData) {
    if (!user) return;
    if (milestonesEnabled && !sharesValid) {
      Alert.alert(
        'Stages don\'t add up',
        sharesTotal === 100
          ? 'Each stage needs a title (2+ chars) and a non-zero share.'
          : `Shares total ${sharesTotal}%. They need to add up to exactly 100%.`,
      );
      return;
    }
    if (cpEnabled && !cpContact.trim()) {
      Alert.alert('Counterparty needs a contact', 'Enter a phone number or email so we can send them the invite.');
      return;
    }
    track('deal.create_attempted', {
      category,
      milestonesCount: milestonesEnabled ? milestones.length : 0,
      counterparty: cpEnabled,
    });
    try {
      const counterparty = cpEnabled
        ? {
            role: cpRole,
            name: cpName.trim() || undefined,
            // Cheap split: contains '@' → email, otherwise phone.
            ...(cpContact.includes('@')
              ? { email: cpContact.trim() }
              : { phone: cpContact.trim() }),
          }
        : undefined;
      const deal = await createDeal({
        buyerId: user.id,
        title: data.title,
        grossKobo: nairaToKobo(parseInt(data.amountNaira)),
        category,
        milestones: milestonesEnabled
          ? milestones.map((m) => ({ title: m.title.trim(), shareBps: m.sharePct * 100 }))
          : undefined,
        counterparty,
        fundingMode: cpEnabled ? fundingMode : undefined,
      });
      track('deal.created', {
        dealId: deal.id,
        category,
        milestones: deal.milestones?.length ?? 0,
        counterparty: cpEnabled,
        fundingMode: cpEnabled ? fundingMode : 'none',
      });
      if (cpEnabled) {
        // Two-party deals materialise the invite token immediately so the
        // initiator lands on the invite screen with a shareable link ready.
        await invite(deal.id);
        router.replace({ pathname: '/(app)/deal/[id]/invite', params: { id: deal.id } });
      } else {
        router.replace({ pathname: '/(app)/deal/[id]', params: { id: deal.id } });
      }
    } catch (e) {
      Alert.alert('Error', (e as Error).message || 'Could not create deal. Please try again.');
    }
  }

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="New Deal" />

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>WHAT'S THE DEAL?</Text>

        {/* Title field */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={value}
              onChangeText={onChange}
              placeholder="e.g. MacBook Pro M2, Logo Design..."
              placeholderTextColor={colors.stone}
              autoFocus
              maxLength={120}
            />
          )}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

        {/* Amount field */}
        <Text style={styles.sectionLabel}>AMOUNT (₦)</Text>
        <Controller
          control={control}
          name="amountNaira"
          render={({ field: { onChange, value } }) => (
            <View style={styles.amountRow}>
              <Text style={styles.nairaSign}>₦</Text>
              <TextInput
                style={[styles.amountInput, errors.amountNaira && styles.inputError]}
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                placeholder="50000"
                placeholderTextColor={colors.stone}
                maxLength={10}
              />
            </View>
          )}
        />
        {errors.amountNaira && <Text style={styles.errorText}>{errors.amountNaira.message}</Text>}

        {/* Category grid */}
        <Text style={styles.sectionLabel}>DEAL TYPE</Text>
        <View style={styles.grid}>
          {DEAL_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catCell, category === cat.key && styles.catCellActive]}
              onPress={() => setCategory(cat.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={[styles.catLabel, category === cat.key && styles.catLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Milestone toggle + editor */}
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneToggleRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.milestoneToggleLabel}>Split into stages</Text>
              <Text style={styles.milestoneToggleHint}>
                Release funds milestone-by-milestone instead of one final payout.
              </Text>
            </View>
            <Switch
              value={milestonesEnabled}
              onValueChange={setMilestonesEnabled}
              trackColor={{ true: colors.emerald, false: colors.sand }}
              thumbColor={milestonesEnabled ? colors.lime : colors.cream}
              accessibilityLabel="Toggle milestone split"
            />
          </View>

          {milestonesEnabled && (
            <View style={styles.milestoneEditor}>
              <View style={styles.milestoneHeader}>
                <Text style={styles.milestoneSectionLabel}>STAGES</Text>
                <View style={[styles.totalPill, sharesTotal === 100 ? styles.totalPillOk : styles.totalPillWarn]}>
                  <Text style={styles.totalPillText}>
                    {sharesTotal === 100 ? '✓ 100%' : `${sharesTotal}% / 100%`}
                  </Text>
                </View>
              </View>

              {milestones.map((m, i) => (
                <View key={m.id} style={styles.milestoneRow}>
                  <Text style={styles.milestoneIndex}>{i + 1}</Text>
                  <TextInput
                    style={styles.milestoneTitleInput}
                    value={m.title}
                    onChangeText={(v) => updateStage(m.id, { title: v })}
                    placeholder={`Stage ${i + 1}`}
                    placeholderTextColor={colors.stone}
                    maxLength={80}
                  />
                  <View style={styles.milestonePctWrap}>
                    <TextInput
                      style={styles.milestonePctInput}
                      value={String(m.sharePct)}
                      onChangeText={(v) => {
                        const n = parseInt(v.replace(/\D/g, '')) || 0;
                        updateStage(m.id, { sharePct: Math.min(100, Math.max(0, n)) });
                      }}
                      keyboardType="number-pad"
                      maxLength={3}
                      accessibilityLabel={`Stage ${i + 1} share percent`}
                    />
                    <Text style={styles.milestonePctSign}>%</Text>
                  </View>
                  <Pressable
                    accessibilityLabel={`Remove stage ${i + 1}`}
                    disabled={milestones.length <= 1}
                    onPress={() => removeStage(m.id)}
                    style={({ pressed }) => [
                      styles.milestoneDelete,
                      milestones.length <= 1 && styles.milestoneDeleteDisabled,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <Text style={styles.milestoneDeleteText}>×</Text>
                  </Pressable>
                </View>
              ))}

              <View style={styles.milestoneActions}>
                <Pressable
                  onPress={addStage}
                  disabled={milestones.length >= MAX_STAGES}
                  style={({ pressed }) => [
                    styles.milestoneAction,
                    milestones.length >= MAX_STAGES && styles.milestoneActionDisabled,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <Text style={styles.milestoneActionText}>＋ Add stage</Text>
                </Pressable>
                <Pressable
                  onPress={evenSplit}
                  style={({ pressed }) => [styles.milestoneAction, pressed && styles.btnPressed]}
                >
                  <Text style={styles.milestoneActionText}>⇋ Even split</Text>
                </Pressable>
              </View>

              <Text style={styles.milestoneFooter}>
                The seller delivers each stage in order. Funds auto-release to the seller
                when you confirm, or 24h after delivery if you take no action.
              </Text>
            </View>
          )}
        </View>

        {/* Counterparty + funding mode card */}
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneToggleRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.milestoneToggleLabel}>Invite a counterparty</Text>
              <Text style={styles.milestoneToggleHint}>
                Send them a link to review the terms, negotiate amendments, and lock the
                contract together. Off → you handle this side solo.
              </Text>
            </View>
            <Switch
              value={cpEnabled}
              onValueChange={setCpEnabled}
              trackColor={{ true: colors.emerald, false: colors.sand }}
              thumbColor={cpEnabled ? colors.lime : colors.cream}
              accessibilityLabel="Toggle counterparty invite"
            />
          </View>

          {cpEnabled && (
            <View style={styles.milestoneEditor}>
              {/* Role: am I the buyer or the seller? */}
              <Text style={styles.milestoneSectionLabel}>I AM THE…</Text>
              <View style={styles.roleRow}>
                <Pressable
                  onPress={() => setCpRole('seller')}
                  style={({ pressed }) => [
                    styles.rolePill,
                    cpRole === 'seller' && styles.rolePillActive,
                    pressed && styles.btnPressed,
                  ]}
                  accessibilityLabel="I am the buyer (counterparty is the seller)"
                >
                  <Text style={[styles.rolePillText, cpRole === 'seller' && styles.rolePillTextActive]}>
                    Buyer
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setCpRole('buyer')}
                  style={({ pressed }) => [
                    styles.rolePill,
                    cpRole === 'buyer' && styles.rolePillActive,
                    pressed && styles.btnPressed,
                  ]}
                  accessibilityLabel="I am the seller (counterparty is the buyer)"
                >
                  <Text style={[styles.rolePillText, cpRole === 'buyer' && styles.rolePillTextActive]}>
                    Seller
                  </Text>
                </Pressable>
              </View>

              {/* Contact + name */}
              <Text style={styles.milestoneSectionLabel}>COUNTERPARTY ({cpRole === 'seller' ? 'SELLER' : 'BUYER'})</Text>
              <TextInput
                style={styles.input}
                value={cpName}
                onChangeText={setCpName}
                placeholder="Name (optional)"
                placeholderTextColor={colors.stone}
                maxLength={80}
              />
              <TextInput
                style={styles.input}
                value={cpContact}
                onChangeText={setCpContact}
                placeholder="Phone (+234…) or email"
                placeholderTextColor={colors.stone}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={120}
              />

              {/* Funding mode */}
              <Text style={styles.milestoneSectionLabel}>ESCROW FUNDING</Text>
              <View style={styles.roleRow}>
                <Pressable
                  onPress={() => setFundingMode('fund_after_lock')}
                  style={({ pressed }) => [
                    styles.fundCell,
                    fundingMode === 'fund_after_lock' && styles.fundCellActive,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <Text style={[styles.fundCellTitle, fundingMode === 'fund_after_lock' && styles.fundCellTitleActive]}>
                    Fund after we agree
                  </Text>
                  <Text style={styles.fundCellHint}>Negotiate → both endorse → then fund.</Text>
                </Pressable>
                <Pressable
                  onPress={() => setFundingMode('fund_first')}
                  style={({ pressed }) => [
                    styles.fundCell,
                    fundingMode === 'fund_first' && styles.fundCellActive,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <Text style={[styles.fundCellTitle, fundingMode === 'fund_first' && styles.fundCellTitleActive]}>
                    Fund now (proof of funds)
                  </Text>
                  <Text style={styles.fundCellHint}>Money in escrow before invite goes out.</Text>
                </Pressable>
              </View>

              <Text style={styles.milestoneFooter}>
                After you create the deal, we'll generate a shareable invite link to send
                to your counterparty. They can review the terms, suggest amendments, and
                must endorse to lock the contract before any funds are released.
              </Text>
            </View>
          )}
        </View>

        {/* Escrow explainer */}
        <View style={styles.escrowNote}>
          <Text style={styles.escrowNoteText}>
            🔒 PayPaddy holds the funds in a CBN-licensed escrow account until both
            parties confirm the deal is done. Your money is safe.
          </Text>
        </View>

        <Button
          label="Create Deal"
          onPress={handleSubmit(onSubmit)}
          loading={listLoading}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.lg },
  sectionLabel: {
    fontSize: typography.caption.size,
    fontWeight: '700',
    color: colors.stone,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.forest,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.sand,
    padding: spacing.lg,
    fontSize: typography.body.size,
    color: colors.cream,
    fontWeight: '500',
  },
  inputError: { borderColor: colors.alert },
  errorText: { fontSize: typography.caption.size, color: colors.alert },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.sand,
    overflow: 'hidden',
  },
  nairaSign: {
    paddingHorizontal: spacing.md,
    fontSize: typography.h2.size,
    fontWeight: '700',
    color: colors.lime,
  },
  amountInput: {
    flex: 1,
    padding: spacing.lg,
    fontSize: typography.h2.size,
    fontWeight: '700',
    color: colors.cream,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  catCell: {
    width: '47%',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: spacing.sm,
  },
  catCellActive: { borderColor: colors.lime },
  catIcon: { fontSize: 28 },
  catLabel: {
    fontSize: typography.bodySm.size,
    fontWeight: '600',
    color: colors.stone,
    textAlign: 'center',
  },
  catLabelActive: { color: colors.lime },
  milestoneCard: {
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sand,
    gap: spacing.md,
  },
  milestoneToggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  milestoneToggleLabel: { color: colors.cream, fontWeight: '800', fontSize: typography.body.size },
  milestoneToggleHint: { color: colors.stone, fontSize: typography.caption.size, fontWeight: '500' },
  milestoneEditor: { gap: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: spacing.md },
  milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  milestoneSectionLabel: { fontSize: typography.caption.size, fontWeight: '700', color: colors.stone, letterSpacing: 0.8 },
  totalPill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.pill },
  totalPillOk: { backgroundColor: colors.safeBg },
  totalPillWarn: { backgroundColor: colors.cautionBg },
  totalPillText: { color: colors.cream, fontWeight: '900', fontSize: typography.caption.size, letterSpacing: 0.3 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  milestoneIndex: { color: colors.lime, fontWeight: '900', fontSize: typography.bodySm.size, width: 18, textAlign: 'center' },
  milestoneTitleInput: {
    flex: 1,
    backgroundColor: colors.ink,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.cream,
    fontWeight: '600',
    fontSize: typography.bodySm.size,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  milestonePctWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  milestonePctInput: { width: 38, paddingVertical: spacing.sm, color: colors.cream, fontWeight: '800', textAlign: 'right', fontSize: typography.bodySm.size },
  milestonePctSign: { color: colors.stone, fontWeight: '800', paddingLeft: 2 },
  milestoneDelete: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(233,75,60,0.16)' },
  milestoneDeleteDisabled: { opacity: 0.3 },
  milestoneDeleteText: { color: colors.alert, fontWeight: '900', fontSize: 18, lineHeight: 20 },
  milestoneActions: { flexDirection: 'row', gap: spacing.sm },
  milestoneAction: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radii.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  milestoneActionDisabled: { opacity: 0.4 },
  milestoneActionText: { color: colors.cream, fontWeight: '800', fontSize: typography.bodySm.size },
  milestoneFooter: { color: colors.stone, fontSize: typography.caption.size, lineHeight: 16, fontStyle: 'italic' },
  btnPressed: { opacity: 0.7 },
  roleRow: { flexDirection: 'row', gap: spacing.sm },
  rolePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: colors.ink,
  },
  rolePillActive: { borderColor: colors.lime, backgroundColor: 'rgba(191,255,79,0.08)' },
  rolePillText: { color: colors.stone, fontWeight: '800', fontSize: typography.bodySm.size },
  rolePillTextActive: { color: colors.lime },
  fundCell: {
    flex: 1,
    backgroundColor: colors.ink,
    borderRadius: radii.sm,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 4,
  },
  fundCellActive: { borderColor: colors.lime },
  fundCellTitle: {
    color: colors.cream,
    fontWeight: '800',
    fontSize: typography.bodySm.size,
  },
  fundCellTitleActive: { color: colors.lime },
  fundCellHint: { color: colors.stone, fontSize: typography.caption.size, lineHeight: 14 },
  escrowNote: {
    backgroundColor: colors.forest,
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.emerald,
  },
  escrowNoteText: {
    fontSize: typography.bodySm.size,
    color: colors.cream,
    lineHeight: 20,
  },
});
