import { describe, expect, it } from "vitest";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildOfferCatalogSchema,
  serializeJsonLd
} from "@lib/seo/schema";
import type { FaqItem, Tariff } from "@models/domain";

const sampleFaq: FaqItem = {
  question: "Можно ли оставить телефон для звонка?",
  answer: "Да, форма передает телефон специалисту Kubtel.",
  category: "connect",
  priority: 1,
  relatedServices: ["internet"],
  proof: {
    label: "Тест",
    value: "Локальная модель",
    status: "draft"
  },
  contentSource: {
    status: "draft",
    type: "editorial_assumption",
    label: "Тест",
    checkedAt: null,
    responsible: "content",
    note: "Тестовый объект"
  }
};

const sampleTariff: Tariff = {
  title: "Дом 300",
  slug: "home-300",
  audience: ["семья"],
  speedDownload: 300,
  speedUpload: null,
  priceMonth: 900,
  promoPrice: null,
  promoPeriod: null,
  benefitDescription: "Для семьи, видео и удаленной работы.",
  bestFor: ["семья", "видео"],
  includedServices: ["internet"],
  availableOptions: ["routerRent"],
  connectionPrice: null,
  routerRentPrice: 150,
  staticIpPrice: null,
  isFeatured: true,
  sortOrder: 1,
  proof: {
    label: "Тест",
    value: "Локальная модель",
    status: "draft"
  },
  contentSource: {
    status: "draft",
    type: "editorial_assumption",
    label: "Тест",
    checkedAt: null,
    responsible: "content",
    note: "Тестовый объект"
  },
  commercialReview: {
    status: "needs_verification",
    priceStatus: "needs_verification",
    speedStatus: "needs_verification",
    optionsStatus: "needs_verification",
    connectionStatus: "needs_verification",
    requiredEvidence: ["Коммерческая таблица"],
    note: "Тестовый тариф"
  }
};

describe("seo schema helpers", () => {
  it("builds escaped JSON-LD safely", () => {
    const schema = buildFaqSchema([{ ...sampleFaq, answer: "Безопасно </script>" }], "/support/");
    const serialized = serializeJsonLd(schema);

    expect(serialized).toContain("\\u003c/script>");
    expect(serialized).not.toContain("</script>");
  });

  it("builds breadcrumbs with absolute URLs", () => {
    const schema = buildBreadcrumbSchema(
      [
        { name: "Главная", path: "/" },
        { name: "Тарифы", path: "/tariffs/" }
      ],
      "/tariffs/"
    );

    expect(schema.itemListElement).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          position: 2,
          name: "Тарифы",
          item: "http://127.0.0.1:4321/tariffs/"
        })
      ])
    );
  });

  it("exposes tariff prices and service details as an offer catalog", () => {
    const schema = buildOfferCatalogSchema([sampleTariff], "/tariffs/");

    expect(schema).toEqual(
      expect.objectContaining({
        "@type": "OfferCatalog",
        itemListElement: [
          expect.objectContaining({
            name: "Дом 300",
            price: 900,
            priceCurrency: "RUB"
          })
        ]
      })
    );
  });
});
