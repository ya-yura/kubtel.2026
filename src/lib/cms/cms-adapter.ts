import { createLocalContentAdapter } from "@lib/cms/local-content-adapter";
import { createStrapiAdapter } from "@lib/cms/strapi-adapter";
import type { CmsAdapter, CmsAdapterConfig, CmsProvider, CmsReadMode } from "@lib/cms/types";
import { CmsAdapterError } from "@lib/cms/types";

type CmsMethodName = Exclude<keyof CmsAdapter, "provider" | "readMode">;

const cmsMethodNames: CmsMethodName[] = [
  "getTariffs",
  "getServices",
  "getFaqItems",
  "getCoverageAreas",
  "getPromos",
  "getBusinessServices",
  "getBusinessSegments",
  "getBusinessCalculators",
  "getCalculatorOptions",
  "getLeadFormVariants"
];

export function resolveCmsAdapterConfig(
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch
): CmsAdapterConfig {
  const provider = resolveProvider(env.CMS_PROVIDER);
  const readMode = resolveReadMode(env.CMS_PREVIEW_MODE);
  const fallbackToLocal = env.CMS_FALLBACK_TO_LOCAL !== "false";
  const cacheTtlSeconds = Number.parseInt(env.CMS_CACHE_TTL_SECONDS ?? "60", 10);

  return {
    provider,
    readMode,
    fallbackToLocal,
    cacheTtlSeconds: Number.isFinite(cacheTtlSeconds) ? cacheTtlSeconds : 60,
    env,
    fetchImpl
  };
}

export function createCmsAdapter(config = resolveCmsAdapterConfig()): CmsAdapter {
  if (config.provider === "local") {
    return createLocalContentAdapter();
  }

  const localAdapter = createLocalContentAdapter();

  if (!config.env.STRAPI_URL || !config.env.STRAPI_API_TOKEN) {
    if (config.fallbackToLocal) {
      return localAdapter;
    }

    throw new CmsAdapterError(
      "Strapi выбран, но STRAPI_URL/STRAPI_API_TOKEN не настроены",
      "strapi"
    );
  }

  const strapiAdapter = createStrapiAdapter(config);

  return config.fallbackToLocal
    ? createFallbackAdapter(strapiAdapter, localAdapter)
    : strapiAdapter;
}

function createFallbackAdapter(primary: CmsAdapter, fallback: CmsAdapter): CmsAdapter {
  const adapter: CmsAdapter = {
    provider: primary.provider,
    readMode: primary.readMode,
    getTariffs: primary.getTariffs,
    getServices: primary.getServices,
    getFaqItems: primary.getFaqItems,
    getCoverageAreas: primary.getCoverageAreas,
    getPromos: primary.getPromos,
    getBusinessServices: primary.getBusinessServices,
    getBusinessSegments: primary.getBusinessSegments,
    getBusinessCalculators: primary.getBusinessCalculators,
    getCalculatorOptions: primary.getCalculatorOptions,
    getLeadFormVariants: primary.getLeadFormVariants
  };

  for (const methodName of cmsMethodNames) {
    adapter[methodName] = (async (...args: never[]) => {
      try {
        return await (primary[methodName] as (...methodArgs: never[]) => Promise<unknown>)(...args);
      } catch (error) {
        if (!(error instanceof CmsAdapterError)) {
          throw error;
        }

        return (fallback[methodName] as (...methodArgs: never[]) => Promise<unknown>)(...args);
      }
    }) as never;
  }

  return adapter;
}

function resolveProvider(value: string | undefined): CmsProvider {
  return value === "strapi" ? "strapi" : "local";
}

function resolveReadMode(value: string | undefined): CmsReadMode {
  return value === "true" || value === "preview" ? "preview" : "published";
}
