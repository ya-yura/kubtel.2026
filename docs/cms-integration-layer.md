# Kubtel.ru: Astro CMS integration layer

Дата: 2026-05-08.

Документ закрывает Prompt 07 из `docs/b2b-cms-design-token-prompt-pack.md`.

Статус: first implementation completed, Strapi runtime not connected yet.

## Цель

Подключить CMS-слой так, чтобы Astro-компоненты не знали источник данных. Текущие страницы продолжают работать от локальных content collections, но доступ к контенту уже идет через `src/lib/cms/` adapter boundary. Когда Strapi POC будет поднят, источник можно переключить через env без переписывания UI.

## Файловая структура

Реализовано:

```text
src/lib/cms/
  cms-adapter.ts
  index.ts
  local-content-adapter.ts
  normalizers.ts
  normalizers.test.ts
  schemas.ts
  schemas.test.ts
  strapi-adapter.ts
  strapi-adapter.test.ts
  types.ts
```

Обновлено:

```text
src/lib/content.ts
.env.example
docs/project-state.md
docs/implementation-log.md
```

## Adapter interface

`CmsAdapter` описан в `src/lib/cms/types.ts`:

```ts
type CmsAdapter = {
  provider: "local" | "strapi";
  readMode: "published" | "preview";
  getTariffs(): Promise<Tariff[]>;
  getServices(): Promise<Service[]>;
  getFaqItems(options?: { limit?: number }): Promise<FaqItem[]>;
  getCoverageAreas(): Promise<CoverageArea[]>;
  getPromos(): Promise<Promo[]>;
  getBusinessServices(): Promise<BusinessService[]>;
  getBusinessSegments(): Promise<BusinessSegment[]>;
  getBusinessCalculators(): Promise<BusinessCalculator[]>;
  getCalculatorOptions(): Promise<CalculatorOption[]>;
  getLeadFormVariants(): Promise<LeadFormVariant[]>;
};
```

Existing pages still import from `src/lib/content.ts`. That file now delegates to `createCmsAdapter()` and preserves the previous public functions:

- `getTariffs()`
- `getFaqItems()`
- `getServices()`
- `getCoverageAreas()`
- `getPromos()`

## Adapters

### localContentAdapter

`src/lib/cms/local-content-adapter.ts` reads Astro content collections:

- `tariffs`
- `services`
- `faq`
- `coverage`
- `promos`

It validates data through `src/lib/cms/schemas.ts` before returning normalized domain types.

B2B CMS-only methods currently return empty arrays until local B2B seed content or Strapi content is added.

### strapiAdapter

`src/lib/cms/strapi-adapter.ts` reads Strapi REST collections:

- `/api/tariffs`
- `/api/services`
- `/api/faq-items`
- `/api/coverage-areas`
- `/api/promos`
- `/api/business-services`
- `/api/business-segments`
- `/api/business-calculators`
- `/api/calculator-options`
- `/api/lead-form-variants`

It uses:

- bearer token from `STRAPI_API_TOKEN`;
- `populate=*` for first POC;
- `status=draft` in preview mode;
- in-memory TTL cache for published reads;
- no cache for preview reads.

### fallback strategy

`createCmsAdapter()` uses:

- local adapter when `CMS_PROVIDER=local` or unset;
- Strapi adapter when `CMS_PROVIDER=strapi` and Strapi env is configured;
- local fallback when Strapi is selected but unavailable and `CMS_FALLBACK_TO_LOCAL=true`.

Fallback catches `CmsAdapterError`. Unexpected programming errors still fail loudly.

## Environment variables

Added to `.env.example`:

```text
CMS_PROVIDER=local
CMS_PREVIEW_MODE=false
CMS_FALLBACK_TO_LOCAL=true
CMS_CACHE_TTL_SECONDS=60
STRAPI_URL=
STRAPI_API_TOKEN=
STRAPI_PREVIEW_SECRET=
```

Rules:

- `STRAPI_API_TOKEN` is server-only.
- `STRAPI_PREVIEW_SECRET` is reserved for preview routes/webhooks.
- Do not expose CMS tokens to client-side code.
- Production should keep `CMS_FALLBACK_TO_LOCAL=true` during migration, then revisit after Strapi reliability is proven.

## Normalization and validation

Implemented in:

- `src/lib/cms/schemas.ts`
- `src/lib/cms/normalizers.ts`

Responsibilities:

- validate current B2C domain contracts;
- validate first B2B contracts: `BusinessService`, `BusinessSegment`, `BusinessCalculator`, `CalculatorOption`, `LeadFormVariant`;
- unwrap Strapi v4/v5-like responses with `data` and optional `attributes`;
- strip private CMS fields before validation.

Private fields stripped recursively:

- `internalNotes`
- `reviewNotes`
- `reviewedBy`
- `requiredEvidence`
- `crmWebhookUrl`
- `telegramBotToken`
- `telegramTemplate`
- `analyticsSecret`
- `antiSpamConfig`
- `leadScoringWeights`
- Strapi author metadata such as `createdBy` and `updatedBy`

## Error handling

`CmsAdapterError` includes:

- message;
- provider;
- optional HTTP status code.

Expected CMS failures can fall back to local content. Schema validation failures are intentionally not hidden by fallback if they happen outside adapter fetch boundaries, because invalid published content should be caught during checks and preview QA.

## Cache strategy

First implementation uses in-memory TTL cache inside `strapi-adapter.ts`:

- default TTL: 60 seconds;
- env override: `CMS_CACHE_TTL_SECONDS`;
- disabled for preview;
- scoped to adapter instance.

Future production options:

- CDN/build cache for static pages;
- webhook invalidation on Strapi publish;
- persistent cache only if runtime traffic requires it.

## Preview strategy

Implemented primitives:

- `CMS_PREVIEW_MODE=true` switches adapter read mode to `preview`.
- Strapi preview reads add `status=draft`.
- Preview reads bypass cache.
- `STRAPI_PREVIEW_SECRET` is reserved for future authenticated preview routes.

Prompt 17 should add:

- authenticated Astro preview route;
- Strapi Preview URL configuration;
- draft access only with preview secret;
- webhook rebuild/invalidation notes.

## Migration plan

1. Keep existing pages on `src/lib/content.ts`.
2. Route `src/lib/content.ts` through CMS adapter. Completed.
3. Add Strapi POC models from `docs/cms-content-models.md`.
4. Seed Strapi with current B2C content and B2B starter content.
5. Set `CMS_PROVIDER=strapi` locally.
6. Compare local adapter and Strapi adapter output through tests.
7. Add B2B pages using `getBusinessServices()`, `getBusinessSegments()` and form variants.
8. Keep `CMS_FALLBACK_TO_LOCAL=true` until production Strapi is stable.

## Test plan

Implemented:

- `src/lib/cms/schemas.test.ts`
  - validates B2B service contract;
  - rejects invalid workflow status;
  - validates B2B lead form variant.
- `src/lib/cms/normalizers.test.ts`
  - unwraps Strapi entities/lists;
  - strips private fields recursively;
  - validates normalized entries.
- `src/lib/cms/strapi-adapter.test.ts`
  - builds published/preview URLs;
  - fetches and normalizes B2B services;
  - uses cache for published collection reads.

Executed:

```bash
npm test
npm run check
```

## Acceptance criteria

- Existing B2C routes still compile through `src/lib/content.ts`.
- Components do not import Strapi client or CMS response shapes.
- Local content remains the default source.
- Strapi can be selected through env.
- Strapi payload is normalized and validated before reaching UI.
- Server-only CMS token remains outside client code.
- Preview mode has an explicit env path and does not use cache.
- Tests cover normalization, B2B entity validation and Strapi adapter fetch behavior.

## Next step

Prompt 08: migration plan.

The next implementation slice should define URL redirects, CMS import order, source attribution, publication blockers and QA checklist for moving current content plus B2B seed content into Strapi.
