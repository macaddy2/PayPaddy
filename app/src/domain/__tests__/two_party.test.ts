/**
 * Two-party contract lifecycle tests.
 *
 * Covers the full spine end-to-end on the mock `api.deals` namespace:
 *   invite → accept → amendment (propose / both-accept) → endorse-to-lock
 *   → fund → milestone deliveries + releases → awaiting_completion_signoff
 *   → bilateral signCompletion → settled.
 *
 * Plus the negative cases the user explicitly cared about:
 *   - amendments must net to 10000 bps
 *   - lock requires BOTH endorsements on the SAME termsHash (a new amendment
 *     after one side endorses invalidates that endorsement)
 *   - only one sign-off does NOT settle a deal — both required
 *   - legacy single-party deals (no counterparty) still flow straight to
 *     `settled` from the last milestone release (no completion-signoff step)
 */

import { api } from '../../services/api';
import {
  deals as dealsStore,
  inviteTokens as inviteTokensStore,
  resetFixtures,
  wallets as walletsStore,
} from '../../services/fixtures';
import { verifyLedger } from '../../services/ledger';

const BUYER = 'user_ade';
const SELLER = 'user_tunde';

beforeEach(() => {
  resetFixtures();
});

async function createBuyerInitiatedDeal(opts?: { fundingMode?: 'fund_first' | 'fund_after_lock' }) {
  return api.deals.create({
    buyerId: BUYER,
    title: 'Office paint job',
    description: 'Two coats, white satin',
    grossKobo: 500_000_00,
    category: 'service',
    milestones: [
      { title: 'Prep', shareBps: 3_000 },
      { title: 'Coat 1', shareBps: 3_500 },
      { title: 'Coat 2', shareBps: 3_500 },
    ],
    counterparty: { role: 'seller', name: 'Tunde', phone: '+2348023456789' },
    fundingMode: opts?.fundingMode ?? 'fund_after_lock',
  });
}

describe('two-party contract lifecycle — happy path', () => {
  it('full spine: invite → accept → amend → endorse → fund → milestones → bilateral sign-off → settled', async () => {
    const deal0 = await createBuyerInitiatedDeal();
    expect(deal0.status).toBe('draft');
    expect(deal0.initiatorRole).toBe('buyer');
    expect(deal0.counterparty?.role).toBe('seller');
    expect(deal0.sellerId).toBe(''); // not yet filled; pending counterparty acceptance
    expect(deal0.buyerId).toBe(BUYER);

    // Invite issued: deal moves to awaiting_counterparty, token exists.
    const { deal: deal1, inviteUrl } = await api.deals.invite({ dealId: deal0.id });
    expect(deal1.status).toBe('awaiting_counterparty');
    expect(inviteUrl).toMatch(/^\/invite\//);
    const token = deal1.inviteToken?.token;
    expect(token).toBeTruthy();
    expect(inviteTokensStore[token!]).toBeDefined();

    // Counterparty accepts → buyer/seller filled, status `viewed`.
    const deal2 = await api.deals.acceptInvite(token!, SELLER);
    expect(deal2.status).toBe('viewed');
    expect(deal2.sellerId).toBe(SELLER);
    expect(deal2.counterparty?.userId).toBe(SELLER);

    // Counterparty proposes an amendment to milestone breakdown.
    const deal3 = await api.deals.proposeAmendment({
      dealId: deal2.id,
      proposedBy: 'counterparty',
      changes: {
        milestones: [
          { title: 'Prep', shareBps: 3_500 },
          { title: 'Coat 1', shareBps: 3_500 },
          { title: 'Coat 2', shareBps: 3_000 },
        ],
      },
      note: 'Prep heavier than scoped',
    });
    expect(deal3.status).toBe('negotiating');
    expect(deal3.amendments?.[0]?.status).toBe('proposed');
    expect(deal3.amendments?.[0]?.counterpartyResponse).toBe('accept');
    expect(deal3.amendments?.[0]?.initiatorResponse).toBe('pending');

    // Initiator accepts the amendment → applied, back to `viewed`.
    const amendmentId = deal3.amendments![0]!.id;
    const deal4 = await api.deals.respondToAmendment({
      dealId: deal3.id,
      amendmentId,
      by: 'initiator',
      response: 'accept',
    });
    expect(deal4.status).toBe('viewed');
    expect(deal4.amendments?.[0]?.status).toBe('accepted');
    expect(deal4.milestones?.[0]?.shareBps).toBe(3_500); // changes applied
    expect(deal4.milestones?.[2]?.shareBps).toBe(3_000);

    // Both sides endorse on the same termsHash → status flips to locked,
    // then to awaiting_funds (fund-after-lock path; nothing funded yet).
    await api.deals.endorseLock({ dealId: deal4.id, by: 'initiator' });
    const deal5 = await api.deals.endorseLock({ dealId: deal4.id, by: 'counterparty' });
    expect(deal5.status).toBe('awaiting_funds');
    expect(deal5.lockedAt).toBeTruthy();
    expect(deal5.endorsements?.length).toBe(2);
    const [eA, eB] = deal5.endorsements!;
    expect(eA!.termsHash).toBe(eB!.termsHash);

    // Issue the virtual account; the mock sleeps then flips funded.
    await api.deals.fundVirtualAccountViaProvidus(deal5.id);
    // Wait long enough for the simulated webhook (SLA_MS.paymentSettle = ~3s).
    await new Promise((r) => setTimeout(r, 3500));
    const funded = await api.deals.get(deal5.id);
    expect(funded.status).toBe('funded');

    // Walk every milestone through delivered → released.
    for (const m of funded.milestones!) {
      await api.deals.markMilestoneDelivered(funded.id, m.id);
      await api.deals.releaseMilestone(funded.id, m.id, 'buyer');
    }

    // Two-party deals route through awaiting_completion_signoff instead of
    // straight to settled. Both sides have to sign satisfaction.
    const afterMilestones = await api.deals.get(funded.id);
    expect(afterMilestones.status).toBe('awaiting_completion_signoff');
    expect(afterMilestones.completionSignoff).toBeDefined();

    // One sign-off alone is NOT enough — still awaiting.
    const half = await api.deals.signCompletion({ dealId: afterMilestones.id, by: 'initiator' });
    expect(half.status).toBe('awaiting_completion_signoff');
    expect(half.completionSignoff?.initiatorAt).toBeTruthy();
    expect(half.completionSignoff?.counterpartyAt).toBeUndefined();

    // Counterparty signs → settled.
    const settled = await api.deals.signCompletion({ dealId: afterMilestones.id, by: 'counterparty' });
    expect(settled.status).toBe('settled');
    expect(settled.completionSignoff?.counterpartyAt).toBeTruthy();
    expect(settled.confirmedAt).toBeTruthy();

    // Ledger integrity end-to-end.
    expect(verifyLedger(settled.ledger)).toBe(-1);
    const kinds = settled.ledger!.map((e) => e.kind);
    expect(kinds).toEqual(expect.arrayContaining([
      'deal_created',
      'invite_sent',
      'invite_accepted',
      'amendment_proposed',
      'amendment_accepted',
      'terms_locked',
      'deal_funded',
      'milestone_delivered',
      'milestone_released',
      'completion_signed',
      'deal_settled',
    ]));
  }, 20_000);
});

describe('two-party contract lifecycle — negative paths', () => {
  it('amendment milestone shares must net to 10000 bps', async () => {
    const d = await createBuyerInitiatedDeal();
    const { inviteUrl: _u } = await api.deals.invite({ dealId: d.id });
    void _u;
    const token = dealsStore[d.id]!.inviteToken!.token;
    await api.deals.acceptInvite(token, SELLER);
    await expect(
      api.deals.proposeAmendment({
        dealId: d.id,
        proposedBy: 'counterparty',
        changes: {
          milestones: [
            { title: 'Stage one', shareBps: 5_000 },
            { title: 'Stage two', shareBps: 4_000 }, // sums to 9000, not 10000
          ],
        },
      }),
    ).rejects.toThrow(/sum to 10000/);
  });

  it('an amendment between endorsements invalidates the first endorsement', async () => {
    const d0 = await createBuyerInitiatedDeal();
    await api.deals.invite({ dealId: d0.id });
    const token = dealsStore[d0.id]!.inviteToken!.token;
    await api.deals.acceptInvite(token, SELLER);

    // Initiator endorses first…
    const e1 = await api.deals.endorseLock({ dealId: d0.id, by: 'initiator' });
    expect(e1.status).toBe('viewed'); // not locked yet — only one side endorsed
    expect(e1.endorsements?.length).toBe(1);

    // …then counterparty proposes an amendment, which invalidates that endorsement.
    const e2 = await api.deals.proposeAmendment({
      dealId: d0.id,
      proposedBy: 'counterparty',
      changes: { description: 'Add ladders to scope' },
    });
    expect(e2.endorsements?.length).toBe(0); // wiped
    expect(e2.status).toBe('negotiating');

    // Initiator accepts the amendment → back to viewed; both sides must endorse again.
    await api.deals.respondToAmendment({
      dealId: d0.id,
      amendmentId: e2.amendments!.at(-1)!.id,
      by: 'initiator',
      response: 'accept',
    });
    const back = await api.deals.get(d0.id);
    expect(back.status).toBe('viewed');
    expect(back.endorsements?.length).toBe(0);
  });

  it('initiator cannot accept their own invite', async () => {
    const d = await createBuyerInitiatedDeal();
    await api.deals.invite({ dealId: d.id });
    const token = dealsStore[d.id]!.inviteToken!.token;
    await expect(api.deals.acceptInvite(token, BUYER)).rejects.toThrow(/Initiator/);
  });

  it('a legacy single-party deal still settles directly from the last milestone release', async () => {
    // No `counterparty` → legacy path.
    const d = await api.deals.create({
      buyerId: BUYER,
      title: 'One-shot legacy deal',
      grossKobo: 100_000_00,
      category: 'service',
      milestones: [
        { title: 'Stage one', shareBps: 5_000 },
        { title: 'Stage two', shareBps: 5_000 },
      ],
    });
    expect(d.status).toBe('awaiting_funds');
    expect(d.counterparty).toBeUndefined();

    await api.deals.fundVirtualAccountViaProvidus(d.id);
    await new Promise((r) => setTimeout(r, 3500));
    const funded = await api.deals.get(d.id);
    expect(funded.status).toBe('funded');

    for (const m of funded.milestones!) {
      await api.deals.markMilestoneDelivered(funded.id, m.id);
      await api.deals.releaseMilestone(funded.id, m.id, 'buyer');
    }

    // No awaiting_completion_signoff for legacy deals — straight to settled.
    const done = await api.deals.get(funded.id);
    expect(done.status).toBe('settled');
    expect(done.completionSignoff).toBeUndefined();

    // Wallet got the full net.
    const sellerWallet = walletsStore[funded.sellerId];
    expect(sellerWallet!.availableKobo).toBeGreaterThan(0);
  }, 20_000);
});
