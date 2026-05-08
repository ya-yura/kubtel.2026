import { getCollection } from "astro:content";
import type { CoverageArea, FaqItem, Promo, Service, Tariff } from "@models/domain";

function bySortOrder(a: Tariff, b: Tariff): number {
  return a.sortOrder - b.sortOrder;
}

function byPriority(a: FaqItem, b: FaqItem): number {
  return a.priority - b.priority;
}

export async function getTariffs(): Promise<Tariff[]> {
  const entries = await getCollection("tariffs");

  return entries.map((entry) => entry.data as Tariff).sort(bySortOrder);
}

export async function getFaqItems(options: { limit?: number } = {}): Promise<FaqItem[]> {
  const entries = await getCollection("faq");
  const items = entries.map((entry) => entry.data as FaqItem).sort(byPriority);

  return typeof options.limit === "number" ? items.slice(0, options.limit) : items;
}

export async function getServices(): Promise<Service[]> {
  const entries = await getCollection("services");

  return entries.map((entry) => entry.data as Service);
}

export async function getCoverageAreas(): Promise<CoverageArea[]> {
  const entries = await getCollection("coverage");

  return entries.map((entry) => entry.data as CoverageArea);
}

export async function getPromos(): Promise<Promo[]> {
  const entries = await getCollection("promos");

  return entries.map((entry) => entry.data as Promo);
}
