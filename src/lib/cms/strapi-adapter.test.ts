import { describe, expect, it, vi } from "vitest";
import { buildCollectionUrl, createStrapiAdapter } from "@lib/cms/strapi-adapter";
import type { CmsAdapterConfig } from "@lib/cms/types";

const source = {
  status: "confirmed",
  type: "public_site",
  label: "kubtel.ru/legal/",
  url: "https://kubtel.ru/legal/",
  checkedAt: "2026-05-08",
  responsible: "content",
  note: ""
};

function createConfig(fetchImpl: typeof fetch): CmsAdapterConfig {
  return {
    provider: "strapi",
    readMode: "published",
    fallbackToLocal: false,
    cacheTtlSeconds: 60,
    env: {
      STRAPI_URL: "https://cms.example.test",
      STRAPI_API_TOKEN: "token"
    },
    fetchImpl
  };
}

describe("Strapi adapter", () => {
  it("builds published and preview collection URLs", () => {
    expect(
      buildCollectionUrl("https://cms.example.test", "business-services", "published").toString()
    ).toContain("/api/business-services");
    expect(
      buildCollectionUrl(
        "https://cms.example.test",
        "business-services",
        "preview"
      ).searchParams.get("status")
    ).toBe("draft");
  });

  it("fetches and normalizes B2B services", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        data: [
          {
            id: 1,
            attributes: {
              title: "Интернет в офис",
              slug: "internet",
              category: "internet",
              summary: "Корпоративный интернет",
              businessBenefit: "Рабочие сервисы остаются на связи",
              proofPoints: [
                {
                  label: "Мониторинг",
                  value: "24/7",
                  status: "confirmed",
                  source
                }
              ],
              ctaLabel: "Рассчитать интернет",
              workflowStatus: "published",
              verificationStatus: "confirmed",
              internalNotes: "hidden"
            }
          }
        ]
      })
    ) as unknown as typeof fetch;

    const adapter = createStrapiAdapter(createConfig(fetchImpl));
    const services = await adapter.getBusinessServices();

    expect(services).toHaveLength(1);
    expect(services[0].slug).toBe("internet");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("uses cache for published collection reads", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        data: []
      })
    ) as unknown as typeof fetch;

    const adapter = createStrapiAdapter(createConfig(fetchImpl));

    await adapter.getBusinessSegments();
    await adapter.getBusinessSegments();

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
