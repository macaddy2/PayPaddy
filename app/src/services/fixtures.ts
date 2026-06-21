/**
 * In-memory seed data.
 *
 * Populated around the three PRD personas so every screen looks "alive":
 *   • Cautious Buyer (Ade, Lagos)       — makes deals, no seller tier
 *   • Established Seller (Tunde)        — Gold tier, Computer Village
 *   • Emerging Reseller (Chiamaka)      — Silver tier, IG/WhatsApp fashion
 *
 * Everything here is mutable at runtime so the mock API can mimic state
 * transitions (funded → settled, collateral slashed, etc.) without a DB.
 * Tests should reset via `resetFixtures()`.
 */

import type {
  Agent,
  CommerceIntent,
  Deal,
  IntegrationPartner,
  Listing,
  Milestone,
  Seller,
  User,
  Wallet,
} from '@/domain/schema';
import { TIERS } from '@/domain/constants';
import { appendEntry } from './ledger';

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
  'user_tolu': {
    id: 'user_tolu',
    phone: '+2348045678901',
    firstName: 'Tolu',
    trinity: { bvn: 'verified', nin: 'verified', liveness: 'verified' },
    role: 'seller',
    createdAt: now(),
  },
  'user_ngozi': {
    id: 'user_ngozi',
    phone: '+2348056789012',
    firstName: 'Ngozi',
    trinity: { bvn: 'verified', nin: 'verified', liveness: 'verified' },
    role: 'buyer',
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
  'user_tolu': {
    userId: 'user_tolu',
    tier: 'gold',
    collateralKobo: TIERS.gold.stakeKobo,
    listingsCount: 22,
    trustScore: 96,
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
    // Three-stage milestone breakdown — demonstrates the ledger + auto-trigger
    // payouts on the Deal Room. Shares (30/40/30) sum to 10_000 bps.
    milestones: [
      {
        id: 'mstone_logo_concepts',
        title: 'Concept sketches',
        description: '3 directions delivered as PDF for buyer to choose',
        shareBps: 3_000,
        status: 'pending',
      },
      {
        id: 'mstone_logo_revisions',
        title: 'Two revision rounds',
        description: 'Refinements on the chosen direction',
        shareBps: 4_000,
        status: 'pending',
      },
      {
        id: 'mstone_logo_final',
        title: 'Final files',
        description: 'Vector + raster exports across required formats',
        shareBps: 3_000,
        status: 'pending',
      },
    ] satisfies Milestone[],
    ledger: [],
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
  'deal_sneakers': {
    id: 'deal_sneakers',
    title: 'Designer sneakers order',
    category: 'commerce',
    grossKobo: 180_000_00,
    buyerId: 'user_ade',
    sellerId: 'user_chiamaka',
    sellerTier: 'silver',
    status: 'disputed',
    createdAt: now(),
    fundedAt: now(),
    timeline: [
      { at: now(), kind: 'created', actor: 'buyer' },
      { at: now(), kind: 'funded', actor: 'system' },
      { at: now(), kind: 'delivered', actor: 'seller' },
      { at: now(), kind: 'dispute_opened', actor: 'buyer', note: 'Wrong size and missing receipt.' },
    ],
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
    city: 'Computer Village, Ikeja',
    imageEmoji: '💻',
    status: 'published',
    imei: undefined,
    imeiVerified: undefined,
    createdAt: now(),
  },
  'list_iphone': {
    id: 'list_iphone',
    sellerId: 'user_tolu',
    title: 'iPhone 15 Pro Max 256GB',
    description: 'Factory unlocked, clean IMEI, one owner. Same-day Lagos delivery.',
    priceKobo: 1_250_000_00,
    category: 'commerce',
    city: 'Ikeja, Lagos',
    imageEmoji: '📱',
    status: 'published',
    imei: '352099001761481',
    imeiVerified: true,
    createdAt: now(),
  },
  'list_monitor': {
    id: 'list_monitor',
    sellerId: 'user_tunde',
    title: 'LG UltraFine 27-inch monitor',
    description: '4K USB-C monitor for designers and developers. Tested before dispatch.',
    priceKobo: 420_000_00,
    category: 'commerce',
    city: 'Computer Village, Ikeja',
    imageEmoji: '🖥️',
    status: 'published',
    createdAt: now(),
  },
  'list_brand': {
    id: 'list_brand',
    sellerId: 'user_chiamaka',
    title: 'Launch logo and social kit',
    description: 'Brand identity sprint for small teams selling on Instagram or WhatsApp.',
    priceKobo: 85_000_00,
    category: 'service',
    city: 'Abuja',
    imageEmoji: '🎨',
    status: 'published',
    createdAt: now(),
  },
  'list_contract': {
    id: 'list_contract',
    sellerId: 'user_tolu',
    title: 'Bulk office laptop supply',
    description: 'Verified supplier for 5-20 unit procurement deals with escrow milestones.',
    priceKobo: 8_500_000_00,
    category: 'contract',
    city: 'Lagos Island',
    imageEmoji: '📋',
    status: 'published',
    createdAt: now(),
  },
};

export const integrationPartners: Record<string, IntegrationPartner> = {
  'partner_ig_tolu': {
    id: 'partner_ig_tolu',
    name: 'Tolu WhatsApp Store',
    kind: 'individual',
    city: 'Lagos Island',
    tier: 'gold',
    trustScore: 96,
    collateralKobo: TIERS.gold.stakeKobo,
    trinityVerified: true,
    successfulDeals: 44,
    disputeRatePct: 2,
    integrationMode: 'payment_link',
    externalBaseUrl: 'https://wa.me/2348045678901',
    apiKeyLabel: 'pp_live_link_tolu',
  },
  'partner_techhub': {
    id: 'partner_techhub',
    name: 'TechHub CV Checkout',
    kind: 'storefront',
    city: 'Computer Village, Ikeja',
    tier: 'gold',
    trustScore: 92,
    collateralKobo: TIERS.gold.stakeKobo,
    trinityVerified: true,
    successfulDeals: 38,
    disputeRatePct: 3,
    integrationMode: 'hosted_checkout',
    externalBaseUrl: 'https://techhub.example/checkout',
    apiKeyLabel: 'pp_live_hosted_techhub',
  },
  'partner_shopgrid': {
    id: 'partner_shopgrid',
    name: 'ShopGrid Commerce API',
    kind: 'platform',
    city: 'Multi-city',
    tier: 'silver',
    trustScore: 88,
    collateralKobo: TIERS.silver.stakeKobo,
    trinityVerified: true,
    successfulDeals: 126,
    disputeRatePct: 4,
    integrationMode: 'api',
    externalBaseUrl: 'https://shopgrid.example/orders',
    apiKeyLabel: 'pp_live_api_shopgrid',
  },
};

export const commerceIntents: Record<string, CommerceIntent> = {
  'intent_iphone_link': {
    id: 'intent_iphone_link',
    source: 'individual_link',
    externalRef: 'wa-order-1842',
    partnerId: 'partner_ig_tolu',
    sellerId: 'user_tolu',
    title: 'iPhone 15 Pro Max 256GB',
    description: 'Buyer came from WhatsApp. PayPaddy locks funds, seller dispatches after funding.',
    amountKobo: 1_250_000_00,
    category: 'commerce',
    city: 'Ikeja, Lagos',
    imageEmoji: '📱',
    status: 'ready',
    returnUrl: 'https://wa.me/2348045678901',
    createdAt: now(),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  },
  'intent_laptop_checkout': {
    id: 'intent_laptop_checkout',
    source: 'platform_checkout',
    externalRef: 'techhub-cart-8842',
    partnerId: 'partner_techhub',
    sellerId: 'user_tunde',
    title: 'MacBook Pro M2 14"',
    description: 'External storefront checkout passed cart, buyer, and seller trust metadata into PayPaddy.',
    amountKobo: 1_650_000_00,
    category: 'commerce',
    city: 'Computer Village, Ikeja',
    imageEmoji: '💻',
    status: 'ready',
    returnUrl: 'https://techhub.example/orders/8842',
    createdAt: now(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  'intent_bulk_api': {
    id: 'intent_bulk_api',
    source: 'plugin_demo',
    externalRef: 'shopgrid-api-992',
    partnerId: 'partner_shopgrid',
    sellerId: 'user_tunde',
    title: 'Bulk office laptop supply',
    description: 'A commerce platform initiated this escrow intent through the PayPaddy API.',
    amountKobo: 8_500_000_00,
    category: 'contract',
    city: 'Lagos Island',
    imageEmoji: '📋',
    status: 'ready',
    returnUrl: 'https://shopgrid.example/orders/992',
    createdAt: now(),
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
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

// Seed the brand-logo deal's ledger so the Deal Room renders a live hash
// chain on first open: deal_created → deal_funded already happened, and
// the seller is partway through delivering the first milestone.
{
  const d = deals.deal_logo;
  if (d) {
    appendEntry(d, 'deal_created', 'buyer', { at: d.createdAt });
    appendEntry(d, 'deal_funded', 'system', { amountKobo: d.grossKobo, at: d.fundedAt ?? d.createdAt });
    appendEntry(d, 'milestone_started', 'seller', {
      milestoneId: d.milestones?.[0]?.id,
      note: d.milestones?.[0]?.title,
    });
    if (d.milestones?.[0]) d.milestones[0].status = 'in_progress';
  }
}
