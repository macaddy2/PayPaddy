# Low-trust manual workflows — what we're digitizing

What people do today with manual / crude monitoring systems in a low-trust
society, and which of those PayPaddy's primitives (deal + milestones + ledger
+ two-party contract lifecycle) can now carry electronically.

Each entry is scored on four axes:
- **Manual today** — what people actually do without an app
- **Crude monitoring** — what mechanism (if any) gives them comfort
- **Covered by current PayPaddy** — primitives we already have
- **Gap (if any)** — what's still missing or out of scope

## In scope — covered today

### Handshake / parley deals
- **Manual today:** Verbal agreement between two parties, sometimes with a
  witness (an "uncle", a village elder, a community leader).
- **Crude monitoring:** Social pressure; the witness vouches for the terms; a
  paper note signed by both. Falls apart on memory disputes and witness
  bias.
- **Covered:** Two-party invite + dual endorsement records the handshake
  digitally. The `Endorsement.termsHash` snapshots the agreed terms; any
  later change requires a fresh round of endorsements. The ledger is the
  witness, with cryptographic integrity instead of memory.
- **Gap:** None for the basic case.

### Letter of intent / proof of funds
- **Manual today:** A buyer takes a screenshot of their bank balance and
  sends it to the seller before negotiation, "to show I'm serious".
- **Crude monitoring:** Trust me, I have a balance. Easily faked, says
  nothing about commitment.
- **Covered:** **Fund-first toggle** on deal creation: money sits in escrow
  before the invite goes out. The counterparty sees a proof-of-funds badge
  with a real (escrowed) amount, not a screenshot.
- **Gap:** None.

### Service contracts with deliverables
*(logo design, content writing, construction stages, software builds)*
- **Manual today:** Loose verbal scope, milestones agreed by chat, payments
  made by trust at each stage. Disputes when "complete" means different
  things to each party.
- **Crude monitoring:** Email trails, WhatsApp messages, occasional written
  estimate. Hard to reference later, easy to reinterpret.
- **Covered:** Milestone breakdown + per-milestone release. Each milestone
  is a checkpoint with a named deliverable and a share of the gross. Buyer
  releases on delivery, or the 24h auto-release fires.
- **Gap:** None for the core case. Long-running service contracts with
  many milestones would benefit from per-milestone evidence attachments
  (currently only at dispute time).

### Layaway / installment purchase
- **Manual today:** Buyer pays for goods in installments and receives them
  on final payment; or buyer takes goods on credit and pays over time.
- **Crude monitoring:** Carbon-copy receipts. No mechanism if the seller
  closes shop or the buyer defaults.
- **Covered:** Reverse-direction milestone breakdown — funded incrementally
  by the buyer, with the seller releasing goods at staged points. The
  existing milestone primitive doesn't care which direction the value flows;
  the share schedule can model either.
- **Gap:** Recurring scheduled milestones (e.g. "every Friday for 8 weeks")
  need a small cron-like primitive — currently milestones are released by
  user action or single 24h auto-release. **Park for v2.**

### Brokered private sales
*(cars, land, used phones)*
- **Manual today:** Buyer hands cash to a broker, broker takes inspection
  fees out, paperwork happens (or doesn't), title transfers at the registry,
  final balance settles. Multiple disputes points along the way.
- **Crude monitoring:** Carbon receipts at each step, broker reputation by
  word of mouth, registry stamps.
- **Covered:** Multi-stage milestones model the natural checkpoints —
  inspection / agreement, paperwork / registration, transfer / handover,
  final payment. For phones specifically, the existing IMEI verifier
  (`device.verifyIMEIViaNCC`) plugs into the inspection milestone.
- **Gap:** None for the cash-flow side. Integration with land/vehicle
  registries is a partner integration (out of scope).

### Pre-orders & commissions
- **Manual today:** Buyer pays upfront for something not yet made; creator
  takes the money and delivers (or doesn't).
- **Crude monitoring:** Public reputation, social media call-outs.
- **Covered:** Fund-first + single delivery-on-completion milestone (or
  staged milestones for big-ticket commissions).
- **Gap:** None.

### Service-with-warranty
- **Manual today:** Service rendered, balance paid, dispute period later
  when something breaks.
- **Crude monitoring:** Written warranty card, easily lost.
- **Covered:** A milestone for delivery + a second milestone gated on the
  existing 24h auto-release timer extended to a warranty window (e.g. 14 days).
  Within the window, the buyer can dispute; after it, the milestone
  auto-releases.
- **Gap:** Configurable auto-release window per milestone (currently a
  single `DEAL_TIMERS_MS.autoReleaseWindow` constant). Trivial to widen
  — **good v2 follow-up**.

## Adjacent — gap, but additive

### Subletting / vendor agreements (recurring)
- **Manual today:** Monthly rent, weekly vendor invoices.
- **Covered:** Single-shot deals work for one period.
- **Gap:** Recurring deal templates — "issue a fresh milestone every period"
  — don't exist yet. **Worth a future spike.**

## Out of scope (multi-party or sensitive)

Recorded so they're not silently dropped:

- **Ajo / esusu / group savings** — multi-party (not 2-party), needs a
  distinct primitive.
- **Joint ventures with revenue split** — multi-party + ongoing distributions.
- **Inheritance / estate distributions** — multi-party + legal context.
- **Dowry / bride-price / cultural settlements** — sensitive, complex
  cultural variation, not somewhere a fintech should be opinionated.
- **Charitable pledges / GoFundMe-style** — many-to-one, not 2-party.
- **Bail / surety bonds** — legal/regulatory ground; not our lane.

## Summary of the upgrade this PR delivers

Before this PR, PayPaddy could carry **service contracts with deliverables**,
**pre-orders**, and **brokered private sales** as long as both parties happened
to already be PayPaddy users and one of them was happy to be the seed. The
contract terms were imposed by the initiator with no negotiation; the
counterparty's only first-class action was delivering or releasing funds.

The two-party lifecycle closes the loop:

- A **shareable invite link** brings the counterparty in even if they're not
  yet a PayPaddy user.
- The **negotiation board** turns terms into something both sides actively
  agree to, with a tamper-evident hash of the agreement.
- The **bilateral completion sign-off** makes the "we're done" moment a
  two-sided action, not a unilateral one.

That's the analog handshake, the witness, the carbon-copy receipt, and the
"we both said it's finished" — collapsed into a single auditable ledger
nobody can quietly rewrite.
