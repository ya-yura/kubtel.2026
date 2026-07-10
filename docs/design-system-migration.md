# Design system migration report

Дата обновления: 2026-07-10.

## Baseline before migration

Initial local audit found:

- 162 source CSS lines with static raw colors;
- 78 unique raw color values;
- legacy variables in active CSS: `--color-*`, `--max-page`, `--radius*`, `--header-height`, `--business-*` aliases;
- token generator checked only a smaller legacy set and did not validate all theme overrides or readable transform;
- readable mode used `filter: grayscale(1)` plus direct selector patching;
- motion, radius, shadows and some z-index/media values were outside token governance.

## Migration result

Current `npm run design:audit`:

| Check                       | Result |
| --------------------------- | ------ |
| Static raw color violations | 0      |
| Approved color exceptions   | 10     |
| Legacy variables            | 0      |
| Unknown `--kb-*` variables  | 0      |
| Raw motion declarations     | 0      |
| Raw radius declarations     | 0      |
| Raw shadow declarations     | 0      |
| Raw z-index declarations    | 0      |
| Media breakpoint violations | 0      |
| Primitive usage warnings    | 0      |

## Removed legacy variables

Removed from production CSS usage:

- `--color-ink`, `--color-graphite`, `--color-muted`, `--color-subtle`;
- `--color-line`, `--color-line-strong`;
- `--color-surface`, `--color-surface-raised`, `--color-soft`, `--color-soft-warm`;
- `--color-accent`, `--color-accent-hover`, `--color-accent-active`, `--color-accent-ink`;
- `--color-success`, `--color-success-soft`, `--color-info`, `--color-info-soft`, `--color-danger`, `--color-danger-soft`;
- `--shadow-soft`, `--shadow-lift`;
- `--max-page`, `--radius`, `--radius-sm`, `--header-height`;
- old business aliases such as `--business-neon`, `--business-blue`, `--business-panel`, `--business-line`, `--business-muted`, `--business-text`, `--business-accent`.

## Cannot auto-migrate

Approved technical exceptions:

- `rgb(var(--route-accent) / ...)`: computed B2B route accents from CSS variables, 9 occurrences;
- `SITE.themeColor`: browser metadata for `<meta name="theme-color">`, 1 occurrence.

CSS media queries still require literal pixel values. The allowed values are governed by `breakpoint.*` primitives and audited.

## New safeguards

- `scripts/build-tokens.mjs` validates token graph, theme overrides, layer boundaries and readable achromatic output.
- `scripts/design-audit.mjs` validates source styling contracts.
- `src/lib/design/tokens.test.ts` covers token graph, CSS generation, readable achromatic output, AA contrast, selected-vs-hover distinction and design audit pass.
