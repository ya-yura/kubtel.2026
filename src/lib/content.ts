import { createCmsAdapter } from "@lib/cms";
import { getCollection } from "astro:content";
import { configuratorSchema } from "@lib/configurator/schema";
import type { ConfiguratorCatalog } from "@models/configurator";
import type { CoverageArea, FaqItem, JobVacancy, Promo, Service, Tariff } from "@models/domain";

function bySortOrder(a: Tariff, b: Tariff): number {
  return a.sortOrder - b.sortOrder;
}

function byPriority(a: FaqItem, b: FaqItem): number {
  return a.priority - b.priority;
}

export async function getTariffs(): Promise<Tariff[]> {
  return (await createCmsAdapter().getTariffs()).sort(bySortOrder);
}

export async function getFaqItems(options: { limit?: number } = {}): Promise<FaqItem[]> {
  const items = (await createCmsAdapter().getFaqItems()).sort(byPriority);

  return typeof options.limit === "number" ? items.slice(0, options.limit) : items;
}

export async function getServices(): Promise<Service[]> {
  return createCmsAdapter().getServices();
}

export async function getConfiguratorCatalog(): Promise<ConfiguratorCatalog> {
  const entries = await getCollection("configurator");
  const entry = entries[0];

  if (!entry) {
    throw new Error("Каталог конфигуратора не найден");
  }

  return configuratorSchema.parse(entry.data) as ConfiguratorCatalog;
}

export async function getCoverageAreas(): Promise<CoverageArea[]> {
  return createCmsAdapter().getCoverageAreas();
}

export async function getPromos(): Promise<Promo[]> {
  return createCmsAdapter().getPromos();
}

export async function getJobVacancies(): Promise<JobVacancy[]> {
  return (await createCmsAdapter().getJobVacancies())
    .filter((vacancy) => vacancy.isActive && vacancy.status === "open")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
