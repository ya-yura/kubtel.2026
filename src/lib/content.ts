import { createCmsAdapter } from "@lib/cms";
import type { CoverageArea, FaqItem, Promo, Service, Tariff } from "@models/domain";

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

export async function getCoverageAreas(): Promise<CoverageArea[]> {
  return createCmsAdapter().getCoverageAreas();
}

export async function getPromos(): Promise<Promo[]> {
  return createCmsAdapter().getPromos();
}
