/**
 * Deal invite screen — shown right after a two-party deal is created.
 *
 * Renders the shareable invite link (with the deployed origin prepended so
 * the URL is paste-ready), a Share / Copy button row, a summary of the
 * contract terms the counterparty will see, and a demo "View as counterparty"
 * affordance that opens the invite landing in this same session so one tester
 * can drive both sides of the flow.
 *
 * Real-backend swap: each party would log in on their own device; the demo
 * perspective switch evaporates.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BackHeader, Button, Screen } from '@/ui';
import { useDeal } from '@/state';
import { formatNaira } from '@/domain/money';
import { colors, radii, spacing, typography } from '@/theme';

function inviteOrigin(): string {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname.replace(/\/?$/, '')}`.replace(/\/+$/, '');
}

export default function InviteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const deal = useDeal(id ?? '');
  const [copied, setCopied] = useState(false);

  const inviteUrl = useMemo(() => {
    if (!deal?.inviteToken) return '';
    const path = `/invite/${deal.inviteToken.token}`;
    const origin = inviteOrigin();
    return origin ? `${origin}${path}` : path;
  }, [deal?.inviteToken]);

  if (!deal) {
    return (
      <Screen bg={colors.ink} padH>
        <BackHeader title="Invite" />
        <Text style={styles.body}>Loading deal…</Text>
      </Screen>
    );
  }

  if (!deal.counterparty || !deal.inviteToken) {
    return (
      <Screen bg={colors.ink} padH>
        <BackHeader title="Invite" />
        <Text style={styles.body}>This deal has no counterparty — invite is not applicable.</Text>
      </Screen>
    );
  }

  async function handleShare() {
    if (!inviteUrl) return;
    try {
      if (Platform.OS === 'web') {
        // Best-effort: navigator.share on supported browsers, fall back to copy.
        const nav = typeof navigator !== 'undefined' ? navigator : undefined;
        if (nav && 'share' in nav && typeof (nav as { share?: unknown }).share === 'function') {
          await (nav as { share: (data: { title: string; text: string; url: string }) => Promise<void> }).share({
            title: 'PayPaddy deal invite',
            text: `Review and accept this deal on PayPaddy.`,
            url: inviteUrl,
          });
          return;
        }
        await copyToClipboard();
        return;
      }
      await Share.share({
        message: `You've been invited to a PayPaddy deal: ${inviteUrl}`,
        url: inviteUrl,
      });
    } catch {
      // Share cancelled or failed; copy is a fine fallback.
      await copyToClipboard();
    }
  }

  async function copyToClipboard() {
    if (!inviteUrl) return;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        return;
      }
      Alert.alert('Invite link', inviteUrl);
    } catch {
      Alert.alert('Invite link', inviteUrl);
    }
  }

  const cpRoleLabel = deal.counterparty.role === 'seller' ? 'Seller' : 'Buyer';
  const fundLabel =
    deal.fundingMode === 'fund_first' ? 'Fund-first (proof of funds)' : 'Fund after we agree';
  const milestoneCount = deal.milestones?.length ?? 0;

  return (
    <Screen bg={colors.ink} padH scroll>
      <BackHeader title="Send the invite" />

      <View style={styles.body}>
        <Text style={styles.heading}>Share with your counterparty</Text>
        <Text style={styles.sub}>
          {deal.counterparty.name ? `${deal.counterparty.name}` : `Your ${cpRoleLabel.toLowerCase()}`} will
          open this link to review the terms, propose amendments, and endorse the contract.
        </Text>

        <View style={styles.linkCard}>
          <Text style={styles.linkLabel}>INVITE LINK</Text>
          <Text style={styles.linkText} numberOfLines={2}>
            {inviteUrl}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
          >
            <Text style={styles.primaryActionText}>Share link</Text>
          </Pressable>
          <Pressable
            onPress={copyToClipboard}
            style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryActionText}>{copied ? '✓ Copied' : 'Copy'}</Text>
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>WHAT THEY'LL SEE</Text>
          <SummaryRow label="Title" value={deal.title} />
          <SummaryRow label="Amount" value={formatNaira(deal.grossKobo)} />
          <SummaryRow label="Their role" value={cpRoleLabel} />
          <SummaryRow label="Funding" value={fundLabel} />
          <SummaryRow
            label="Stages"
            value={milestoneCount > 0 ? `${milestoneCount} milestone${milestoneCount === 1 ? '' : 's'}` : 'Single payout'}
          />
        </View>

        {/* DEMO-ONLY: Open the invite landing in this same session so one
            tester can drive both sides of the flow. In a real backend the
            counterparty would log in separately and this button disappears. */}
        <View style={styles.demoCard}>
          <Text style={styles.demoLabel}>DEMO</Text>
          <Text style={styles.demoText}>
            For this mock build, you can step into the counterparty's shoes from this same session:
          </Text>
          <Button
            label="Preview as counterparty"
            variant="secondary"
            onPress={() => router.push({ pathname: '/invite/[token]', params: { token: deal.inviteToken!.token } })}
          />
        </View>

        <Button
          label="Back to deal board"
          variant="secondary"
          onPress={() => router.replace({ pathname: '/(app)/deal/[id]', params: { id: deal.id } })}
        />
      </View>
    </Screen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryRowLabel}>{label}</Text>
      <Text style={styles.summaryRowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.lg, gap: spacing.lg },
  heading: {
    fontSize: typography.h2.size,
    fontWeight: typography.h2.weight,
    color: colors.cream,
  },
  sub: { color: colors.stone, fontSize: typography.body.size, lineHeight: 22 },
  linkCard: {
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  linkLabel: {
    fontSize: typography.caption.size,
    fontWeight: '700',
    color: colors.stone,
    letterSpacing: 0.8,
  },
  linkText: {
    color: colors.lime,
    fontFamily: typography.monoFamily,
    fontSize: typography.bodySm.size,
    fontWeight: '700',
  },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  primaryAction: {
    flex: 2,
    backgroundColor: colors.lime,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryActionText: { color: colors.ink, fontWeight: '900', fontSize: typography.body.size },
  secondaryAction: {
    flex: 1,
    backgroundColor: colors.forest,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.sand,
  },
  secondaryActionText: { color: colors.cream, fontWeight: '800', fontSize: typography.body.size },
  pressed: { opacity: 0.75 },
  summaryCard: {
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.emerald,
  },
  summaryLabel: {
    fontSize: typography.caption.size,
    fontWeight: '700',
    color: colors.stone,
    letterSpacing: 0.8,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  summaryRowLabel: {
    color: colors.stone,
    fontSize: typography.bodySm.size,
    fontWeight: '600',
    flexShrink: 0,
  },
  summaryRowValue: {
    color: colors.cream,
    fontSize: typography.bodySm.size,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  demoCard: {
    backgroundColor: 'rgba(245,166,35,0.06)',
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.3)',
  },
  demoLabel: {
    fontSize: typography.caption.size,
    fontWeight: '900',
    color: colors.caution,
    letterSpacing: 0.8,
  },
  demoText: { color: colors.stone, fontSize: typography.bodySm.size, lineHeight: 20 },
});
