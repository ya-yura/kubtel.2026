import {
  businessCalculatorSchema,
  businessSegmentSchema,
  businessServiceSchema,
  calculatorOptionSchema,
  coverageAreaSchema,
  faqItemSchema,
  leadFormVariantSchema,
  promoSchema,
  serviceSchema,
  tariffSchema
} from "@lib/cms/schemas";
import { normalizeStrapiCollection } from "@lib/cms/normalizers";
import type {
  BusinessCalculator,
  BusinessSegment,
  BusinessService,
  CalculatorOption,
  CmsAdapter,
  CmsAdapterConfig,
  CmsListOptions,
  LeadFormVariant
} from "@lib/cms/types";
import { CmsAdapterError } from "@lib/cms/types";
import type { CoverageArea, FaqItem, Promo, Service, Tariff } from "@models/domain";
import type { ZodType } from "zod";

type StrapiCacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const collectionApiIds = {
  tariffs: "tariffs",
  services: "services",
  faqItems: "faq-items",
  coverageAreas: "coverage-areas",
  promos: "promos",
  businessServices: "business-services",
  businessSegments: "business-segments",
  businessCalculators: "business-calculators",
  calculatorOptions: "calculator-options",
  leadFormVariants: "lead-form-variants"
} as const;

export function createStrapiAdapter(config: CmsAdapterConfig): CmsAdapter {
  const baseUrl = config.env.STRAPI_URL;
  const apiToken = config.env.STRAPI_API_TOKEN;
  const cache = new Map<string, StrapiCacheEntry<unknown>>();

  async function fetchCollection<T>(apiId: string, schema: ZodType<T>): Promise<T[]> {
    if (!baseUrl || !apiToken) {
      throw new CmsAdapterError("Strapi URL или API token не настроены", "strapi");
    }

    const url = buildCollectionUrl(baseUrl, apiId, config.readMode);
    const cacheKey = url.toString();
    const cached = readCache<T[]>(cache, cacheKey, config.cacheTtlSeconds, config.readMode);

    if (cached) {
      return cached;
    }

    const response = await config.fetchImpl(url, {
      headers: {
        authorization: `Bearer ${apiToken}`,
        accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new CmsAdapterError(
        `Strapi ${apiId} вернул ${response.status}`,
        "strapi",
        response.status
      );
    }

    const payload = await response.json();
    const normalized = normalizeStrapiCollection(payload, schema);
    writeCache(cache, cacheKey, normalized, config.cacheTtlSeconds, config.readMode);

    return normalized;
  }

  return {
    provider: "strapi",
    readMode: config.readMode,

    async getTariffs(): Promise<Tariff[]> {
      return fetchCollection<Tariff>(collectionApiIds.tariffs, tariffSchema as ZodType<Tariff>);
    },

    async getServices(): Promise<Service[]> {
      return fetchCollection<Service>(collectionApiIds.services, serviceSchema as ZodType<Service>);
    },

    async getFaqItems(options: CmsListOptions = {}): Promise<FaqItem[]> {
      const items = await fetchCollection<FaqItem>(
        collectionApiIds.faqItems,
        faqItemSchema as ZodType<FaqItem>
      );
      const sorted = items.sort((a, b) => a.priority - b.priority);

      return typeof options.limit === "number" ? sorted.slice(0, options.limit) : sorted;
    },

    async getCoverageAreas(): Promise<CoverageArea[]> {
      return fetchCollection<CoverageArea>(
        collectionApiIds.coverageAreas,
        coverageAreaSchema as ZodType<CoverageArea>
      );
    },

    async getPromos(): Promise<Promo[]> {
      return fetchCollection<Promo>(collectionApiIds.promos, promoSchema as ZodType<Promo>);
    },

    async getBusinessServices(): Promise<BusinessService[]> {
      return fetchCollection<BusinessService>(
        collectionApiIds.businessServices,
        businessServiceSchema as ZodType<BusinessService>
      );
    },

    async getBusinessSegments(): Promise<BusinessSegment[]> {
      return fetchCollection<BusinessSegment>(
        collectionApiIds.businessSegments,
        businessSegmentSchema as ZodType<BusinessSegment>
      );
    },

    async getBusinessCalculators(): Promise<BusinessCalculator[]> {
      return fetchCollection<BusinessCalculator>(
        collectionApiIds.businessCalculators,
        businessCalculatorSchema as ZodType<BusinessCalculator>
      );
    },

    async getCalculatorOptions(): Promise<CalculatorOption[]> {
      return fetchCollection<CalculatorOption>(
        collectionApiIds.calculatorOptions,
        calculatorOptionSchema as ZodType<CalculatorOption>
      );
    },

    async getLeadFormVariants(): Promise<LeadFormVariant[]> {
      return fetchCollection<LeadFormVariant>(
        collectionApiIds.leadFormVariants,
        leadFormVariantSchema as ZodType<LeadFormVariant>
      );
    }
  };
}

export function buildCollectionUrl(
  baseUrl: string,
  apiId: string,
  readMode: "published" | "preview"
): URL {
  const url = new URL(`/api/${apiId}`, ensureTrailingSlash(baseUrl));

  url.searchParams.set("pagination[pageSize]", "100");
  url.searchParams.set("populate", "*");

  if (readMode === "preview") {
    url.searchParams.set("status", "draft");
  }

  return url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function readCache<T>(
  cache: Map<string, StrapiCacheEntry<unknown>>,
  key: string,
  ttlSeconds: number,
  readMode: "published" | "preview"
): T | null {
  if (readMode === "preview" || ttlSeconds <= 0) {
    return null;
  }

  const cached = cache.get(key);

  if (!cached || cached.expiresAt < Date.now()) {
    return null;
  }

  return cached.value as T;
}

function writeCache<T>(
  cache: Map<string, StrapiCacheEntry<unknown>>,
  key: string,
  value: T,
  ttlSeconds: number,
  readMode: "published" | "preview"
): void {
  if (readMode === "preview" || ttlSeconds <= 0) {
    return;
  }

  cache.set(key, {
    expiresAt: Date.now() + ttlSeconds * 1000,
    value
  });
}
