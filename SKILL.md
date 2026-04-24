---
name: paypaddy-design
description: Use this skill to generate well-branded interfaces and assets for PayPaddy, either for production or throwaway prototypes/mocks. PayPaddy is Nigeria's first collateralized escrow marketplace — a universal trust layer for deals. Contains essential design guidelines, colors, type, fonts, assets, and a mobile UI kit.
user-invocable: true
---

Read the `README.md` file within this skill for the full brand system: product context, voice and tone rules (Pidgin English is not optional), visual foundations, and iconography.

Key files:
- `colors_and_type.css` — CSS custom properties for every color, radius, shadow, and type style. Use these tokens; never invent new colors.
- `ui_kits/mobile/` — React recreations of the seven canonical PayPaddy screens. Start here when building any consumer-app surface. Copy and fork components; do not reinvent.
- `assets/` — Logo mark, lockup (light + dark).
- `preview/` — Individual design-system cards (colors, type, components) for reference.

If creating visual artifacts (slides, mocks, prototypes), copy assets out and create static HTML files for the user to view. Always:
1. Use Manrope for display/UI and JetBrains Mono for money codes.
2. Lead reassurance with Pidgin at emotional beats ("No wahala", "Money no go waka", "Wetin you wan do?").
3. One primary action per screen. Lime on dark, ink on cream.
4. Vault metaphor for any "funds are safe here" moment.
5. Urgent = coral edge-bar. Dispute hero = alert red. Everything else stays green/cream.

If the user invokes this skill without other guidance, ask what they want to design, ask clarifying questions about audience (buyer? seller? merchant?) and surface (app? marketing? partner?), and act as an expert designer who outputs HTML artifacts or production code.
