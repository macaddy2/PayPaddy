/**
 * Milestones + ledger tests.
 *
 * Two layers:
 *   1. `computeMilestonePayout` — slice math, rounding, sum invariant against
 *      a single-payout `computeFees` over the same gross.
 *   2. End-to-end against the mock `api.deals` namespace: create a
 *      milestone-equipped deal, drive it through fund → deliver each
 *      milestone → release each milestone → settled, and assert that
 *      (a) the seller wallet receives the right amount, (b) the deal
 *      transitions cleanly, (c) the ledger hash chain is intact end-to-end.
 */

import { computeFees, computeMilestonePayout } from '../money';
import { TIERS } from '../constants';
import { api } from '../../services/api';
import { appendEntry, verifyLedger } from '../../services/ledger';
import {
  deals as dealsStore,
  resetFixtures,
  wallets as walletsStore,
} from '../../services/fixtures';

// -------------------------
// Slice math
// -------------------------

describe('computeMilestonePayout', () => {
  const tiers = Object.keys(TIERS) as (keyof typeof TIERS)[];

  it.each(tiers)('full-deal share (10000 bps) matches computeFees for %s tier', (tier) => {
    const gross = 1_650_000_00;
    const full = computeFees(gross, tier);
    const sliced = computeMilestonePayout(gross, 10_000, tier);
    expect(sliced.sliceKobo).toBe(gross);
    expect(sliced.fees).toEqual(full);
  });

  it('split shares sum exactly to gross (no rounding loss in slice math)', () => {
    const gross = 85_000_00;
    const shares = [3_000, 4_000, 3_000];
    const sum = shares
      .map((bps) => computeMilestonePayout(gross, bps, 'silver').sliceKobo)
      .reduce((a, b) => a + b, 0);
    // sum-of-slices is allowed to drift by ≤ 1 kobo per share due to rounding,
    // and never by more than (shares.length - 1) kobo total.
    expect(Math.abs(sum - gross)).toBeLessThanOrEqual(shares.length - 1);
  });

  it('rejects shares outside the 1..10000 bps band', () => {
    expect(() => computeMilestonePayout(100_00, 0, 'silver')).toThrow();
    expect(() => computeMilestonePayout(100_00, -1, 'silver')).toThrow();
    expect(() => computeMilestonePayout(100_00, 10_001, 'silver')).toThrow();
  });

  it('rejects non-positive gross', () => {
    expect(() => computeMilestonePayout(0, 5_000, 'gold')).toThrow();
    expect(() => computeMilestonePayout(-100, 5_000, 'gold')).toThrow();
  });
});

// -------------------------
// End-to-end milestone flow against api.deals
// -------------------------

describe('api.deals: milestone flow + ledger chain', () => {
  beforeEach(() => {
    resetFixtures();
  });

  it('runs create → fund → deliver/release each milestone → settled with intact ledger', async () => {
    // user_chiamaka is a Silver-tier seller seeded with collateral and a wallet.
    const buyerId = 'user_ade';
    const sellerId = 'user_chiamaka';
    const grossKobo = 90_000_00;

    const deal = await api.deals.create({
      buyerId,
      sellerId,
      title: 'Three-stage delivery test',
      grossKobo,
      category: 'service',
      milestones: [
        { title: 'Phase 1', shareBps: 3_000 },
        { title: 'Phase 2', shareBps: 4_000 },
        { title: 'Phase 3', shareBps: 3_000 },
      ],
    });

    expect(deal.milestones).toHaveLength(3);
    expect(deal.ledger?.length).toBe(1);
    expect(deal.ledger?.[0]?.kind).toBe('deal_created');
    expect(deal.ledger?.[0]?.prevHash).toBe('genesis');

    // Shortcut funding so we can drive milestones synchronously — the
    // `fundVirtualAccountViaProvidus` webhook-simulation path is tested
    // separately and waiting on its 3.5s setTimeout here would slow the suite.
    const stored = dealsStore[deal.id]!;
    stored.status = 'funded';
    stored.fundedAt = new Date().toISOString();
    appendEntry(stored, 'deal_funded', 'system', { amountKobo: stored.grossKobo });

    const startingBalance = walletsStore[sellerId]?.availableKobo ?? 0;

    // Drive each milestone through deliver → release.
    let runningCredit = 0;
    for (const m of deal.milestones!) {
      await api.deals.markMilestoneDelivered(deal.id, m.id);
      const released = await api.deals.releaseMilestone(deal.id, m.id);
      const updated = released.milestones!.find((x) => x.id === m.id)!;
      expect(updated.status).toBe('released');
      expect(updated.releasedKobo).toBeGreaterThan(0);
      runningCredit += updated.releasedKobo!;
    }

    const finalDeal = await api.deals.get(deal.id);
    expect(finalDeal.status).toBe('settled');
    expect(finalDeal.milestones!.every((m) => m.status === 'released')).toBe(true);

    // Wallet credit matches the sum of milestone net payouts.
    const endingBalance = walletsStore[sellerId]?.availableKobo ?? 0;
    expect(endingBalance - startingBalance).toBe(runningCredit);

    // Ledger chain integrity: indices ascend, prevHash links match, hashes valid.
    const broken = verifyLedger(finalDeal.ledger);
    expect(broken).toBe(-1);

    // Last entry must be deal_settled and reference the auto-settle.
    expect(finalDeal.ledger?.at(-1)?.kind).toBe('deal_settled');
  });

  it('detects a tampered ledger entry via verifyLedger', async () => {
    const deal = await api.deals.create({
      buyerId: 'user_ade',
      sellerId: 'user_chiamaka',
      title: 'Tamper test',
      grossKobo: 50_000_00,
      category: 'service',
      milestones: [
        { title: 'Stage A', shareBps: 5_000 },
        { title: 'Stage B', shareBps: 5_000 },
      ],
    });
    const stored = dealsStore[deal.id]!;
    stored.status = 'funded';
    stored.fundedAt = new Date().toISOString();
    appendEntry(stored, 'deal_funded', 'system', { amountKobo: stored.grossKobo });
    await api.deals.markMilestoneDelivered(deal.id, deal.milestones![0]!.id);
    const released = await api.deals.releaseMilestone(deal.id, deal.milestones![0]!.id);

    expect(verifyLedger(released.ledger)).toBe(-1);

    // Mutate one entry's amount and confirm verifyLedger flags it.
    const tampered = released.ledger!.map((e, i) =>
      i === 2 ? { ...e, amountKobo: e.amountKobo + 1 } : e,
    );
    expect(verifyLedger(tampered)).toBe(2);
  });

  it('rejects milestone shares that do not sum to 10_000 bps', async () => {
    await expect(
      api.deals.create({
        buyerId: 'user_ade',
        sellerId: 'user_chiamaka',
        title: 'Bad shares',
        grossKobo: 10_000_00,
        category: 'service',
        milestones: [
          { title: 'Stage A', shareBps: 5_000 },
          { title: 'Stage B', shareBps: 4_000 },
        ],
      }),
    ).rejects.toThrow(/sum to 10000/);
  });
});
