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
import { computeFees, computeSlash } from '@/domain/money';
import {
  Agent,
  CashInCode,
  Deal,
  Dispute,
  DisputePayoutBreakdown,
  Listing,
  TrinityStatus,
  User,
  VirtualAccount,
  Wallet,
  type DealCategory,
  type DisputeReason,
  type DisputeVerdict,
} from '@/domain/schema';
import { logger } from './logger';
import {
  agents as agentsStore,
  currentUserId,
  deals as dealsStore,
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
   */
  async verifyOtp(requestId: string, code: string): Promise<{ user: User }> {
    await sleep(SLA_MS.otpVerify);
    const pending = pendingOtps[requestId];
    if (!pending) throw new Error('OTP expired or unknown');
    if (pending.code !== code) throw new Error('OTP incorrect');
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
   * Create a deal in `awaiting_funds`. The `sellerId` is optional in the mock
   * because some deal types (contracts, bets) are against a counterparty
   * chosen later — defaulting to Tunde keeps the mock concrete.
   */
  async create(input: {
    buyerId: string;
    sellerId?: string;
    title: string;
    grossKobo: number;
    category: DealCategory;
  }): Promise<Deal> {
    await sleep(SLA_MS.generic);
    const sellerId = input.sellerId ?? 'user_tunde';
    const sellerTier: TierKey = sellersStore[sellerId]?.tier ?? 'silver';
    const deal: Deal = {
      id: nid('deal'),
      title: input.title,
      category: input.category,
      grossKobo: input.grossKobo,
      buyerId: input.buyerId,
      sellerId,
      sellerTier,
      status: 'awaiting_funds',
      createdAt: nowIso(),
      timeline: [{ at: nowIso(), kind: 'created', actor: 'buyer' }],
    };
    dealsStore[deal.id] = deal;
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
    setTimeout(() => {
      const latest = dealsStore[dealId];
      if (latest && latest.status === 'awaiting_funds') {
        latest.status = 'funded';
        latest.fundedAt = nowIso();
        latest.autoReleaseAt = undefined; // set only after delivery+confirm
        latest.timeline.push({ at: nowIso(), kind: 'funded', actor: 'system' });
        latest.timeline.push({ at: nowIso(), kind: 'seller_notified', actor: 'system' });
      }
    }, SLA_MS.paymentSettle);
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
};

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
      createdAt: nowIso(),
    };
    listingsStore[l.id] = l;
    return Listing.parse(l);
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

const disputesStore: Record<string, Dispute> = {};

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
  sellers: sellersApi,
  disputes,
};

export type Api = typeof api;
