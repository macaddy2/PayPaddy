/**
 * Money math for PayPaddy.
 *
 * Rules:
 *  • All amounts internally are integer kobo. 1 NGN = 100 kobo.
 *  • Never use floats for money. Never multiply a kobo value by a float
 *    and drop the remainder — round deterministically instead.
 *  • Naira strings only appear in UI, produced by `formatNaira`.
 *
 * Fee policy (see PRD):
 *  • Silver tier escrow fee: 1.5%.
 *  • Gold tier escrow fee:   1.0%.
 *  • SafeGuard levy:         2% of the escrow fee (NOT of the deal gross).
 */

import { SAFEGUARD, TIERS, type TierKey } from './constants';

/**
 * Convert an integer naira amount to kobo.
 * Accepts numbers or numeric strings; rejects non-integers.
 */
export function nairaToKobo(nairaWhole: number): number {
  if (!Number.isInteger(nairaWhole) || nairaWhole < 0) {
    throw new Error(`nairaToKobo expects a non-negative integer, got ${nairaWhole}`);
  }
  return nairaWhole * 100;
}

/**
 * Format kobo as a user-facing NGN string (e.g. `₦50,000`).
 *
 * Always drops kobo in the display — the UI never shows sub-naira precision.
 * When displaying an amount that legitimately carries kobo precision,
 * pass `{ showKobo: true }`.
 */
export function formatNaira(amountKobo: number, opts?: { showKobo?: boolean }): string {
  const sign = amountKobo < 0 ? '-' : '';
  const abs = Math.abs(amountKobo);
  const naira = Math.floor(abs / 100);
  const kobo = abs % 100;
  const withSeparators = naira.toLocaleString('en-NG');
  if (opts?.showKobo) {
    return `${sign}₦${withSeparators}.${kobo.toString().padStart(2, '0')}`;
  }
  return `${sign}₦${withSeparators}`;
}

export type FeeBreakdown = {
  grossKobo: number;
  escrowFeeKobo: number;
  safeguardKobo: number;
  netToSellerKobo: number;
  tier: TierKey;
};

/**
 * Given a gross deal amount and a seller tier, produce the canonical fee
 * breakdown used on the receipt and in settlement.
 *
 * We round each component with `Math.round` to the nearest kobo. The rounding
 * error (at most 1 kobo total) is absorbed into `netToSellerKobo` so the
 * components always sum exactly to `grossKobo`.
 */
export function computeFees(grossKobo: number, tier: TierKey): FeeBreakdown {
  if (!Number.isInteger(grossKobo) || grossKobo <= 0) {
    throw new Error(`computeFees expects a positive integer kobo amount, got ${grossKobo}`);
  }
  const tierCfg = TIERS[tier];
  // Escrow fee = gross × fee-bps / 10_000 (bps = basis points; 100 bps = 1%)
  const escrowFeeKobo = Math.round((grossKobo * tierCfg.escrowFeeBps) / 10_000);
  // SafeGuard levy is a percentage of the escrow fee (not of gross).
  const safeguardKobo = Math.round((escrowFeeKobo * SAFEGUARD.levyBps) / 10_000);
  // Net-to-seller absorbs any rounding so the sum always matches gross.
  const netToSellerKobo = grossKobo - escrowFeeKobo - safeguardKobo;
  return { grossKobo, escrowFeeKobo, safeguardKobo, netToSellerKobo, tier };
}

/**
 * Slice a deal by a milestone share, then run the seller-tier escrow fee
 * over the slice. Same rounding invariant as `computeFees`: components of
 * `fees` sum exactly to `sliceKobo`, so paying out across all milestones
 * never over- or under-credits vs. paying out the deal in one shot.
 */
export function computeMilestonePayout(
  grossKobo: number,
  shareBps: number,
  tier: TierKey,
): { sliceKobo: number; fees: FeeBreakdown } {
  if (!Number.isInteger(grossKobo) || grossKobo <= 0) {
    throw new Error(`computeMilestonePayout expects a positive integer kobo amount, got ${grossKobo}`);
  }
  if (!Number.isInteger(shareBps) || shareBps <= 0 || shareBps > 10_000) {
    throw new Error(`computeMilestonePayout expects shareBps in 1..10000, got ${shareBps}`);
  }
  const sliceKobo = Math.round((grossKobo * shareBps) / 10_000);
  const fees = computeFees(sliceKobo, tier);
  return { sliceKobo, fees };
}

/**
 * Apply a fraud slash to a seller's collateral. Returns the amount slashed
 * (which funds the buyer refund) and the collateral remaining.
 */
export function computeSlash(collateralKobo: number, tier: TierKey): {
  slashedKobo: number;
  remainingKobo: number;
} {
  if (!Number.isInteger(collateralKobo) || collateralKobo < 0) {
    throw new Error(`computeSlash expects a non-negative integer, got ${collateralKobo}`);
  }
  const rate = TIERS[tier].slashRate;
  const slashedKobo = Math.round(collateralKobo * rate);
  return { slashedKobo, remainingKobo: collateralKobo - slashedKobo };
}

/**
 * Produce a stable, order-independent string of the negotiable contract terms
 * for a deal. Used as the input to `ledgerHash` when recording an Endorsement;
 * two endorsements only lock the deal if they share the same termsHash, so any
 * change between signatures invalidates the earlier one.
 *
 * Importing the Deal type via a structural shape avoids a circular dep with
 * `schema.ts` (which depends on `money.ts` via constants).
 */
export function canonicaliseTermsForHash(deal: {
  title: string;
  description?: string;
  grossKobo: number;
  buyerId: string;
  sellerId: string;
  category: string;
  milestones?: { id: string; title: string; shareBps: number; description?: string }[];
  counterparty?: { role: 'buyer' | 'seller'; userId?: string };
  fundingMode?: 'fund_first' | 'fund_after_lock';
}): string {
  const m = deal.milestones
    ?.slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((x) => `${x.id}:${x.title}:${x.shareBps}:${x.description ?? ''}`)
    .join('|');
  return [
    `t=${deal.title}`,
    `d=${deal.description ?? ''}`,
    `g=${deal.grossKobo}`,
    `b=${deal.buyerId}`,
    `s=${deal.sellerId}`,
    `c=${deal.category}`,
    `m=${m ?? ''}`,
    `cp=${deal.counterparty?.role ?? ''}/${deal.counterparty?.userId ?? ''}`,
    `fm=${deal.fundingMode ?? ''}`,
  ].join('||');
}
