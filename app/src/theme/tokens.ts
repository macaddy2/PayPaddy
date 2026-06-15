/**
 * Design tokens — the single source of truth for colours, spacing, radii,
 * typography, and elevation across the entire app.
 *
 * The palette is lifted verbatim from the PayPaddy v2 prototype
 * (Docs/paypaddy-v2-improved.jsx) and the v2 mockups (Docs/PayPaddy-Mockups-v2.html).
 *
 * No hex codes should appear outside this file. The only exception is
 * `rgba(255,255,255,…)` overlays used for elevation / translucent scrims.
 *
 * NOTE: body text minimum is 14pt. UX research flagged small fonts on Opay
 * as a top accessibility complaint — we avoid that from day one.
 */

export const colors = {
  // Primary brand — deep emerald family. Money, trust, Nigerian-flag heritage.
  ink: '#0A1F1A', // base canvas, dark screens, button label on lime
  forest: '#14453D', // one step lighter than ink, used for secondary surfaces
  emerald: '#00A86B', // brand green, escrow safe state, "money" affordance
  lime: '#BFFF4F', // neon accent — reserved for the primary CTA of a screen

  // Warm accents — "paddy" = friend; softens the fintech severity.
  apricot: '#FF9D6E', // warm highlight, agent cards
  coral: '#FF6B4A', // urgent but not alarming

  // Neutrals
  cream: '#FAF7F2', // light background
  sand: '#F0EBE1', // divider, muted border
  stone: '#8B8680', // muted text
  charcoal: '#1C1C1C', // near-black body text on light surfaces

  // Semantic
  safe: '#00A86B',
  caution: '#F5A623',
  alert: '#E94B3C',
  info: '#3D7FFF',

  // Status surfaces (tinted backgrounds for badges)
  safeBg: 'rgba(0, 168, 107, 0.12)',
  cautionBg: 'rgba(245, 166, 35, 0.12)',
  alertBg: 'rgba(233, 75, 60, 0.12)',
  infoBg: 'rgba(61, 127, 255, 0.12)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

/**
 * Typography scale. Minimum body size is 14 — matches the "Opay fonts are too
 * small" UX finding. Weight values follow React Native's cross-platform set.
 */
export const typography = {
  family: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  monoFamily: '"JetBrains Mono", "Courier New", monospace',
  display: { size: 40, weight: '900' as const, lineHeight: 42 },
  h1: { size: 26, weight: '900' as const, lineHeight: 30 },
  h2: { size: 22, weight: '800' as const, lineHeight: 27 },
  h3: { size: 18, weight: '800' as const, lineHeight: 23 },
  body: { size: 15, weight: '500' as const, lineHeight: 22 },
  bodySm: { size: 14, weight: '500' as const, lineHeight: 20 }, // minimum body
  label: { size: 12, weight: '700' as const, lineHeight: 16 }, // uppercase pills
  caption: { size: 11, weight: '600' as const, lineHeight: 14 },
  money: { size: 32, weight: '900' as const, lineHeight: 36 },
  mono: { size: 18, weight: '700' as const, lineHeight: 22 }, // USSD codes, OTP
} as const;

/**
 * Elevation tokens — translate to platform shadow for iOS and elevation for Android.
 * Keep these few; too many levels dilute the hierarchy.
 */
export const elevation = {
  card: {
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  modal: {
    shadowColor: colors.ink,
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Radii = typeof radii;
export type Typography = typeof typography;
