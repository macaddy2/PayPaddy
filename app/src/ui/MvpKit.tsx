import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { formatNaira } from '@/domain/money';
import { colors, elevation, radii, spacing, typography } from '@/theme';

type Tone = 'safe' | 'caution' | 'alert' | 'info' | 'neutral';

const toneColors: Record<Tone, { bg: string; fg: string; border: string }> = {
  safe: { bg: colors.safeBg, fg: colors.safe, border: colors.safe },
  caution: { bg: colors.cautionBg, fg: colors.caution, border: colors.caution },
  alert: { bg: colors.alertBg, fg: colors.alert, border: colors.alert },
  info: { bg: colors.infoBg, fg: colors.info, border: colors.info },
  neutral: { bg: colors.sand, fg: colors.stone, border: colors.sand },
};

export function Eyebrow({ children, color = colors.stone }: { children: React.ReactNode; color?: string }) {
  return <Text style={[styles.eyebrow, { color }]}>{children}</Text>;
}

export function MoneyText({
  amountKobo,
  size = 'lg',
  color = colors.cream,
}: {
  amountKobo: number;
  size?: 'sm' | 'lg';
  color?: string;
}) {
  return (
    <Text style={[size === 'lg' ? styles.moneyLg : styles.moneySm, { color }]}>
      {formatNaira(amountKobo)}
    </Text>
  );
}

export function TrustPill({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const c = toneColors[tone];
  return (
    <View style={[styles.trustPill, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.trustPillText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

export function VaultCard({
  amountKobo,
  label = 'LOCKED IN ESCROW',
  bank = 'with a CBN-licensed bank',
  style,
}: {
  amountKobo: number;
  label?: string;
  bank?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.vault, style]}>
      <View style={styles.vaultOrb} />
      <View style={styles.lockTile}>
        <Text style={styles.lockIcon}>🔒</Text>
      </View>
      <Eyebrow color="rgba(250,247,242,0.72)">{label}</Eyebrow>
      <MoneyText amountKobo={amountKobo} />
      <Text style={styles.vaultBank}>{bank}</Text>
    </View>
  );
}

export function MetricCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  const c = toneColors[tone];
  return (
    <View style={styles.metricCard}>
      <Text style={[styles.metricValue, { color: c.fg }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function MilestoneBar({
  steps,
  activeIndex,
}: {
  steps: string[];
  activeIndex: number;
}) {
  return (
    <View style={styles.milestones}>
      {steps.map((step, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <View key={step} style={styles.milestoneCol}>
            <View style={[styles.milestoneDot, (done || active) && styles.milestoneDotActive]}>
              <Text style={styles.milestoneDotText}>{done ? '✓' : index + 1}</Text>
            </View>
            <Text style={[styles.milestoneLabel, (done || active) && styles.milestoneLabelActive]}>{step}</Text>
            {index < steps.length - 1 && (
              <View style={[styles.milestoneLine, done && styles.milestoneLineActive]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

export function DealCard({
  title,
  meta,
  amountKobo,
  urgent,
  onPress,
}: {
  title: string;
  meta: string;
  amountKobo: number;
  urgent?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={[styles.rowCard, urgent && styles.urgentCard]}>
      <View style={styles.rowIcon}>
        <Text>📦</Text>
      </View>
      <View style={styles.rowMiddle}>
        <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.rowMeta} numberOfLines={1}>{meta}</Text>
      </View>
      <MoneyText amountKobo={amountKobo} size="sm" color={colors.charcoal} />
    </TouchableOpacity>
  );
}

export function IntegrationCard({
  name,
  category,
  trustScore,
  tier,
  onPress,
}: {
  name: string;
  category: string;
  trustScore: number;
  tier: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={styles.integrationCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={styles.rowMiddle}>
        <Text style={styles.rowTitle} numberOfLines={1}>{name}</Text>
        <Text style={styles.rowMeta}>{category}</Text>
        <View style={styles.pillRow}>
          <TrustPill label={`TRUST ${trustScore}`} tone="safe" />
          <TrustPill label={tier.toUpperCase()} tone={tier === 'gold' ? 'caution' : 'neutral'} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function ActionBar({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  dangerLabel,
  onDanger,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  dangerLabel?: string;
  onDanger?: () => void;
}) {
  return (
    <View style={styles.actionBar}>
      <TouchableOpacity onPress={onPrimary} activeOpacity={0.86} style={styles.primaryAction}>
        <Text style={styles.primaryActionText}>{primaryLabel}</Text>
      </TouchableOpacity>
      {secondaryLabel && onSecondary ? (
        <TouchableOpacity onPress={onSecondary} activeOpacity={0.86} style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      ) : null}
      {dangerLabel && onDanger ? (
        <TouchableOpacity onPress={onDanger} activeOpacity={0.86} style={styles.dangerAction}>
          <Text style={styles.dangerActionText}>{dangerLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export const mvpText = StyleSheet.create({
  h1: {
    fontFamily: typography.family,
    fontSize: typography.h1.size,
    lineHeight: typography.h1.lineHeight,
    fontWeight: typography.h1.weight,
    color: colors.charcoal,
    letterSpacing: -0.8,
  },
  body: {
    fontFamily: typography.family,
    fontSize: typography.body.size,
    lineHeight: typography.body.lineHeight,
    color: colors.stone,
    fontWeight: typography.body.weight,
  },
});

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: typography.family,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  moneyLg: {
    fontFamily: typography.monoFamily,
    fontSize: typography.money.size,
    lineHeight: typography.money.lineHeight,
    fontWeight: typography.money.weight,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  moneySm: {
    fontFamily: typography.monoFamily,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  trustPill: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  trustPillText: {
    fontFamily: typography.family,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  vault: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radii.lg,
    padding: spacing.xl,
    backgroundColor: colors.forest,
    minHeight: 156,
    justifyContent: 'flex-end',
    ...elevation.modal,
  },
  vaultOrb: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    right: -28,
    top: -30,
    backgroundColor: colors.lime,
    opacity: 0.16,
  },
  lockTile: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    transform: [{ rotate: '-5deg' }],
  },
  lockIcon: { fontSize: 20 },
  vaultBank: {
    fontFamily: typography.family,
    color: colors.lime,
    fontSize: typography.caption.size,
    fontWeight: '800',
    marginTop: 3,
  },
  metricCard: {
    flex: 1,
    minWidth: 96,
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.sand,
  },
  metricValue: {
    fontFamily: typography.family,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  metricLabel: {
    marginTop: 2,
    fontFamily: typography.family,
    fontSize: typography.caption.size,
    color: colors.stone,
    fontWeight: '700',
  },
  milestones: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  milestoneCol: { flex: 1, alignItems: 'center', position: 'relative' },
  milestoneDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
    zIndex: 2,
  },
  milestoneDotActive: { backgroundColor: colors.lime },
  milestoneDotText: { fontFamily: typography.family, color: colors.ink, fontSize: 11, fontWeight: '900' },
  milestoneLabel: {
    marginTop: 5,
    fontFamily: typography.family,
    color: colors.stone,
    fontSize: 10,
    fontWeight: '800',
  },
  milestoneLabelActive: { color: colors.emerald },
  milestoneLine: {
    position: 'absolute',
    height: 2,
    top: 12,
    left: '50%',
    right: '-50%',
    backgroundColor: colors.sand,
  },
  milestoneLineActive: { backgroundColor: colors.lime },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: '#fff',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  urgentCard: { borderLeftWidth: 4, borderLeftColor: colors.coral },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.safeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMiddle: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontFamily: typography.family,
    color: colors.charcoal,
    fontSize: typography.body.size,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  rowMeta: {
    fontFamily: typography.family,
    color: colors.stone,
    fontSize: typography.caption.size,
    fontWeight: '600',
    marginTop: 2,
  },
  integrationCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#fff',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.sand,
    padding: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.apricot,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: typography.family, color: colors.ink, fontWeight: '900' },
  pillRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', marginTop: spacing.sm },
  actionBar: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'web' ? spacing.lg : 0,
  },
  primaryAction: {
    minHeight: 52,
    borderRadius: radii.md,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryActionText: {
    fontFamily: typography.family,
    color: colors.cream,
    fontSize: typography.body.size,
    fontWeight: '900',
  },
  secondaryAction: {
    minHeight: 48,
    borderRadius: radii.sm,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: { fontFamily: typography.family, color: colors.ink, fontWeight: '800' },
  dangerAction: {
    minHeight: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.alertBg,
    borderWidth: 1,
    borderColor: colors.alert,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerActionText: { fontFamily: typography.family, color: colors.alert, fontWeight: '900' },
});
