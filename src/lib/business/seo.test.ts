import { describe, expect, it } from "vitest";
import { getRouteMetadata, sitemapRoutes } from "@config/routes";
import { businessServices } from "@lib/business/content";
import { hotspotPlans } from "@lib/business/hotspot";

describe("business SEO landing pages", () => {
  it("publishes unique Hotspot and virtualization routes with metadata", () => {
    const hotspot = getRouteMetadata("/business/hotspot/");
    const virtualization = getRouteMetadata("/business/virtualization/");

    expect(hotspot?.title).toContain("Hotspot");
    expect(hotspot?.description).toContain("Гостевой Wi‑Fi");
    expect(virtualization?.title).toContain("VPS и VDI");
    expect(virtualization?.description).toContain("1С и CRM");
    expect(sitemapRoutes.filter((route) => route.path === hotspot?.path)).toHaveLength(1);
    expect(sitemapRoutes.filter((route) => route.path === virtualization?.path)).toHaveLength(1);
  });

  it("registers both landing pages as business services", () => {
    expect(businessServices.map((service) => service.slug)).toEqual(
      expect.arrayContaining(["hotspot", "virtualization"])
    );
  });

  it("keeps Hotspot plan prices aligned with the approved monthly prices", () => {
    expect(hotspotPlans.map(({ title, monthlyPrice }) => [title, monthlyPrice])).toEqual([
      ["Базовый", 2000],
      ["Стандарт", 3000],
      ["Премиум", 3500]
    ]);
  });
});
