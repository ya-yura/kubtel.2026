# Kubtel.ru: дизайн-токены как source of truth

Дата: 2026-05-08.

Документ закрывает Prompt 09 из `docs/b2b-cms-design-token-prompt-pack.md`.

Статус: implementation-ready design, token build script not implemented yet.

Связанные документы:

- `docs/visual-system.md` - текущая визуальная система этапа 3.
- `src/styles/global.css` - текущие CSS-переменные и raw styling values.
- `docs/cms-content-models.md` - модели `DesignTheme` и `DesignTokenSet`.
- `docs/cms-migration-plan.md` - правила CMS migration and design governance.

## Цель

Сделать дизайн Kubtel управляемым через token source of truth, а не ручной поиск по `global.css`.

После реализации Prompt 18 источником правды должны стать JSON-файлы в `src/design/tokens/**`; `src/styles/tokens.css` должен генерироваться скриптом, а `global.css` должен использовать semantic/component tokens без raw hex/rem там, где это разумно.

## Что есть сейчас

Текущий `global.css` уже содержит первый слой переменных:

- color tokens: `--color-ink`, `--color-graphite`, `--color-muted`, `--color-line`, `--color-surface`, `--color-accent`, `--color-success`, `--color-info`, `--color-danger`;
- shadows: `--shadow-soft`, `--shadow-lift`;
- layout: `--max-page`, `--header-height`;
- radius: `--radius`, `--radius-sm`.

Проблема:

- primitive values и semantic role names смешаны;
- component states частично зашиты raw значениями: `rgba(...)`, `#fff`, `#2a2f36`, `160ms`, `44px`, breakpoints;
- B2B-стили добавлены в тот же слой и не имеют отдельной token dependency map;
- CMS пока может хранить `DesignTheme`, но не должна давать редактору raw цвета, размеры или CSS.

## Target file structure

```text
src/design/tokens/
  primitives.json
  semantic.json
  components.json
  business.json
  themes/
    light.json
    dark.json
scripts/
  build-tokens.mjs
src/styles/
  tokens.css
```

Правила владения:

- `primitives.json` - developers/designers only.
- `semantic.json` - developers/designers own, CMS can reference allowed semantic choices indirectly.
- `components.json` - developers/designers own.
- `business.json` - B2B semantic extension, not a separate visual universe.
- `themes/light.json` and `themes/dark.json` - theme overrides and theme-ready structure.
- `tokens.css` - generated artifact, do not edit manually.

## Token taxonomy

| Category                | File              | Purpose                                        | Example token                         | Direct component use  |
| ----------------------- | ----------------- | ---------------------------------------------- | ------------------------------------- | --------------------- |
| `color` primitives      | `primitives.json` | Raw brand/status/neutral color values          | `color.orange.500`                    | no                    |
| `typography` primitives | `primitives.json` | Font family, weight, size, line height         | `typography.size.2xl`                 | no                    |
| `spacing` primitives    | `primitives.json` | Spacing scale                                  | `spacing.4`                           | no                    |
| `radius` primitives     | `primitives.json` | Radius scale                                   | `radius.2`                            | no                    |
| `shadow` primitives     | `primitives.json` | Raw shadow recipes                             | `shadow.lift`                         | no                    |
| `motion` primitives     | `primitives.json` | Duration and easing                            | `motion.duration.fast`                | no                    |
| `breakpoint` primitives | `primitives.json` | Responsive breakpoints                         | `breakpoint.md`                       | build/script only     |
| `z-index` primitives    | `primitives.json` | Layer scale                                    | `z.overlay`                           | no                    |
| `layout` semantic       | `semantic.json`   | Page/container/header roles                    | `layout.page.maxWidth`                | yes                   |
| `color` semantic        | `semantic.json`   | Text/surface/action/status roles               | `color.text.primary`                  | yes                   |
| `state` semantic        | `semantic.json`   | Focus, hover, selected, invalid roles          | `state.focus.ring`                    | yes                   |
| `component` tokens      | `components.json` | Component-specific values from semantic tokens | `component.button.primary.background` | yes                   |
| `business` semantic     | `business.json`   | B2B accents and proof/status usage             | `business.proof.confirmed.border`     | yes                   |
| `theme` overrides       | `themes/*.json`   | Light/dark semantic overrides                  | `color.surface.page`                  | yes via generated CSS |

## Naming convention

Token paths use dot notation in JSON:

```text
category.group.role.variant.state
```

Generated CSS variables use the `--kb-` prefix:

```text
--kb-{category}-{group}-{role}-{variant}-{state}
```

Examples:

- `color.text.primary` -> `--kb-color-text-primary`
- `color.action.primary.hover` -> `--kb-color-action-primary-hover`
- `component.button.primary.shadow.hover` -> `--kb-component-button-primary-shadow-hover`
- `business.proof.needsVerification.background` -> `--kb-business-proof-needs-verification-background`

Compatibility rule:

- Prompt 18 should generate temporary legacy aliases for current variables, for example `--color-ink: var(--kb-color-text-primary)`.
- New CSS should use `--kb-*` tokens.
- Existing `--color-*` variables should be removed only after components are migrated and visual smoke passes.

## Primitive tokens example

Target file: `src/design/tokens/primitives.json`.

```json
{
  "$schema": "./tokens.schema.json",
  "color": {
    "neutral": {
      "0": { "value": "#ffffff", "type": "color" },
      "50": { "value": "#f4f7fa", "type": "color" },
      "100": { "value": "#d9e0e8", "type": "color" },
      "200": { "value": "#c3ccd7", "type": "color" },
      "500": { "value": "#5f6875", "type": "color" },
      "600": { "value": "#20242a", "type": "color" },
      "950": { "value": "#15171a", "type": "color" }
    },
    "orange": {
      "50": { "value": "#fff5ec", "type": "color" },
      "500": { "value": "#f47b20", "type": "color" },
      "600": { "value": "#e46d16", "type": "color" },
      "700": { "value": "#bf540c", "type": "color" },
      "950": { "value": "#1a120b", "type": "color" }
    },
    "blue": {
      "50": { "value": "#edf5ff", "type": "color" },
      "600": { "value": "#1f67b2", "type": "color" }
    },
    "green": {
      "50": { "value": "#e7f5ee", "type": "color" },
      "700": { "value": "#137a4b", "type": "color" }
    },
    "red": {
      "50": { "value": "#fff0ec", "type": "color" },
      "700": { "value": "#ba351f", "type": "color" }
    }
  },
  "typography": {
    "family": {
      "sans": {
        "value": "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
        "type": "fontFamily"
      }
    },
    "size": {
      "xs": { "value": "0.76rem", "type": "fontSize" },
      "sm": { "value": "0.82rem", "type": "fontSize" },
      "base": { "value": "1rem", "type": "fontSize" },
      "lg": { "value": "1.08rem", "type": "fontSize" },
      "xl": { "value": "1.25rem", "type": "fontSize" },
      "2xl": { "value": "1.45rem", "type": "fontSize" },
      "display-sm": { "value": "2.35rem", "type": "fontSize" },
      "display-lg": { "value": "4.6rem", "type": "fontSize" }
    },
    "weight": {
      "regular": { "value": "400", "type": "fontWeight" },
      "strong": { "value": "720", "type": "fontWeight" },
      "bold": { "value": "800", "type": "fontWeight" },
      "black": { "value": "900", "type": "fontWeight" }
    },
    "lineHeight": {
      "tight": { "value": "1.06", "type": "lineHeight" },
      "heading": { "value": "1.18", "type": "lineHeight" },
      "body": { "value": "1.62", "type": "lineHeight" }
    }
  },
  "spacing": {
    "0": { "value": "0", "type": "dimension" },
    "1": { "value": "0.25rem", "type": "dimension" },
    "2": { "value": "0.45rem", "type": "dimension" },
    "3": { "value": "0.65rem", "type": "dimension" },
    "4": { "value": "0.75rem", "type": "dimension" },
    "5": { "value": "1rem", "type": "dimension" },
    "6": { "value": "1.25rem", "type": "dimension" },
    "7": { "value": "1.5rem", "type": "dimension" },
    "8": { "value": "2rem", "type": "dimension" },
    "9": { "value": "3.5rem", "type": "dimension" },
    "10": { "value": "4.5rem", "type": "dimension" }
  },
  "radius": {
    "sm": { "value": "6px", "type": "borderRadius" },
    "md": { "value": "8px", "type": "borderRadius" },
    "pill": { "value": "999px", "type": "borderRadius" }
  },
  "shadow": {
    "soft": { "value": "0 18px 44px rgba(21, 23, 26, 0.08)", "type": "shadow" },
    "lift": { "value": "0 22px 56px rgba(21, 23, 26, 0.12)", "type": "shadow" }
  },
  "motion": {
    "duration": {
      "fast": { "value": "160ms", "type": "duration" },
      "base": { "value": "180ms", "type": "duration" },
      "slow": { "value": "420ms", "type": "duration" }
    },
    "easing": {
      "standard": { "value": "ease", "type": "cubicBezier" }
    }
  },
  "breakpoint": {
    "xs": { "value": "420px", "type": "dimension" },
    "sm": { "value": "520px", "type": "dimension" },
    "md": { "value": "720px", "type": "dimension" },
    "lg": { "value": "900px", "type": "dimension" },
    "xl": { "value": "980px", "type": "dimension" }
  },
  "z": {
    "header": { "value": "20", "type": "number" },
    "sticky": { "value": "30", "type": "number" },
    "menu": { "value": "40", "type": "number" },
    "skipLink": { "value": "100", "type": "number" }
  }
}
```

## Semantic tokens example

Target file: `src/design/tokens/semantic.json`.

```json
{
  "$schema": "./tokens.schema.json",
  "color": {
    "text": {
      "primary": { "value": "{color.neutral.950}" },
      "secondary": { "value": "{color.neutral.500}" },
      "subtle": { "value": "#7a8492" },
      "inverse": { "value": "{color.neutral.0}" }
    },
    "surface": {
      "page": { "value": "{color.neutral.0}" },
      "raised": { "value": "{color.neutral.0}" },
      "soft": { "value": "{color.neutral.50}" },
      "warm": { "value": "{color.orange.50}" },
      "dark": { "value": "{color.neutral.600}" },
      "darkRaised": { "value": "#2a2f36" }
    },
    "border": {
      "default": { "value": "{color.neutral.100}" },
      "strong": { "value": "{color.neutral.200}" },
      "action": { "value": "{color.orange.500}" }
    },
    "action": {
      "primary": { "value": "{color.orange.500}" },
      "primaryHover": { "value": "{color.orange.600}" },
      "primaryActive": { "value": "{color.orange.700}" },
      "primaryText": { "value": "{color.orange.950}" }
    },
    "status": {
      "success": { "value": "{color.green.700}" },
      "successSoft": { "value": "{color.green.50}" },
      "info": { "value": "{color.blue.600}" },
      "infoSoft": { "value": "{color.blue.50}" },
      "danger": { "value": "{color.red.700}" },
      "dangerSoft": { "value": "{color.red.50}" }
    }
  },
  "layout": {
    "page": {
      "maxWidth": { "value": "1180px" },
      "sectionPaddingMobile": { "value": "{spacing.9} {spacing.5}" },
      "sectionPaddingDesktop": { "value": "{spacing.10} {spacing.7}" }
    },
    "header": {
      "height": { "value": "68px" }
    },
    "touchTarget": {
      "min": { "value": "44px" }
    }
  },
  "state": {
    "focus": {
      "ring": { "value": "0 0 0 3px rgba(31, 103, 178, 0.48)" },
      "outlineColor": { "value": "rgba(31, 103, 178, 0.48)" }
    },
    "selected": {
      "background": { "value": "{color.surface.warm}" },
      "border": { "value": "{color.action.primary}" }
    },
    "invalid": {
      "border": { "value": "{color.status.danger}" },
      "ring": { "value": "0 0 0 4px rgba(186, 53, 31, 0.1)" }
    }
  }
}
```

## Component tokens example

Target file: `src/design/tokens/components.json`.

```json
{
  "$schema": "./tokens.schema.json",
  "component": {
    "button": {
      "primary": {
        "background": { "value": "{color.action.primary}" },
        "backgroundHover": { "value": "{color.action.primaryHover}" },
        "backgroundActive": { "value": "{color.action.primaryActive}" },
        "text": { "value": "{color.action.primaryText}" },
        "radius": { "value": "{radius.md}" },
        "minHeight": { "value": "{layout.touchTarget.min}" },
        "paddingY": { "value": "0.78rem" },
        "paddingX": { "value": "{spacing.5}" },
        "shadow": { "value": "0 10px 24px rgba(244, 123, 32, 0.22)" },
        "shadowHover": { "value": "0 14px 30px rgba(244, 123, 32, 0.28)" }
      }
    },
    "card": {
      "background": { "value": "{color.surface.raised}" },
      "border": { "value": "{color.border.default}" },
      "borderHover": { "value": "{color.border.strong}" },
      "radius": { "value": "{radius.md}" },
      "padding": { "value": "{spacing.6}" },
      "shadowHover": { "value": "{shadow.soft}" }
    },
    "input": {
      "background": { "value": "{color.surface.page}" },
      "border": { "value": "{color.border.strong}" },
      "borderFocus": { "value": "{color.status.info}" },
      "radius": { "value": "{radius.md}" },
      "minHeight": { "value": "48px" },
      "placeholder": { "value": "#8c96a3" }
    }
  }
}
```

## Business tokens example

Target file: `src/design/tokens/business.json`.

```json
{
  "$schema": "./tokens.schema.json",
  "business": {
    "hero": {
      "panelBackground": {
        "value": "linear-gradient(135deg, rgba(31, 103, 178, 0.14), transparent 42%), linear-gradient(160deg, {color.surface.dark}, #313942)"
      },
      "proofText": { "value": "rgba(255, 255, 255, 0.72)" }
    },
    "proof": {
      "confirmed": {
        "background": { "value": "{color.status.successSoft}" },
        "border": { "value": "rgba(19, 122, 75, 0.18)" },
        "text": { "value": "{color.status.success}" }
      },
      "needsVerification": {
        "background": { "value": "{color.surface.warm}" },
        "border": { "value": "rgba(244, 123, 32, 0.24)" },
        "text": { "value": "{color.action.primaryActive}" }
      },
      "draft": {
        "background": { "value": "{color.surface.soft}" },
        "border": { "value": "{color.border.default}" },
        "text": { "value": "{color.text.secondary}" }
      }
    },
    "request": {
      "summaryBackground": { "value": "{component.card.background}" },
      "summaryBorder": { "value": "{component.card.border}" }
    }
  }
}
```

B2B rule:

- B2B can use `business.*` semantic aliases for proof/status and dense business pages.
- B2B must still resolve to the same primitives and component tokens.
- No separate B2B-only color universe, font stack or radius scale.

## Theme tokens example

Target file: `src/design/tokens/themes/light.json`.

```json
{
  "$schema": "../tokens.schema.json",
  "theme": {
    "name": "light",
    "colorScheme": { "value": "light" },
    "overrides": {
      "color.surface.page": { "value": "{color.neutral.0}" },
      "color.text.primary": { "value": "{color.neutral.950}" },
      "color.action.primary": { "value": "{color.orange.500}" }
    }
  }
}
```

Target file: `src/design/tokens/themes/dark.json`.

```json
{
  "$schema": "../tokens.schema.json",
  "theme": {
    "name": "dark",
    "colorScheme": { "value": "dark" },
    "overrides": {
      "color.surface.page": { "value": "{color.neutral.600}" },
      "color.surface.raised": { "value": "#2a2f36" },
      "color.text.primary": { "value": "{color.neutral.0}" },
      "color.text.secondary": { "value": "rgba(255, 255, 255, 0.78)" },
      "color.border.default": { "value": "rgba(255, 255, 255, 0.12)" }
    }
  }
}
```

Dark theme is theme-ready only. It should not be exposed to editors until contrast QA and real brand assets are checked.

## Generated CSS example

Target generated file: `src/styles/tokens.css`.

```css
@layer tokens {
  :root {
    color-scheme: light;
    --kb-color-text-primary: #15171a;
    --kb-color-text-secondary: #5f6875;
    --kb-color-surface-page: #ffffff;
    --kb-color-surface-raised: #ffffff;
    --kb-color-surface-soft: #f4f7fa;
    --kb-color-surface-warm: #fff5ec;
    --kb-color-border-default: #d9e0e8;
    --kb-color-border-strong: #c3ccd7;
    --kb-color-action-primary: #f47b20;
    --kb-color-action-primary-hover: #e46d16;
    --kb-color-action-primary-active: #bf540c;
    --kb-color-action-primary-text: #1a120b;
    --kb-color-status-info: #1f67b2;
    --kb-color-status-info-soft: #edf5ff;
    --kb-radius-card: 8px;
    --kb-radius-control: 8px;
    --kb-radius-control-sm: 6px;
    --kb-layout-page-max-width: 1180px;
    --kb-layout-header-height: 68px;
    --kb-component-card-background: var(--kb-color-surface-raised);
    --kb-component-card-border: var(--kb-color-border-default);
    --kb-component-button-primary-background: var(--kb-color-action-primary);
    --kb-component-button-primary-background-hover: var(--kb-color-action-primary-hover);
    --kb-component-button-primary-text: var(--kb-color-action-primary-text);

    /* Temporary legacy aliases for incremental migration. */
    --color-ink: var(--kb-color-text-primary);
    --color-graphite: #20242a;
    --color-muted: var(--kb-color-text-secondary);
    --color-line: var(--kb-color-border-default);
    --color-line-strong: var(--kb-color-border-strong);
    --color-surface: var(--kb-color-surface-page);
    --color-surface-raised: var(--kb-color-surface-raised);
    --color-soft: var(--kb-color-surface-soft);
    --color-soft-warm: var(--kb-color-surface-warm);
    --color-accent: var(--kb-color-action-primary);
    --color-accent-hover: var(--kb-color-action-primary-hover);
    --color-accent-active: var(--kb-color-action-primary-active);
    --color-accent-ink: var(--kb-color-action-primary-text);
    --radius: var(--kb-radius-card);
    --radius-sm: var(--kb-radius-control-sm);
    --max-page: var(--kb-layout-page-max-width);
    --header-height: var(--kb-layout-header-height);
  }
}
```

`global.css` should import or be loaded after `tokens.css`, then reference token variables.

## Build script contract

Target file: `scripts/build-tokens.mjs`.

Responsibilities:

- read JSON token files in deterministic order: primitives, semantic, components, business, selected theme;
- resolve references such as `{color.orange.500}`;
- validate categories, type fields and duplicate generated CSS variable names;
- write `src/styles/tokens.css`;
- write stable output with sorted variables for clean diffs;
- preserve temporary legacy aliases until the migration checklist is complete;
- fail on unresolved references, invalid token type, unknown category or raw component reference to primitive tokens.

Target npm scripts for Prompt 18:

```json
{
  "scripts": {
    "tokens:build": "node scripts/build-tokens.mjs",
    "tokens:check": "node scripts/build-tokens.mjs --check"
  }
}
```

## CMS and editor governance

CMS can store `DesignTheme` and eventually `DesignTokenSet`, but editors must not edit raw token JSON in production.

Allowed CMS choices:

- `heroVariant`: standard, business, calculator, segment.
- `pageAccent`: default, business, critical.
- `sectionDensity`: compact, standard, spacious.
- `ctaVariant`: primary, secondary, quiet.
- `serviceCardLayout`: grid, list, compact.
- `proofVisibility`: full, compact, hidden.

Not allowed in CMS:

- arbitrary hex colors;
- raw `rem`, `px`, shadow, transition or z-index values;
- custom font family;
- custom CSS classes or inline CSS;
- raw HTML used for layout;
- direct edits to `tokens.css`.

## Visual smoke rules

Every token change must pass:

- `npm run tokens:check` after Prompt 18;
- `npm run format:check`;
- `npm run check`;
- `npm test`;
- `npm run build`;
- `npm run test:ux` when local browser environment is available;
- mobile and desktop screenshots for `/`, `/tariffs/`, `/connect/`, `/business/`, `/business/internet/`, `/business/request/`.

Visual acceptance:

- no horizontal overflow;
- no overlapping text or controls;
- primary CTA remains visually dominant;
- B2B pages feel related to B2C, not like a separate product;
- proof/status colors remain distinguishable and WCAG AA-friendly;
- focus-visible ring is visible on all controls;
- reduced-motion behavior still disables animations.

## Migration checklist from `global.css`

### Phase 1: introduce generated tokens

- [ ] Create `src/design/tokens/primitives.json`.
- [ ] Create `src/design/tokens/semantic.json`.
- [ ] Create `src/design/tokens/components.json`.
- [ ] Create `src/design/tokens/business.json`.
- [ ] Create `src/design/tokens/themes/light.json`.
- [ ] Create `src/design/tokens/themes/dark.json`.
- [ ] Create `scripts/build-tokens.mjs`.
- [ ] Generate `src/styles/tokens.css`.
- [ ] Import `tokens.css` before `global.css`.
- [ ] Keep legacy aliases for `--color-*`, `--radius*`, `--shadow-*`, `--max-page`, `--header-height`.

### Phase 2: migrate global root and page layout

- [ ] Move `:root` color, shadow, radius and layout variables to generated `tokens.css`.
- [ ] Replace `font-family` in `:root` with `--kb-typography-family-sans`.
- [ ] Replace `body` background raw gradients with semantic surface tokens.
- [ ] Replace `--max-page` usage with `--kb-layout-page-max-width`.
- [ ] Replace `--header-height` usage with `--kb-layout-header-height`.

### Phase 3: migrate controls and states

- [ ] Replace button background/hover/active shadows with `component.button.primary.*`.
- [ ] Replace focus outlines with `state.focus.*`.
- [ ] Replace input border/focus/invalid values with `component.input.*` and `state.invalid.*`.
- [ ] Replace checkbox/radio accent with `color.action.primary`.
- [ ] Replace selection background with a semantic token.
- [ ] Replace `44px` touch targets with `layout.touchTarget.min`.

### Phase 4: migrate cards, forms and repeated UI

- [ ] Replace card background/border/radius/shadow with `component.card.*`.
- [ ] Replace `.tariff-card`, `.service-card`, `.business-card`, `.contact-card` repeated values with component tokens.
- [ ] Replace `.proof`, `.data-status` and `.state-card` status colors with `color.status.*` and `business.proof.*`.
- [ ] Replace form group, consent, message and comparison surfaces with surface/border tokens.

### Phase 5: migrate B2B-specific layer

- [ ] Replace `.business-hero-panel` gradients with `business.hero.panelBackground`.
- [ ] Replace B2B proof text and panel alpha colors with `business.*` tokens.
- [ ] Replace B2B request summary/card values with shared `component.card.*`.
- [ ] Verify B2B does not introduce new raw brand colors.

### Phase 6: migrate motion, breakpoints and z-index

- [ ] Replace `160ms`, `180ms`, `420ms` with `motion.duration.*`.
- [ ] Replace repeated `ease` with `motion.easing.standard`.
- [ ] Document breakpoints in tokens and keep media queries generated or referenced from the same scale.
- [ ] Replace z-index values `20`, `30`, `40`, `100` with `z.*` custom properties where CSS supports it cleanly.

### Phase 7: remove legacy aliases

- [ ] Search for `--color-`, `--radius`, `--shadow`, `--max-page`, `--header-height` in `src/**/*`.
- [ ] Replace remaining legacy aliases with `--kb-*`.
- [ ] Remove legacy alias generation only after visual smoke passes.
- [ ] Add raw hex check for component styles.
- [ ] Update `docs/visual-system.md` to point to token source of truth.

## Raw value audit summary

Known raw values in current `global.css` that Prompt 18 should address:

- Hex colors: `#ffffff`, `#fff`, `#111317`, `#2a2f36`, `#313942`, `#8c96a3`, `#aab5c2`, `#edf7f0`, `#8bc59c`, `#fff1ed`, `#e0a18f`, `#f5f7fa`.
- RGBA colors: focus rings, header/menu backdrops, button shadows, selected states, dark panel copy.
- Dimensions: `44px`, `48px`, `68px`, `1180px`, `260px`, `320px`, `520px`, `900px`, `980px`.
- Spacing: repeated `0.75rem`, `1rem`, `1.25rem`, `1.5rem`, `3.5rem`, `4.5rem`.
- Radius: `999px` pill values.
- Motion: `160ms`, `180ms`, `420ms`, `ease`.
- Z-index: `20`, `30`, `40`, `100`.

Not every raw value must disappear immediately. One-off layout values can remain if tokenizing them would reduce clarity, but colors, repeated spacing, radii, shadows, motion, states and component primitives should move to tokens.

## Acceptance checklist

- [x] Token taxonomy covers color, typography, spacing, radius, shadow, motion, breakpoint, z-index, layout, component and state.
- [x] Naming convention is defined for JSON paths and generated CSS variables.
- [x] Target file structure is specified.
- [x] Primitive tokens are separated from semantic/component tokens.
- [x] B2B token rule is defined without creating a separate visual universe.
- [x] Example JSON tokens are provided for primitives, semantic, components, themes and business.
- [x] Example generated CSS is provided with backward compatibility aliases.
- [x] Build script contract and npm scripts are specified for Prompt 18.
- [x] CMS/editor governance is documented.
- [x] Visual smoke requirements are documented.
- [x] Migration checklist from `global.css` is ready.

## Следующий шаг

Prompt 10 should define which design settings can be governed from CMS and which tokens remain locked in code, using this token taxonomy as the permission boundary.
