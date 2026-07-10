# Kubtel visual system

Дата обновления: 2026-07-10.

Визуальный слой теперь управляется дизайн-токенами из `src/design/tokens/**`. `src/styles/tokens.css` генерируется командой `npm run tokens:build` и подключается в `src/layouts/BaseLayout.astro` перед `src/styles/global.css`.

## Визуальный принцип

Kubtel должен выглядеть как локальная технологичная команда: спокойно, понятно, без декоративного шума. Светлая B2C-основа использует контрастный текст, нейтральные поверхности и розовый брендовый CTA. B2B-ветка использует business dark theme, но остается на той же token taxonomy.

## Палитра и темы

| Theme    | Selector                                    | Назначение                                   |
| -------- | ------------------------------------------- | -------------------------------------------- |
| Light    | `:root`                                     | Основной публичный сайт                      |
| Business | `.business-page, [data-theme="business"]`   | B2B hub, service pages, request flows        |
| Readable | `body.is-readable, [data-theme="readable"]` | Ахроматичная версия с повышенной читаемостью |

Primary CTA использует `--kb-color-action-primary-background` (`pink.600`) с белым текстом и проходит WCAG AA. Более светлый `pink.500` остается brand/accent primitive, но не используется как фон primary-кнопки с белым текстом.

## Типографика и layout

- Кириллический стек: `Golos Text` для body/readable, `Manrope`/display roles через tokens.
- Letter spacing в интерфейсе не уходит в отрицательные значения.
- Breakpoints управляются `breakpoint.*` primitives; media query literals проверяются `design:audit`.
- Карточки и контролы используют component tokens, не raw radius/shadow.

## States

Обязательные состояния:

- hover and active;
- focus-visible;
- selected/current, отличные от hover;
- disabled/loading;
- success/warning/danger/info;
- readable mode;
- reduced motion;
- forced colors.

## Component layer

Новые и мигрированные компоненты:

- `ActionLink`;
- `Button`;
- `FormField`;
- `SectionHeading`;
- `StatusBadge`;
- `Tabs`;
- `TariffCard`.

Showcase: `/design-system/` (`noindex`).

## Проверки

```bash
npm run tokens:check
npm run design:audit
npm run design:verify
npm run check
npm test
```

Перед релизом также выполняются `npm run build`, `npm run test:ux`, visual screenshots и `npm run launch:check`.
