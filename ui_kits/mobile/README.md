# PayPaddy Mobile UI Kit

Interactive click-thru of the PayPaddy consumer app. Open `index.html`.

## Screens

- **Splash** — `Splash.jsx` — deep-ink hero, Pidgin tagline, trust pills (CBN · NDIC · NDPR), lime primary CTA.
- **Home** — `Home.jsx` — gradient collar header, greeting, unified escrow vault, Start-a-New-Deal, quick-action chips, active deal list with urgent edge-bar.
- **Create Deal** — `CreateDeal.jsx` — AI draft-continuation tile, 2×2 deal-type grid (Buy/Sell, Service, Contract, Bet), Custom deal tile, escrow reassurance.
- **Deal Room** — `DealRoom.jsx` — vault hero, 4-milestone progress, two-party handshake row, activity feed with chat bubbles, two-path action bar (confirm or chat, with report ghost).
- **Trinity** — `Trinity.jsx` — 3-segment verification progress, apricot-outlined digit cells, why-3-checks explainer, lime CTA.
- **Dispute** — `Dispute.jsx` — alert-red hero header ("Money no go waka"), emerald "your money is safe" reassurance FIRST, issue selector, evidence upload, coral submit.
- **USSD Offline** — `USSD.jsx` — JetBrains Mono lime USSD code hero, copy button, 3-step dial instructions, agent-finder fallback.

## Components

Shared primitives in `primitives.jsx`:
- `PrimaryButton`, `DarkButton`, `EmeraldButton`
- `TrustPill`, `TrinityBadge`, `Eyebrow`
- `VaultCard` (the signature motif)
- `MilestoneBar`, `VerifySegBar`
- `BottomNav`, `DotGrid`

All colors pulled from `colors_and_type.css` via the inline `PP` token object. When building new screens, always import `primitives.jsx` first.

## Notes / Gaps

- No light-theme Trinity (only the ink-background variant — matches founder mockups).
- Icons are emoji. Per iconography guidance, future icon set will move to Lucide or custom.
- Merchant Dashboard, Product Detail, and Admin Arbitration screens from the PRD are **not** included — founder mockups only cover the consumer journey. Flag for next iteration.
