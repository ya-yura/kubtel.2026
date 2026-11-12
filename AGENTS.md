# UI implementation rules

## Source of truth

- `src/design/tokens/**` is the only editable source for visual tokens. `src/styles/tokens.css` is generated; update it with `npm run tokens:build` and validate with `npm run tokens:check`.
- Use the token layers in order: primitives define raw scales; semantic tokens describe product roles; component tokens define reusable controls and surfaces; composition tokens define page layouts. Production pages and components must consume semantic, component, or composition tokens, never primitives directly.
- Use the existing light, business, and readable themes. Business aliases extend the shared system; do not create a separate palette or typography scale for a page.
- Reuse `src/components/ui/**` and `src/components/sections/**` before adding a visual pattern. A new reusable pattern needs token contracts and a showcase example on `/design-system/`.
- Do not edit generated CSS, add literal colors, or introduce unregistered responsive breakpoints, radii, shadows, motion values, or stacking levels. Add the value to the token source and regenerate.

## Page construction

- Build pages from the shared shell, headings, buttons/links, form controls, cards, tabs, status, and documented compositions. Page CSS may arrange these patterns; it must not redefine their foundational visual values.
- Keep content editable separately from presentation. CMS fields select approved themes, variants, density, alignment, compositions, and status; they never accept arbitrary CSS, token references, or raw visual values.
- Every control has a visible focus state, a useful accessible name, and a touch target of at least 44px where practical. Form controls use explicit labels and mobile-safe input sizing.
- Respect `prefers-reduced-motion`, safe-area insets, readable mode, forced-colors mode, and long translated or user-provided text.

## Responsive review

- Review representative routes at 320×720, 390×844, 768×1024, and 1440×1000. Include home, service/configurator, business overview, B2G, and request-form paths.
- Check horizontal overflow, clipped or overlapping text, navigation and location selection, sticky actions, cards and grids, tab overflow, form controls, focus visibility, and content hidden behind fixed elements.
- Fix shared layout defects in their token, component, or composition owner so all affected routes benefit. Add one-off page rules only when the content genuinely needs a distinct composition, and encode that variant in the design system.

## Required checks after UI changes

1. `npm run tokens:check`
2. `npm run design:audit`
3. `npm run check`
4. `npm run test:ux` against the local site; save screenshots for the viewport matrix when layout or responsive behavior changes.
5. `npm run design:verify` when changing tokens, themes, or component contracts.

Update `docs/design-system.md` and `docs/design-system-governance.md` when the system gains a new layer, component contract, theme, or approved CMS choice.
