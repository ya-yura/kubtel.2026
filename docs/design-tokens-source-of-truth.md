# Kubtel design tokens source of truth

Дата обновления: 2026-07-10.

Source of truth дизайн-системы находится в `src/design/tokens/**`. Файл `src/styles/tokens.css` является generated artifact и не редактируется вручную.

## Структура

```text
src/design/tokens/
  primitives.json      # raw values: color, font, spacing, radius, shadow, motion, breakpoint, z
  semantic.json        # roles: text, surface, action, status, layout, focus, interaction
  components.json      # component contracts: button, input, card, tabs, tariffCard, etc.
  compositions.json    # reusable page/layout compositions
  business.json        # B2B semantic aliases, not a separate visual system
  themes/
    light.json         # base light theme
    dark.json          # business dark theme selector
    readable.json      # readable/achromatic theme selector
```

Generated CSS uses `--kb-*` variables. Legacy variables such as `--color-ink`, `--max-page`, `--radius` and `--business-neon` are intentionally absent.

## Build and checks

```bash
npm run tokens:build
npm run tokens:check
npm run design:audit
npm run design:verify
```

`scripts/build-tokens.mjs` validates:

- duplicate token paths;
- token shape, `type` and value syntax;
- unresolved and circular references;
- component/business boundary rule: no primitive reference and no raw color in those layers;
- theme override existence and type compatibility;
- readable theme achromatic transform.

`scripts/design-audit.mjs` fails on:

- static raw colors in source UI files;
- legacy CSS variables;
- unknown `--kb-*` variables;
- raw motion durations/easing in style sources;
- raw `border-radius`, `box-shadow` and `z-index`;
- media breakpoints not present in token primitives.

## Current token tree

Current generated count: 699 tokens.

| Layer               | Role                                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `primitives.json`   | Foundation values only. Components should not bind to these directly except inside the internal showcase.                               |
| `semantic.json`     | Public design roles for product UI: text, surface, action, status, layout, shape, stroke, elevation, layer, focus, interaction, motion. |
| `components.json`   | Stable component contracts consumed by CSS and Astro UI components.                                                                     |
| `compositions.json` | Page-level recipes for shell, intro, grids, service workspaces, calculator workspaces, mobile action bars.                              |
| `business.json`     | B2B aliases mapped back to semantic/component primitives.                                                                               |
| `themes/*.json`     | Theme selectors and semantic overrides.                                                                                                 |

## Theme selectors

| Theme      | Selector                                    | Purpose                                                |
| ---------- | ------------------------------------------- | ------------------------------------------------------ |
| `light`    | `:root`                                     | Default public site.                                   |
| `business` | `.business-page, [data-theme="business"]`   | B2B dark surfaces and dense service pages.             |
| `readable` | `body.is-readable, [data-theme="readable"]` | High readability, achromatic palette, larger controls. |

## Component contracts

Production CSS should consume component or semantic variables:

- button/action link: `--kb-component-button-*`, `--kb-color-action-*`;
- fields/select/textarea: `--kb-component-input-*`, `--kb-component-form-*`;
- cards/tariffs/services: `--kb-component-card-*`, `--kb-component-tariff-card-*`, `--kb-component-service-card-*`;
- tabs/status/table/accordion/sticky CTA: matching `--kb-component-*` contracts;
- business pages: `--kb-business-*` only for B2B-specific semantics.

## Exceptions

Approved current exceptions are explicit and checked by `design:audit`:

- 9 computed route accent values: `rgb(var(--route-accent) / ...)` in `src/styles/business-page.css`;
- 1 browser metadata value: `SITE.themeColor` in `src/config/site.ts`, because `<meta name="theme-color">` cannot reliably consume CSS custom properties.

All other source-level static raw colors are violations.

## Governance

CMS may choose presets only: theme, variant, density, alignment, accent, composition and status visibility. CMS must not store raw hex, raw CSS length values, box shadows, transitions, z-index, arbitrary classes, inline CSS or token JSON.
