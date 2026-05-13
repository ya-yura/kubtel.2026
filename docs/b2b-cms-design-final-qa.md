# B2B, CMS и дизайн-токены: Prompts 10-20

Документ закрывает артефакты Prompts 10-20: design governance, B2B UI contracts, calculators, forms/CRM, copy, SEO, CMS MVP, token implementation, editor guide и финальный QA.

## Prompt 10: Design Governance

### DesignTheme CMS model

Модель добавлена в Strapi scaffold: `cms/strapi/src/api/design-theme/content-types/design-theme/schema.json`.

Редактору доступны только governed presets:

- `pageAccent`: `default`, `business`, `critical`;
- `heroVariant`: `standard`, `business`, `compact`, `proof-led`;
- `sectionDensity`: `comfortable`, `compact`, `dense`;
- `ctaVariant`: `primary`, `secondary`, `business`, `critical`;
- `serviceCardLayout`: `grid`, `list`, `comparison`;
- `proofVisibility`: boolean.

### Token levels

| Уровень                 | Кто меняет            | Примеры                                                             |
| ----------------------- | --------------------- | ------------------------------------------------------------------- |
| Locked tokens           | разработчик/дизайнер  | primitive colors, typography, spacing, radius, shadows, breakpoints |
| Governed tokens         | дизайнер + CMS preset | business accents, CTA variants, proof visibility, density           |
| Content styling choices | редактор из списка    | hero variant, card layout, media position, section density          |

### Permission matrix

| Роль                | Контент     | Цены/SLA | Юридика | DesignTheme         | Publish |
| ------------------- | ----------- | -------- | ------- | ------------------- | ------- |
| admin               | да          | да       | да      | да                  | да      |
| developer           | нет         | нет      | нет     | да                  | нет     |
| content_editor      | да          | нет      | нет     | только выбор preset | нет     |
| commercial_reviewer | комментарии | да       | нет     | нет                 | нет     |
| legal_reviewer      | комментарии | нет      | да      | нет                 | нет     |

### Contrast safety rules

- Редактор не вводит raw цвета.
- CTA colors выбираются только из token presets.
- `critical` accent используется только для ошибок, юридических предупреждений и недоступности.
- Preview QA должен проверить mobile, focus states, длинные CTA и proof/status badges.

## Prompt 11: B2B UI contracts

| Component               | Назначение             | Data contract                                       | States                             | Analytics                                | Token usage                         |
| ----------------------- | ---------------------- | --------------------------------------------------- | ---------------------------------- | ---------------------------------------- | ----------------------------------- |
| BusinessHero            | вход в B2B hub/service | title, benefit, CTA, proof strip                    | default, service, segment          | `b2b_hero_view`                          | business hero/component card tokens |
| BusinessServiceGrid     | выбор услуги           | `BusinessService[]`                                 | empty, loaded                      | `b2b_service_card_view`                  | card/action tokens                  |
| BusinessServiceCard     | карточка услуги        | slug, title, summary, proof, CTA                    | hover/focus                        | `b2b_service_click`                      | card/button tokens                  |
| BusinessProofStrip      | факты и статусы        | label, value, status                                | confirmed/needs_verification/draft | `b2b_proof_view`                         | business proof tokens               |
| BusinessCalculatorShell | оболочка расчета       | calculator type, options, result                    | calculated, individual, error      | `b2b_calculator_change`                  | form/status/card tokens             |
| B2BLeadForm             | заявка                 | company, contact, segment, service, urgency, config | success/error/rate limit           | `b2b_lead_submitted`, `b2b_lead_success` | form/button/status tokens           |
| StickyBusinessCTA       | мобильный быстрый CTA  | route, label                                        | visible/hidden                     | `b2b_sticky_cta_click`                   | sticky/button tokens                |

Доступность: все формы используют native controls, обязательные поля, keyboard focus, success/error status. Mobile first: B2B hub, service pages and request page collapse into single-column flows.

## Prompt 12: B2B calculators

Расчет отделен от UI в `src/lib/business/calculators.ts`.

Реализованы pure functions:

- `calculateInternetOffice`;
- `calculateTelephony`;
- `calculateCctv`;
- `calculateVps`;
- `calculateVdi`;
- `calculateColocation`;
- `calculateWifiAuth`.

Единый result contract:

```ts
{
  monthly: number | null;
  oneTime: number | null;
  unknownItems: string[];
  requiredConsultation: boolean;
  summary: string;
  details: Record<string, unknown>;
}
```

Если цена отсутствует, `unknown` или `needs_verification`, расчет помечается как индивидуальный и передает `unknownItems` в CRM payload.

Тесты: `src/lib/business/calculators.test.ts`.

## Prompt 13: B2B forms, CRM routing and analytics

B2B schema: `src/lib/leads/business-schema.ts`.

Payload builder: `src/lib/leads/business-submission.ts`.

Отдельные признаки:

- `leadType: "b2b"`;
- `qualification.leadScore`;
- `qualification.qualification`;
- `qualification.priority`;
- `routing.pipeline`: `b2b`, `operators`, `datacenter`;
- `configuration.monthlyEstimate`;
- `configuration.oneTimeEstimate`;
- `configuration.unknownItems`.

Delivery:

- CRM: общий server adapter получает расширенный B2B payload.
- Telegram: B2B summary включает компанию, ИНН, услугу, срочность, score, pipeline и конфигурацию.
- Outbox: сохраняет заявку, если внешние каналы упали или не настроены.
- Analytics: `b2b_lead_submitted`, `b2b_lead_success`, `b2b_lead_delivery_failed`, `b2b_lead_spam_blocked`.

Тесты: `src/lib/leads/business-submission.test.ts`, `src/lib/business/lead-scoring.test.ts`.

## Prompt 14: B2B copy

Копирайтинг в B2B MVP строится на подтверждаемых фактах и снижении риска. Запрещены формулы "лучший", "индивидуальный подход", "высокое качество" без процесса или доказательства.

| Услуга            | Headline                    | Proof status                        |
| ----------------- | --------------------------- | ----------------------------------- |
| internet          | Интернет в офис             | SLA needs_verification              |
| telephony         | Телефония и IP-телефония    | CRM integration needs_verification  |
| cctv              | Видеонаблюдение для бизнеса | монтаж needs_verification           |
| wifi-auth         | Wi-Fi авторизация           | юридическая база needs_verification |
| vps               | VPS/VDS                     | backup/SLA needs_verification       |
| vdi               | Виртуальные рабочие места   | лицензии ПО needs_verification      |
| colocation        | Colocation                  | ключевые факты confirmed            |
| datacenter-access | Доступ в ЦОД                | права заявителя needs_verification  |
| operators         | Операторам связи            | партнерские условия require review  |
| government        | Государственному сектору    | юридическая сверка required         |

Источник: `src/lib/business/content.ts`.

## Prompt 15: B2B SEO

SEO routes включены в `src/config/routes.ts` и sitemap:

- `/business/`;
- `/business/internet/`;
- `/business/telephony/`;
- `/business/cctv/`;
- `/business/wifi-auth/`;
- `/business/vps/`;
- `/business/vdi/`;
- `/business/colocation/`;
- `/business/datacenter-access/`;
- `/business/smb/`;
- `/business/operators/`;
- `/business/government/`;
- `/business/request/`.

Schema:

- B2B hub emits `Service` + `OfferCatalog`.
- B2B service pages emit `Service`.
- Segment pages emit `WebPage`.

Redirect map реализован в `src/lib/redirects/business-legacy.ts` и подключен через `src/middleware.ts`.

## Prompt 16: B2B MVP implementation

Статус: реализовано как отдельная конверсионная ветка.

- B2B hub and pages: implemented.
- B2B request form: implemented.
- CRM payload `leadType=b2b`: implemented.
- Calculator core: implemented.
- SEO metadata/schema/redirects: implemented.
- B2C routes preserved.

Ограничение: интерактивные калькуляторные UI еще представлены расчетным core и формой конфигурации; полноценные пошаговые UI-shells можно развить поверх готовых pure functions.

## Prompt 17: CMS MVP

Статус: repo scaffold implemented, production runtime not booted.

Реализовано:

- `cms/strapi/package.json`;
- Strapi content-type schemas for B2C+B2B;
- role/workflow baseline in `cms/strapi/config/kubtel-governance.json`;
- seed content in `cms/strapi/seed/kubtel-seed.json`;
- Astro CMS adapter and fallback in `src/lib/cms/**`;
- env example and README.

Не подтверждено без внешних доступов:

- PostgreSQL instance;
- Strapi admin users and actual role permissions;
- production CMS URL/API token;
- publish webhooks.

## Prompt 18: Token implementation

Реализовано:

- token sources: `src/design/tokens/**`;
- build script: `scripts/build-tokens.mjs`;
- generated CSS: `src/styles/tokens.css`;
- scripts: `npm run tokens:build`, `npm run tokens:check`;
- `BaseLayout.astro` imports tokens before global styles;
- `global.css` migrated to semantic/component tokens where reasonable;
- raw hex guard for source `.astro`/`.css` files excluding generated `tokens.css`;
- theme-ready structure with `themes/light.json` and `themes/dark.json`.

## Prompt 19: Editor guide

Готово: `docs/editor-guide.md`.

## Prompt 20: Final QA report

### Local checks

Перед сдачей должны пройти:

- `npm run tokens:check`;
- `npm run format:check`;
- `npm test`;
- `npm run check`;
- `npm run build`;
- `npm run launch:check`;
- `npm run test:ux` при поднятом dev server.

### Blocker list

Production launch пока нельзя подтвердить без:

- актуальных тарифов/цен/опций;
- адресной базы покрытия;
- SLA и юридических текстов;
- production CRM/Telegram/analytics env;
- production domain/DNS/SSL/redirect verification;
- фактического sales feedback loop.

### Acceptance status

B2B-заявки квалифицируются и измеряются отдельно от B2C: implemented locally. Production delivery and sales-loop confirmation remain external.
