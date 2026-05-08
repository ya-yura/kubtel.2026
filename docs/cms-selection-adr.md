# Kubtel.ru: ADR выбора Headless CMS

Дата: 2026-05-08.

Статус: accepted for POC, production confirmation required.

Связанные артефакты:

- `docs/b2b-cms-design-token-prompt-pack.md`, Prompt 05.
- `docs/b2b-strategy-ia-funnel.md`.
- `docs/site-management-access.md`.
- `docs/decision-log.md`, ADR-013.

## Решение

Основной вариант для Kubtel: **Strapi 5 self-hosted + PostgreSQL**.

Запасной вариант: **Directus self-hosted + PostgreSQL**.

Sanity и Storyblok не выбираются как основной путь сейчас, потому что оба сильнее завязаны на SaaS-модель и vendor lock-in. Их стоит вернуть в обсуждение только если Kubtel явно поставит visual editing выше self-host/control данных.

## Контекст

Kubtel нужен CMS-контур, где контент меняют не разработчики. CMS должна обслуживать B2C и будущий B2B-раздел:

- страницы `/business/**`;
- услуги, тарифы, опции, SLA, FAQ, кейсы, legal documents;
- B2B-калькуляторы и lead form variants;
- workflow `draft -> ready for review -> commercial approved -> legal approved -> published -> archived`;
- source/proof statuses `confirmed`, `needs_verification`, `draft`;
- preview перед публикацией;
- дизайн-настройки в пределах governance: theme/accent/layout presets, но не raw CSS.

Текущий проект уже построен на Astro + TypeScript, локальных content collections, Zod validation и изолированном lead workflow. CMS не должна ломать этот контракт: Astro-компоненты должны получать нормализованные внутренние types, а не сырые CMS-ответы.

## Decision drivers

| Driver                          | Вес | Почему важно                                                                                                    |
| ------------------------------- | --: | --------------------------------------------------------------------------------------------------------------- |
| Self-host/control               |  20 | Региональный телеком, коммерческие данные, юридические тексты и будущие заявки требуют контроля инфраструктуры. |
| Editor UX                       |  15 | Контентом будут управлять не инженеры.                                                                          |
| Structured content/page builder |  15 | Нужны услуги, тарифы, калькуляторы, proof points, страницы и дизайн-настройки.                                  |
| Preview                         |  10 | Редактор должен видеть страницу до публикации.                                                                  |
| Roles/workflow                  |  10 | Нужны content, commercial и legal review stages.                                                                |
| Astro integration               |  10 | Интеграция должна лечь поверх текущего Astro content layer.                                                     |
| Schema/migrations               |  10 | Модели будут эволюционировать вместе с B2B и токенами.                                                          |
| Cost/vendor lock-in             |  10 | Нужен прогнозируемый TCO и возможность выхода.                                                                  |

## Сравнение

Оценка: 1 - слабое соответствие, 5 - сильное соответствие.

| Критерий                   | Strapi 5 | Directus | Sanity | Storyblok |
| -------------------------- | -------: | -------: | -----: | --------: |
| Self-host/control          |        5 |        5 |      2 |         1 |
| Editor UX                  |        4 |        3 |      4 |         5 |
| Visual preview             |        3 |        3 |      5 |         5 |
| Dynamic zones/page builder |        5 |        5 |      5 |         4 |
| Astro integration          |        3 |        3 |      5 |         5 |
| Roles and workflow         |        4 |        4 |      4 |         4 |
| Schema migrations          |        4 |        4 |      5 |         3 |
| Russian content/i18n       |        5 |        5 |      5 |         5 |
| Vendor lock-in             |        4 |        4 |      3 |         2 |
| Design settings            |        5 |        5 |      5 |         4 |

Weighted result:

| CMS       |  Score | Вывод                                                                                                      |
| --------- | -----: | ---------------------------------------------------------------------------------------------------------- |
| Strapi 5  | 83/100 | Лучший баланс для Kubtel: self-host, редакторская CMS, компоненты/dynamic zones, Node/TypeScript stack.    |
| Directus  | 80/100 | Очень сильный запасной вариант, особенно если Kubtel хочет database-first и больше контроля над таблицами. |
| Sanity    | 79/100 | Отличная студия и visual editing, но Content Lake является SaaS-зависимостью.                              |
| Storyblok | 69/100 | Лучший visual editor, но слабее по self-host/control и дороже/жестче по lock-in.                           |

## Критерии из Prompt 05

| Критерий                   | Strapi 5                                                                                                                                | Directus                                                                                                                               | Sanity                                                                                                    | Storyblok                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Редакторский UX            | Хороший CMS UX: content manager, content-type builder, components, draft/publish. Не полноценный визуальный конструктор из коробки.     | Удобный Data Studio, но ощущается ближе к базе данных и admin UI. Для неинженеров потребуется аккуратная настройка интерфейсов и имен. | Сильный кастомный Studio UX, real-time collaboration, схемы как код. Требует разработки Studio-структуры. | Лучший редакторский visual UX: редактор видит страницу, блоки и контекст.                          |
| Self-host/cloud            | Есть self-host и Strapi Cloud. Для Kubtel выбираем self-host.                                                                           | Есть self-host и Directus Cloud. Для Kubtel подходит self-host.                                                                        | Studio можно хостить отдельно, но Content Lake и APIs - hosted Sanity.                                    | SaaS-first, self-host не является целевым вариантом.                                               |
| Visual preview             | Preview есть как feature; Live Preview относится к Growth/Enterprise. Для MVP хватит обычного preview route.                            | Есть live preview/content versioning паттерны, но нужно больше ручной настройки.                                                       | Очень сильный Presentation Tool и Astro visual editing.                                                   | Самый сильный Visual Editor и Bridge для компонентных страниц.                                     |
| Dynamic zones/page builder | Components + Dynamic Zones хорошо ложатся на Page.sections и B2B blocks.                                                                | Many-to-Any relationships позволяют делать page builder, но API и UI сложнее для редактора.                                            | Arrays of objects/references дают гибкий page builder, но все строится кодом Studio.                      | Blocks/Bloks - ядро продукта, удобно для страниц.                                                  |
| Astro integration          | Через REST/GraphQL/Strapi client или community loader. Нужен собственный adapter layer.                                                 | Через REST/GraphQL/SDK. Нужен собственный adapter layer.                                                                               | Есть официальный `@sanity/astro`.                                                                         | Есть официальный `@storyblok/astro`.                                                               |
| Roles and workflow         | RBAC есть; Review Workflows - Enterprise; Releases - Growth/Enterprise. Для MVP можно хранить Kubtel workflow в полях `workflowStatus`. | Roles/policies сильные; workflow можно строить через fields + Flows.                                                                   | Роли зависят от плана; custom roles - Enterprise; document actions позволяют кастомизировать процесс.     | Roles/workflows сильные, но custom roles/workflows зависят от плана.                               |
| Миграции схем              | Schema files живут в Strapi app и могут версионироваться; data migrations нужно дисциплинировать отдельно.                              | Database-first; schema snapshot/migration подход хорош для команды, но редакторский UX требует больше настройки.                       | Schema as code и migration tooling сильные.                                                               | Component schemas управляются в Storyblok и Management API; repo-driven schema discipline сложнее. |
| Русский контент            | Поддерживает UTF-8, i18n, поля/лейблы можно настраивать.                                                                                | Поддерживает UTF-8, translations pattern.                                                                                              | Поддерживает любые локали; сильная модель локализации.                                                    | Поддерживает локали и datasources.                                                                 |
| Vendor lock-in             | Низкий: self-host, открытый код, PostgreSQL, REST/GraphQL. Paid features нужно учитывать отдельно.                                      | Низкий/средний: self-host, прямой DB control, но лицензирование Directus нужно юридически проверить.                                   | Средний/высокий: Content Lake, GROQ, Sanity-specific APIs.                                                | Высокий: SaaS, Storyblok component model, pricing/limits.                                          |
| Theme/design settings      | DesignTheme и governed settings удобно хранить как single/collection types.                                                             | Отлично как data/config collections.                                                                                                   | Отлично как typed documents.                                                                              | Хорошо через components/datasources, но не self-host.                                              |

## Почему Strapi подходит Kubtel

1. **Контроль данных и инфраструктуры.** Strapi можно держать self-hosted рядом с текущим Node/Astro runtime и PostgreSQL. Это лучше соответствует телеком-контексту, чем SaaS-only CMS.
2. **Редакторская модель достаточно понятна.** Content Manager, Draft & Publish, components и Media Library дают редакторам привычный CMS-процесс без доступа к коду.
3. **B2B-модели ложатся естественно.** `BusinessService`, `Tariff`, `CalculatorOption`, `SLAFeature`, `ProofPoint`, `LeadFormVariant`, `DesignTheme` можно делать отдельными collection/single types с relations.
4. **Page builder можно ограничить.** Dynamic Zones дают гибкость страницам, но мы можем разрешить только системные блоки Kubtel: hero, proof strip, service grid, calculator shell, FAQ, CTA.
5. **Astro остается независимым.** Мы не подключаем Strapi напрямую в компоненты. Будет `src/lib/cms/` adapter, который нормализует Strapi REST/GraphQL в текущие TypeScript/Zod contracts.
6. **Есть понятный fallback.** Если Strapi окажется слишком CMS-centric или платные workflow features не подойдут бюджету, Directus остается близким self-host вариантом.

## Что выбрать по планам

POC:

- Strapi 5 self-hosted Community features.
- PostgreSQL.
- Локальные роли: admin, developer, content editor.
- Kubtel-specific workflow хранится в поле `workflowStatus`, пока не подтвержден Enterprise/Growth budget.

Production recommendation after POC:

- Если хватает ручного workflow через поля и Zod/prelaunch checks: остаться на self-hosted Strapi без paid workflow features.
- Если нужны настоящие Review Workflows, Releases, Content History, SSO или Live Preview: заложить Strapi CMS Growth/Enterprise и отдельно решить, где хостить - self-host или Strapi Cloud.
- Если Kubtel запрещает любые paid CMS licenses и хочет максимум контроля на уровне БД: перейти к Directus POC.

## Риски

| Риск                                                    | Вероятность | Влияние | Что делаем                                                                                                      |
| ------------------------------------------------------- | ----------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| Paid features нужны раньше, чем кажется                 | Medium      | Medium  | В MVP не зависеть от Review Workflows/Releases; workflow дублировать в полях и prelaunch audit.                 |
| Self-host потребует DevOps-регламента                   | High        | Medium  | Docker, PostgreSQL backups, media storage, upgrade policy и health checks включить в Prompt 17.                 |
| Dynamic Zones станут слишком свободными                 | Medium      | High    | Разрешать только approved blocks; DesignTheme давать как governed choices, не raw style fields.                 |
| Сложность Strapi populate для nested relations          | Medium      | Medium  | Не отдавать сырые ответы компонентам; писать `cmsAdapter` и normalization tests.                                |
| Редакторы будут путаться в технических моделях          | Medium      | Medium  | Русские display names, field descriptions, editor guide, минимальный набор обязательных полей.                  |
| Коммерческие данные попадут в public API преждевременно | Medium      | High    | Поля `internalNotes`, reviewer comments и unpublished prices помечать private/server-only; API token read-only. |
| Vendor/price changes                                    | Medium      | Medium  | Хранить internal normalized types и local fallback, чтобы CMS была заменяема.                                   |
| Юридические ограничения Kubtel изменят выбор            | Unknown     | High    | До production подтвердить data residency, SLA, бюджет, SSO, backup и legal review.                              |

## Proof of Concept checklist

### POC-1: инфраструктура

- Создать отдельный Strapi app в `cms/strapi` или отдельном репозитории, чтобы не смешивать Astro frontend и CMS backend.
- Поднять Strapi 5 + PostgreSQL через Docker Compose.
- Настроить env: `STRAPI_URL`, `STRAPI_API_TOKEN`, `STRAPI_PREVIEW_SECRET`, `CMS_PROVIDER=strapi`.
- Подтвердить backup/export media strategy.

### POC-2: минимальные модели

- `Page`.
- `SeoMeta`.
- `BusinessService`.
- `BusinessSegment`.
- `Tariff`.
- `TariffOption`.
- `BusinessCalculator`.
- `CalculatorOption`.
- `ProofPoint`.
- `FAQItem`.
- `LeadFormVariant`.
- `DesignTheme`.

### POC-3: workflow

- Добавить поле `workflowStatus`: `draft`, `ready_for_review`, `commercial_approved`, `legal_approved`, `published`, `archived`.
- Добавить `verificationStatus`: `confirmed`, `needs_verification`, `draft`.
- Добавить reviewer fields: `commercialReviewedBy`, `legalReviewedBy`, `reviewedAt`, `reviewNotes`.
- Проверить, что public adapter не возвращает private review notes.

### POC-4: Astro adapter

- Добавить `src/lib/cms/types.ts`.
- Добавить `src/lib/cms/cms-adapter.ts`.
- Добавить `src/lib/cms/local-content-adapter.ts`.
- Добавить `src/lib/cms/strapi-adapter.ts`.
- Добавить normalization tests для `BusinessService`, `Tariff`, `LeadFormVariant`.
- Сохранить fallback на текущие `src/content/**`.

### POC-5: preview and rebuild

- Добавить Astro preview route или query mode, который использует server-only token.
- Настроить Strapi Preview URL для `/business/**`.
- Настроить webhook rebuild/invalidation для production.
- Проверить, что draft content не виден без preview token.

### POC-6: editor trial

- Дать редактору задачу: изменить B2B FAQ, цену tariff option, CTA label, proof status и hero copy.
- Зафиксировать, где редактору было непонятно.
- Проверить, что редактор не может сломать дизайн через произвольные цвета, HTML или layout.

## Go/no-go criteria

Strapi POC считается успешным, если:

- редактор меняет услугу, тариф, FAQ и CTA без Git;
- Astro получает CMS data через adapter, а компоненты не знают источник;
- draft/preview работает отдельно от published;
- public API не отдает private review fields;
- local fallback продолжает работать при недоступной CMS;
- B2B lead form получает `serviceInterest`, `configurationSummary` и CMS-defined form variant;
- дизайн-настройки ограничены approved values;
- `npm test`, `npm run check`, `npm run build` проходят после adapter integration.

Strapi POC нужно остановить и перейти к Directus, если:

- Kubtel требует database-first CMS и прямого контроля таблиц важнее редакторского CMS UX;
- paid Strapi workflow features становятся обязательными, но бюджет не подтвержден;
- Strapi nested relations/dynamic zones создают слишком высокий риск поддержки;
- IT/безопасность Kubtel не принимает Strapi runtime/hosting модель.

## Источники

Официальные источники, проверенные 2026-05-08:

- Strapi: `https://docs.strapi.io/cms/features/content-type-builder`
- Strapi Draft & Publish: `https://docs.strapi.io/cms/features/draft-and-publish`
- Strapi Preview: `https://docs.strapi.io/cms/features/preview`
- Strapi RBAC: `https://docs.strapi.io/cms/features/rbac`
- Strapi Review Workflows: `https://docs.strapi.io/cms/features/review-workflows`
- Strapi Releases: `https://docs.strapi.io/cms/features/releases`
- Strapi pricing/CMS licensing overview: `https://strapi.io/pricing-cms`
- Directus M2A page blocks: `https://directus.io/docs/tutorials/getting-started/create-reusable-blocks-with-many-to-any-relationships`
- Directus Content Versioning: `https://directus.io/docs/guides/content/content-versioning`
- Directus Flows: `https://directus.io/docs/guides/automate/flows`
- Directus pricing/licensing: `https://directus.io/pricing/`
- Sanity Studio deployment: `https://www.sanity.io/docs/studio/deployment`
- Sanity Astro integration: `https://www.sanity.io/docs/astro/configure-sanity-astro`
- Sanity Visual Editing with Astro: `https://www.sanity.io/docs/astro/astro-visual-editing`
- Sanity schema/content migrations: `https://www.sanity.io/docs/content-lake/schema-and-content-migrations`
- Sanity pricing/roles: `https://www.sanity.io/pricing`
- Storyblok Visual Editor: `https://www.storyblok.com/docs/concepts/visual-editor`
- Storyblok Blocks: `https://www.storyblok.com/docs/concepts/blocks`
- Storyblok Workflows: `https://www.storyblok.com/docs/manuals/workflows`
- Storyblok Roles: `https://www.storyblok.com/docs/concepts/roles`
- Storyblok Astro package: `https://www.storyblok.com/docs/packages/storyblok-astro`
- Storyblok pricing: `https://www.storyblok.com/pricing`
