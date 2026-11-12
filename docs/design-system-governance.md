# Design system governance

Дата обновления: 2026-11-12.

## Правила разработки интерфейса

- Корневой `AGENTS.md` обязателен для страниц, компонентов, CSS и CMS интерфейсов. Сначала ищи уже существующий компонент или композицию, затем расширяй систему через токен и контракт компонента.
- Рабочие стили используют семантические, компонентные и композиционные токены. Напрямую обращаться к primitive-токенам нельзя; `npm run design:audit` завершится ошибкой при таком обращении.
- Не задавай в production CSS цвета, радиусы, тени, motion, z-index и breakpoint литералами. Для spacing и типографики используй именованные роли и шкалы; исключения допускаются только для intrinsic layout-механики вроде `auto`, `minmax()`, процентов, grid fractions и нулевого сброса.
- Семантические имена должны описывать роль, а не страницу или случайное значение. Компонентные токены связывают эту роль с конкретным контролом. Бизнес-тема наследует общие ритмы и типографику.
- Проверяй адаптивность на 320×720, 390×844, 768×1024 и 1440×1000. Для мобильного прогона проверь переполнение, переносы, навигацию и зону подключения, sticky элементы, вкладки и форму. Исправляй дефект на уровне токена, компонента или композиции, общей для затронутых страниц.
- Перед сдачей изменений интерфейса запускай обязательные проверки из корневого `AGENTS.md` и сохраняй скриншоты responsive matrix в указанный каталог артефактов.

## Ownership

| Layer                | Owner              | CMS access              |
| -------------------- | ------------------ | ----------------------- |
| Primitives           | Developer/designer | No                      |
| Semantic tokens      | Developer/designer | No raw editing          |
| Component tokens     | Developer/designer | No raw editing          |
| Compositions         | Developer/designer | Preset selection only   |
| Business aliases     | Developer/designer | Preset selection only   |
| Content status/proof | Editor/reviewer    | Enum/status fields only |

## CMS allowed choices

CMS may store only these governed choices:

- `themeMode`: `light`, `business`;
- `pageAccent`: `default`, `business`, `critical`;
- `heroVariant`: `standard`, `business`, `compact`, `proof-led`;
- `sectionDensity`: `comfortable`, `compact`, `dense`;
- `contentAlignment`: `start`, `center`, `split`;
- `compositionPreset`: `page-intro`, `card-grid`, `service-workspace`, `calculator-workspace`, `contact-grid`, `business-routing`;
- `ctaVariant`: `primary`, `secondary`, `ghost`, `business`, `critical`;
- `serviceCardLayout`: `grid`, `list`, `comparison`;
- `proofVisibility`: `full`, `compact`, `hidden`;
- `statusTone`: `neutral`, `success`, `warning`, `danger`, `info`.

## CMS forbidden values

Do not add fields that accept:

- raw hex/RGB/HSL colors;
- raw px/rem spacing, typography, radius or shadow values;
- arbitrary transition, animation or z-index values;
- custom class names or inline CSS;
- raw HTML for layout;
- direct token references or JSON token blobs.

## Change process

1. Add or change tokens in `src/design/tokens/**`.
2. Run `npm run tokens:build`.
3. Run `npm run design:verify`.
4. Update `/design-system/` if a new component contract is introduced.
5. Update this document and editor-facing docs if CMS preset choices change.
