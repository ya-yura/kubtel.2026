# Kubtel design system

Дата обновления: 2026-07-10.

Внутренний showcase: `/design-system/`. Страница `noindex`, использует реальные компоненты и generated tokens.

## Что входит

- Tokens: primitives, semantic roles, component contracts, compositions, business aliases, light/business/readable themes.
- UI components: `ActionLink`, `Button`, `FormField`, `SectionHeading`, `StatusBadge`, `Tabs`, migrated `TariffCard`.
- Shared states: hover, active, focus-visible, selected/current, disabled, loading, error/success, readable, reduced motion, forced colors.
- Production guard: `npm run design:verify`.

## Компоненты и композиции

| Area                        | Source                                                                            |
| --------------------------- | --------------------------------------------------------------------------------- |
| Buttons and links           | `src/components/ui/Button.astro`, `src/components/ui/ActionLink.astro`            |
| Forms                       | `src/components/ui/FormField.astro`, existing lead/business forms                 |
| Status                      | `src/components/ui/StatusBadge.astro`, `src/lib/verification.ts`                  |
| Navigation/content sections | `SectionHeading`, `Tabs`, migrated section components                             |
| Cards                       | `TariffCard`, service cards, business cards, contact/vacancy/payment/search cards |
| Compositions                | `src/design/tokens/compositions.json`                                             |

## Accessibility baseline

- Primary action contrast: AA-safe after moving action background to `pink.600`.
- Readable mode: token-driven, achromatic, no `filter: grayscale(...)`.
- Reduced motion: durations and easing come from motion tokens.
- Forced colors: focus and selected/current states remain visible without shadows.
- Selected state is not hover-only; tabs/cards have separate selected contracts.

## Required commands for token changes

```bash
npm run tokens:check
npm run design:audit
npm run design:verify
npm run check
npm test
```

Run `npm run test:ux` and visual screenshots before production release.
