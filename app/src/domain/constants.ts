/**
 * Domain constants — business rules and SLAs pulled from the PRD and Tech Spec.
 *
 * Every screen / mock / store references constants from this file instead of
 * hard-coding numbers. When the PRD changes, there is exactly one place to edit.
 */

/**
 * Seller tiers. Values mirror the PRD's collateral-staking policy.
 */
export const TIERS = {
  silver: {
    key: 'silver',
    label: 'Silver',
    // Minimum collateral (kobo). ₦100,000 → 10_000_000 kobo.
    stakeKobo: 10_000_000,
    // Monthly cumulative transaction cap (kobo). ₦5,000,000.
    monthlyLimitKobo: 500_000_000,
    // Fraction of stake slashed on a lost dispute.
    slashRate: 0.5,
    // Escrow fee basis points applied to each deal (150 = 1.50%).
    escrowFeeBps: 150,
  },
  gold: {
    key: 'gold',
    label: 'Gold',
    stakeKobo: 50_000_000, // ₦500,000
    monthlyLimitKobo: 5_000_000_000, // ₦50,000,000
    slashRate: 0.75,
    escrowFeeBps: 100, // 1.00%
  },
} as const;

export type TierKey = keyof typeof TIERS; // 'silver' | 'gold'

/**
 * SafeGuard pool parameters.
 *
 * `levyBps` is a levy on the escrow fee (NOT on the deal gross).
 * 200 bps = 2% of the escrow fee routed into the pool.
 */
export const SAFEGUARD = {
  levyBps: 200,
  coverageCeilingKobo: 50_000_000, // ₦500,000 per buyer per incident
} as const;

/**
 * Collateral earns T-bill yield while locked. Informational only — the UI
 * surfaces this on the fund-collateral screen as a seller incentive.
 */
export const COLLATERAL_YIELD = {
  annualPct: 12,
} as const;

/**
 * SLA budgets (milliseconds) for Trinity and related calls. The mock API
 * uses these to approximate real provider latency so loading states feel
 * realistic and the funnel stays within the <30s account-creation budget.
 */
export const SLA_MS = {
  bvnLookup: 4_500, // PRD: ≤ 5s
  ninLookup: 9_000, // PRD: ≤ 10s
  liveness: 7_500, // PRD: ≤ 8s
  otpDeliver: 1_200,
  otpVerify: 600,
  imeiCheck: 1_500,
  virtualAccountIssue: 1_000,
  payout: 2_000,
  paymentSettle: 3_500, // mocked webhook latency awaiting_funds → funded
  generic: 600,
} as const;

/**
 * Deal timers (ms).
 *
 * autoReleaseWindow: once the buyer confirms receipt the funds are auto-released
 * after this many ms unless the buyer disputes. 24h per PRD.
 *
 * disputeSellerResponseWindow: once a dispute is opened the seller has this long
 * to submit a counter-statement before the arbitrator proceeds unilaterally.
 */
export const DEAL_TIMERS_MS = {
  autoReleaseWindow: 24 * 60 * 60 * 1000, // 24h
  disputeSellerResponseWindow: 48 * 60 * 60 * 1000, // 48h
  disputeTargetResolution: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

/**
 * Deal categories — drive the 2×2 picker on `deal/new` and filter chips on
 * `(tabs)/deals`. Icons are emoji for now; they can be swapped to real
 * icon-font glyphs without touching logic.
 */
export const DEAL_CATEGORIES = [
  { key: 'commerce', label: 'Buy / Sell', icon: '🛍' },
  { key: 'service', label: 'Service', icon: '✍️' },
  { key: 'contract', label: 'Contract', icon: '📋' },
  { key: 'bet', label: 'Bet', icon: '⚽' },
] as const;

export type DealCategoryKey = (typeof DEAL_CATEGORIES)[number]['key'];

/**
 * Mock-only trigger values that deliberately exercise failure paths. Keeping
 * them in one file makes the "canned failures" documentation live.
 */
export const MOCK_TRIGGERS = {
  // Passing this BVN to the mock makes the lookup fail.
  failingBvn: '00000000000',
  // IMEI values starting with this prefix are flagged as stolen by NCC mock.
  stolenImeiPrefix: '999',
} as const;
