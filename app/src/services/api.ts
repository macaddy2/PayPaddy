/**
 * Mock API client.
 *
 * This module is the ENTIRE backend seam. Every screen talks to it via the
 * `api.*` namespaces below; swapping to a real backend is a find-and-replace
 * of each method body with a `fetch(...)` call — the argument and return
 * shapes are locked by zod schemas in `@/domain/schema`.
 *
 * Provider attribution is baked into the internal function names so the
 * swap is literal: `lookupBVNViaDojah` becomes a Dojah REST call, etc.
 *
 * All methods return Promises with realistic latencies derived from the
 * PRD SLA budget, and a small set of deterministic failure triggers (see
 * `MOCK_TRIGGERS` in constants) so the UI can exercise error branches.
 */

import {
  DEAL_TIMERS_MS,
  MOCK_TRIGGERS,
  SAFEGUARD,
  SLA_MS,
  TIERS,
  type TierKey,
} from '@/domain/constants';
import { canonicaliseTermsForHash, computeFees, computeMilestonePayout, computeSlash } from '@/domain/money';
import {
  Agent,
  CashInCode,
  CommerceIntentDetail,
  CommerceIntentFilters,
  Deal,
  Dispute,
  DisputePayoutBreakdown,
  IntegrationPartner,
  Listing,
  User,
  VirtualAccount,
  Wallet,
} from '@/domain/schema';
import type {
  Amendment,
  AmendmentChanges,
  CommerceIntent,
  Counterparty,
  DealCategory,
  DisputeReason,
  DisputeVerdict,
  Endorsement,
  Milestone,
  TrinityStatus,
} from '@/domain/schema';
import { appendEntry, ledgerHash } from './ledger';
import { logger } from './logger';
import {
  agents as agentsStore,
  commerceIntents as commerceIntentsStore,
  currentUserId,
  deals as dealsStore,
  integrationPartners as integrationPartnersStore,
  inviteTokens as inviteTokensStore,
  listings as listingsStore,
  sellers as sellersStore,
  users as usersStore,
  wallets as walletsStore,
} from './fixtures';

// -------------------------
// Utilities
// -------------------------

/** Resolve after `ms` milliseconds — used to model provider latency. */
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Short random id. Good enough for mock entities. */
function nid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * `setTimeout` returns a `NodeJS.Timeout` under Jest (which has `.unref()` to
 * tell Node a pending timer should not block process exit) but an opaque
 * number on web / React Native. This helper lets us call `.unref()` safely
 * in both environments — important so long-fuse mock triggers (e.g. the 24h
 * milestone auto-release) don't keep the test runner alive.
 */
function unrefTimer(handle: unknown): void {
  const maybe = handle as { unref?: () => void };
  if (typeof maybe?.unref === 'function') maybe.unref();
}

// -------------------------
// Auth / OTP
// -------------------------

type PendingOtp = { requestId: string; phone: string; code: string; expiresAt: number };
const pendingOtps: Record<string, PendingOtp> = {};

export const auth = {
  /**
   * Step 1 of phone login. Real impl: Termii SMS dispatch.
   * In mock: returns a `requestId` and stashes a fixed code (`000000`) that
   * any screen can display via `auth.peekOtp(requestId)` in dev.
   */
  async requestOtp(phone: string): Promise<{ requestId: string }> {
    await sleep(SLA_MS.otpDeliver);
    const requestId = nid('otp');
    pendingOtps[requestId] = {
      requestId,
      phone,
      code: '000000',
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    logger.info('otp.requested', { phone, requestId });
    return { requestId };
  },

  /** Dev helper — never ship a path to this from production UI. */
  peekOtp(requestId: string): string | null {
    return pendingOtps[requestId]?.code ?? null;
  },

  /**
   * Step 2. Verifies the code; on success either returns an existing user or
   * creates a skeleton user (Trinity fields `pending`) and "signs them in".
   *
   * Mock build: any 6-digit code is accepted. The deterministic `000000`
   * surfaced via `peekOtp` is still a hint, not a gate.
   */
  async verifyOtp(requestId: string, code: string): Promise<{ user: User }> {
    await sleep(SLA_MS.otpVerify);
    const pending = pendingOtps[requestId];
    if (!pending) throw new Error('OTP expired or unknown');
    if (!/^\d{6}$/.test(code)) throw new Error('OTP must be 6 digits');
    delete pendingOtps[requestId];

    // Look up existing user by phone or create a new one.
    const existing = Object.values(usersStore).find((u) => u.phone === pending.phone);
    const user: User =
      existing ??
      (() => {
        const fresh: User = {
          id: nid('user'),
          phone: pending.phone,
          trinity: { bvn: 'pending', nin: 'pending', liveness: 'pending' },
          role: 'buyer',
          createdAt: nowIso(),
        };
        usersStore[fresh.id] = fresh;
        return fresh;
      })();
    currentUserId.value = user.id;
    // Seed a wallet if none exists.
    if (!walletsStore[user.id]) {
      walletsStore[user.id] = { userId: user.id, availableKobo: 0, pendingKobo: 0 };
    }
    return { user: User.parse(user) };
  },

  async signOut(): Promise<void> {
    currentUserId.value = null;
  },

  /** Returns the current session user, if any. */
  async me(): Promise<User | null> {
    const id = currentUserId.value;
    if (!id) return null;
    const u = usersStore[id];
    return u ? User.parse(u) : null;
  },
};

// -------------------------
// Trinity (BVN + NIN + Liveness)
// -------------------------

export const trinity = {
  /**
   * BVN lookup via Dojah. Mock returns success unless the magic BVN
   * `MOCK_TRIGGERS.failingBvn` is supplied — that path exercises the
   * failed-state UI.
   */
  async lookupBVNViaDojah(userId: string, bvn: string): Promise<{ status: TrinityStatus }> {
    await sleep(SLA_MS.bvnLookup);
    const status: TrinityStatus = bvn === MOCK_TRIGGERS.failingBvn ? 'failed' : 'verified';
    const u = usersStore[userId];
    if (u) u.trinity.bvn = status;
    logger.info('trinity.bvn.result', { userId, status });
    return { status };
  },

  /** NIN lookup via Dojah. Always verifies in the current mock. */
  async lookupNINViaDojah(userId: string, _nin: string): Promise<{ status: TrinityStatus }> {
    await sleep(SLA_MS.ninLookup);
    const u = usersStore[userId];
    if (u) u.trinity.nin = 'verified';
    return { status: 'verified' };
  },

  /**
   * Liveness check via Smile ID. In a real app this would return a hosted
   * session URL; here we return a stable mocked URL and immediately mark
   * the user's liveness as verified after the simulated latency.
   */
  async livenessViaSmileID(userId: string): Promise<{ status: TrinityStatus; sessionUrl: string }> {
    await sleep(SLA_MS.liveness);
    const u = usersStore[userId];
    if (u) u.trinity.liveness = 'verified';
    return { status: 'verified', sessionUrl: 'https://mock.smileid/session' };
  },
};

// -------------------------
// Deals
// -------------------------

export const deals = {
  /** List deals for the current user (buyer-side OR seller-side). */
  async list(userId: string): Promise<Deal[]> {
    await sleep(SLA_MS.generic);
    const mine = Object.values(dealsStore).filter(
      (d) => d.buyerId === userId || d.sellerId === userId,
    );
    return mine.map((d) => Deal.parse(d));
  },

  async get(dealId: string): Promise<Deal> {
    await sleep(SLA_MS.generic);
    const d = dealsStore[dealId];
    if (!d) throw new Error(`Deal ${dealId} not found`);
    return Deal.parse(d);
  },

  /**
   * Create a deal. Two shapes:
   *  - **Legacy single-party**: omit `counterparty`. Falls through to the
   *    existing `awaiting_funds → funded → settled` lifecycle.
   *  - **Two-party contract**: pass `counterparty` (the other side) and
   *    optionally `fundingMode`. The deal is born in `draft` so the initiator
   *    can either fund first (proof-of-funds) or invite first; downstream
   *    methods (`invite`, `acceptInvite`, …) drive the lifecycle from there.
   */
  async create(input: {
    buyerId: string;
    sellerId?: string;
    title: string;
    description?: string;
    grossKobo: number;
    category: DealCategory;
    /** Optional milestone breakdown. Shares must be in basis points and sum to 10_000. */
    milestones?: { title: string; description?: string; shareBps: number }[];
    /** Two-party flag — the other side of the deal. Triggers the contract lifecycle. */
    counterparty?: { role: 'buyer' | 'seller'; name?: string; phone?: string; email?: string };
    /** Two-party only: when escrow is funded relative to the lock. Defaults to fund-after-lock. */
    fundingMode?: 'fund_first' | 'fund_after_lock';
  }): Promise<Deal> {
    await sleep(SLA_MS.generic);
    const isTwoParty = !!input.counterparty;
    // For two-party deals, the side opposite the initiator is filled in on
    // acceptInvite; for legacy deals, we keep the historic Tunde default.
    let buyerId = input.buyerId;
    let sellerId = input.sellerId ?? (isTwoParty ? '' : 'user_tunde');
    let initiatorRole: 'buyer' | 'seller' | undefined;
    let counterparty: Counterparty | undefined;
    if (isTwoParty && input.counterparty) {
      counterparty = { ...input.counterparty };
      if (counterparty.role === 'seller') {
        // Initiator is the buyer; counterparty (the seller) will accept the invite.
        initiatorRole = 'buyer';
        sellerId = '';
      } else {
        // Initiator is the seller; counterparty (the buyer) will accept.
        initiatorRole = 'seller';
        sellerId = input.buyerId;
        buyerId = '';
      }
    }
    const sellerTier: TierKey = sellerId && sellersStore[sellerId]?.tier ? sellersStore[sellerId]!.tier : 'silver';
    let milestones: Milestone[] | undefined;
    if (input.milestones && input.milestones.length > 0) {
      const totalBps = input.milestones.reduce((sum, m) => sum + m.shareBps, 0);
      if (totalBps !== 10_000) {
        throw new Error(`Milestone shares must sum to 10000 bps, got ${totalBps}`);
      }
      milestones = input.milestones.map((m) => ({
        id: nid('mstone'),
        title: m.title,
        description: m.description,
        shareBps: m.shareBps,
        status: 'pending',
      }));
    }
    const initialStatus: Deal['status'] = isTwoParty ? 'draft' : 'awaiting_funds';
    const deal: Deal = {
      id: nid('deal'),
      title: input.title,
      description: input.description,
      category: input.category,
      grossKobo: input.grossKobo,
      buyerId,
      sellerId,
      sellerTier,
      status: initialStatus,
      createdAt: nowIso(),
      timeline: [{ at: nowIso(), kind: 'created', actor: 'buyer' }],
      milestones,
      ledger: milestones || isTwoParty ? [] : undefined,
      initiatorRole,
      counterparty,
      fundingMode: isTwoParty ? input.fundingMode ?? 'fund_after_lock' : undefined,
      amendments: isTwoParty ? [] : undefined,
      endorsements: isTwoParty ? [] : undefined,
    };
    dealsStore[deal.id] = deal;
    if (deal.ledger) {
      appendEntry(deal, 'deal_created', 'buyer', { at: deal.createdAt });
    }
    return Deal.parse(deal);
  },

  /**
   * Issue a Providus virtual account for a deal. In reality the Providus
   * PSSP API returns an account number; here we return a deterministic mock.
   *
   * After `SLA_MS.paymentSettle` ms the mock also flips the deal to `funded`
   * so the Deal Room UI can observe the transition without a webhook wire-up.
   */
  async fundVirtualAccountViaProvidus(dealId: string): Promise<VirtualAccount> {
    await sleep(SLA_MS.virtualAccountIssue);
    const d = dealsStore[dealId];
    if (!d) throw new Error(`Deal ${dealId} not found`);
    const va: VirtualAccount = {
      bankName: 'Providus Bank',
      accountName: `PAYPADDY ESCROW / ${d.title.slice(0, 20)}`,
      accountNumber: '9' + Math.floor(100_000_000 + Math.random() * 899_999_999).toString(),
      amountKobo: d.grossKobo,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };
    // Simulate the webhook-driven transition after the settlement delay.
    unrefTimer(setTimeout(() => {
      const latest = dealsStore[dealId];
      if (latest && latest.status === 'awaiting_funds') {
        latest.status = 'funded';
        latest.fundedAt = nowIso();
        latest.autoReleaseAt = undefined; // set only after delivery+confirm
        latest.timeline.push({ at: nowIso(), kind: 'funded', actor: 'system' });
        latest.timeline.push({ at: nowIso(), kind: 'seller_notified', actor: 'system' });
        if (latest.milestones) {
          appendEntry(latest, 'deal_funded', 'system', { amountKobo: latest.grossKobo });
        }
      }
    }, SLA_MS.paymentSettle));
    return VirtualAccount.parse(va);
  },

  /** Seller marks delivered → status `delivered`, starts the auto-release clock. */
  async markDelivered(dealId: string): Promise<Deal> {
    await sleep(SLA_MS.generic);
    const d = dealsStore[dealId];
    if (!d) throw new Error('Deal not found');
    if (d.status !== 'funded' && d.status !== 'in_progress') {
      throw new Error(`Cannot deliver from status ${d.status}`);
    }
    d.status = 'delivered';
    d.autoReleaseAt = new Date(Date.now() + DEAL_TIMERS_MS.autoReleaseWindow).toISOString();
    d.timeline.push({ at: nowIso(), kind: 'delivered', actor: 'seller' });
    return Deal.parse(d);
  },

  /**
   * Buyer confirms receipt → immediate settlement to the seller's wallet
   * net of fees. SafeGuard levy credited to the pool (not modelled here).
   */
  async confirmReceipt(dealId: string): Promise<Deal> {
    await sleep(SLA_MS.generic);
    const d = dealsStore[dealId];
    if (!d) throw new Error('Deal not found');
    if (d.status !== 'delivered' && d.status !== 'in_progress' && d.status !== 'funded') {
      throw new Error(`Cannot confirm from status ${d.status}`);
    }
    const fees = computeFees(d.grossKobo, d.sellerTier);
    const sellerWallet = walletsStore[d.sellerId];
    if (sellerWallet) {
      sellerWallet.availableKobo += fees.netToSellerKobo;
    }
    d.status = 'settled';
    d.confirmedAt = nowIso();
    d.timeline.push({ at: nowIso(), kind: 'confirmed', actor: 'buyer' });
    d.timeline.push({ at: nowIso(), kind: 'settled', actor: 'system' });
    return Deal.parse(d);
  },

  /**
   * Seller marks a milestone delivered. Writes a `milestone_delivered` ledger
   * entry, arms the auto-release timer for that milestone, and schedules the
   * smart-contract trigger that releases funds if the buyer takes no action
   * within `DEAL_TIMERS_MS.autoReleaseWindow`.
   */
  async markMilestoneDelivered(dealId: string, milestoneId: string): Promise<Deal> {
    await sleep(SLA_MS.generic);
    const d = dealsStore[dealId];
    if (!d) throw new Error('Deal not found');
    if (!d.milestones) throw new Error('Deal has no milestones');
    if (d.status !== 'funded' && d.status !== 'in_progress') {
      throw new Error(`Cannot deliver from deal status ${d.status}`);
    }
    const m = d.milestones.find((x) => x.id === milestoneId);
    if (!m) throw new Error(`Milestone ${milestoneId} not found`);
    if (m.status !== 'pending' && m.status !== 'in_progress') {
      throw new Error(`Milestone is already ${m.status}`);
    }
    m.status = 'delivered';
    m.deliveredAt = nowIso();
    m.autoReleaseAt = new Date(Date.now() + DEAL_TIMERS_MS.autoReleaseWindow).toISOString();
    if (d.status === 'funded') d.status = 'in_progress';
    appendEntry(d, 'milestone_delivered', 'seller', { milestoneId, note: m.title });
    // Smart-contract trigger: if still delivered at expiry, system releases.
    unrefTimer(setTimeout(() => {
      const latest = dealsStore[dealId];
      const latestM = latest?.milestones?.find((x) => x.id === milestoneId);
      if (latestM && latestM.status === 'delivered') {
        void deals.releaseMilestone(dealId, milestoneId, 'system').catch(() => undefined);
      }
    }, DEAL_TIMERS_MS.autoReleaseWindow));
    return Deal.parse(d);
  },

  /**
   * Release a milestone's slice to the seller's wallet. Buyer-initiated by
   * default; passing `actor: 'system'` is how the auto-release timer fires.
   * When the last milestone releases, the deal flips to `settled`.
   */
  async releaseMilestone(
    dealId: string,
    milestoneId: string,
    actor: 'buyer' | 'system' = 'buyer',
  ): Promise<Deal> {
    await sleep(SLA_MS.generic);
    const d = dealsStore[dealId];
    if (!d) throw new Error('Deal not found');
    if (!d.milestones) throw new Error('Deal has no milestones');
    const m = d.milestones.find((x) => x.id === milestoneId);
    if (!m) throw new Error(`Milestone ${milestoneId} not found`);
    if (m.status !== 'delivered') {
      throw new Error(`Milestone must be delivered to release, was ${m.status}`);
    }
    const { fees } = computeMilestonePayout(d.grossKobo, m.shareBps, d.sellerTier);
    const sellerWallet = walletsStore[d.sellerId];
    if (sellerWallet) {
      sellerWallet.availableKobo += fees.netToSellerKobo;
    }
    m.status = 'released';
    m.releasedAt = nowIso();
    m.releasedKobo = fees.netToSellerKobo;
    m.autoReleaseAt = undefined;
    appendEntry(d, 'milestone_released', actor, {
      milestoneId,
      amountKobo: fees.netToSellerKobo,
      note: m.title,
    });
    // If every milestone has been released, either move to bilateral
    // completion sign-off (two-party flow) or settle directly (legacy).
    const allReleased = d.milestones.every((x) => x.status === 'released');
    if (allReleased) {
      if (d.counterparty) {
        d.status = 'awaiting_completion_signoff';
        d.completionSignoff = d.completionSignoff ?? {};
        // No ledger entry here — `signCompletion` writes one per signature.
      } else {
        d.status = 'settled';
        d.confirmedAt = d.confirmedAt ?? nowIso();
        d.timeline.push({ at: nowIso(), kind: 'settled', actor: 'system' });
        appendEntry(d, 'deal_settled', 'system');
      }
    }
    return Deal.parse(d);
  },

  // -------------------------
  // Two-party contract lifecycle
  // -------------------------

  /**
   * Initiator sends the counterparty an invite link. Issues an opaque token
   * and transitions the deal to `awaiting_counterparty`. Idempotent — calling
   * twice reuses the existing token unless it has expired.
   *
   * Callable from `draft` (fund-after-lock path) OR `funded` (fund-first path —
   * the initiator's money is already in escrow as proof-of-commitment).
   */
  async invite(input: {
    dealId: string;
  }): Promise<{ deal: Deal; inviteUrl: string }> {
    await sleep(SLA_MS.generic);
    const d = dealsStore[input.dealId];
    if (!d) throw new Error('Deal not found');
    if (!d.counterparty) throw new Error('Deal has no counterparty to invite');
    if (d.status !== 'draft' && d.status !== 'funded' && d.status !== 'awaiting_counterparty') {
      throw new Error(`Cannot invite from status ${d.status}`);
    }
    const existing = d.inviteToken;
    const stillValid = existing && new Date(existing.expiresAt).getTime() > Date.now() && !existing.acceptedAt;
    let token = existing;
    if (!stillValid || !token) {
      const newToken = {
        token: `inv_${Math.random().toString(36).slice(2, 10)}`,
        dealId: d.id,
        issuedAt: nowIso(),
        // 7-day window — generous for the demo; real backend would tune per partner.
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      inviteTokensStore[newToken.token] = newToken;
      token = newToken;
      d.inviteToken = newToken;
      appendEntry(d, 'invite_sent', 'system', { note: 'invite link issued' });
    }
    if (d.status === 'draft' || d.status === 'funded') {
      d.status = 'awaiting_counterparty';
    }
    // MOCK: a real backend would render a fully-qualified app URL here. In the
    // demo we return a path; the UI appends the deployed origin (e.g. the
    // GitHub Pages base) on the fly.
    const inviteUrl = `/invite/${token.token}`;
    return { deal: Deal.parse(d), inviteUrl };
  },

  /**
   * Public token → dealId lookup. Used by the unauth-friendly invite landing
   * page so a not-yet-signed-in counterparty can preview the contract terms
   * before signing in. Returns the resolved deal alongside basic metadata.
   *
   * MOCK: in a real backend this would be a public read-only endpoint with a
   * scoped projection (no user PII beyond what the initiator chose to share).
   */
  async lookupInviteToken(token: string): Promise<{ dealId: string; deal: Deal }> {
    await sleep(SLA_MS.generic);
    const tok = inviteTokensStore[token];
    if (!tok) throw new Error('Invite link not found or expired');
    if (new Date(tok.expiresAt).getTime() < Date.now()) {
      throw new Error('Invite link has expired');
    }
    const d = dealsStore[tok.dealId];
    if (!d) throw new Error('Invite link is no longer valid');
    return { dealId: d.id, deal: Deal.parse(d) };
  },

  /**
   * Counterparty (after signing in) accepts the invite. Resolves the
   * counterparty.userId, fills in the previously-empty buyerId/sellerId,
   * transitions the deal to `viewed`, and writes an `invite_accepted` ledger
   * entry.
   */
  async acceptInvite(token: string, asUserId: string): Promise<Deal> {
    await sleep(SLA_MS.generic);
    const tok = inviteTokensStore[token];
    if (!tok) throw new Error('Invite link not found or expired');
    if (new Date(tok.expiresAt).getTime() < Date.now()) {
      throw new Error('Invite link has expired');
    }
    const d = dealsStore[tok.dealId];
    if (!d || !d.counterparty || !d.inviteToken) throw new Error('Invite link is no longer valid');
    if (d.status !== 'awaiting_counterparty' && d.status !== 'viewed') {
      throw new Error(`Cannot accept invite from status ${d.status}`);
    }
    // Don't let the initiator accept their own invite.
    if ((d.counterparty.role === 'seller' && asUserId === d.buyerId) ||
        (d.counterparty.role === 'buyer' && asUserId === d.sellerId)) {
      throw new Error('Initiator cannot accept their own invite');
    }
    d.counterparty.userId = asUserId;
    if (d.counterparty.role === 'seller') {
      d.sellerId = asUserId;
      d.sellerTier = sellersStore[asUserId]?.tier ?? 'silver';
    } else {
      d.buyerId = asUserId;
    }
    if (!walletsStore[asUserId]) {
      walletsStore[asUserId] = { userId: asUserId, availableKobo: 0, pendingKobo: 0 };
    }
    tok.acceptedAt = nowIso();
    d.inviteToken = tok;
    d.status = 'viewed';
    appendEntry(d, 'invite_accepted', d.counterparty.role, { note: 'counterparty joined' });
    return Deal.parse(d);
  },

  /**
   * Either side proposes an amendment to the contract terms. Adds it to
   * `deal.amendments` in `proposed` status and flips the deal to `negotiating`.
   */
  async proposeAmendment(input: {
    dealId: string;
    proposedBy: 'initiator' | 'counterparty';
    changes: AmendmentChanges;
    note?: string;
  }): Promise<Deal> {
    await sleep(SLA_MS.generic);
    const d = dealsStore[input.dealId];
    if (!d || !d.counterparty) throw new Error('Two-party deal not found');
    if (d.status !== 'viewed' && d.status !== 'negotiating') {
      throw new Error(`Cannot propose amendment from status ${d.status}`);
    }
    if (input.changes.milestones) {
      const total = input.changes.milestones.reduce((s, m) => s + m.shareBps, 0);
      if (total !== 10_000) {
        throw new Error(`Amendment milestone shares must sum to 10000 bps, got ${total}`);
      }
    }
    // Any prior endorsements are invalidated whenever a new amendment opens —
    // the termsHash they signed against may diverge from the new agreed terms.
    d.endorsements = [];
    const amendment: Amendment = {
      id: nid('amend'),
      proposedBy: input.proposedBy,
      proposedAt: nowIso(),
      note: input.note,
      changes: input.changes,
      status: 'proposed',
      initiatorResponse: input.proposedBy === 'initiator' ? 'accept' : 'pending',
      counterpartyResponse: input.proposedBy === 'counterparty' ? 'accept' : 'pending',
    };
    d.amendments = d.amendments ?? [];
    d.amendments.push(amendment);
    d.status = 'negotiating';
    const actor: 'buyer' | 'seller' = mapSideToActor(d, input.proposedBy);
    appendEntry(d, 'amendment_proposed', actor, { note: amendment.note ?? amendment.id });
    return Deal.parse(d);
  },

  /**
   * Record one side's response to an amendment. When both sides have accepted,
   * the changes are applied to the live deal, any older still-proposed
   * amendments are marked `superseded`, and if there are no more open
   * amendments the deal returns to `viewed` (ready to endorse the lock).
   */
  async respondToAmendment(input: {
    dealId: string;
    amendmentId: string;
    by: 'initiator' | 'counterparty';
    response: 'accept' | 'reject';
  }): Promise<Deal> {
    await sleep(SLA_MS.generic);
    const d = dealsStore[input.dealId];
    if (!d || !d.counterparty) throw new Error('Two-party deal not found');
    if (d.status !== 'negotiating') {
      throw new Error(`Cannot respond to amendment from status ${d.status}`);
    }
    const a = d.amendments?.find((x) => x.id === input.amendmentId);
    if (!a) throw new Error('Amendment not found');
    if (a.status !== 'proposed') throw new Error(`Amendment already ${a.status}`);
    if (input.by === 'initiator') a.initiatorResponse = input.response;
    else a.counterpartyResponse = input.response;
    const actor: 'buyer' | 'seller' = mapSideToActor(d, input.by);
    appendEntry(d, input.response === 'accept' ? 'amendment_accepted' : 'amendment_rejected', actor, {
      note: a.note ?? a.id,
    });
    // If either side rejects, the amendment is dead.
    if (a.initiatorResponse === 'reject' || a.counterpartyResponse === 'reject') {
      a.status = 'rejected';
      a.respondedAt = nowIso();
    } else if (a.initiatorResponse === 'accept' && a.counterpartyResponse === 'accept') {
      // Both sides on board — apply the changes to the live deal.
      a.status = 'accepted';
      a.respondedAt = nowIso();
      applyAmendment(d, a);
      // Any older proposed amendments are now stale.
      for (const other of d.amendments ?? []) {
        if (other.id !== a.id && other.status === 'proposed') {
          other.status = 'superseded';
          other.respondedAt = nowIso();
        }
      }
    }
    // If no amendments are still proposed, the deal moves back to `viewed`.
    const stillOpen = (d.amendments ?? []).some((x) => x.status === 'proposed');
    if (!stillOpen) d.status = 'viewed';
    return Deal.parse(d);
  },

  /**
   * One side endorses the current terms. The Endorsement records the
   * canonicalised termsHash at the moment of signing — if anything changes
   * before the other side signs (e.g. a new amendment lands), this
   * endorsement is invalidated (its termsHash no longer matches the live
   * deal's hash) and the lock requires re-endorsement.
   *
   * When BOTH sides have endorsed on the same termsHash, the deal flips to
   * `locked`. If `fundingMode === 'fund_after_lock'`, it then advances to
   * `awaiting_funds`; if the initiator has already funded (`deal.fundedAt`
   * set), it goes straight to `funded`.
   */
  async endorseLock(input: { dealId: string; by: 'initiator' | 'counterparty' }): Promise<Deal> {
    await sleep(SLA_MS.generic);
    const d = dealsStore[input.dealId];
    if (!d || !d.counterparty) throw new Error('Two-party deal not found');
    if (d.status !== 'viewed') {
      throw new Error(`Cannot endorse from status ${d.status} — settle open amendments first`);
    }
    const termsHash = ledgerHash(canonicaliseTermsForHash(d));
    d.endorsements = d.endorsements ?? [];
    // Replace any existing endorsement by this side (re-endorse after an
    // intervening amendment is the normal flow).
    d.endorsements = d.endorsements.filter((e) => e.by !== input.by);
    const e: Endorsement = { by: input.by, at: nowIso(), termsHash };
    d.endorsements.push(e);
    const actor: 'buyer' | 'seller' = mapSideToActor(d, input.by);
    appendEntry(d, 'terms_locked', actor, { note: `endorsed by ${input.by}` });
    // Lock fires only when both sides have endorsed AGAINST THE SAME termsHash.
    const initEndorsed = d.endorsements.find((x) => x.by === 'initiator');
    const counterEndorsed = d.endorsements.find((x) => x.by === 'counterparty');
    if (initEndorsed && counterEndorsed && initEndorsed.termsHash === counterEndorsed.termsHash) {
      d.lockedAt = nowIso();
      // Path depends on whether funds are already in escrow.
      if (d.fundedAt) {
        d.status = 'funded';
      } else {
        d.status = 'awaiting_funds';
      }
    }
    return Deal.parse(d);
  },

  /**
   * Final bilateral satisfaction sign-off. Both sides must call this before
   * a two-party deal moves to `settled`. The first call records the
   * timestamp; the second call flips the status and writes the
   * `deal_settled` ledger entry.
   */
  async signCompletion(input: { dealId: string; by: 'initiator' | 'counterparty' }): Promise<Deal> {
    await sleep(SLA_MS.generic);
    const d = dealsStore[input.dealId];
    if (!d || !d.counterparty) throw new Error('Two-party deal not found');
    if (d.status !== 'awaiting_completion_signoff') {
      throw new Error(`Cannot sign completion from status ${d.status}`);
    }
    d.completionSignoff = d.completionSignoff ?? {};
    if (input.by === 'initiator') d.completionSignoff.initiatorAt = nowIso();
    else d.completionSignoff.counterpartyAt = nowIso();
    const actor: 'buyer' | 'seller' = mapSideToActor(d, input.by);
    appendEntry(d, 'completion_signed', actor, { note: `${input.by} signed satisfaction` });
    if (d.completionSignoff.initiatorAt && d.completionSignoff.counterpartyAt) {
      d.status = 'settled';
      d.confirmedAt = d.confirmedAt ?? nowIso();
      d.timeline.push({ at: nowIso(), kind: 'settled', actor: 'system' });
      appendEntry(d, 'deal_settled', 'system');
    }
    return Deal.parse(d);
  },
};

// -------------------------
// Internal helpers — two-party lifecycle
// -------------------------

/**
 * Map an initiator/counterparty side onto the buyer/seller actor enum
 * expected by the ledger. The deal's `initiatorRole` tells us which side
 * the initiator is.
 */
function mapSideToActor(d: Deal, side: 'initiator' | 'counterparty'): 'buyer' | 'seller' {
  const initiator = d.initiatorRole ?? 'buyer';
  return side === 'initiator' ? initiator : (initiator === 'buyer' ? 'seller' : 'buyer');
}

/** Apply an accepted amendment's changes to the live deal in place. */
function applyAmendment(d: Deal, a: Amendment): void {
  const c = a.changes;
  if (c.title !== undefined) d.title = c.title;
  if (c.description !== undefined) d.description = c.description;
  if (c.grossKobo !== undefined) d.grossKobo = c.grossKobo;
  if (c.milestones && c.milestones.length > 0) {
    // Re-materialise the milestone list. Pending milestones are wiped; if any
    // were already in motion (delivered/released) the amendment shouldn't be
    // proposable in the first place. Defensive: refuse to overwrite if so.
    if (d.milestones?.some((m) => m.status !== 'pending')) {
      throw new Error('Cannot rewrite milestones after any have started');
    }
    d.milestones = c.milestones.map((m) => ({
      id: nid('mstone'),
      title: m.title,
      description: m.description,
      shareBps: m.shareBps,
      status: 'pending',
    }));
  }
}

// -------------------------
// Wallet / Payout
// -------------------------

export const wallet = {
  async get(userId: string): Promise<Wallet> {
    await sleep(SLA_MS.generic);
    const w = walletsStore[userId];
    if (!w) throw new Error('Wallet not found');
    return Wallet.parse(w);
  },

  /**
   * Payout via NIP (NIBSS Instant Payments). Mock decrements the wallet,
   * records the timestamp, and returns.
   */
  async payoutViaNIP(
    userId: string,
    input: { amountKobo: number; bankCode: string; accountNumber: string },
  ): Promise<Wallet> {
    await sleep(SLA_MS.payout);
    const w = walletsStore[userId];
    if (!w) throw new Error('Wallet not found');
    if (input.amountKobo <= 0) throw new Error('Amount must be positive');
    if (input.amountKobo > w.availableKobo) throw new Error('Insufficient balance');
    w.availableKobo -= input.amountKobo;
    w.lastPayoutAt = nowIso();
    logger.info('wallet.payout', { userId, amount: input.amountKobo });
    return Wallet.parse(w);
  },
};

// -------------------------
// Agents
// -------------------------

export const agentsApi = {
  async near(_userId: string): Promise<Agent[]> {
    await sleep(SLA_MS.generic);
    return Object.values(agentsStore).map((a) => Agent.parse(a));
  },

  async get(agentId: string): Promise<Agent> {
    await sleep(SLA_MS.generic);
    const a = agentsStore[agentId];
    if (!a) throw new Error('Agent not found');
    return Agent.parse(a);
  },

  /** Generate a 6-digit cash-in code valid for 15 minutes. */
  async generateCashInCode(input: {
    agentId: string;
    amountKobo: number;
  }): Promise<CashInCode> {
    await sleep(SLA_MS.generic);
    const code = Math.floor(100_000 + Math.random() * 899_999)
      .toString()
      .padStart(6, '0');
    const out: CashInCode = {
      code,
      agentId: input.agentId,
      amountKobo: input.amountKobo,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
    return CashInCode.parse(out);
  },
};

// -------------------------
// Device / IMEI
// -------------------------

export const device = {
  /**
   * NCC stolen-goods DB check. The mock flags IMEIs whose prefix matches
   * `MOCK_TRIGGERS.stolenImeiPrefix` as stolen; every other value passes.
   */
  async verifyIMEIViaNCC(imei: string): Promise<{ ok: boolean; reason?: string }> {
    await sleep(SLA_MS.imeiCheck);
    if (imei.startsWith(MOCK_TRIGGERS.stolenImeiPrefix)) {
      return { ok: false, reason: 'IMEI flagged as stolen in NCC database.' };
    }
    if (!/^\d{15}$/.test(imei)) {
      return { ok: false, reason: 'IMEI must be 15 digits.' };
    }
    return { ok: true };
  },
};

// -------------------------
// Listings
// -------------------------

export const listings = {
  async mine(sellerId: string): Promise<Listing[]> {
    await sleep(SLA_MS.generic);
    return Object.values(listingsStore)
      .filter((l) => l.sellerId === sellerId)
      .map((l) => Listing.parse(l));
  },

  async create(input: {
    sellerId: string;
    title: string;
    description: string;
    priceKobo: number;
    category: DealCategory;
    imei?: string;
    imeiVerified?: boolean;
    city?: string;
    imageEmoji?: string;
  }): Promise<Listing> {
    await sleep(SLA_MS.generic);
    const l: Listing = {
      id: nid('list'),
      sellerId: input.sellerId,
      title: input.title,
      description: input.description,
      priceKobo: input.priceKobo,
      category: input.category,
      imei: input.imei,
      imeiVerified: input.imeiVerified,
      city: input.city ?? 'Lagos',
      imageEmoji: input.imageEmoji ?? '🛍️',
      status: 'draft',
      createdAt: nowIso(),
    };
    listingsStore[l.id] = l;
    return Listing.parse(l);
  },

  async markImeiVerified(listingId: string, imei: string): Promise<Listing> {
    await sleep(SLA_MS.generic);
    const l = listingsStore[listingId];
    if (!l) throw new Error('Listing not found');
    l.imei = imei;
    l.imeiVerified = true;
    return Listing.parse(l);
  },
};

// -------------------------
// Commerce integrations
// -------------------------

function intentDetailFor(intent: CommerceIntent): CommerceIntentDetail {
  const partner = integrationPartnersStore[intent.partnerId];
  if (!partner) throw new Error('Integration partner not found');
  return CommerceIntentDetail.parse({ ...intent, partner });
}

export const commerce = {
  async listPartners(): Promise<IntegrationPartner[]> {
    await sleep(SLA_MS.generic);
    return Object.values(integrationPartnersStore).map((partner) => IntegrationPartner.parse(partner));
  },

  async getPartner(id: string): Promise<IntegrationPartner> {
    await sleep(SLA_MS.generic);
    const partner = integrationPartnersStore[id];
    if (!partner) throw new Error('Integration partner not found');
    return IntegrationPartner.parse(partner);
  },

  async listIntents(filters: CommerceIntentFilters = {}): Promise<CommerceIntentDetail[]> {
    await sleep(SLA_MS.generic);
    const parsed = CommerceIntentFilters.parse(filters);
    const query = parsed.query?.trim().toLowerCase();
    const intents = Object.values(commerceIntentsStore)
      .filter((intent) => intent.status === 'ready')
      .filter((intent) => (parsed.category ? intent.category === parsed.category : true))
      .filter((intent) => (parsed.partnerId ? intent.partnerId === parsed.partnerId : true))
      .filter((intent) => {
        const partner = integrationPartnersStore[intent.partnerId];
        if (parsed.mode && partner?.integrationMode !== parsed.mode) return false;
        if (!query) return true;
        return `${intent.title} ${intent.description} ${intent.city} ${partner?.name ?? ''}`.toLowerCase().includes(query);
      })
      .map(intentDetailFor)
      .sort((a, b) => b.partner.trustScore - a.partner.trustScore);
    return intents;
  },

  async getIntent(id: string): Promise<CommerceIntentDetail> {
    await sleep(SLA_MS.generic);
    const intent = commerceIntentsStore[id];
    if (!intent) throw new Error('Commerce intent not found');
    return intentDetailFor(intent);
  },

  async createIntent(input: {
    source: CommerceIntent['source'];
    externalRef: string;
    partnerId: string;
    sellerId: string;
    title: string;
    description: string;
    amountKobo: number;
    category: DealCategory;
    returnUrl?: string;
  }): Promise<CommerceIntentDetail> {
    await sleep(SLA_MS.generic);
    const partner = integrationPartnersStore[input.partnerId];
    if (!partner) throw new Error('Integration partner not found');
    const intent: CommerceIntent = {
      id: nid('intent'),
      source: input.source,
      externalRef: input.externalRef,
      partnerId: input.partnerId,
      sellerId: input.sellerId,
      title: input.title,
      description: input.description,
      amountKobo: input.amountKobo,
      category: input.category,
      city: partner.city,
      imageEmoji: input.category === 'commerce' ? '🛍️' : '📄',
      status: 'ready',
      returnUrl: input.returnUrl,
      createdAt: nowIso(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    };
    commerceIntentsStore[intent.id] = intent;
    return intentDetailFor(intent);
  },

  async createDealFromIntent(input: {
    intentId: string;
    buyerId: string;
  }): Promise<Deal> {
    await sleep(SLA_MS.generic);
    const intent = commerceIntentsStore[input.intentId];
    if (!intent) throw new Error('Commerce intent not found');
    if (intent.status !== 'ready') throw new Error('This commerce intent is no longer active');
    const sellerTier: TierKey = sellersStore[intent.sellerId]?.tier ?? 'silver';
    const deal: Deal = {
      id: nid('deal'),
      title: intent.title,
      category: intent.category,
      grossKobo: intent.amountKobo,
      buyerId: input.buyerId,
      sellerId: intent.sellerId,
      sellerTier,
      status: 'awaiting_funds',
      createdAt: nowIso(),
      timeline: [
        { at: nowIso(), kind: 'created', actor: 'buyer', note: `Started from ${intent.externalRef}` },
      ],
    };
    dealsStore[deal.id] = deal;
    intent.status = 'deal_created';
    return Deal.parse(deal);
  },
};

// -------------------------
// Sellers / Collateral
// -------------------------

export const sellersApi = {
  async get(userId: string) {
    await sleep(SLA_MS.generic);
    return sellersStore[userId] ?? null;
  },

  /**
   * Stake collateral and register the seller at a tier. If the seller already
   * exists we top up their collateral rather than overwriting.
   */
  async stake(userId: string, tier: TierKey): Promise<void> {
    await sleep(SLA_MS.generic);
    const cfg = TIERS[tier];
    const existing = sellersStore[userId];
    if (existing) {
      existing.tier = tier;
      existing.collateralKobo = Math.max(existing.collateralKobo, cfg.stakeKobo);
    } else {
      sellersStore[userId] = {
        userId,
        tier,
        collateralKobo: cfg.stakeKobo,
        listingsCount: 0,
        trustScore: 50,
      };
    }
    const u = usersStore[userId];
    if (u) u.role = 'seller';
  },
};

// -------------------------
// Disputes
// -------------------------

const disputesStore: Record<string, Dispute> = {
  'disp_sneakers': {
    id: 'disp_sneakers',
    dealId: 'deal_sneakers',
    openedAt: nowIso(),
    reason: 'wrong_item',
    description: 'Buyer says the sneakers arrived in the wrong size and seller did not include original receipt.',
    evidenceUrls: ['photo:sneakers-size-tag', 'chat:seller-confirmed-size'],
    status: 'under_review',
  },
};

export const disputes = {
  /** Open a dispute from the buyer side. Transitions the deal → `disputed`. */
  async open(input: {
    dealId: string;
    reason: DisputeReason;
    description: string;
  }): Promise<Dispute> {
    await sleep(SLA_MS.generic);
    const deal = dealsStore[input.dealId];
    if (!deal) throw new Error('Deal not found');
    if (deal.status !== 'funded' && deal.status !== 'delivered' && deal.status !== 'in_progress') {
      throw new Error(`Cannot dispute from status ${deal.status}`);
    }
    const d: Dispute = {
      id: nid('disp'),
      dealId: input.dealId,
      openedAt: nowIso(),
      reason: input.reason,
      description: input.description,
      evidenceUrls: [],
      status: 'open',
    };
    disputesStore[d.id] = d;
    deal.status = 'disputed';
    deal.timeline.push({ at: nowIso(), kind: 'dispute_opened', actor: 'buyer' });
    return Dispute.parse(d);
  },

  async get(id: string): Promise<Dispute> {
    await sleep(SLA_MS.generic);
    const d = disputesStore[id];
    if (!d) throw new Error('Dispute not found');
    return Dispute.parse(d);
  },

  async listAdminQueue(): Promise<Dispute[]> {
    await sleep(SLA_MS.generic);
    return Object.values(disputesStore)
      .filter((d) => d.status !== 'resolved')
      .map((d) => Dispute.parse(d));
  },

  async addEvidence(disputeId: string, evidence: string): Promise<Dispute> {
    await sleep(SLA_MS.generic);
    const d = disputesStore[disputeId];
    if (!d) throw new Error('Dispute not found');
    d.evidenceUrls = [...d.evidenceUrls, evidence].slice(0, 6);
    d.status = 'under_review';
    return Dispute.parse(d);
  },

  async resolve(disputeId: string, verdict: DisputeVerdict): Promise<Dispute> {
    if (verdict === 'buyer_wins') return disputes.resolveBuyerWins(disputeId);
    await sleep(SLA_MS.generic);
    const d = disputesStore[disputeId];
    if (!d) throw new Error('Dispute not found');
    const deal = dealsStore[d.dealId];
    if (!deal) throw new Error('Deal not found');
    const fees = computeFees(deal.grossKobo, deal.sellerTier);
    const payout: DisputePayoutBreakdown = DisputePayoutBreakdown.parse({
      fromCollateralKobo: 0,
      fromSafeguardPoolKobo: 0,
      toBuyerKobo: verdict === 'split' ? Math.floor(deal.grossKobo / 2) : 0,
      toSellerKobo: verdict === 'split' ? Math.floor(fees.netToSellerKobo / 2) : fees.netToSellerKobo,
    });
    d.status = 'resolved';
    d.verdict = verdict;
    d.resolvedAt = nowIso();
    d.payout = payout;
    deal.status = verdict === 'seller_wins' ? 'settled' : 'refunded';
    deal.timeline.push({ at: nowIso(), kind: 'dispute_resolved', actor: 'admin' });
    return Dispute.parse(d);
  },

  /**
   * DEV-ONLY helper to short-circuit arbitration in the mock. Produces a
   * buyer-wins verdict with a payout breakdown that mixes collateral slash
   * and (if insufficient) SafeGuard pool top-up, capped at the coverage
   * ceiling per PRD.
   */
  async resolveBuyerWins(disputeId: string): Promise<Dispute> {
    await sleep(SLA_MS.generic);
    const d = disputesStore[disputeId];
    if (!d) throw new Error('Dispute not found');
    const deal = dealsStore[d.dealId];
    if (!deal) throw new Error('Deal not found');

    const seller = sellersStore[deal.sellerId];
    const slash = seller
      ? computeSlash(seller.collateralKobo, seller.tier)
      : { slashedKobo: 0, remainingKobo: 0 };
    const fromCollateralKobo = Math.min(slash.slashedKobo, deal.grossKobo);
    const shortfall = deal.grossKobo - fromCollateralKobo;
    const fromSafeguardPoolKobo = Math.min(shortfall, SAFEGUARD.coverageCeilingKobo);
    const toBuyerKobo = fromCollateralKobo + fromSafeguardPoolKobo;
    const toSellerKobo = 0;

    if (seller) seller.collateralKobo = slash.remainingKobo;

    const payout: DisputePayoutBreakdown = DisputePayoutBreakdown.parse({
      fromCollateralKobo,
      fromSafeguardPoolKobo,
      toBuyerKobo,
      toSellerKobo,
    });

    d.status = 'resolved';
    d.verdict = 'buyer_wins' as DisputeVerdict;
    d.resolvedAt = nowIso();
    d.payout = payout;

    deal.status = 'refunded';
    deal.timeline.push({ at: nowIso(), kind: 'dispute_resolved', actor: 'admin' });
    deal.timeline.push({ at: nowIso(), kind: 'refunded', actor: 'system' });
    return Dispute.parse(d);
  },
};

// -------------------------
// Public surface
// -------------------------

export const api = {
  auth,
  trinity,
  deals,
  wallet,
  agents: agentsApi,
  device,
  listings,
  commerce,
  sellers: sellersApi,
  disputes,
};

export type Api = typeof api;
