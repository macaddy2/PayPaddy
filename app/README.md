# PayPaddy — MVP App

Nigerian escrow fintech. Universal escrow (commerce, contracts, bets, services)
with four moat mechanics:

1. **Trinity Verification** — BVN + NIN + Liveness at signup.
2. **Collateral Staking** — Silver (₦100K) or Gold (₦500K) locked by sellers before listing.
3. **SafeGuard Pool** — 2% of every escrow fee funds buyer-side refunds when collateral runs dry.
4. **Device IMEI Verification** — NCC stolen-goods DB check for electronics listings.

---

## Quickstart

```bash
cd app
npm install
npx expo start          # dev server + QR code
npm run typecheck       # tsc --noEmit (strict + noUncheckedIndexedAccess)
npm run lint
npm test                # money domain unit tests
```

Scan the QR with **Expo Go** on a phone, or press `i` / `a` to launch a simulator.

**Dev hint:** The mock OTP code is always `000000`. It's displayed on the OTP screen
in `__DEV__` mode. The mock BVN `00000000000` triggers a failure path. IMEI starting
with `999` is flagged as stolen by the NCC mock.

No `.env` is required for the mock build — everything is in-memory.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Expo 51 + React Native 0.74 | Managed workflow, no custom native modules for MVP |
| Language | TypeScript 5.3 strict + `noUncheckedIndexedAccess` | Catches undefined from array/dict — critical for money math |
| Routing | expo-router v3 (file-based, typed routes) | Zero hand-rolled navigation; folder layout is the IA |
| State | Zustand | Small, no-ceremony stores; slice-per-domain |
| Forms | react-hook-form + zod via @hookform/resolvers | One schema for UI validation and API parsing |
| Paths | `@/*` → `./src/*` | Short imports from any screen |

---

## Folder Layout

```
app/
  app/                         # expo-router screens (this tree = the sitemap)
    index.tsx                  # splash → redirect to /welcome or /(app)
    welcome.tsx                # value prop + CTA
    auth/
      phone.tsx                # phone entry
      otp.tsx                  # 6-digit OTP
      trinity/                 # post-phone identity wall
        bvn.tsx                # NIBSS lookup (mocked via Dojah)
        nin.tsx                # NIMC lookup (mocked via Dojah)
        liveness.tsx           # Smile ID liveness (mocked)
        success.tsx            # Trinity complete → /(app)
    (app)/                     # authenticated area
      (tabs)/                  # bottom nav (Home / Deals / Agents / Me)
        index.tsx              # Home — balance, actions, active deals
        deals.tsx              # filter chips + deal list
        agents.tsx             # map stub + nearby agents
        settings.tsx           # profile, tier, legal, sign-out
      deal/
        new.tsx                # create escrow — title, amount, category
        [id]/
          index.tsx            # Deal Room — timeline + state-aware CTAs
          fund/
            method.tsx         # transfer / card / USSD / agent picker
            virtual-account.tsx# Providus PSSP virtual account
          complete.tsx         # confirm-received + fee breakdown
          receipt.tsx          # formal, printable receipt
          dispute/
            open.tsx           # reason + description (min 10 chars)
            evidence.tsx       # photo slots + chat attach
            resolved.tsx       # verdict + payout source breakdown
      sell/
        tier.tsx               # Silver vs Gold
        fund-collateral.tsx    # lock stake from bank
        dashboard.tsx          # collateral health + listings
        listing/
          new.tsx              # title / description / price / category
          device-verify.tsx    # NCC IMEI check (electronics only)
          publish.tsx          # preview + share link
      agent/[id].tsx           # agent detail + cash-in code
      payout.tsx               # bank payout
  src/
    domain/
      money.ts                 # kobo math, formatNaira, computeFees
      constants.ts             # SLAs, tier limits, slash rates, fee policy
      schema.ts                # zod schemas + inferred types
      __tests__/
        money.test.ts          # unit tests — must stay green
    services/
      api.ts                   # mock client (all providers, find-and-replace to go live)
      fixtures.ts              # seed data (three PRD personas)
      logger.ts                # PII-masking logger (NDPR compliant)
      analytics.ts             # no-op track() stub (swap with Segment/Mixpanel)
    state/
      auth.ts                  # signup, OTP, Trinity
      deals.ts                 # list, load, create, fund, confirm
      wallet.ts                # balance, payout
      seller.ts                # tier, stake, listings
      index.ts                 # re-exports
    theme/
      tokens.ts                # colors, radii, spacing, typography (single source of truth)
      index.ts
    ui/
      Screen.tsx Button.tsx Card.tsx Pill.tsx
      BackHeader.tsx StepBar.tsx TrustBadge.tsx
      index.ts                 # re-exports
```

---

## Route Map (happy paths)

**First-time buyer**
`/welcome` → `/auth/phone` → `/auth/otp` → `/auth/trinity/bvn` → `/nin` → `/liveness` → `/success` → `/(app)/(tabs)`

**Start a deal (buyer)**
`/(tabs)` → `/deal/new` → `/deal/[id]` → `/deal/[id]/fund/method` → `/fund/virtual-account` → (wait) → `/deal/[id]` → `/complete` → `/receipt`

**Open a dispute (buyer)**
`/deal/[id]` → `/dispute/open` → `/dispute/evidence` → `/dispute/resolved`

**Become a seller**
`/(tabs)/settings` → `/sell/tier` → `/sell/fund-collateral` → `/sell/dashboard` → `/sell/listing/new` → (if electronics) `/device-verify` → `/publish`

**Cash-in at an agent**
`/(tabs)/agents` → `/agent/[id]` → (generate 6-digit code, show agent)

**Payout**
`/(tabs)/settings` → `/payout`

---

## Domain Model

Everything monetary is **kobo** (integer). 1 naira = 100 kobo. Never use floats for money.

```ts
// src/domain/money.ts
formatNaira(amountKobo)              // "₦50,000"
nairaToKobo(50_000)                  // 5_000_000
computeFees(grossKobo, tier)         // { grossKobo, escrowFeeKobo, safeguardKobo, netToSellerKobo }
```

**Fee policy (PRD):**
- Silver tier: 1.5% escrow fee
- Gold tier: 1.0% escrow fee
- SafeGuard levy: 2% of the escrow fee → replenishes the buyer insurance pool

**Deal status machine (`DealStatus` in `schema.ts`):**
`draft` → `awaiting_funds` → `funded` → `in_progress` → `delivered` → `settled`
with `disputed` as a branch off `funded`/`delivered` that terminates in `refunded` or `settled`.

---

## Mock API

`src/services/api.ts` exposes the same surface a real backend would:

| Namespace | Key methods | Real-world swap |
|---|---|---|
| `api.trinity` | `lookupBVNViaDojah`, `lookupNINViaDojah`, `livenessViaSmileID` | NIBSS + NIMC + Smile ID |
| `api.deals` | `list`, `get`, `create`, `fundVirtualAccountViaProvidus`, `confirmReceipt` | Own service + Paystack/Flutterwave |
| `api.wallet` | `get`, `payoutViaNIP` | Own ledger + NIP out-transfer |
| `api.agents` | `near`, `get`, `generateCashInCode` | Own agent network service |
| `api.device` | `verifyIMEIViaNCC` | NCC stolen-goods API |
| `api.disputes` | `open`, `get`, `resolveBuyerWins` | Own dispute engine |

Canned failure paths:
- BVN `00000000000` → verification fails
- IMEI prefix `999` → flagged as stolen by NCC
- Wallet `payoutViaNIP` with amount > balance → throws "Insufficient balance"

To point at a real server, replace each method body in `api.ts` with `fetch(...)` calls.

---

## State

Zustand stores under `src/state/`. Each store owns one domain:

```ts
const { user, verifyBvn } = useAuth();
const { byId, createDeal } = useDeals();
const { availableKobo, payout } = useWallet();
const { seller, stake } = useSeller();
```

---

## Design Tokens

`src/theme/tokens.ts` is the single source of truth. No hex codes in UI code
(exception: `rgba(255,255,255,…)` overlays). Minimum body text: 14pt (UX research finding).

**Palette:** ink / forest / emerald / lime (CTA) / apricot / coral / cream / sand / stone / charcoal + semantic safe/caution/alert/info.

---

## Known Gaps (not in this MVP)

- Push notifications, deep links from WhatsApp, and share-sheet wiring are stubbed.
- The agents map is a placeholder tile — swap with react-native-maps when a Google Maps key is provisioned.
- No analytics events yet — add `track()` calls once Segment/Mixpanel is picked.
- No real payments — wire Paystack charge webhook to transition `awaiting_funds → funded`.
- No i18n — copy is English + Pidgin inline; extract to a string table before adding Yoruba/Hausa/Igbo.

---

## Conventions

- Screens are **thin**: parse params → call a store action → render.
- No stray `console.log`. Use `if (__DEV__) console.warn(...)` for dev-only traces.
- Money flows as kobo end-to-end. `formatNaira()` is the only place naira appears — never in state.
- Pidgin copy stays in UI only. `api.ts` errors are plain English so they log cleanly.
- `noUncheckedIndexedAccess`: every `arr[i]` / `map[k]` access yields `T | undefined`. Handle with `?? fallback`.

---

## Verification checklist

Before shipping a PR:

```bash
npm run typecheck   # must pass — strict + noUncheckedIndexedAccess
npm run lint        # must pass
npm test            # money unit tests must pass
```

Screen-level smoke:
- [ ] Does the folder have a `_layout.tsx`? (expo-router requires one per stack)
- [ ] Does every `router.push(...)` target resolve against the actual file tree?
- [ ] Do route params match `useLocalSearchParams<{...}>()` on the destination?
- [ ] Does every store destructure only fields that exist on the store type?
- [ ] Does every `<Button>` / `<Card>` / `<Pill>` use only declared props?
