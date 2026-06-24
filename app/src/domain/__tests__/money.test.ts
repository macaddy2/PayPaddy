/**
 * Money domain unit tests.
 *
 * These are the most critical tests in the project — money math bugs are
 * silent, corrupt financial records, and are hard to find in production.
 *
 * Coverage targets per plan:
 *   • nairaToKobo — conversion correctness, rejection of non-integers.
 *   • formatNaira — display formatting, negative amounts, kobo option.
 *   • computeFees — correct split for each tier, exact rounding, sum invariant.
 *   • computeSlash — slash percentages per tier, remainder invariant.
 */

import {
  canonicaliseTermsForHash,
  computeFees,
  computeSlash,
  formatNaira,
  nairaToKobo,
} from '../money';

// -------------------------
// nairaToKobo
// -------------------------

describe('nairaToKobo', () => {
  it('converts whole naira to kobo correctly', () => {
    expect(nairaToKobo(1)).toBe(100);
    expect(nairaToKobo(50_000)).toBe(5_000_000);
    expect(nairaToKobo(0)).toBe(0);
  });

  it('throws on non-integer inputs', () => {
    expect(() => nairaToKobo(1.5)).toThrow();
  });

  it('throws on negative inputs', () => {
    expect(() => nairaToKobo(-1)).toThrow();
  });
});

// -------------------------
// formatNaira
// -------------------------

describe('formatNaira', () => {
  it('formats zero as ₦0', () => {
    expect(formatNaira(0)).toBe('₦0');
  });

  it('formats a round naira amount without kobo', () => {
    expect(formatNaira(50_000_00)).toBe('₦50,000');
  });

  it('formats large amounts with separators', () => {
    expect(formatNaira(1_650_000_00)).toBe('₦1,650,000');
  });

  it('formats negative amounts with a leading minus', () => {
    expect(formatNaira(-5_000_00)).toBe('-₦5,000');
  });

  it('shows kobo when showKobo is true', () => {
    expect(formatNaira(5_050, { showKobo: true })).toBe('₦50.50');
  });
});

// -------------------------
// computeFees
// -------------------------

describe('computeFees', () => {
  const gross = nairaToKobo(100_000); // ₦100,000 → 10_000_000 kobo

  it('Silver: escrow fee is exactly 1.5%', () => {
    const { escrowFeeKobo } = computeFees(gross, 'silver');
    // 10_000_000 * 150 / 10_000 = 150_000 kobo
    expect(escrowFeeKobo).toBe(150_000);
  });

  it('Gold: escrow fee is exactly 1.0%', () => {
    const { escrowFeeKobo } = computeFees(gross, 'gold');
    // 10_000_000 * 100 / 10_000 = 100_000 kobo
    expect(escrowFeeKobo).toBe(100_000);
  });

  it('SafeGuard levy is 2% of the escrow fee (Silver)', () => {
    const { escrowFeeKobo, safeguardKobo } = computeFees(gross, 'silver');
    // 150_000 * 200 / 10_000 = 3_000 kobo
    expect(safeguardKobo).toBe(3_000);
    // and escrowFeeKobo was used as the base
    expect(safeguardKobo).toBe(Math.round(escrowFeeKobo * 0.02));
  });

  it('netToSellerKobo + escrowFeeKobo + safeguardKobo === grossKobo (Silver)', () => {
    const { grossKobo, escrowFeeKobo, safeguardKobo, netToSellerKobo } = computeFees(gross, 'silver');
    expect(netToSellerKobo + escrowFeeKobo + safeguardKobo).toBe(grossKobo);
  });

  it('netToSellerKobo + escrowFeeKobo + safeguardKobo === grossKobo (Gold)', () => {
    const { grossKobo, escrowFeeKobo, safeguardKobo, netToSellerKobo } = computeFees(gross, 'gold');
    expect(netToSellerKobo + escrowFeeKobo + safeguardKobo).toBe(grossKobo);
  });

  it('throws on non-positive amounts', () => {
    expect(() => computeFees(0, 'silver')).toThrow();
    expect(() => computeFees(-1, 'silver')).toThrow();
  });

  it('throws on non-integer amounts', () => {
    expect(() => computeFees(1.5, 'silver')).toThrow();
  });

  it('returns correct tier label', () => {
    expect(computeFees(gross, 'silver').tier).toBe('silver');
    expect(computeFees(gross, 'gold').tier).toBe('gold');
  });
});

// -------------------------
// computeSlash
// -------------------------

describe('computeSlash', () => {
  const stake = nairaToKobo(100_000); // ₦100,000 Silver stake

  it('Silver: slashes 50% of collateral', () => {
    const { slashedKobo, remainingKobo } = computeSlash(stake, 'silver');
    expect(slashedKobo).toBe(stake * 0.5);
    expect(remainingKobo).toBe(stake * 0.5);
  });

  it('Gold: slashes 75% of collateral', () => {
    const goldStake = nairaToKobo(500_000);
    const { slashedKobo, remainingKobo } = computeSlash(goldStake, 'gold');
    expect(slashedKobo).toBe(goldStake * 0.75);
    expect(remainingKobo).toBe(goldStake * 0.25);
  });

  it('slashedKobo + remainingKobo === collateralKobo', () => {
    const { slashedKobo, remainingKobo } = computeSlash(stake, 'silver');
    expect(slashedKobo + remainingKobo).toBe(stake);
  });

  it('handles zero collateral without throwing', () => {
    const { slashedKobo, remainingKobo } = computeSlash(0, 'silver');
    expect(slashedKobo).toBe(0);
    expect(remainingKobo).toBe(0);
  });

  it('throws on negative collateral', () => {
    expect(() => computeSlash(-1, 'silver')).toThrow();
  });
});

// -------------------------
// canonicaliseTermsForHash
// -------------------------

describe('canonicaliseTermsForHash', () => {
  const baseDeal = {
    title: 'Office paint job',
    grossKobo: 500_000_00,
    buyerId: 'user_ade',
    sellerId: 'user_tunde',
    category: 'service',
  } as const;

  it('produces a stable, order-independent digest of the negotiable terms', () => {
    const hash1 = canonicaliseTermsForHash(baseDeal);
    const hash2 = canonicaliseTermsForHash(baseDeal);
    expect(hash1).toBe(hash2);
  });

  it('absorbs every optional field — both populated and absent variants', () => {
    // Bare deal — all optional fields missing — must still produce a string.
    const bare = canonicaliseTermsForHash(baseDeal);
    expect(typeof bare).toBe('string');
    expect(bare.length).toBeGreaterThan(0);

    // Each optional field flips the digest when populated.
    const withDesc = canonicaliseTermsForHash({ ...baseDeal, description: 'two coats, white satin' });
    const withMs = canonicaliseTermsForHash({
      ...baseDeal,
      milestones: [
        { id: 'm_b', title: 'Stage two', shareBps: 5_000 },
        { id: 'm_a', title: 'Stage one', shareBps: 5_000, description: 'prep' },
      ],
    });
    const withMsNoDesc = canonicaliseTermsForHash({
      ...baseDeal,
      milestones: [{ id: 'm_a', title: 'Solo', shareBps: 10_000 }],
    });
    const withCpRoleOnly = canonicaliseTermsForHash({ ...baseDeal, counterparty: { role: 'seller' } });
    const withCpFull = canonicaliseTermsForHash({
      ...baseDeal,
      counterparty: { role: 'buyer', userId: 'user_tolu' },
    });
    const withFundFirst = canonicaliseTermsForHash({ ...baseDeal, fundingMode: 'fund_first' });

    expect(withDesc).not.toBe(bare);
    expect(withMs).not.toBe(bare);
    expect(withMsNoDesc).not.toBe(bare);
    expect(withCpRoleOnly).not.toBe(bare);
    expect(withCpFull).not.toBe(withCpRoleOnly);
    expect(withFundFirst).not.toBe(bare);
  });

  it('milestone ordering is canonicalised — same set in any order hashes the same', () => {
    const a = canonicaliseTermsForHash({
      ...baseDeal,
      milestones: [
        { id: 'm_a', title: 'A', shareBps: 3_000 },
        { id: 'm_b', title: 'B', shareBps: 7_000 },
      ],
    });
    const b = canonicaliseTermsForHash({
      ...baseDeal,
      milestones: [
        { id: 'm_b', title: 'B', shareBps: 7_000 },
        { id: 'm_a', title: 'A', shareBps: 3_000 },
      ],
    });
    expect(a).toBe(b);
  });
});
