# Kubtel design system

## Правило для новых страниц

Любая новая страница строится из существующих компонентов и композиций. Её CSS отвечает за расположение конкретного содержимого, а визуальные значения берутся из централизованных токенов. Новый цвет, размер, отступ, радиус, тень, слой или движение сначала оформляется как токен с понятной ролью, затем используется через компонентный или семантический контракт.

Краткая инструкция для агентов находится в корневом `AGENTS.md`. Подробная карта токенов и правила управления CMS — в `docs/design-tokens-source-of-truth.md` и `docs/design-system-governance.md`.

## Источники и порядок слоёв

1. `src/design/tokens/primitives.json` — исходные шкалы цвета, типографики, размеров, интервалов, слоёв и движения. UI не обращается к ним напрямую.
2. `src/design/tokens/semantic.json` — роли интерфейса: поверхность, текст, действие, статус, фокус, сетка и управление.
3. `src/design/tokens/components.json` — визуальные контракты кнопок, полей, карточек, навигации, вкладок и других компонентов.
4. `src/design/tokens/compositions.json` — рецепты страницы: интро, сетки, рабочие области услуг, формы и мобильные панели.
5. `src/design/tokens/business.json` и `src/design/tokens/themes/**` — бизнес-алиасы и темы поверх общей системы.

`src/styles/tokens.css` — сгенерированный файл. Его нельзя править вручную. Изменения исходных JSON применяются командой `npm run tokens:build`.

## Повторно используемые компоненты

Внутренний showcase `/design-system/` (`noindex`) должен показывать реальные токены и компоненты. Перед созданием нового визуального решения проверь `src/components/ui/**` и `src/components/sections/**`. Если паттерн нужен больше чем одной странице, оформи его как компонент с токен-контрактом, состояниями, доступным именем и примером в showcase.

## Обязательные состояния и адаптивность

- Tokens: primitives, semantic roles, component contracts, compositions, business aliases, light/business/readable themes.
- UI components: `ActionLink`, `Button`, `FormField`, `SectionHeading`, `StatusBadge`, `Tabs`, migrated `TariffCard`.
- Компоненты должны задавать состояния hover, active, focus-visible, selected/current, disabled, loading, error/success и readable.
- Движение берётся из motion-токенов и учитывает `prefers-reduced-motion`; фокус остаётся заметным при forced colors.
- Интерфейс проверяется при ширинах 320, 390, 768 и 1440 px; отдельно проверяются безопасные области, переполнение текста, фиксированные элементы и мобильная навигация.
- Производственный guard: `npm run design:verify`; отдельный responsive прогон: `npm run test:ux`.

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
