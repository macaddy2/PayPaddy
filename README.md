# PayPaddy Design System

**"No wahala. Your money is safe."**

PayPaddy is Nigeria's first collateralized escrow marketplace — a universal trust layer for any deal (commerce, contracts, bets, services). This is the internal design system used to build every surface: mobile app, merchant dashboard, marketing, and partner touchpoints.

## What PayPaddy is

A trust protocol, not just an app. Three pillars:

1. **Trinity Verification** — BVN + NIN + Liveness. Everyone verifies. No shortcuts.
2. **Collateral Staking** — Sellers stake real money (₦100K Silver, ₦500K Gold, ₦2.5M Platinum). Fraud = collateral slashed.
3. **Escrow + SafeGuard Pool** — Funds sit with a CBN-licensed bank partner. 2% of fees fund a network-wide insurance pool.

Core product is a **mobile-first app** for Nigerian buyers and sellers. Current target: Lagos. Roadmap extends to Abuja, Port Harcourt, Ibadan, and eventually Ghana/Kenya/Senegal.

## Source materials

All attached by the founder (Ade). Stored in `refs/` for reference.

- `PayPaddy-PRD.docx` — Product Requirements Document v1.0 (March 2026)
- `PayPaddy-Strategy-Analysis.docx` — V1/V2/V3 strategic model comparison
- `PayPaddy-UX-Research.docx` — User research (could not parse — `.docx` was malformed, re-upload welcome)
- `PayPaddy-Tech-Spec.docx` — Technical specification (could not parse — re-upload welcome)
- `PayPaddy-Global-Expansion-Strategy.docx` — Phase 4 West Africa playbook
- `PayPaddy-Deep-Dive.pptx` — Founder deep-dive deck (not extracted for visuals)
- `PayPaddy-Financial-Model.xlsx` — Unit economics
- `PayPaddy-Mockups-v2.html` + `paypaddy-v2-improved.jsx` — **The canonical visual reference.** Everything in this system is derived from these files.

## Content fundamentals

**Voice: Nigerian, warm, plain.** PayPaddy talks to users like a friend who happens to know a lot about money. Pidgin English is a brand signature — not sprinkled as decoration but used at the emotional beats (reassurance, welcome, trouble).

- ✅ "No wahala. Your money is safe."
- ✅ "Wetin you wan do?" (What do you want to do?)
- ✅ "Money no go waka." (Your money won't walk away.)
- ✅ "Your NIN, and we dey go 🚀" (…and we're going.)
- ✅ "A human paddy (not bot) will review within 24h"
- ❌ "Please proceed to continue your verification."
- ❌ "We value your trust." (too corporate)
- ❌ Over-formal legalese anywhere the user makes a decision

**Tone rules**

- **Reassurance leads.** On every dispute, problem, or delay screen, the FIRST thing the user sees is "your money is safe." Problem-solving copy comes after.
- **Trust signals before CTAs.** CBN • NDIC • NDPR badges appear above the primary action on marketing/auth screens.
- **One primary action per screen.** Zero decision fatigue. Other actions are visibly secondary.
- **Casing.** Sentence case for everything except: SECTION LABELS IN SMALL CAPS (letterspaced, used as eyebrows) and TRINITY ✓ / GOLD / SILVER badge text.
- **Numbers.** Money always with ₦ prefix, thousands separators, no decimals on whole sums (₦1,250,000 not ₦1,250,000.00).
- **Pronouns.** "You" / "your" — never "the user." "We" is PayPaddy, used sparingly.
- **Emoji.** Functional only — 🔒 for escrow/vault, ✓ for verified, 👋 for greetings, 🚀 for momentum. Never decorative. Never as the only label. Always paired with a word.

## Visual foundations

**The vibe:** Deep-forest trust + lime electricity. Cream paper warmth. Apricot human touch. A fintech that feels like a Lagos evening, not a Silicon Valley gradient.

**Color**
- Primary surface alternates between deep **Ink** (`#0A1F1A`) and warm **Cream** (`#FAF7F2`). Dark-on-marketing/auth, light-on-transactional.
- **Emerald** (`#00A86B`) = money state / safe / done. Never used decoratively — always carries meaning.
- **Lime** (`#BFFF4F`) = primary CTA on dark, accent glyphs, "momentum" moments. Used sparingly — the spark, not the wallpaper.
- **Apricot** (`#FF9D6E`) = human / warm / in-progress. Avatars default to apricot.
- **Coral** (`#FF6B4A`) and **Alert** (`#E94B3C`) — reserved for urgency and disputes only. Coral = edge-bar / badge, Alert = dispute hero.
- No purple, no blue-purple gradients, no synthwave. If in doubt, use ink + lime.

**Type**
- Display/UI: **Manrope** (weights 400/600/700/800/900). Heavy letter-spacing tightening at display sizes (`-0.5px` to `-1.5px`). Replaced the stack's SF/Roboto fallback with Manrope because it has a strong 900-weight and feels contemporary + African-wax-print sharp.
- Mono: **JetBrains Mono** — used for USSD codes, deal IDs, and the money vault amount only.
- Numerals in money display should feel monumental: 28–40px at 900 weight with tight tracking.

**Backgrounds**
- Cream (`#FAF7F2`) for transactional flows — home, deal list, create deal, deal room, dispute intake.
- Ink gradient (`#0A1F1A → #14453D`) for marketing/auth/verification/USSD.
- Emerald → forest gradient for the escrow "locked" card.
- **Alert red full-bleed header** is reserved for the Dispute flow only.
- Decorative: soft blob/radial gradients (blur 60px, opacity 0.15–0.35), and 4×4 lime dot grids at 0.15–0.3 opacity. No stock photography, no illustrations of humans.

**Corner radii**
- `4px` — digit cells, inline pills
- `8px` — small buttons, chips, input cells (`--radius-sm`)
- `14px` — standard cards, CTAs (`--radius`)
- `20px` — hero/vault cards
- `24px` — header-collar curves (`border-radius: 0 0 24px 24px`)
- `999px` — trust pills, trinity badge, tabs (`--radius-pill`)

**Elevation**
- PayPaddy is mostly flat. Shadows exist but are restrained.
- Primary CTA shadow: `0 8px 24px rgba(10,31,26,0.3)` — green-tinted drop.
- Phone frame shadow: `0 20px 60px rgba(0,0,0,0.45)`.
- No inner shadows. No neumorphism.

**Borders**
- Card borders: `1.5px solid --sand` on cream. Low contrast — structure, not decoration.
- Active/focus: border becomes `--apricot` (on dark) or `--emerald` (on light).
- **Urgent edge-bar:** `3–4px` full-height coral strip on the left of an urgent deal card. Strong brand motif.

**Animation**
- Transitions are short and calm: `0.2s` for buttons, `0.35s` for screen fades.
- Easing: `ease` or `ease-out`. No bounces. No spring overshoot.
- Success states: a brief lime flash on confirmation. Progress bars fill left-to-right.

**Hover / press**
- Buttons: lighten by ~8% on hover, shrink to 98% on press.
- Chips / secondary tiles: border darkens to emerald or lime.
- No ripple effects.

**Transparency & blur**
- Frosted overlays: `rgba(255,255,255,0.05)` on ink backgrounds for "field" cards.
- Trust pills: `rgba(255,255,255,0.08)` + `border: 1px solid rgba(255,255,255,0.1)` on dark.
- Blur used only inside decorative blobs, never on text containers (performance on 2G/low-end).

**Layout rules**
- Mobile canvas: **300×640** for mockup frames; real device = 375–430 wide. Never design below 320.
- Edge gutter: 16–20px. 16 on the tightest screens, 20 default, 28 for auth hero.
- Section headers (SECTION TITLE) are 11px, 700 weight, uppercase, letterspaced 0.5–0.8px, color stone (`#8B8680`).
- Bottom nav: 4 items, 10px font-size labels, 22px icons, coral dot badge for unread.
- Minimum body text 12px — never smaller. Hero money: 26–32px. Display hero: 36–40px.

**The vault metaphor**
A recurring motif: every deal has a "vault" — a dark-green card with a lock glyph, the amount, and the CBN-licensed bank partner name. This is the system's most distinctive composition. Reuse it anywhere you need to say "funds are safe here."

## Iconography

**Approach:** mostly emoji today, migrating to a custom icon set. Current mockups use:

- 🔒 — escrow / vault / privacy (single most important glyph)
- 🔔 — notifications
- 👋 — greeting
- 📦 — delivery / item
- 🎲 — bet / wager
- 🛍 — buy/sell
- 🛠️ / 🔧 — service deal
- 📝 / 📑 — contract / milestones
- 🛡️ — protection, trust explainer
- 📱 — offline / USSD
- 📋 — copy-to-clipboard, deals list
- 💬 — chat
- ⚠️ — report a problem
- ✓ — verified / completed step

**Guidance**
- Prefer emoji currently — they render familiar on every Nigerian device.
- Pair every emoji with a text label. Never emoji-only buttons.
- When we need line icons (for web, future), use **Lucide** as the fallback. Matched weight: 1.75–2px strokes, rounded caps. Flagged substitution.
- Custom glyphs (PayPaddy lock logo, trinity triad) are bespoke SVGs in `assets/`.

## Index

```
README.md                      — you are here
SKILL.md                       — agent-skill entrypoint
colors_and_type.css            — CSS var tokens (colors, type, radii, shadows)
fonts/                         — Manrope, JetBrains Mono
assets/
  ├─ logo-mark.svg             — lime lock icon, PayPaddy mark
  ├─ logo-lockup.svg           — mark + wordmark
  ├─ trust-badges.svg          — CBN · NDIC · NDPR pill row
  └─ vault-hero.svg            — reusable vault illustration
preview/                       — design-system cards (registered for review)
ui_kits/
  └─ mobile/                   — PayPaddy app recreation
       ├─ index.html           — interactive click-thru prototype
       ├─ README.md
       └─ components/          — JSX for Home, Deal Room, Create Deal, etc.
refs/                          — extracted text from founder docs (not design)
```

## For agents using this system

Read `SKILL.md`. The short version: every visual must use the colors, type, and radii in `colors_and_type.css`. Every mobile surface should start from a component in `ui_kits/mobile/`. Voice and tone rules in this README are non-negotiable — Pidgin is not optional flavor, it is the brand.
