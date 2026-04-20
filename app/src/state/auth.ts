/**
 * Auth store — owns the signed-in session and Trinity progress.
 *
 * Screens call the async actions here; the store handles loading/error state
 * so screens stay thin. Trinity steps are tracked individually so the
 * StepBar on the trinity flow reflects partial completion.
 */

import { create } from 'zustand';

import { api } from '@/services/api';
import type { TrinityStatus, User } from '@/domain/schema';

type AuthState = {
  /** null = not yet loaded or signed out */
  user: User | null;
  loading: boolean;
  error: string | null;

  /** BVN / NIN / Liveness statuses as they complete during onboarding. */
  trinityLoading: { bvn: boolean; nin: boolean; liveness: boolean };

  // Actions
  requestOtp: (phone: string) => Promise<string>;
  verifyOtp: (requestId: string, code: string) => Promise<User>;
  signOut: () => Promise<void>;
  loadMe: () => Promise<void>;
  verifyBvn: (bvn: string) => Promise<TrinityStatus>;
  verifyNin: (nin: string) => Promise<TrinityStatus>;
  verifyLiveness: () => Promise<TrinityStatus>;
  clearError: () => void;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  trinityLoading: { bvn: false, nin: false, liveness: false },

  clearError: () => set({ error: null }),

  async loadMe() {
    set({ loading: true });
    try {
      const user = await api.auth.me();
      set({ user, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  async requestOtp(phone) {
    set({ loading: true, error: null });
    try {
      const { requestId } = await api.auth.requestOtp(phone);
      set({ loading: false });
      return requestId;
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
      throw e;
    }
  },

  async verifyOtp(requestId, code) {
    set({ loading: true, error: null });
    try {
      const { user } = await api.auth.verifyOtp(requestId, code);
      set({ user, loading: false });
      return user;
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
      throw e;
    }
  },

  async signOut() {
    await api.auth.signOut();
    set({ user: null, error: null });
  },

  async verifyBvn(bvn) {
    const userId = get().user?.id;
    if (!userId) throw new Error('Not signed in');
    set((s) => ({ trinityLoading: { ...s.trinityLoading, bvn: true } }));
    try {
      const { status } = await api.trinity.lookupBVNViaDojah(userId, bvn);
      // Reflect the new status back onto the cached user.
      set((s) => ({
        trinityLoading: { ...s.trinityLoading, bvn: false },
        user: s.user ? { ...s.user, trinity: { ...s.user.trinity, bvn: status } } : s.user,
      }));
      return status;
    } catch (e) {
      set((s) => ({ trinityLoading: { ...s.trinityLoading, bvn: false }, error: (e as Error).message }));
      throw e;
    }
  },

  async verifyNin(nin) {
    const userId = get().user?.id;
    if (!userId) throw new Error('Not signed in');
    set((s) => ({ trinityLoading: { ...s.trinityLoading, nin: true } }));
    try {
      const { status } = await api.trinity.lookupNINViaDojah(userId, nin);
      set((s) => ({
        trinityLoading: { ...s.trinityLoading, nin: false },
        user: s.user ? { ...s.user, trinity: { ...s.user.trinity, nin: status } } : s.user,
      }));
      return status;
    } catch (e) {
      set((s) => ({ trinityLoading: { ...s.trinityLoading, nin: false }, error: (e as Error).message }));
      throw e;
    }
  },

  async verifyLiveness() {
    const userId = get().user?.id;
    if (!userId) throw new Error('Not signed in');
    set((s) => ({ trinityLoading: { ...s.trinityLoading, liveness: true } }));
    try {
      const { status } = await api.trinity.livenessViaSmileID(userId);
      set((s) => ({
        trinityLoading: { ...s.trinityLoading, liveness: false },
        user: s.user ? { ...s.user, trinity: { ...s.user.trinity, liveness: status } } : s.user,
      }));
      return status;
    } catch (e) {
      set((s) => ({ trinityLoading: { ...s.trinityLoading, liveness: false }, error: (e as Error).message }));
      throw e;
    }
  },
}));
