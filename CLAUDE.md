# CLAUDE.md — PayPaddy repo working notes

Durable guidance for Claude sessions working in this repository. Read this before starting any task.

## Repo layout

- `colors_and_type.css` — single source of truth for design tokens (colors, type, radii, shadows, spacing). Every visual must use these tokens.
- `assets/` — `logo-mark.svg`, `logo-lockup.svg`, `logo-lockup-dark.svg`. Inline the SVG markup, don't reference files.
- `ui_kits/mobile/` — React + Babel-via-CDN interactive UI kit. **Canonical reference for screen layouts.** Every JSX component there is a faithful spec.
- `web/` — `app.jsx`, `screens.jsx`, `screens2.jsx`, `shell.jsx`. Web/dashboard variants of the same flows. Useful as secondary reference (Chat skeleton lives in `screens2.jsx`).
- `Docs/` — PRD, mockups (HTML), strategy, financial model. **`PayPaddy-Mockups.html` and `PayPaddy-Mockups-v2.html`** contain canonical visual references including screens dropped from the v2 UI kit (Product Detail, Escrow Payment, Order Tracking).
- `refs/` — text extracts of the PRD docx files. Use these for structured copy lookups.
- `prototype/index.html` — **the self-contained click-thru prototype.** Single file, no build, no CDN deps beyond Google Fonts. Served via GitHub Pages.
- `preview/` — design-system component previews (registered for visual review).
- `index.html` (root) — design system landing page.
- `README.md` — voice/tone, design rules. Voice is non-negotiable. Read it before writing copy.
- `SKILL.md` — agent skill entrypoint.

## Live deployment

- Branch `gh-pages` is served at `https://macaddy2.github.io/PayPaddy/`.
- Prototype URL: `https://macaddy2.github.io/PayPaddy/prototype/`.
- The repo's root `index.html` (design system landing) is at `https://macaddy2.github.io/PayPaddy/`.
- **Two-branch deployment workflow:**
  1. Develop on the feature branch (e.g. `claude/paypaddy-interactive-prototype-ys0oE`).
  2. Once approved, **merge or fast-forward `gh-pages` to the feature branch tip**, then `git push origin gh-pages`. GitHub Pages rebuilds in ~60s.
  3. Use `git checkout gh-pages && git merge --ff-only <feature-branch> && git push origin gh-pages && git checkout <feature-branch>` — or cherry-pick specific commits if you don't want everything.

## Build conventions for `prototype/index.html`

- **Build incrementally — never write 2000+ lines in a single tool call.** Past attempts to do everything at once have stalled or been interrupted. Layer the work: skeleton → tokens → primitive CSS → screen group A → screen group B → JS state → wire routing → verify → commit.
- After every layer, run `python3 -c "..."` tag-balance and `node --check` JS syntax checks. Don't ship without both passing.
- Inline styles match the JSX kit's pattern (`style={{...}}`). Mix-and-match with class-based primitives where shared (`btn-primary`, `pill-trust`, `vault`, `bottom-nav`).
- Every emoji must pair with a text label. Never emoji-only buttons. Functional emoji only — no decoration.
- Money: `₦1,250,000` (₦ prefix, comma separators, no decimals on whole sums). Mono numerals via JetBrains Mono on USSD codes, deal IDs (`#PP-4829`), tracking numbers (`NGR38291`).
- Pidgin English at emotional beats only — copy verbatim from `README.md`: "No wahala", "Money no go waka", "Wetin you wan do?", "we dey go 🚀". Don't invent new Pidgin lines.
- Section labels: 11px UPPERCASE, letterspaced 0.8px, `--pp-stone` color, via the `.eyebrow` class.

## Navigation pattern

The prototype mimics a real mobile app:
- **No external tab strip above the phone** — investors should see the phone, not chrome.
- **Bottom nav (4 items: Home / Deals / Chat / Me)** is the primary navigator. Add it to every primary-screen layout.
- **In-screen back arrows + CTAs** route forward and back. Every screen must be reachable.
- **Hidden demo drawer** (`◉` floating button bottom-right of the page) is the escape hatch for non-linear demos. Toggle with the `D` key.
- **Arrow keys (`←`/`→`)** cycle screens for power users.
- `localStorage` key `pp-screen` persists the last-active screen across reloads.
- The `SCREENS` array order **must match** `<section>` DOM order. `setScreen(n)` indexes into it. After adding a screen, update both.

## Theme tokens

- v2 "Warm Trust" is the default (forest header gradient + emerald CTAs + lime spark).
- v1 "Electric" lives as commented-out CSS-variable overrides at the top of the stylesheet.
- Theme is driven by `--t-hero-bg`, `--t-primary`, `--t-primary-fg`, `--t-accent`, `--t-highlight`, `--t-vault-grad`, `--t-header-grad`. Don't hardcode hex past the token block.

## Voice / tone gotchas

- Reassurance leads. Dispute and delay screens MUST open with "your money is safe", not problem-solving copy.
- Trust signals (CBN · NDIC · NDPR pills) appear above the primary CTA on marketing/auth screens.
- One primary action per screen. Other actions visibly secondary.
- "You" / "your" — never "the user".

## Tooling gotchas

- `AskUserQuestion` allows max **4 options per question**. Bundle larger choice sets across multiple questions or use multi-select (still ≤4).
- `Read` chokes on files >25k tokens; use `offset` and `limit` for surgical reads of large files like `prototype/index.html`.
- `WebFetch` returns 403 for some private GitHub Pages sites — always confirm reachability with the user rather than assuming a 403 means failure.
- Don't use `cat`/`head`/`tail` via Bash — use `Read`. Use `Bash` only for shell-only operations (git, grep, python checks).
- The Stop hook checks for uncommitted/unpushed work. Commit and push before stopping.

## Verification checklist (before commit + push)

1. Tag balance check via `python3` regex pass.
2. `node --check` on the extracted `<script>` body.
3. Routing audit: extract every `setScreen(N)` and verify `0 ≤ N < SCREENS.length`.
4. Section-order vs `SCREENS`-array order match.
5. Trace at least the buyer happy-path end-to-end:
   `Splash → Onboarding → Home → Browse → Product Detail → Buy with Escrow → Escrow Payment → Lock funds → Order Tracking → I got it → Ratings & Reviews → Home`.
6. Open in a browser when possible. If not, ask the user to verify.

## Lessons from prior sessions

- **Big single-file builds need layering.** Sonnet/Opus context budgets and tool-call interruption risk make 2000+ line writes brittle. Always commit each layer before moving on.
- **PRD-mockup files (`Docs/*.html`) are richer than the v2 React kit.** v1 mockups had Product Detail, Escrow Payment, Order Tracking; v2 dropped them. When asked for "more screens from the PRD", read `Docs/PayPaddy-Mockups.html` first — it's already designed.
- **Tabs above the phone break the demo illusion.** Keep page chrome minimal: logo → phone → keyboard hint. Real-app navigation lives inside the phone.
- **Real-app feel means functional bottom nav.** Every primary screen (Home, Chat, Me, Merchant) needs the bottom nav rendered, with active-state highlight on the current screen.
- **GitHub Pages updates require pushing to `gh-pages`, not just the feature branch.** Don't tell the user it's deployed until both branches are pushed.
