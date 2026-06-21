# Commerce component — end to end

How an order initiated on an external commerce platform (a WhatsApp seller, a
storefront checkout, an invoice, a plugin) becomes a PayPaddy escrow contract
between two parties — with the new two-party lifecycle layered on. PayPaddy is
just the marshall here: it never holds title to the goods or services, only
marshals money against milestones whose terms both parties endorsed.

## The full path

```mermaid
sequenceDiagram
    participant Ext as External commerce platform<br/>(WhatsApp, Shopify, invoice, plugin)
    participant Sel as Seller
    participant PP as PayPaddy
    participant Buy as Buyer
    participant Wal as Wallets

    Note over Ext,Sel: Seller (or a platform integration on their behalf)<br/>posts a CommerceIntent describing the order.
    Sel->>PP: commerce.createIntent({ sellerId, title, amountKobo,<br/>externalRef, partnerId, returnUrl, category })
    PP-->>Sel: CommerceIntent (status=ready) + share URL

    Note over Sel,Buy: Seller shares URL — WhatsApp link, embedded in checkout,<br/>QR code, payment-link button, etc.
    Sel-->>Buy: paypaddy.app/commerce/intent/{id}

    Buy->>PP: opens intent detail screen
    PP-->>Buy: read-only summary + trust pills + "Fund protected deal" CTA

    Note over Buy: Sign in if needed; complete Trinity if first time.
    Buy->>PP: commerce.createDealFromIntent({ intentId, buyerId })
    PP-->>Buy: Deal (status=awaiting_funds) with sellerId already attached

    alt single-payout (legacy, no negotiation)
        Buy->>PP: fundVirtualAccountViaProvidus(dealId)
        Note over PP: status = funded
        Sel->>PP: markDelivered() / Buy->>PP: confirmReceipt()
        Note over PP: status = settled
        PP->>Wal: credit seller.netToSellerKobo
    else two-party milestone contract (new spine)
        Buy->>PP: invite() to upgrade intent → two-party deal<br/>(or buyer initiates directly via the Create Deal form)
        Note over PP: status = awaiting_counterparty
        PP-->>Sel: invite link
        Sel->>PP: acceptInvite() — joins as counterparty
        Note over PP: status = viewed
        Sel->>PP: proposeAmendment() (e.g. tweak milestone shares)
        Buy->>PP: respondToAmendment(accept)
        Note over PP: status = viewed
        Buy->>PP: endorseLock(by=initiator)
        Sel->>PP: endorseLock(by=counterparty)
        Note over PP: termsHash matches → status = awaiting_funds (fund-after)<br/>OR funded (fund-first, already proof-of-funds)
        Buy->>PP: fundVirtualAccountViaProvidus(dealId)<br/>(if not already funded)
        Note over PP: status = funded
        loop per milestone
            Sel->>PP: markMilestoneDelivered(milestoneId)
            Note over PP: amendment_ × ledger entries written
            Buy->>PP: releaseMilestone(milestoneId)
            PP->>Wal: credit seller wallet by slice net
        end
        Note over PP: status = awaiting_completion_signoff
        Buy->>PP: signCompletion(by=initiator)
        Sel->>PP: signCompletion(by=counterparty)
        Note over PP: status = settled
    end

    opt returnUrl present
        PP-->>Ext: redirect / webhook to the external platform's<br/>returnUrl with deal status
    end
```

## What lives where

| Concept | Schema | API | Notes |
|---|---|---|---|
| External platform order | `CommerceIntent` (`schema.ts`) | `commerce.createIntent`, `getIntent`, `listIntents` | Pre-staged by the seller / platform. `externalRef` is the tether to the originating system; `returnUrl` is where to bounce back after settlement. Immutable once `ready`. |
| Conversion to a PayPaddy deal | `Deal` | `commerce.createDealFromIntent` | Buyer-initiated. Seller and amount inherit from the intent; the intent flips to `deal_created`. |
| Two-party negotiation | `Counterparty`, `Amendment`, `Endorsement`, `InviteToken` | `deals.invite`, `acceptInvite`, `proposeAmendment`, `respondToAmendment`, `endorseLock`, `signCompletion` | The contract lifecycle described in [two-party-deal-lifecycle.md](./two-party-deal-lifecycle.md). Either party can be the "initiator" — the form on `/deal/new` lets you say "I am the buyer / I am the seller" with the counterparty filling the other slot via the invite link. |
| Milestones + ledger | `Milestone`, `LedgerEntry` | `markMilestoneDelivered`, `releaseMilestone` | Each milestone is a trigger; auto-release armed for 24h after delivery. |
| Funds marshalling | `Wallet`, `VirtualAccount` | `fundVirtualAccountViaProvidus`, wallet credit on `releaseMilestone` | PayPaddy never holds title to the goods — only the kobo. |

## What PayPaddy is NOT

This is the "just the marshall" qualifier the user emphasised:

- **Not a marketplace.** Listings exist for the demo but the contract terms are
  whatever the two parties agree to — PayPaddy doesn't moderate the goods or
  vouch for quality.
- **Not a title registry.** Custody of phones, cars, land etc. stays with the
  parties. The escrow protects the money side of the transfer, not the asset.
- **Not a notary.** Endorsements are tamper-evident (hash-chained ledger,
  termsHash on each Endorsement) but legally they're "audit trail" not
  "court-admissible signature" without further wiring.
- **Not a dispute court.** The dispute mechanism exists (`disputes.open`,
  `disputes.resolve`) but its job is to release escrow per a verdict — the
  verdict itself reflects an admin / partner adjudication outside this code.

The whole product collapses to: "marshal funds against the milestones two
parties endorsed; surface a clean audit trail; never touch the rest."
