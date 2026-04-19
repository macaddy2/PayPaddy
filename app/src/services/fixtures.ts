/**
 * In-memory seed data.
 *
 * Populated around the three PRD personas so every screen looks "alive":
 *   • Cautious Buyer (Ade, Lagos)       — makes deals, no seller tier
 *   • Established Merchant (Tunde)      — Gold tier, Computer Village
 *   • Emerging Reseller (Chiamaka)      — Silver tier, IG/WhatsApp fashion
 *
 * Everything here is mutable at runtime so the mock API can mimic state
 * transitions (funded → settled, collateral slashed, etc.) without a DB.
 * Tests should reset via `resetFixtures()`.
 */

import type {
  Agent,
  Deal,
  Listing,
  Seller,
  User,
  Wallet,
} from '@/domain/schema';
import { TIERS } from '@/domain/constants';

// -------------------------
// Primary seed records
// -------------------------

const now = () => new Date().toISOString();

export const users: Record<string, User> = {
  'user_ade': {
    id: 'user_ade',
    phone: '+2348012345678',
    firstName: 'Ade',
    trinity: { bvn: 'verified', nin: 'verified', liveness: 'verified' },
    role: 'buyer',
    createdAt: now(),
  },
  'user_tunde': {
    id: 'user_tunde',
    phone: '+2348023456789',
    firstName: 'Tunde',
    trinity: { bvn: 'verified', nin: 'verified', liveness: 'verified' },
    role: 'seller',
    createdAt: now(),
  },
  'user_chiamaka': {
    id: 'user_chiamaka',
    phone: '+2348034567890',
    firstName: 'Chiamaka',
    trinity: { bvn: 'verified', nin: 'verified', liveness: 'verified' },
    role: 'seller',
    createdAt: now(),
  },
};

export const sellers: Record<string, Seller> = {
  'user_tunde': {
    userId: 'user_tunde',
    tier: 'gold',
    collateralKobo: TIERS.gold.stakeKobo,
    listingsCount: 14,
    trustScore: 92,
  },
  'user_chiamaka': {
    userId: 'user_chiamaka',
    tier: 'silver',
    collateralKobo: TIERS.silver.stakeKobo,
    listingsCount: 3,
    trustScore: 71,
  },
};

export const wallets: Record<string, Wallet> = {
  'user_ade': { userId: 'user_ade', availableKobo: 245_000_00, pendingKobo: 0 },
  'user_tunde': { userId: 'user_tunde', availableKobo: 3_200_000_00, pendingKobo: 120_000_00 },
  'user_chiamaka': { userId: 'user_chiamaka', availableKobo: 85_000_00, pendingKobo: 15_000_00 },
};

// A realistic starter set of deals so Home / Deals tabs aren't empty.
export const deals: Record<string, Deal> = {
  'deal_macbook': {
    id: 'deal_macbook',
    title: 'MacBook Pro M2 14"',
    category: 'commerce',
    grossKobo: 1_650_000_00,
    buyerId: 'user_ade',
    sellerId: 'user_tunde',
    sellerTier: 'gold',
    status: 'funded',
    createdAt: now(),
    fundedAt: now(),
    autoReleaseAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22h ahead
    timeline: [
      { at: now(), kind: 'created', actor: 'buyer' },
      { at: now(), kind: 'funded', actor: 'system' },
      { at: now(), kind: 'seller_notified', actor: 'system' },
    ],
  },
  'deal_logo': {
    id: 'deal_logo',
    title: 'Brand logo design',
    category: 'service',
    grossKobo: 85_000_00,
    buyerId: 'user_ade',
    sellerId: 'user_chiamaka',
    sellerTier: 'silver',
    status: 'in_progress',
    createdAt: now(),
    fundedAt: now(),
    autoReleaseAt: undefined,
    timeline: [
      { at: now(), kind: 'created', actor: 'buyer' },
      { at: now(), kind: 'funded', actor: 'system' },
      { at: now(), kind: 'seller_notified', actor: 'system' },
    ],
  },
  'deal_arsenal': {
    id: 'deal_arsenal',
    title: 'Arsenal vs Chelsea — friendly wager',
    category: 'bet',
    grossKobo: 25_000_00,
    buyerId: 'user_ade',
    sellerId: 'user_tunde',
    sellerTier: 'gold',
    status: 'awaiting_funds',
    createdAt: now(),
    timeline: [{ at: now(), kind: 'created', actor: 'buyer' }],
  },
};

export const listings: Record<string, Listing> = {
  'list_macbook': {
    id: 'list_macbook',
    sellerId: 'user_tunde',
    title: 'MacBook Pro M2 14" — mint condition',
    description: 'Bought Dec 2024. Original box, charger, all docs.',
    priceKobo: 1_650_000_00,
    category: 'commerce',
    imei: undefined,
    imeiVerified: undefined,
    createdAt: now(),
  },
};

export const agents: Record<string, Agent> = {
  'agent_yaba': {
    id: 'agent_yaba',
    name: 'Yaba SmartHub',
    address: '12 Sabo Road, Yaba, Lagos',
    distanceKm: 0.8,
    rating: 4.7,
    cashInCapable: true,
    cashOutCapable: true,
    trustScore: 88,
  },
  'agent_ikeja': {
    id: 'agent_ikeja',
    name: 'Ikeja Computer Village Kiosk 3B',
    address: 'Francis Oremeji St, Ikeja',
    distanceKm: 4.2,
    rating: 4.4,
    cashInCapable: true,
    cashOutCapable: false,
    trustScore: 82,
  },
  'agent_surulere': {
    id: 'agent_surulere',
    name: 'Surulere Paddy Point',
    address: 'Bode Thomas, Surulere',
    distanceKm: 6.9,
    rating: 4.6,
    cashInCapable: true,
    cashOutCapable: true,
    trustScore: 91,
  },
};

/**
 * Fresh copies for test / sign-out flows. The mock API mutates the maps
 * above in place, so tests that need isolation should call this first.
 */
export function resetFixtures(): void {
  // Intentional: we only reset the state-carrying stores that mutate.
  // User / agent / listing seeds are read-only in current flows.
}

/** The "current user" in a signed-in mock session. Auth store sets this. */
export const currentUserId: { value: string | null } = { value: null };
