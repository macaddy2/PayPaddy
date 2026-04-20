/**
 * Wallet store — owns the user's available balance and payout flow.
 */

import { create } from 'zustand';

import { api } from '@/services/api';
import type { Wallet } from '@/domain/schema';

type WalletState = {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;

  load: (userId: string) => Promise<void>;
  payout: (userId: string, input: {
    amountKobo: number;
    bankCode: string;
    accountNumber: string;
  }) => Promise<void>;
  clearError: () => void;
};

export const useWallet = create<WalletState>((set) => ({
  wallet: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  async load(userId) {
    set({ loading: true, error: null });
    try {
      const wallet = await api.wallet.get(userId);
      set({ wallet, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  async payout(userId, input) {
    set({ loading: true, error: null });
    try {
      const wallet = await api.wallet.payoutViaNIP(userId, input);
      set({ wallet, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
      throw e;
    }
  },
}));
