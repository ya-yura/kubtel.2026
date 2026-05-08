import { getCollection } from "astro:content";
import type { CoverageArea, FaqItem, Promo, Service, Tariff } from "@models/domain";
import {
  coverageAreaSchema,
  faqItemSchema,
  promoSchema,
  serviceSchema,
  tariffSchema
} from "@lib/cms/schemas";
import type {
  BusinessCalculator,
  BusinessSegment,
  BusinessService,
  CalculatorOption,
  CmsAdapter,
  CmsListOptions,
  LeadFormVariant
} from "@lib/cms/types";

function bySortOrder(a: Tariff, b: Tariff): number {
  return a.sortOrder - b.sortOrder;
}

function byPriority(a: FaqItem, b: FaqItem): number {
  return a.priority - b.priority;
}

export function createLocalContentAdapter(): CmsAdapter {
  return {
    provider: "local",
    readMode: "published",

    async getTariffs(): Promise<Tariff[]> {
      const entries = await getCollection("tariffs");

      return entries.map((entry) => tariffSchema.parse(entry.data) as Tariff).sort(bySortOrder);
    },

    async getServices(): Promise<Service[]> {
      const entries = await getCollection("services");

      return entries.map((entry) => serviceSchema.parse(entry.data) as Service);
    },

    async getFaqItems(options: CmsListOptions = {}): Promise<FaqItem[]> {
      const entries = await getCollection("faq");
      const items = entries
        .map((entry) => faqItemSchema.parse(entry.data) as FaqItem)
        .sort(byPriority);

      return typeof options.limit === "number" ? items.slice(0, options.limit) : items;
    },

    async getCoverageAreas(): Promise<CoverageArea[]> {
      const entries = await getCollection("coverage");

      return entries.map((entry) => coverageAreaSchema.parse(entry.data) as CoverageArea);
    },

    async getPromos(): Promise<Promo[]> {
      const entries = await getCollection("promos");

      return entries.map((entry) => promoSchema.parse(entry.data) as Promo);
    },

    async getBusinessServices(): Promise<BusinessService[]> {
      return [];
    },

    async getBusinessSegments(): Promise<BusinessSegment[]> {
      return [];
    },

    async getBusinessCalculators(): Promise<BusinessCalculator[]> {
      return [];
    },

    async getCalculatorOptions(): Promise<CalculatorOption[]> {
      return [];
    },

    async getLeadFormVariants(): Promise<LeadFormVariant[]> {
      return [];
    }
  };
}
