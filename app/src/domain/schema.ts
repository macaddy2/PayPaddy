/**
 * Zod schemas + inferred TypeScript types for every entity that crosses the
 * mock-API boundary.
 *
 * Using zod means one schema serves three purposes:
 *   1. UI-level form validation (via @hookform/resolvers).
 *   2. Parse-at-the-boundary guard in `services/api.ts`
 *      (so a bad fixture crashes tests, not production).
 *   3. Source of truth for TypeScript types (`z.infer`).
 */

import { z } from 'zod';
import { DEAL_CATEGORIES } from './constants';

// -------------------------
// Primitive helpers
// -------------------------

/** A strictly-positive integer amount of kobo. */
export const kobo = z
  .number()
  .int({ message: 'kobo must be an integer' })
  .nonnegative({ message: 'kobo must be ≥ 0' });

/** ISO-8601 timestamp string. */
export const iso = z.string().datetime();

// -------------------------
// User / Trinity
// -------------------------

export const TrinityStatus = z.enum(['pending', 'verified', 'failed']);
export type TrinityStatus = z.infer<typeof TrinityStatus>;

export const User = z.object({
  id: z.string().min(1),
  phone: z.string().regex(/^\+?\d{10,14}$/),
  firstName: z.string().min(1).optional(),
  trinity: z.object({
    bvn: TrinityStatus,
    nin: TrinityStatus,
    liveness: TrinityStatus,
  }),
  role: z.enum(['buyer', 'seller', 'admin']).default('buyer'),
  createdAt: iso,
});
export type User = z.infer<typeof User>;

// -------------------------
// Seller / Collateral
// -------------------------

export const Tier = z.enum(['silver', 'gold']);
export type Tier = z.infer<typeof Tier>;

export const Seller = z.object({
  userId: z.string(),
  tier: Tier,
  collateralKobo: kobo,
  listingsCount: z.number().int().nonnegative(),
  trustScore: z.number().min(0).max(100),
});
export type Seller = z.infer<typeof Seller>;

// -------------------------
// Wallet
// -------------------------

export const Wallet = z.object({
  userId: z.string(),
  availableKobo: kobo,
  pendingKobo: kobo,
  lastPayoutAt: iso.optional(),
});
export type Wallet = z.infer<typeof Wallet>;

// -------------------------
// Deal
// -------------------------

export const DealCategory = z.enum(
  // DEAL_CATEGORIES is readonly-tuple; map to a zod enum at build time.
  DEAL_CATEGORIES.map((c) => c.key) as [string, ...string[]],
);
export type DealCategory = z.infer<typeof DealCategory>;

export const DealStatus = z.enum([
  'draft', // buyer creating but not yet funded
  'awaiting_funds', // created, waiting on payment
  'funded', // escrow is holding funds
  'in_progress', // seller notified + working
  'delivered', // seller marked delivered
  'settled', // buyer confirmed, funds released
  'disputed', // branch from funded/delivered
  'refunded', // dispute resolved in buyer's favour
]);
export type DealStatus = z.infer<typeof DealStatus>;

export const DealTimelineEvent = z.object({
  at: iso,
  kind: z.enum([
    'created',
    'funded',
    'seller_notified',
    'in_transit',
    'delivered',
    'confirmed',
    'settled',
    'dispute_opened',
    'dispute_resolved',
    'refunded',
  ]),
  actor: z.enum(['system', 'buyer', 'seller', 'admin']),
  note: z.string().optional(),
});
export type DealTimelineEvent = z.infer<typeof DealTimelineEvent>;

export const Deal = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(120),
  category: DealCategory,
  grossKobo: kobo,
  buyerId: z.string(),
  sellerId: z.string(),
  sellerTier: Tier,
  status: DealStatus,
  createdAt: iso,
  fundedAt: iso.optional(),
  confirmedAt: iso.optional(),
  /** When funded → auto-release fires at this time unless buyer disputes. */
  autoReleaseAt: iso.optional(),
  timeline: z.array(DealTimelineEvent),
  /** Optional milestone breakdown for multi-stage deals; undefined → single-payout. */
  milestones: z.array(z.lazy(() => Milestone)).optional(),
  /** Hash-chained provenance log; undefined for legacy single-payout deals. */
  ledger: z.array(z.lazy(() => LedgerEntry)).optional(),
});
export type Deal = z.infer<typeof Deal>;

// -------------------------
// Milestones + Ledger ("off-chain smart contract" — see services/ledger.ts)
// -------------------------

export const MilestoneStatus = z.enum([
  'pending', // not yet started
  'in_progress', // seller working
  'delivered', // seller marked done; awaiting buyer release (or auto-release)
  'released', // funds credited to seller wallet
  'disputed',
]);
export type MilestoneStatus = z.infer<typeof MilestoneStatus>;

export const Milestone = z.object({
  id: z.string().min(1),
  title: z.string().min(2).max(80),
  description: z.string().max(280).optional(),
  /** Share of deal.grossKobo in basis points. Milestones in a deal sum to 10_000. */
  shareBps: z.number().int().min(1).max(10_000),
  status: MilestoneStatus,
  deliveredAt: iso.optional(),
  releasedAt: iso.optional(),
  /** Net amount actually credited on release (post-fees). */
  releasedKobo: kobo.optional(),
  /** Auto-release deadline once delivered. */
  autoReleaseAt: iso.optional(),
});
export type Milestone = z.infer<typeof Milestone>;

export const LedgerEntryKind = z.enum([
  'deal_created',
  'deal_funded',
  'milestone_started',
  'milestone_delivered',
  'milestone_released',
  'milestone_disputed',
  'deal_settled',
]);
export type LedgerEntryKind = z.infer<typeof LedgerEntryKind>;

export const LedgerEntry = z.object({
  /** Sequence within the deal, starting at 0. */
  index: z.number().int().min(0),
  at: iso,
  kind: LedgerEntryKind,
  actor: z.enum(['system', 'buyer', 'seller', 'admin']),
  /** Milestone this entry pertains to, if applicable. */
  milestoneId: z.string().optional(),
  /** Kobo moved by this entry (0 for non-payout events). */
  amountKobo: kobo,
  note: z.string().optional(),
  /** Hash of this entry's payload + prevHash. */
  hash: z.string(),
  /** Hash of the previous entry; 'genesis' for index 0. */
  prevHash: z.string(),
});
export type LedgerEntry = z.infer<typeof LedgerEntry>;

// -------------------------
// Dispute
// -------------------------

export const DisputeReason = z.enum([
  'not_delivered',
  'wrong_item',
  'damaged',
  'fake',
  'other',
]);
export type DisputeReason = z.infer<typeof DisputeReason>;

export const DisputeStatus = z.enum(['open', 'under_review', 'resolved']);
export type DisputeStatus = z.infer<typeof DisputeStatus>;

export const DisputeVerdict = z.enum(['buyer_wins', 'seller_wins', 'split']);
export type DisputeVerdict = z.infer<typeof DisputeVerdict>;

export const DisputePayoutBreakdown = z.object({
  fromCollateralKobo: kobo,
  fromSafeguardPoolKobo: kobo,
  toBuyerKobo: kobo,
  toSellerKobo: kobo,
});
export type DisputePayoutBreakdown = z.infer<typeof DisputePayoutBreakdown>;

export const Dispute = z.object({
  id: z.string(),
  dealId: z.string(),
  openedAt: iso,
  reason: DisputeReason,
  description: z.string().min(10),
  evidenceUrls: z.array(z.string()).max(6),
  status: DisputeStatus,
  verdict: DisputeVerdict.optional(),
  resolvedAt: iso.optional(),
  payout: DisputePayoutBreakdown.optional(),
});
export type Dispute = z.infer<typeof Dispute>;

// -------------------------
// Listing
// -------------------------

export const Listing = z.object({
  id: z.string(),
  sellerId: z.string(),
  title: z.string().min(3),
  description: z.string(),
  priceKobo: kobo,
  category: DealCategory,
  city: z.string().default('Lagos'),
  imageEmoji: z.string().default('📦'),
  status: z.enum(['draft', 'published', 'paused']).default('published'),
  /** Required if category === 'commerce' AND listing declares an IMEI. */
  imei: z.string().optional(),
  imeiVerified: z.boolean().optional(),
  createdAt: iso,
});
export type Listing = z.infer<typeof Listing>;

export const IntegrationPartner = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(['individual', 'storefront', 'platform', 'plugin']),
  city: z.string(),
  tier: Tier,
  trustScore: z.number().min(0).max(100),
  collateralKobo: kobo,
  trinityVerified: z.boolean(),
  successfulDeals: z.number().int().nonnegative(),
  disputeRatePct: z.number().nonnegative(),
  integrationMode: z.enum(['payment_link', 'hosted_checkout', 'api', 'plugin']),
  externalBaseUrl: z.string().url().optional(),
  apiKeyLabel: z.string().optional(),
});
export type IntegrationPartner = z.infer<typeof IntegrationPartner>;

export const CommerceIntentStatus = z.enum(['ready', 'deal_created', 'expired']);
export type CommerceIntentStatus = z.infer<typeof CommerceIntentStatus>;

export const CommerceIntent = z.object({
  id: z.string(),
  source: z.enum(['individual_link', 'platform_checkout', 'invoice', 'plugin_demo']),
  externalRef: z.string(),
  partnerId: z.string(),
  sellerId: z.string(),
  title: z.string().min(3),
  description: z.string(),
  amountKobo: kobo,
  category: DealCategory,
  city: z.string(),
  imageEmoji: z.string().default('📦'),
  status: CommerceIntentStatus.default('ready'),
  returnUrl: z.string().url().optional(),
  createdAt: iso,
  expiresAt: iso.optional(),
});
export type CommerceIntent = z.infer<typeof CommerceIntent>;

export const CommerceIntentDetail = CommerceIntent.extend({
  partner: IntegrationPartner,
});
export type CommerceIntentDetail = z.infer<typeof CommerceIntentDetail>;

export const CommerceIntentFilters = z.object({
  query: z.string().optional(),
  category: DealCategory.optional(),
  partnerId: z.string().optional(),
  mode: z.enum(['payment_link', 'hosted_checkout', 'api', 'plugin']).optional(),
});
export type CommerceIntentFilters = z.infer<typeof CommerceIntentFilters>;

// -------------------------
// Agent
// -------------------------

export const Agent = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  distanceKm: z.number().nonnegative(),
  rating: z.number().min(0).max(5),
  cashInCapable: z.boolean(),
  cashOutCapable: z.boolean(),
  trustScore: z.number().min(0).max(100),
});
export type Agent = z.infer<typeof Agent>;

export const CashInCode = z.object({
  code: z.string().regex(/^\d{6}$/),
  expiresAt: iso,
  amountKobo: kobo,
  agentId: z.string(),
});
export type CashInCode = z.infer<typeof CashInCode>;

// -------------------------
// Payment / virtual account
// -------------------------

export const VirtualAccount = z.object({
  bankName: z.string(),
  accountName: z.string(),
  accountNumber: z.string().regex(/^\d{10}$/),
  amountKobo: kobo,
  expiresAt: iso,
});
export type VirtualAccount = z.infer<typeof VirtualAccount>;
