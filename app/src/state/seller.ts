/**
 * Seller store — owns tier, collateral state, and listing management.
 */

import { create } from 'zustand';

import { api } from '@/services/api';
import type { Listing, Seller, DealCategory } from '@/domain/schema';
import type { TierKey } from '@/domain/constants';

type SellerState = {
  seller: Seller | null;
  listings: Listing[];
  loading: boolean;
  error: string | null;

  load: (userId: string) => Promise<void>;
  stake: (userId: string, tier: TierKey) => Promise<void>;
  loadListings: (userId: string) => Promise<void>;
  createListing: (input: {
    sellerId: string;
    title: string;
    description: string;
    priceKobo: number;
    category: DealCategory;
    imei?: string;
    imeiVerified?: boolean;
  }) => Promise<Listing>;
  clearError: () => void;
};

export const useSeller = create<SellerState>((set) => ({
  seller: null,
  listings: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  async load(userId) {
    set({ loading: true, error: null });
    try {
      const seller = await api.sellers.get(userId);
      set({ seller, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  async stake(userId, tier) {
    set({ loading: true, error: null });
    try {
      await api.sellers.stake(userId, tier);
      // Reload the seller profile after staking.
      const seller = await api.sellers.get(userId);
      set({ seller, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
      throw e;
    }
  },

  async loadListings(userId) {
    set({ loading: true, error: null });
    try {
      const listings = await api.listings.mine(userId);
      set({ listings, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  async createListing(input) {
    set({ loading: true, error: null });
    try {
      const listing = await api.listings.create(input);
      set((s) => ({ listings: [...s.listings, listing], loading: false }));
      return listing;
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
      throw e;
    }
  },
}));
