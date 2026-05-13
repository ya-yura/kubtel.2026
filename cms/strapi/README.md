# Kubtel Strapi CMS POC

This workspace is intentionally separate from the Astro app. It defines Strapi 5 content-type schemas aligned with the existing `src/lib/cms/strapi-adapter.ts` collection API IDs. The current state is a repo-ready CMS MVP scaffold: schemas, seed, governance notes and Astro adapter contract are present; a real Strapi instance still requires PostgreSQL and secrets.

## Local Start

1. Copy `.env.example` to `.env`.
2. Fill secrets and PostgreSQL connection.
3. Install dependencies:

```bash
npm install
```

4. Start Strapi:

```bash
npm run develop
```

5. In Strapi admin, create a read-only API token and set Astro env:

```env
CMS_PROVIDER=strapi
STRAPI_URL=http://127.0.0.1:1337
STRAPI_API_TOKEN=...
CMS_FALLBACK_TO_LOCAL=true
```

## Roles

- `admin`: full access.
- `developer`: schemas, API tokens, preview and webhooks.
- `content_editor`: pages, services, FAQ, navigation, media drafts.
- `commercial_reviewer`: tariffs, prices, options, offers, calculators, SLA.
- `legal_reviewer`: consent, privacy, Wi-Fi legal copy, datacenter access rules.

Kubtel workflow is stored as a field on publishable content:

```text
draft -> ready_for_review -> commercial_approved -> legal_approved -> published -> archived
```

Strapi Draft & Publish is still used as the technical publish switch.

The machine-readable role/workflow baseline is stored in `config/kubtel-governance.json`. Create these roles in Strapi admin after first boot and mirror the permissions from that file.

## Preview and Fallback

Astro switches source through env:

```env
CMS_PROVIDER=strapi
CMS_PREVIEW_MODE=true
CMS_FALLBACK_TO_LOCAL=true
STRAPI_URL=http://127.0.0.1:1337
STRAPI_API_TOKEN=...
STRAPI_PREVIEW_SECRET=...
```

If Strapi is unavailable and `CMS_FALLBACK_TO_LOCAL=true`, the Astro adapter keeps serving the local content layer. Preview must never expose `STRAPI_API_TOKEN` to client-side code.

## Seed

`seed/kubtel-seed.json` contains a first content payload for B2C+B2B MVP: B2C tariff/service/FAQ/coverage/promo, B2B services/segments/calculator/options/form variant and the default governed design theme. After Strapi is running and an API token is available:

```bash
KUBTEL_SEED_API_TOKEN=... npm run seed
```

The seed script uses REST endpoints and does not overwrite existing records with the same slug.

## Rebuild Webhook Notes

For production, configure a Strapi webhook on publish/unpublish events that triggers the hosting deploy pipeline. Do not trigger rebuilds from draft saves; use preview for draft review.

## Backup and Export

Before bulk edits or price updates:

1. Export Strapi database or run the hosting backup.
2. Export media library if media changed.
3. Keep the previous `seed/kubtel-seed.json` snapshot for recovery reference.
4. After import, run the Astro adapter with `CMS_PROVIDER=strapi` and `CMS_FALLBACK_TO_LOCAL=true`, then run `npm run launch:check`.
