# Kubtel.ru: план миграции контента в CMS

Дата: 2026-05-08.

Документ закрывает Prompt 08 из `docs/b2b-cms-design-token-prompt-pack.md`.

Статус: implementation-ready migration plan, Strapi runtime not connected yet.

Связанные документы:

- `docs/b2b-strategy-ia-funnel.md` - B2B-аудит, страницы переноса и conversion flow.
- `docs/cms-selection-adr.md` - ADR по выбору Strapi 5 self-hosted + PostgreSQL.
- `docs/cms-content-models.md` - модели, workflow, роли и import order.
- `docs/cms-integration-layer.md` - adapter boundary, fallback и preview strategy.
- `src/content.config.ts` - текущие local content collections.
- `src/lib/business/content.ts` - первый B2B seed content.
- `src/config/routes.ts` - текущие публичные маршруты, navigation и sitemap metadata.

## Цель

Перенести текущий контент Kubtel в CMS так, чтобы:

- не потерять SEO-вес старых `/legal/**` страниц;
- сохранить source attribution для каждого факта, цены, SLA, legal-текста и proof point;
- не публиковать неподтвержденные коммерческие данные как факты;
- дать редактору безопасный preview до переключения источника данных;
- сохранить fallback на local content через `src/lib/cms/`;
- не смешать B2B-заявки, B2C-заявки и операционные заявки ЦОД.

## Границы Prompt 08

Входит:

- migration checklist;
- URL redirect table;
- content freeze plan;
- CMS import order;
- ручная редакторская проверка;
- список данных, которые нельзя публиковать без подтверждения.

Не входит:

- локальный запуск Strapi runtime;
- создание Strapi collection types в админке;
- production webhook/rebuild;
- реализация 301 redirects в серверной конфигурации;
- перенос цен из коммерческих таблиц, пока Kubtel их не предоставил.

## Источники миграции

| Источник                         | Что мигрировать                                           | CMS target                                                                  | Стартовый статус                                                        | Владелец проверки                                | Блокеры                                                 |
| -------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| `src/content/tariffs/*.json`     | B2C тарифы, скорости, цены, опции, proof/commercialReview | `Tariff`, `TariffOption`, `ProofPoint`, `CommercialReview`                  | текущие значения `draft`/`needs_verification`                           | commercial reviewer                              | актуальные цены, НДС, условия подключения               |
| `src/content/services/*.json`    | B2C/general услуги: интернет, ТВ, статический IP          | `Service`, `FAQItem`, `ProofPoint`                                          | как в `contentSource.status`                                            | content editor                                   | публичная сверка описаний                               |
| `src/content/faq/*.json`         | FAQ первого контура                                       | `FAQItem`                                                                   | как в `proof.status`                                                    | content editor, legal reviewer при необходимости | юридическая формулировка согласий и персональных данных |
| `src/content/coverage/*.json`    | Черновая зона покрытия Краснодара                         | `CoverageArea`                                                              | `draft`/`needs_verification`                                            | coverage/operations                              | фактическая адресная база                               |
| `src/content/promos/*.json`      | Акции и условия                                           | `Promo`, `CommercialReview`                                                 | `draft`/`needs_verification`                                            | commercial reviewer                              | сроки, условия, правовая формулировка                   |
| `src/config/routes.ts`           | Page metadata, sitemap, header/footer                     | `Page`, `SeoMeta`, `NavigationItem`                                         | `needs_verification` для SEO copy, `confirmed` для текущих live routes  | content editor                                   | финальный production origin                             |
| `src/lib/business/content.ts`    | Видимый B2B seed: services, segments, proof strip         | `BusinessService`, `BusinessSegment`, `ProofPoint`, `Page`, `SeoMeta`       | `confirmed` только для публичных фактов, остальное `needs_verification` | content editor, commercial reviewer              | B2B цены, SLA, coverage, CRM routing                    |
| `docs/b2b-strategy-ia-funnel.md` | B2B IA, funnels, CRM payload, lead scoring                | `BusinessCalculator`, `LeadFormVariant`, `BusinessOffer`, `SLAFeature`      | `draft`/`needs_verification`                                            | commercial reviewer, developer                   | формулы, цены, pipeline, owner                          |
| Текущий публичный kubtel.ru      | Legacy B2B facts and old URL source attribution           | `ContentSource`, `ProofPoint`, `BusinessService`, `LegalDocument`           | `confirmed`, если факт найден публично                                  | content editor                                   | повторная публичная сверка перед импортом               |
| Будущие таблицы Kubtel           | Цены, SLA, опции, coverage, sales routing                 | `Tariff`, `BusinessOffer`, `CalculatorOption`, `SLAFeature`, `CoverageArea` | `confirmed` только после утверждения                                    | commercial reviewer, operations                  | входные файлы не предоставлены                          |

## Правила миграции

1. Все URL в CMS хранятся со trailing slash, как в Astro config.
2. CMS import не удаляет local JSON до успешного preview и fallback test.
3. Все факты получают `ContentSource` с `type`, `label`, `url`, `checkedAt`, `responsible` и `status`.
4. `confirmed` ставится только при наличии публичного источника или явного подтверждения Kubtel.
5. Цены, SLA, coverage, скидки, сроки подключения и legal copy не публикуются без review.
6. `Page.route` считается стабильным public contract. Менять route после публикации можно только через redirect map.
7. Редактор может менять текст и порядок approved blocks, но не raw HTML, scripts, inline CSS, CRM secrets или calculation code.
8. Astro получает только нормализованные internal types через `src/lib/cms/`, а не сырые Strapi responses.

## URL redirect table

Все redirects ниже должны быть `301 Permanent` после cutover. До production cutover старые URL можно оставить только как preview checklist.

| Старый URL                              | Новый URL                      | CMS target                                                          | Source attribution                                           | Publish gate                            | QA                                                                        |
| --------------------------------------- | ------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------- |
| `/legal/`                               | `/business/`                   | `Page`, `BusinessSegment`, `BusinessService`                        | `public_site:kubtel.ru/legal/`                               | B2B hub preview approved                | старый URL возвращает 301, новый 200, canonical указывает на `/business/` |
| `/legal/smallbusiness/inet/`            | `/business/internet/`          | `BusinessService`, `BusinessCalculator`, `FAQItem`                  | `public_site:kubtel.ru/legal/smallbusiness/inet/`            | speed/SLA/price marked or approved      | 301, title/description, CTA serviceInterest=internet                      |
| `/legal/smallbusiness/tel/`             | `/business/telephony/`         | `BusinessService`, `Tariff`, `TariffOption`, `BusinessCalculator`   | `public_site:kubtel.ru/legal/smallbusiness/tel/`             | phone tariffs and number rules reviewed | 301, no broken links, CTA serviceInterest=telephony                       |
| `/legal/smallbusiness/cctv/`            | `/business/cctv/`              | `BusinessService`, `HardwareItem`, `BusinessCalculator`, `FAQItem`  | `public_site:kubtel.ru/legal/smallbusiness/cctv/`            | camera/archive prices reviewed          | 301, hardware prices not shown as confirmed unless approved               |
| `/legal/smallbusiness/wifi/`            | `/business/wifi-auth/`         | `BusinessService`, `Tariff`, `LegalDocument`, `FAQItem`             | `public_site:kubtel.ru/legal/smallbusiness/wifi/`            | Wi-Fi legal basis reviewed              | 301, legal warning and consent text checked                               |
| `/legal/smallbusiness/datac/vserver/`   | `/business/vps/`               | `BusinessService`, `BusinessCalculator`, `CalculatorOption`         | `public_site:kubtel.ru/legal/smallbusiness/datac/vserver/`   | VPS prices/resources approved or hidden | 301, unknown prices show individual calculation                           |
| `/legal/smallbusiness/datac/vdi`        | `/business/vdi/`               | `BusinessService`, `BusinessCalculator`, `CalculatorOption`         | `public_site:kubtel.ru/legal/smallbusiness/datac/vdi`        | license/support terms reviewed          | 301, canonical uses `/business/vdi/`                                      |
| `/legal/smallbusiness/datac/colocation` | `/business/colocation/`        | `BusinessService`, `SLAFeature`, `BusinessCalculator`, `ProofPoint` | `public_site:kubtel.ru/legal/smallbusiness/datac/colocation` | power/SLA/access terms reviewed         | 301, colocation facts keep source/status                                  |
| `/legal/smallbusiness/datac/admission`  | `/business/datacenter-access/` | `Page`, `LeadFormVariant`, `LegalDocument`                          | `public_site:kubtel.ru/legal/smallbusiness/datac/admission`  | access workflow/legal reviewed          | 301, operational request is not routed as sales lead                      |
| `/legal/operators/`                     | `/business/operators/`         | `BusinessSegment`, `BusinessService`, `LeadFormVariant`             | `public_site:kubtel.ru/legal/operators/`                     | partner offer and NOC flow reviewed     | 301, serviceInterest=operators, pipeline=operators                        |
| `/legal/govsector`                      | `/business/government/`        | `BusinessSegment`, `BusinessSolution`, `LegalDocument`              | `public_site:kubtel.ru/legal/govsector`                      | legal/compliance wording approved       | 301, no unverified compliance claims                                      |

Notes:

- If old URLs exist both with and without trailing slash, both variants must redirect to the canonical new URL.
- Query params and UTM tags must be preserved.
- The sitemap must include only new `/business/**` URLs after cutover.
- Old `/legal/**` pages should not be kept as duplicate indexable pages.

## Current routes to CMS Page mapping

| Route          | CMS model                                                       | Page type     | Initial workflow                                                  | Source                                                          |
| -------------- | --------------------------------------------------------------- | ------------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| `/`            | `Page`, `SeoMeta`                                               | `home`        | `ready_for_review`                                                | `src/pages/index.astro`, `src/config/routes.ts`                 |
| `/tariffs/`    | `Page`, `Tariff`, `TariffOption`                                | `tariffs`     | `commercial_approved` only after price review                     | `src/content/tariffs/*.json`                                    |
| `/connect/`    | `Page`, `LeadFormVariant`, `CoverageArea`                       | `b2c_connect` | `legal_approved` required for consent                             | `src/pages/connect.astro`, `src/lib/leads/schema.ts`            |
| `/support/`    | `Page`, `FAQItem`                                               | `support`     | `ready_for_review`                                                | `src/content/faq/*.json`                                        |
| `/about/`      | `Page`                                                          | `about`       | `ready_for_review`                                                | `src/pages/about.astro`                                         |
| `/contacts/`   | `Page`                                                          | `contacts`    | `ready_for_review`                                                | `src/pages/contacts.astro`                                      |
| `/business/**` | `Page`, `BusinessService`, `BusinessSegment`, `LeadFormVariant` | `business_*`  | `commercial_approved` or visible `needs_verification` disclaimers | `src/lib/business/content.ts`, `docs/b2b-strategy-ia-funnel.md` |

## Model mapping details

| CMS model            | Import source                            | Required transform                                                                                 | Client-safe fields                               | Private/server-only fields            |
| -------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------- |
| `Page`               | routes config, Astro pages, B2B IA       | normalize route, pageType, hero, section refs                                                      | title, route, hero, sections, related entities   | internal notes, unpublished sections  |
| `NavigationItem`     | `mainNavItems`, `footerNavItems`, B2B IA | split by area: main, footer, business                                                              | label, href, visibility, sortOrder               | role restrictions                     |
| `SeoMeta`            | `sitemapRoutes`, B2B SEO drafts          | enforce title/description length and canonical                                                     | title, description, robots, schemaType           | experiments not approved              |
| `Tariff`             | local tariffs JSON, commercial tables    | map `availableOptions` to `TariffOption` relations                                                 | title, speed, public price if approved, benefits | margin/cost, private commercial notes |
| `TariffOption`       | local tariff fields, commercial tables   | create canonical options: router, static IP, TV, backup, voice, camera, VPS, colocation, Wi-Fi SMS | label, unit, public price/status                 | supplier cost, margin                 |
| `Service`            | local services JSON                      | keep B2C/general services separate from B2B                                                        | description, facts, benefits                     | internal notes                        |
| `BusinessService`    | B2B audit, visible B2B seed              | map proof points, CTA, related segments, calculators                                               | summary, benefit, proof statuses, CTA            | launch blockers                       |
| `BusinessSegment`    | B2B positioning matrix                   | map pains, triggers, service bundles, form variant                                                 | audience, pains, triggers, CTA                   | persona research notes                |
| `BusinessOffer`      | commercial tables, B2B funnel            | import only after price/terms review                                                               | offer label, public estimate/status              | discount logic, approval notes        |
| `BusinessCalculator` | B2B funnel, future Prompt 12 formulas    | formulaVersion must match code                                                                     | title, type, disclaimer, options                 | private formula notes if sensitive    |
| `CalculatorOption`   | commercial option tables                 | fieldKey must match code enum                                                                      | public label, constraints, price/status          | cost/margin                           |
| `HardwareItem`       | CCTV/public site, commercial tables      | require usage/source for camera specs                                                              | title, specs, approved public price              | supplier terms                        |
| `SLAFeature`         | public site, SLA docs                    | confirmed requires metric, scope and source                                                        | public SLA label/status                          | internal escalation rules             |
| `FAQItem`            | local FAQ, B2B FAQ drafts                | attach related services and proof                                                                  | question, answer, category                       | reviewer notes                        |
| `CoverageArea`       | local coverage JSON, operations tables   | add B2B types: `business_center`, `datacenter`                                                     | city, district, status, contact hint             | raw address database if restricted    |
| `Promo`              | local promos JSON, commercial tables     | require commercial review before active                                                            | public promo text and dates                      | unpublished promo rules               |
| `LeadFormVariant`    | lead schemas, B2B funnel                 | map fields, requiredFields, routingKey, pipeline                                                   | labels, options, consent reference               | CRM routing internals beyond safe key |
| `LegalDocument`      | legal texts from Kubtel                  | version and effectiveDate required                                                                 | approved public legal body                       | draft legal comments                  |
| `DesignTheme`        | current visual system, Prompt 10 later   | import only governed choices                                                                       | allowed enum choices                             | raw token values                      |
| `DesignTokenSet`     | Prompt 09/18 later                       | source of truth after token build                                                                  | generated CSS refs/status                        | locked token governance notes         |

## Content freeze plan

| Phase                   | Timing           | Action                                                                            | Owner                    | Output                         |
| ----------------------- | ---------------- | --------------------------------------------------------------------------------- | ------------------------ | ------------------------------ |
| Pre-freeze inventory    | T-5 working days | Export current local JSON, routes config, B2B seed and public old URL checklist   | developer                | migration snapshot branch/tag  |
| Editorial freeze        | T-3 working days | Stop non-critical text edits outside CMS import branch                            | content editor           | frozen source list             |
| Commercial freeze       | T-3 working days | Freeze prices, promos, SLA, calculator options and B2B offers                     | commercial reviewer      | signed commercial source table |
| Legal freeze            | T-2 working days | Freeze consent, privacy, Wi-Fi legal, ЦОД access and government wording           | legal reviewer           | signed legal source table      |
| CMS import              | T-2 to T-1       | Import in dependency order, keep all new entries unpublished or preview-only      | developer/content editor | CMS preview content            |
| Preview QA              | T-1              | Review mobile/desktop preview, forms, SEO, source statuses and redirects          | all reviewers            | QA checklist with blockers     |
| Cutover                 | Launch day       | Enable CMS provider for production, deploy redirects, rebuild sitemap             | developer                | production CMS-backed site     |
| Post-cutover monitoring | Launch day + 1   | Check forms/outbox, 404/redirect logs, analytics, search console after deployment | developer/sales          | launch readiness update        |

Freeze exception rule:

- Emergency legal/commercial corrections are allowed during freeze, but must be applied both to CMS and migration source snapshot.
- Cosmetic copy edits wait until after cutover unless they unblock launch.

## CMS import order

1. Create reusable components and enums in Strapi according to `docs/cms-content-models.md`.
2. Import `ContentSource`, proof/status values and common review components.
3. Import `LegalDocument` placeholders for consent/privacy, with `workflowStatus=draft` until Kubtel legal confirms them.
4. Import `SeoMeta` and `Page` records for existing B2C routes.
5. Import `NavigationItem` for header, footer and B2B navigation, initially `isVisible=false` in CMS preview until page records exist.
6. Import `TariffOption`, then `Tariff`.
7. Import `Service`.
8. Import `FAQItem`.
9. Import `CoverageArea`.
10. Import `Promo`.
11. Import `BusinessSegment`.
12. Import `BusinessService`.
13. Import `SLAFeature`, `HardwareItem` and `CaseStudy` placeholders only if source is available.
14. Import `BusinessCalculator` and `CalculatorOption` with `pricingStatus=needs_verification` until Prompt 12 formulas/prices are approved.
15. Import `BusinessOffer` only for approved commercial offers, otherwise keep as `draft`.
16. Import `LeadFormVariant` for B2C, B2B, operator partner and datacenter access flows.
17. Import `DesignTheme` governed settings after Prompt 10; do not import raw design tokens before Prompt 09/18.
18. Publish only after preview QA, source status review and redirects are ready.

## Что нельзя публиковать без подтверждения

Commercial review required:

- B2C and B2B prices, promo prices, discounts, connection fees, installation fees.
- Speed guarantees, symmetric bandwidth wording if tied to a paid plan.
- SLA values: reaction time, restoration time, uptime, support hours, NOC escalation.
- B2B calculator formulas and thresholds.
- Equipment prices, rental prices, warranty terms and stock claims.
- Colocation power, port, IP, remote hands and access prices.
- Operator partner terms, port speeds, peering/transit/cross-connect commercial rules.

Operations/coverage review required:

- Address availability, business center availability, private sector coverage.
- Build timelines and connection dates.
- Datacenter access rules, emergency flow and authorized requester checks.
- Monitoring claims that imply operational responsibility.

Legal review required:

- Consent and personal data text.
- Privacy policy and legal entity details.
- Public Wi-Fi identification wording and legal basis.
- CCTV personal data/security wording.
- Government sector compliance, procurement, certificates and protected channel claims.
- Case studies, client names and logos.

Content that may ship with visible `needs_verification` status:

- High-level service descriptions based on public legacy pages.
- Proof points that are public but need fresher commercial wording.
- Draft B2B page copy that does not state unconfirmed price/SLA/compliance facts.

Content that must stay unpublished:

- Internal reviewer notes.
- Supplier costs, margins and unpublished discounts.
- CRM pipeline internals, webhook URLs, tokens and anti-spam signals.
- Raw address database if it contains restricted or personal data.

## Ручная редакторская проверка

Review order:

1. Content editor checks route, title, hero, sections, CTA, proof statuses and source links.
2. Commercial reviewer checks all prices, SLA, options, calculators, offers and sales claims.
3. Legal reviewer checks consent, personal data, Wi-Fi, CCTV, ЦОД access and government copy.
4. Developer checks adapter normalization, preview mode, private-field stripping and route integrity.
5. Sales owner checks CRM routing, B2B pipeline, Telegram/outbox fallback and response SLA.

Minimum page checklist:

- Page route exists once and has trailing slash.
- `SeoMeta.title` and `SeoMeta.description` are unique.
- Canonical points to the new public route.
- All factual claims have `ContentSource`.
- No `draft` fact is shown without visible status or hidden from public.
- Primary CTA points to the correct lead form variant.
- Related services use valid slugs.
- FAQ items have proof/source status.
- Preview works on mobile and desktop.
- Page is present in sitemap only when intended to be indexable.

## Redirect QA checklist

- Old URL returns `301`, not `302`.
- Redirect target returns `200`.
- Query params and UTM tags are preserved.
- No redirect chains longer than one hop.
- Old `/legal/**` pages are absent from sitemap.
- New `/business/**` pages have canonical self-reference.
- Internal links point directly to new URLs, not to old URLs.
- 404/redirect logs are monitored during first production day.

## CMS import QA checklist

- Strapi entries validate against internal Zod schemas through adapter tests.
- `CMS_PROVIDER=strapi` preview can load pages with `CMS_FALLBACK_TO_LOCAL=true`.
- With Strapi unavailable, local fallback still renders existing routes.
- Private fields are stripped before reaching Astro components.
- B2B and B2C lead form variants keep separate `leadType`, `routingKey` and `crmPipeline`.
- Calculator options with unknown prices return `requiredConsultation=true` in future calculator code.
- `workflowStatus=published` is not set for commercial/legal-sensitive entries without approval.
- `verificationStatus=confirmed` always has source attribution.
- Generated sitemap includes CMS routes and no duplicate legacy routes.

## Rollback plan

1. Keep local JSON and `src/lib/business/content.ts` until two successful CMS-backed production deploys.
2. Keep `.env` default `CMS_PROVIDER=local` for local development.
3. If CMS preview fails, set `CMS_PROVIDER=local` and rebuild.
4. If Strapi data is partially broken, keep `CMS_FALLBACK_TO_LOCAL=true` and inspect server logs.
5. If redirects are wrong after cutover, revert redirect config first; do not roll back content unless pages are broken.

## Acceptance checklist

- [x] Mapping старых `/legal/**` URL к новым `/business/**` URL зафиксирован.
- [x] Current local JSON mapped to CMS models.
- [x] B2B seed content mapped to `BusinessService`, `BusinessSegment`, `LeadFormVariant` and future calculators.
- [x] Source attribution and proof statuses are mandatory migration rules.
- [x] Redirect map defines 301 behavior, canonical targets and QA checks.
- [x] Content freeze plan defines editorial, commercial, legal, import and cutover phases.
- [x] CMS import order reflects dependencies between models.
- [x] List of non-publishable/unconfirmed content is explicit.
- [x] Manual editorial QA checklist is ready for managers and reviewers.

## Следующий шаг

Prompt 09 should turn current CSS variables into a token source of truth before deeper B2B UI/calculator work, so CMS-governed design choices can reference approved semantic/component tokens instead of raw CSS values.
