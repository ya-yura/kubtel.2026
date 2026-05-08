# Kubtel.ru: CMS-модели для Strapi-first POC

Дата: 2026-05-08.

Документ закрывает Prompt 06 из `docs/b2b-cms-design-token-prompt-pack.md`.

Статус: implementation-ready design, CMS not connected yet.

Связанные документы:

- `docs/cms-selection-adr.md` - CMS ADR, Strapi 5 self-hosted + PostgreSQL выбран как основной POC.
- `docs/b2b-strategy-ia-funnel.md` - B2B-услуги, маршруты, воронки и CRM payload.
- `src/content.config.ts` - текущие Astro content collections.
- `src/types/domain.ts` - текущие frontend domain types.
- `src/lib/leads/schema.ts` - текущая B2C lead schema.

## Цель

CMS должна позволить редакторам Kubtel менять контент без Git и не ломать Astro-компоненты. Поэтому модели проектируются в двух слоях:

1. **CMS layer** - Strapi collection/single types, relations, components, media, roles and workflow fields.
2. **Internal layer** - нормализованные TypeScript/Zod contracts, которые получает Astro через будущий `src/lib/cms/` adapter.

Astro-компоненты не должны знать, что источник данных - Strapi. Они должны работать с внутренними типами, совместимыми с текущими local content collections.

## Общие соглашения

### Workflow

Все publishable-модели получают поле `workflowStatus`:

```text
draft -> ready_for_review -> commercial_approved -> legal_approved -> published -> archived
```

Правила:

- `published` разрешен только после нужных review stages.
- Для моделей без коммерческих данных достаточно `ready_for_review -> legal_approved -> published`.
- Для тарифов, опций, калькуляторов, SLA и офферов обязателен `commercial_approved`.
- Для legal documents, consent text и Wi-Fi authorization legal copy обязателен `legal_approved`.
- Strapi Draft & Publish используется как техническое состояние публикации; Kubtel workflow хранится отдельным полем, чтобы не зависеть от платных Review Workflows на старте.

### Proof status

Все факты, цены, SLA, coverage и юридические утверждения получают `verificationStatus`:

```text
confirmed | needs_verification | draft
```

`confirmed` нельзя ставить без source attribution.

### Роли

| Роль                | Что редактирует                                                        | Что утверждает                 |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| Admin               | все модели, роли, публикации                                           | технический emergency override |
| Developer           | схемы, adapter mapping, design tokens, protected fields                | technical readiness            |
| Content editor      | страницы, FAQ, услуги, навигация, медиа, черновики                     | editorial ready                |
| Commercial reviewer | тарифы, цены, опции, SLA, калькуляторы, B2B offers                     | commercial approved            |
| Legal reviewer      | согласия, оферты, персональные данные, публичный Wi-Fi, гос/ЦОД тексты | legal approved                 |

### Private/server-only fields

Нельзя отдавать на клиент:

- reviewer notes, internal notes, unpublished prices;
- CRM routing internals beyond public form choice;
- API tokens, webhook URLs, secrets;
- private legal/commercial comments;
- anti-spam fields and internal lead scoring weights;
- original CMS audit metadata, если оно не нужно пользователю.

## Таблица моделей

В таблице `*` означает обязательное поле.

| Model              | Strapi type          | Поля и типы                                                                                                                                                                                                                                                                                                                                                                                                              | Связи                                                                                                                  | Кто редактирует                                 | Workflow/validation                                                                             | Astro usage                                                   | Не отдавать на клиент                         |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------- |
| Page               | collection           | `title:string*`, `slug:uid*`, `route:string*`, `pageType:enum*`, `hero:component`, `sections:dynamicZone`, `seo:component*`, `theme:relation`, `workflowStatus:enum*`, `verificationStatus:enum*`, `publishedAt:datetime`                                                                                                                                                                                                | NavigationItem, SeoMeta, DesignTheme, BusinessService, BusinessSegment, FAQItem                                        | content editor                                  | unique route, route starts `/`, published requires seo and allowed sections                     | route metadata, page rendering, sitemap                       | internalNotes, draft sections without preview |
| NavigationItem     | collection           | `label:string*`, `href:string*`, `area:enum*`, `parent:relation`, `sortOrder:int*`, `isVisible:boolean*`, `ctaVariant:enum`, `workflowStatus:enum*`                                                                                                                                                                                                                                                                      | Page, parent NavigationItem                                                                                            | content editor                                  | href must be internal or approved external URL                                                  | header, footer, B2B subnav, mobile menu                       | role restrictions, internal notes             |
| SeoMeta            | component            | `title:string*`, `description:text*`, `canonical:string`, `robots:enum*`, `ogTitle:string`, `ogDescription:text`, `ogImage:media`, `schemaType:enum*`, `lastModified:date*`, `priority:decimal`, `changeFrequency:enum`                                                                                                                                                                                                  | embedded in Page/Service                                                                                               | content editor, legal reviewer for legal pages  | title 30-70 chars, description 70-170 chars, canonical internal                                 | BaseLayout, sitemap, JSON-LD                                  | unpublished canonical experiments             |
| MediaAsset         | collection           | `title:string*`, `alt:string*`, `asset:media*`, `caption:text`, `usageRights:enum*`, `source:component*`, `verificationStatus:enum*`, `expiresAt:date`                                                                                                                                                                                                                                                                   | Page, Service, CaseStudy, HardwareItem                                                                                 | content editor, legal reviewer                  | alt required, usage rights required before publish                                              | images, OG images, galleries                                  | license notes, source contact                 |
| ProofPoint         | component/collection | `label:string*`, `value:string*`, `description:text`, `status:enum*`, `source:component*`, `reviewedAt:datetime`                                                                                                                                                                                                                                                                                                         | Service, BusinessService, SLAFeature, CaseStudy                                                                        | content editor, commercial reviewer             | confirmed requires source label and checkedAt                                                   | proof strips, cards, status badges                            | reviewerNotes                                 |
| ContentSource      | component            | `status:enum*`, `type:enum*`, `label:string*`, `url:string`, `checkedAt:datetime`, `responsible:enum*`, `note:text`                                                                                                                                                                                                                                                                                                      | embedded in most models                                                                                                | content editor, reviewer                        | confirmed requires checkedAt and responsible                                                    | status labels, internal QA                                    | private source notes if marked internal       |
| CommercialReview   | component            | `status:enum*`, `priceStatus:enum*`, `speedStatus:enum`, `optionsStatus:enum`, `connectionStatus:enum`, `requiredEvidence:string[]`, `reviewedBy:string`, `reviewedAt:datetime`, `note:text`                                                                                                                                                                                                                             | Tariff, BusinessOffer, CalculatorOption                                                                                | commercial reviewer                             | published commercial entities require status confirmed or visible needs_verification disclaimer | prelaunch audit, UI data badges                               | reviewedBy, note, requiredEvidence            |
| Tariff             | collection           | `title:string*`, `slug:uid*`, `audience:string[]`, `market:enum*`, `serviceCategory:enum*`, `speedDownload:int`, `speedUpload:int`, `priceMonth:int`, `promoPrice:int`, `promoPeriod:string`, `benefitDescription:text*`, `bestFor:string[]`, `includedServices:string[]`, `isFeatured:boolean`, `sortOrder:int*`, `proof:component*`, `contentSource:component*`, `commercialReview:component*`, `workflowStatus:enum*` | TariffOption, Service, BusinessService, CoverageArea, Promo                                                            | commercial reviewer, content editor             | unique slug, price non-negative, B2B price may be null with `priceStatus=needs_verification`    | tariff cards, service pages, calculators, OfferCatalog        | internal price notes, unpublished promo rules |
| TariffOption       | collection           | `title:string*`, `slug:uid*`, `optionType:enum*`, `unit:enum*`, `priceMonthly:int`, `priceOneTime:int`, `isPublic:boolean*`, `constraints:json`, `commercialReview:component*`, `contentSource:component*`, `workflowStatus:enum*`                                                                                                                                                                                       | Tariff, BusinessCalculator, CalculatorOption                                                                           | commercial reviewer                             | price can be null only if requiredConsultation=true                                             | option selectors, pricing, CRM summary                        | margin/cost, supplier notes                   |
| Service            | collection           | `title:string*`, `slug:uid*`, `category:string*`, `shortDescription:text*`, `fullDescription:richtext*`, `facts:component[]`, `benefits:string[]`, `contentSource:component*`, `workflowStatus:enum*`                                                                                                                                                                                                                    | Tariff, FAQItem, Page                                                                                                  | content editor                                  | published requires at least one benefit and source                                              | current B2C/home service cards and schema                     | internal notes                                |
| BusinessService    | collection           | `title:string*`, `slug:uid*`, `category:enum*`, `summary:text*`, `businessBenefit:text*`, `proofPoints:component[]`, `ctaLabel:string*`, `priority:enum*`, `sourceUrl:string`, `workflowStatus:enum*`, `verificationStatus:enum*`                                                                                                                                                                                        | BusinessSegment, BusinessCalculator, Tariff, TariffOption, SLAFeature, FAQItem, CaseStudy, HardwareItem, LegalDocument | content editor, commercial reviewer             | P0 services require calculator/form variant before publish                                      | `/business/{service}/`, service grids, schema                 | internal launch blockers                      |
| BusinessSegment    | collection           | `title:string*`, `slug:uid*`, `audience:string[]`, `painPoints:string[]`, `triggers:string[]`, `primaryCta:string*`, `formFields:json`, `workflowStatus:enum*`                                                                                                                                                                                                                                                           | BusinessService, BusinessSolution, BusinessOffer, LeadFormVariant, Page                                                | content editor                                  | published requires at least one related service and CTA                                         | `/business/smb/`, `/operators/`, `/government/`, tabs         | persona research notes                        |
| BusinessSolution   | collection           | `title:string*`, `slug:uid*`, `problem:text*`, `solution:text*`, `includedServices:string[]`, `implementationSteps:string[]`, `proofPoints:component[]`, `workflowStatus:enum*`                                                                                                                                                                                                                                          | BusinessSegment, BusinessService, CaseStudy, BusinessOffer                                                             | content editor, commercial reviewer             | no unapproved price claims in solution copy                                                     | solution blocks and bundles                                   | internal delivery assumptions                 |
| BusinessOffer      | collection           | `title:string*`, `slug:uid*`, `offerType:enum*`, `description:text*`, `validFrom:date`, `validTo:date`, `priceLabel:string`, `monthlyEstimate:int`, `oneTimeEstimate:int`, `unknownItems:string[]`, `commercialReview:component*`, `workflowStatus:enum*`                                                                                                                                                                | BusinessService, BusinessSegment, Tariff, TariffOption, LeadFormVariant                                                | commercial reviewer                             | active offer requires dates or evergreen flag; price requires approval                          | offer cards, CTA blocks, CRM payload defaults                 | discount logic, internal approval notes       |
| BusinessCalculator | collection           | `title:string*`, `slug:uid*`, `calculatorType:enum*`, `formulaVersion:string*`, `disclaimer:text*`, `requiredConsultation:boolean*`, `pricingStatus:enum*`, `workflowStatus:enum*`                                                                                                                                                                                                                                       | BusinessService, CalculatorOption, TariffOption, HardwareItem, LeadFormVariant                                         | developer, commercial reviewer                  | formulaVersion matches code; publish requires test matrix                                       | calculator shells, analytics mapping                          | formula internals if sensitive                |
| CalculatorOption   | collection           | `title:string*`, `slug:uid*`, `fieldKey:string*`, `inputType:enum*`, `valueType:enum*`, `unit:string`, `min:number`, `max:number`, `step:number`, `defaultValue:json`, `priceMonthly:int`, `priceOneTime:int`, `requiredConsultation:boolean`, `sortOrder:int*`, `commercialReview:component*`, `workflowStatus:enum*`                                                                                                   | BusinessCalculator, TariffOption, HardwareItem                                                                         | commercial reviewer, developer                  | fieldKey matches code enum; min <= max                                                          | calculator UI, pure calculation functions, CRM details        | cost/margin, hidden constraints               |
| HardwareItem       | collection           | `title:string*`, `slug:uid*`, `hardwareType:enum*`, `model:string`, `specs:json`, `price:int`, `rentalPrice:int`, `warranty:text`, `media:relation`, `commercialReview:component*`, `workflowStatus:enum*`                                                                                                                                                                                                               | BusinessService, BusinessCalculator, MediaAsset                                                                        | commercial reviewer, content editor             | price/stock status required for public offers                                                   | CCTV camera cards, router options, colocation equipment hints | supplier, stock notes                         |
| SLAFeature         | collection           | `title:string*`, `slug:uid*`, `metric:string*`, `value:string*`, `scope:text*`, `status:enum*`, `source:component*`, `workflowStatus:enum*`                                                                                                                                                                                                                                                                              | BusinessService, BusinessOffer, LegalDocument                                                                          | commercial reviewer, legal reviewer             | confirmed SLA requires source and legal review                                                  | SLA lists, proof strips, schema                               | internal escalation paths                     |
| CaseStudy          | collection           | `title:string*`, `slug:uid*`, `clientName:string`, `industry:string*`, `challenge:text*`, `solution:text*`, `results:component[]`, `publishedWithPermission:boolean*`, `media:relation`, `workflowStatus:enum*`                                                                                                                                                                                                          | BusinessSegment, BusinessService, ProofPoint, MediaAsset                                                               | content editor, legal reviewer                  | publish requires permission or anonymized mode                                                  | case cards, segment pages                                     | client contacts, private metrics              |
| FAQItem            | collection           | `question:string*`, `answer:richtext*`, `category:string*`, `priority:int*`, `relatedServices:string[]`, `proof:component*`, `contentSource:component*`, `workflowStatus:enum*`                                                                                                                                                                                                                                          | Service, BusinessService, BusinessSegment, LegalDocument                                                               | content editor, legal reviewer for legal topics | answer required, legal topics require legal approval                                            | FAQ sections, FAQPage schema                                  | legal draft notes                             |
| CoverageArea       | collection           | `title:string*`, `slug:uid*`, `type:enum*`, `city:string*`, `district:string`, `streets:string[]`, `houses:string[]`, `connectionStatus:enum*`, `availableTariffs:relation`, `availableServices:relation`, `contactHint:text*`, `contentSource:component*`, `workflowStatus:enum*`                                                                                                                                       | Tariff, BusinessService                                                                                                | coverage owner, commercial reviewer             | confirmed coverage requires checkedAt and responsible coverage                                  | address check, service availability hints                     | exact internal network notes                  |
| Promo              | collection           | `title:string*`, `slug:uid*`, `startDate:date*`, `endDate:date`, `description:text*`, `conditions:string[]`, `ctaLabel:string*`, `targetArea:string`, `proof:component*`, `contentSource:component*`, `commercialReview:component`, `workflowStatus:enum*`                                                                                                                                                               | Tariff, Service, BusinessService, BusinessSegment                                                                      | commercial reviewer, content editor             | active promo requires dates, conditions and review                                              | promo cards, banners, Offer schema                            | internal campaign margins                     |
| LeadFormVariant    | collection           | `title:string*`, `slug:uid*`, `leadType:enum*`, `formKey:string*`, `fields:json*`, `requiredFields:string[]`, `routingKey:string*`, `crmPipeline:enum*`, `telegramTemplate:string`, `consentDocument:relation*`, `workflowStatus:enum*`                                                                                                                                                                                  | BusinessService, BusinessSegment, LegalDocument                                                                        | developer, sales ops, legal reviewer            | fields must match server schema; consent required                                               | B2C/B2B forms, CRM payload, validation hints                  | routing secrets, anti-spam config             |
| LegalDocument      | collection           | `title:string*`, `slug:uid*`, `documentType:enum*`, `version:string*`, `body:richtext*`, `effectiveDate:date*`, `status:enum*`, `source:component*`, `workflowStatus:enum*`                                                                                                                                                                                                                                              | Page, LeadFormVariant, BusinessService, FAQItem                                                                        | legal reviewer                                  | published legal doc requires legal_approved and version                                         | consent text, policies, legal links                           | legal comments, negotiation notes             |
| DesignTheme        | collection/single    | `title:string*`, `slug:uid*`, `themeType:enum*`, `pageAccent:enum*`, `heroVariant:enum*`, `sectionDensity:enum*`, `ctaVariant:enum*`, `serviceCardLayout:enum*`, `proofVisibility:enum*`, `tokenSet:relation`, `workflowStatus:enum*`                                                                                                                                                                                    | Page, DesignTokenSet                                                                                                   | designer, developer                             | only allowed enum values; no raw colors                                                         | governed page design choices                                  | experimental variants                         |
| DesignTokenSet     | collection           | `title:string*`, `slug:uid*`, `version:string*`, `tokenScope:enum*`, `tokens:json*`, `generatedCssPath:string`, `status:enum*`, `workflowStatus:enum*`                                                                                                                                                                                                                                                                   | DesignTheme                                                                                                            | developer, designer                             | tokens validated by build script; no raw client edits                                           | token build, theme metadata                                   | unpublished token JSON if not public          |

## JSON/Zod-псевдосхемы

Эти схемы описывают внутренний contract. В Strapi поля могут быть relations/components, но adapter должен нормализовать их к этому виду.

```ts
import { z } from "zod";

export const verificationStatusSchema = z.enum(["confirmed", "needs_verification", "draft"]);
export const workflowStatusSchema = z.enum([
  "draft",
  "ready_for_review",
  "commercial_approved",
  "legal_approved",
  "published",
  "archived"
]);

export const moneySchema = z.object({
  amount: z.number().int().nonnegative().nullable(),
  currency: z.literal("RUB").default("RUB"),
  status: verificationStatusSchema
});

export const contentSourceSchema = z.object({
  status: verificationStatusSchema,
  type: z.enum([
    "kubtel_team",
    "public_site",
    "legacy_site",
    "technical_audit",
    "editorial_assumption"
  ]),
  label: z.string().min(2),
  url: z.string().url().nullable(),
  checkedAt: z.string().datetime().nullable(),
  responsible: z.enum([
    "commercial",
    "operations",
    "coverage",
    "content",
    "legal",
    "design",
    "developer"
  ]),
  note: z.string().default("")
});

export const proofPointSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  description: z.string().nullable(),
  status: verificationStatusSchema,
  source: contentSourceSchema
});

export const commercialReviewSchema = z.object({
  status: verificationStatusSchema,
  priceStatus: verificationStatusSchema,
  speedStatus: verificationStatusSchema.optional(),
  optionsStatus: verificationStatusSchema.optional(),
  connectionStatus: verificationStatusSchema.optional(),
  requiredEvidence: z.array(z.string()).default([]),
  reviewedBy: z.string().nullable(),
  reviewedAt: z.string().datetime().nullable(),
  note: z.string().default("")
});

export const seoMetaSchema = z.object({
  title: z.string().min(30).max(70),
  description: z.string().min(70).max(170),
  canonical: z.string().nullable(),
  robots: z.enum(["index_follow", "noindex_follow", "noindex_nofollow"]).default("index_follow"),
  schemaType: z
    .enum(["WebPage", "Service", "ContactPage", "AboutPage", "FAQPage"])
    .default("WebPage"),
  lastModified: z.string().date(),
  priority: z.number().min(0).max(1).default(0.5),
  changeFrequency: z.enum(["daily", "weekly", "monthly"]).default("monthly")
});

export const pageSchema = z.object({
  title: z.string(),
  slug: z.string(),
  route: z.string().startsWith("/"),
  pageType: z.enum([
    "home",
    "b2c",
    "business_hub",
    "business_segment",
    "business_service",
    "support",
    "legal"
  ]),
  hero: z.record(z.unknown()).nullable(),
  sections: z.array(z.record(z.unknown())).default([]),
  seo: seoMetaSchema,
  themeSlug: z.string().nullable(),
  workflowStatus: workflowStatusSchema,
  verificationStatus: verificationStatusSchema
});

export const navigationItemSchema = z.object({
  label: z.string().min(2).max(40),
  href: z.string().min(1),
  area: z.enum(["main", "footer", "business_subnav", "mobile"]),
  parentSlug: z.string().nullable(),
  sortOrder: z.number().int(),
  isVisible: z.boolean(),
  ctaVariant: z.enum(["none", "primary", "secondary"]).default("none"),
  workflowStatus: workflowStatusSchema
});

export const tariffOptionSchema = z.object({
  title: z.string(),
  slug: z.string(),
  optionType: z.enum([
    "router_rent",
    "static_ip",
    "tv_pack",
    "backup_channel",
    "voice_line",
    "camera_archive",
    "vps_backup",
    "colocation_port",
    "wifi_sms"
  ]),
  unit: z.enum(["month", "one_time", "unit", "minute", "gb", "port"]),
  priceMonthly: moneySchema,
  priceOneTime: moneySchema,
  isPublic: z.boolean(),
  constraints: z.record(z.unknown()).default({}),
  commercialReview: commercialReviewSchema,
  contentSource: contentSourceSchema,
  workflowStatus: workflowStatusSchema
});

export const tariffSchema = z.object({
  title: z.string(),
  slug: z.string(),
  market: z.enum(["b2c", "b2b"]),
  serviceCategory: z.enum([
    "internet",
    "tv",
    "telephony",
    "cctv",
    "wifi_auth",
    "vps",
    "vdi",
    "colocation"
  ]),
  audience: z.array(z.string()).default([]),
  speedDownload: z.number().int().nullable(),
  speedUpload: z.number().int().nullable(),
  priceMonth: moneySchema,
  promoPrice: moneySchema.nullable(),
  promoPeriod: z.string().nullable(),
  benefitDescription: z.string(),
  bestFor: z.array(z.string()).default([]),
  includedServices: z.array(z.string()).default([]),
  availableOptionSlugs: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int(),
  proof: proofPointSchema,
  contentSource: contentSourceSchema,
  commercialReview: commercialReviewSchema,
  workflowStatus: workflowStatusSchema
});

export const serviceSchema = z.object({
  title: z.string(),
  slug: z.string(),
  category: z.string(),
  shortDescription: z.string(),
  fullDescription: z.string(),
  facts: z.array(proofPointSchema).default([]),
  benefits: z.array(z.string()).default([]),
  relatedTariffSlugs: z.array(z.string()).default([]),
  contentSource: contentSourceSchema,
  workflowStatus: workflowStatusSchema
});

export const businessServiceSchema = z.object({
  title: z.string(),
  slug: z.string(),
  category: z.enum([
    "internet",
    "telephony",
    "cctv",
    "wifi_auth",
    "vps",
    "vdi",
    "colocation",
    "datacenter_access",
    "operators",
    "government"
  ]),
  summary: z.string(),
  businessBenefit: z.string(),
  proofPoints: z.array(proofPointSchema).default([]),
  ctaLabel: z.string(),
  priority: z.enum(["P0", "P1", "P2"]).default("P1"),
  relatedSegmentSlugs: z.array(z.string()).default([]),
  calculatorSlug: z.string().nullable(),
  formVariantSlug: z.string().nullable(),
  workflowStatus: workflowStatusSchema,
  verificationStatus: verificationStatusSchema
});

export const businessSegmentSchema = z.object({
  title: z.string(),
  slug: z.string(),
  audience: z.array(z.string()).default([]),
  painPoints: z.array(z.string()).default([]),
  triggers: z.array(z.string()).default([]),
  primaryCta: z.string(),
  relatedServiceSlugs: z.array(z.string()).default([]),
  formVariantSlug: z.string().nullable(),
  workflowStatus: workflowStatusSchema
});

export const businessSolutionSchema = z.object({
  title: z.string(),
  slug: z.string(),
  problem: z.string(),
  solution: z.string(),
  includedServiceSlugs: z.array(z.string()).default([]),
  implementationSteps: z.array(z.string()).default([]),
  proofPoints: z.array(proofPointSchema).default([]),
  workflowStatus: workflowStatusSchema
});

export const businessOfferSchema = z.object({
  title: z.string(),
  slug: z.string(),
  offerType: z.enum(["bundle", "promo", "individual", "operator_partner", "government"]),
  description: z.string(),
  validFrom: z.string().date().nullable(),
  validTo: z.string().date().nullable(),
  priceLabel: z.string().nullable(),
  monthlyEstimate: moneySchema,
  oneTimeEstimate: moneySchema,
  unknownItems: z.array(z.string()).default([]),
  relatedServiceSlugs: z.array(z.string()).default([]),
  commercialReview: commercialReviewSchema,
  workflowStatus: workflowStatusSchema
});

export const calculatorOptionSchema = z.object({
  title: z.string(),
  slug: z.string(),
  fieldKey: z.string(),
  inputType: z.enum(["select", "number", "checkbox", "radio", "slider"]),
  valueType: z.enum(["string", "number", "boolean"]),
  unit: z.string().nullable(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  step: z.number().nullable(),
  defaultValue: z.unknown().nullable(),
  priceMonthly: moneySchema,
  priceOneTime: moneySchema,
  requiredConsultation: z.boolean().default(false),
  sortOrder: z.number().int(),
  commercialReview: commercialReviewSchema,
  workflowStatus: workflowStatusSchema
});

export const businessCalculatorSchema = z.object({
  title: z.string(),
  slug: z.string(),
  calculatorType: z.enum([
    "internet",
    "telephony",
    "cctv",
    "vps",
    "vdi",
    "colocation",
    "wifi_auth"
  ]),
  formulaVersion: z.string(),
  disclaimer: z.string(),
  requiredConsultation: z.boolean(),
  pricingStatus: verificationStatusSchema,
  optionSlugs: z.array(z.string()).default([]),
  workflowStatus: workflowStatusSchema
});

export const hardwareItemSchema = z.object({
  title: z.string(),
  slug: z.string(),
  hardwareType: z.enum(["router", "camera", "server", "switch", "other"]),
  model: z.string().nullable(),
  specs: z.record(z.unknown()).default({}),
  price: moneySchema,
  rentalPrice: moneySchema.nullable(),
  warranty: z.string().nullable(),
  mediaSlug: z.string().nullable(),
  commercialReview: commercialReviewSchema,
  workflowStatus: workflowStatusSchema
});

export const slaFeatureSchema = z.object({
  title: z.string(),
  slug: z.string(),
  metric: z.string(),
  value: z.string(),
  scope: z.string(),
  status: verificationStatusSchema,
  source: contentSourceSchema,
  workflowStatus: workflowStatusSchema
});

export const caseStudySchema = z.object({
  title: z.string(),
  slug: z.string(),
  clientName: z.string().nullable(),
  industry: z.string(),
  challenge: z.string(),
  solution: z.string(),
  results: z.array(proofPointSchema).default([]),
  publishedWithPermission: z.boolean(),
  relatedServiceSlugs: z.array(z.string()).default([]),
  workflowStatus: workflowStatusSchema
});

export const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.string(),
  priority: z.number().int(),
  relatedServices: z.array(z.string()).default([]),
  proof: proofPointSchema,
  contentSource: contentSourceSchema,
  workflowStatus: workflowStatusSchema
});

export const coverageAreaSchema = z.object({
  title: z.string(),
  slug: z.string(),
  type: z.enum([
    "city",
    "district",
    "street",
    "housing_complex",
    "private_sector",
    "business_center",
    "datacenter"
  ]),
  city: z.string(),
  district: z.string().nullable(),
  streets: z.array(z.string()).default([]),
  houses: z.array(z.string()).default([]),
  connectionStatus: z.enum(["available", "manual_check", "unavailable", "draft"]),
  availableTariffSlugs: z.array(z.string()).default([]),
  availableServiceSlugs: z.array(z.string()).default([]),
  contactHint: z.string(),
  contentSource: contentSourceSchema,
  workflowStatus: workflowStatusSchema
});

export const promoSchema = z.object({
  title: z.string(),
  slug: z.string(),
  startDate: z.string().date(),
  endDate: z.string().date().nullable(),
  description: z.string(),
  conditions: z.array(z.string()).default([]),
  relatedTariffSlugs: z.array(z.string()).default([]),
  relatedServiceSlugs: z.array(z.string()).default([]),
  targetArea: z.string().nullable(),
  ctaLabel: z.string(),
  proof: proofPointSchema,
  contentSource: contentSourceSchema,
  commercialReview: commercialReviewSchema.optional(),
  workflowStatus: workflowStatusSchema
});

export const leadFormVariantSchema = z.object({
  title: z.string(),
  slug: z.string(),
  leadType: z.enum(["b2c", "b2b", "datacenter_access", "operator_partner"]),
  formKey: z.string(),
  fields: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(["text", "tel", "email", "select", "textarea", "number", "checkbox", "hidden"]),
      required: z.boolean(),
      maxLength: z.number().int().nullable(),
      options: z.array(z.string()).default([])
    })
  ),
  requiredFields: z.array(z.string()).default([]),
  routingKey: z.string(),
  crmPipeline: z.enum(["b2c", "b2b", "operators", "datacenter"]),
  consentDocumentSlug: z.string(),
  workflowStatus: workflowStatusSchema
});

export const legalDocumentSchema = z.object({
  title: z.string(),
  slug: z.string(),
  documentType: z.enum([
    "privacy_policy",
    "consent",
    "offer",
    "wifi_legal",
    "datacenter_access",
    "sla",
    "contract"
  ]),
  version: z.string(),
  body: z.string(),
  effectiveDate: z.string().date(),
  status: verificationStatusSchema,
  source: contentSourceSchema,
  workflowStatus: workflowStatusSchema
});

export const designTokenSetSchema = z.object({
  title: z.string(),
  slug: z.string(),
  version: z.string(),
  tokenScope: z.enum(["primitive", "semantic", "component", "theme", "business"]),
  tokens: z.record(z.unknown()),
  generatedCssPath: z.string().nullable(),
  status: verificationStatusSchema,
  workflowStatus: workflowStatusSchema
});

export const designThemeSchema = z.object({
  title: z.string(),
  slug: z.string(),
  themeType: z.enum(["default", "business", "critical"]),
  pageAccent: z.enum(["default", "business", "critical"]),
  heroVariant: z.enum(["standard", "business", "calculator", "segment"]),
  sectionDensity: z.enum(["compact", "standard", "spacious"]),
  ctaVariant: z.enum(["primary", "secondary", "quiet"]),
  serviceCardLayout: z.enum(["grid", "list", "compact"]),
  proofVisibility: z.enum(["full", "compact", "hidden"]),
  tokenSetSlug: z.string().nullable(),
  workflowStatus: workflowStatusSchema
});
```

## Strapi modeling notes

### Collections

Create collection types:

- `page`
- `navigation-item`
- `media-asset`
- `tariff`
- `tariff-option`
- `service`
- `business-service`
- `business-segment`
- `business-solution`
- `business-offer`
- `business-calculator`
- `calculator-option`
- `hardware-item`
- `sla-feature`
- `case-study`
- `faq-item`
- `coverage-area`
- `promo`
- `lead-form-variant`
- `legal-document`
- `design-theme`
- `design-token-set`

### Components

Create reusable components:

- `seo.meta`
- `proof.point`
- `source.content-source`
- `review.commercial-review`
- `page.hero`
- `page.cta`
- `page.section-ref`
- `form.field`
- `money.price`

### Dynamic zones

`Page.sections` should allow only approved blocks:

- `business.hero`
- `business.segment-tabs`
- `business.service-grid`
- `business.proof-strip`
- `business.calculator-ref`
- `business.sla-list`
- `business.case-study-list`
- `business.faq`
- `business.cta-band`
- `content.rich-text`

Do not allow raw HTML blocks for editors in MVP.

## Migration map from current local content

| Current source                   | CMS target                                                                                    | Mapping                                                                                                                                                                                              | Notes                                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content/tariffs/*.json`     | Tariff                                                                                        | title, slug, audience, speedDownload, speedUpload, priceMonth, promoPrice, promoPeriod, benefitDescription, bestFor, includedServices, isFeatured, sortOrder, proof, contentSource, commercialReview | Existing `availableOptions` maps to relation with TariffOption. Current B2C options become seed `router_rent`, `static_ip`, `tv_pack`. |
| `src/content/services/*.json`    | Service                                                                                       | title, slug, category, shortDescription, fullDescription, facts, benefits, relatedTariffs, contentSource                                                                                             | Existing services remain B2C/general. B2B services become separate BusinessService entries.                                            |
| `src/content/faq/*.json`         | FAQItem                                                                                       | question, answer, category, priority, relatedServices, proof, contentSource                                                                                                                          | Add workflowStatus during import.                                                                                                      |
| `src/content/coverage/*.json`    | CoverageArea                                                                                  | title, slug, type, city, district, streets, houses, connectionStatus, availableTariffs, contactHint, contentSource                                                                                   | Add B2B types later: business_center, datacenter.                                                                                      |
| `src/content/promos/*.json`      | Promo                                                                                         | title, slug, startDate, endDate, description, conditions, relatedTariffs, targetArea, ctaLabel, proof, contentSource                                                                                 | Add commercialReview before production publish.                                                                                        |
| `src/config/routes.ts`           | Page + SeoMeta + NavigationItem                                                               | sitemapRoutes map to Page/SeoMeta; mainNavItems/footerNavItems map to NavigationItem                                                                                                                 | Keep route config as fallback until CMS adapter is live.                                                                               |
| `docs/b2b-strategy-ia-funnel.md` | BusinessService, BusinessSegment, BusinessCalculator, LeadFormVariant, ProofPoint, SLAFeature | Extract B2B routes, CTA, CMS fields, conversion flows and CRM payload                                                                                                                                | Initial seed content should be `needs_verification` unless public source confirms it.                                                  |
| `docs/cms-selection-adr.md`      | DesignTheme/DesignTokenSet governance notes                                                   | Not direct content; informs permissions and design settings                                                                                                                                          | Prompt 09/10 will refine tokens.                                                                                                       |

## Import order

1. ContentSource and common components.
2. LegalDocument for consent/privacy placeholders.
3. SeoMeta and Page for existing B2C routes.
4. TariffOption.
5. Tariff.
6. Service.
7. FAQItem.
8. CoverageArea.
9. Promo.
10. BusinessSegment.
11. BusinessService.
12. BusinessCalculator and CalculatorOption.
13. BusinessOffer.
14. LeadFormVariant.
15. NavigationItem.
16. DesignTokenSet and DesignTheme.

## Editorial guide for managers

### How to publish safely

1. Create or edit content in `draft`.
2. Add `ContentSource` for every factual claim.
3. Set `verificationStatus`:
   - `draft` for ideas and placeholders;
   - `needs_verification` for content awaiting Kubtel confirmation;
   - `confirmed` only after source and responsible reviewer are set.
4. Send business content to commercial review if it contains price, SLA, speed, coverage, discount, equipment or calculation rules.
5. Send legal-sensitive content to legal review if it mentions personal data, public Wi-Fi requirements, contracts, consent, access to datacenter or government/compliance.
6. Publish only after the page has SEO, CTA, source statuses and the required approvals.

### What editors can change

- Page title, hero text, section order from approved blocks.
- Service descriptions, FAQ, benefits and CTA labels.
- Proof points when they include source and status.
- Promo text after commercial review.
- Design choices from allowed enums: hero variant, page accent, density, CTA variant, service card layout.

### What editors cannot change

- Raw HTML, arbitrary scripts or inline CSS.
- Raw colors, spacing, radius, font values or generated design tokens.
- CRM webhook URLs, Telegram tokens, analytics secrets.
- Server validation rules, calculation code, lead scoring weights.
- Published prices or SLA values without commercial approval.
- Consent/legal texts without legal approval.

### How to handle prices

- If price is confirmed, fill the numeric amount and set price status `confirmed`.
- If price exists but is awaiting confirmation, set status `needs_verification`; UI may show a disclaimer.
- If price should not be public, leave amount null, set status `needs_verification` or `draft`, and use CTA "Получить индивидуальный расчет".

### How to handle B2B calculators

- Editors may change option labels, public descriptions, sort order and confirmed prices.
- Developers own `calculatorType`, `fieldKey`, `formulaVersion` and pure calculation code.
- Every calculator change requires test matrix update before production.

### How to handle source attribution

Acceptable source types:

- `public_site` - current or legacy Kubtel public pages.
- `kubtel_team` - confirmed by Kubtel owner.
- `legacy_site` - old public content requiring modernization.
- `technical_audit` - technical project audit.
- `editorial_assumption` - draft copy only, never confirmed.

### Minimum checks before publish

- Page has SEO title and description.
- All public facts have source/status.
- No `draft` prices are shown as real prices.
- Lead form has consent document.
- B2B page has `serviceInterest` and CRM routing.
- Design settings use allowed choices only.
- Preview has been checked on mobile and desktop.

## Implementation implications

Prompt 07 should create:

- `src/lib/cms/types.ts` - internal types generated from these contracts.
- `src/lib/cms/schemas.ts` - Zod schemas for normalized CMS data.
- `src/lib/cms/cms-adapter.ts` - source-independent interface.
- `src/lib/cms/local-content-adapter.ts` - fallback adapter for current JSON.
- `src/lib/cms/strapi-adapter.ts` - Strapi REST/GraphQL fetcher and normalizer.
- tests for BusinessService, BusinessCalculator, LeadFormVariant and private-field stripping.

Do not create Astro components that call Strapi directly.
