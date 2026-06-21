/**
 * Deals store — owns the list of deals + individual deal detail.
 *
 * Screens use `useDeals` for the list view and `useDeal(id)` for the deal
 * room. Both selectors are derived from a single `byId` map so updates
 * (status transitions) immediately reflect everywhere.
 */

import { create } from 'zustand';

import { api } from '@/services/api';
import type { AmendmentChanges, Deal, DealCategory, VirtualAccount } from '@/domain/schema';

type DealsState = {
  byId: Record<string, Deal>;
  listLoading: boolean;
  error: string | null;

  // Virtual account issued for the current funding flow.
  pendingVirtualAccount: VirtualAccount | null;

  // Actions
  loadAll: (userId: string) => Promise<void>;
  loadOne: (dealId: string) => Promise<void>;
  createDeal: (input: {
    buyerId: string;
    sellerId?: string;
    title: string;
    description?: string;
    grossKobo: number;
    category: DealCategory;
    milestones?: { title: string; description?: string; shareBps: number }[];
    counterparty?: { role: 'buyer' | 'seller'; name?: string; phone?: string; email?: string };
    fundingMode?: 'fund_first' | 'fund_after_lock';
  }) => Promise<Deal>;
  createDealFromIntent: (input: { intentId: string; buyerId: string }) => Promise<Deal>;
  fundViaVirtualAccount: (dealId: string) => Promise<VirtualAccount>;
  confirmReceipt: (dealId: string) => Promise<Deal>;
  markMilestoneDelivered: (dealId: string, milestoneId: string) => Promise<Deal>;
  releaseMilestone: (dealId: string, milestoneId: string) => Promise<Deal>;
  // Two-party contract lifecycle
  invite: (dealId: string) => Promise<{ deal: Deal; inviteUrl: string }>;
  acceptInvite: (token: string, asUserId: string) => Promise<Deal>;
  proposeAmendment: (input: {
    dealId: string;
    proposedBy: 'initiator' | 'counterparty';
    changes: AmendmentChanges;
    note?: string;
  }) => Promise<Deal>;
  respondToAmendment: (input: {
    dealId: string;
    amendmentId: string;
    by: 'initiator' | 'counterparty';
    response: 'accept' | 'reject';
  }) => Promise<Deal>;
  endorseLock: (input: { dealId: string; by: 'initiator' | 'counterparty' }) => Promise<Deal>;
  signCompletion: (input: { dealId: string; by: 'initiator' | 'counterparty' }) => Promise<Deal>;
  clearError: () => void;
};

export const useDeals = create<DealsState>((set) => ({
  byId: {},
  listLoading: false,
  error: null,
  pendingVirtualAccount: null,

  clearError: () => set({ error: null }),

  async loadAll(userId) {
    set({ listLoading: true, error: null });
    try {
      const list = await api.deals.list(userId);
      const byId: Record<string, Deal> = {};
      for (const d of list) byId[d.id] = d;
      set({ byId, listLoading: false });
    } catch (e) {
      set({ listLoading: false, error: (e as Error).message });
    }
  },

  async loadOne(dealId) {
    try {
      const deal = await api.deals.get(dealId);
      set((s) => ({ byId: { ...s.byId, [deal.id]: deal } }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async createDeal(input) {
    set({ error: null });
    try {
      const deal = await api.deals.create(input);
      set((s) => ({ byId: { ...s.byId, [deal.id]: deal } }));
      return deal;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  async createDealFromIntent(input) {
    set({ error: null });
    try {
      const deal = await api.commerce.createDealFromIntent(input);
      set((s) => ({ byId: { ...s.byId, [deal.id]: deal } }));
      return deal;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  async fundViaVirtualAccount(dealId) {
    set({ error: null });
    try {
      const va = await api.deals.fundVirtualAccountViaProvidus(dealId);
      set({ pendingVirtualAccount: va });
      return va;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  async confirmReceipt(dealId) {
    set({ error: null });
    try {
      const deal = await api.deals.confirmReceipt(dealId);
      set((s) => ({ byId: { ...s.byId, [deal.id]: deal } }));
      return deal;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  async markMilestoneDelivered(dealId, milestoneId) {
    set({ error: null });
    try {
      const deal = await api.deals.markMilestoneDelivered(dealId, milestoneId);
      set((s) => ({ byId: { ...s.byId, [deal.id]: deal } }));
      return deal;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  async releaseMilestone(dealId, milestoneId) {
    set({ error: null });
    try {
      const deal = await api.deals.releaseMilestone(dealId, milestoneId);
      set((s) => ({ byId: { ...s.byId, [deal.id]: deal } }));
      return deal;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  async invite(dealId) {
    set({ error: null });
    try {
      const result = await api.deals.invite({ dealId });
      set((s) => ({ byId: { ...s.byId, [result.deal.id]: result.deal } }));
      return result;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  async acceptInvite(token, asUserId) {
    set({ error: null });
    try {
      const deal = await api.deals.acceptInvite(token, asUserId);
      set((s) => ({ byId: { ...s.byId, [deal.id]: deal } }));
      return deal;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  async proposeAmendment(input) {
    set({ error: null });
    try {
      const deal = await api.deals.proposeAmendment(input);
      set((s) => ({ byId: { ...s.byId, [deal.id]: deal } }));
      return deal;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  async respondToAmendment(input) {
    set({ error: null });
    try {
      const deal = await api.deals.respondToAmendment(input);
      set((s) => ({ byId: { ...s.byId, [deal.id]: deal } }));
      return deal;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  async endorseLock(input) {
    set({ error: null });
    try {
      const deal = await api.deals.endorseLock(input);
      set((s) => ({ byId: { ...s.byId, [deal.id]: deal } }));
      return deal;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  async signCompletion(input) {
    set({ error: null });
    try {
      const deal = await api.deals.signCompletion(input);
      set((s) => ({ byId: { ...s.byId, [deal.id]: deal } }));
      return deal;
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },
}));

/** Convenience selector — returns a single deal or undefined. */
export const useDeal = (id: string) => useDeals((s) => s.byId[id]);
