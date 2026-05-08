import { describe, expect, it } from "vitest";
import { leadFormSchema } from "@lib/leads/schema";
import { buildLeadSubmission, LeadSubmissionError } from "@lib/leads/submission";
import type { CoverageArea, Tariff } from "@models/domain";

const tariff: Tariff = {
  title: "Дом 300",
  slug: "home-300",
  audience: ["families"],
  speedDownload: 300,
  speedUpload: 300,
  priceMonth: 700,
  promoPrice: null,
  promoPeriod: null,
  benefitDescription: "Тестовый тариф",
  bestFor: ["дом"],
  includedServices: ["интернет"],
  availableOptions: ["routerRent", "staticIp"],
  connectionPrice: null,
  routerRentPrice: 150,
  staticIpPrice: 150,
  isFeatured: true,
  sortOrder: 1,
  proof: {
    label: "Статус",
    value: "Тест",
    status: "draft"
  },
  contentSource: {
    status: "draft",
    type: "editorial_assumption",
    label: "Тест",
    checkedAt: null,
    responsible: "content",
    note: "Тест"
  },
  commercialReview: {
    status: "draft",
    priceStatus: "draft",
    speedStatus: "draft",
    optionsStatus: "draft",
    connectionStatus: "draft",
    requiredEvidence: [],
    note: "Тест"
  }
};

const coverage: CoverageArea = {
  title: "Краснодар",
  slug: "krasnodar",
  type: "city",
  city: "Краснодар",
  district: null,
  streets: [],
  houses: [],
  connectionStatus: "draft",
  availableTariffs: ["home-300"],
  contactHint: "Ручная проверка",
  contentSource: {
    status: "draft",
    type: "editorial_assumption",
    label: "Тест",
    checkedAt: null,
    responsible: "coverage",
    note: "Тест"
  }
};

describe("buildLeadSubmission", () => {
  it("builds a priced lead with address status", () => {
    const input = leadFormSchema.parse({
      name: "Юрий",
      phone: "+79181234567",
      address: "Краснодар, Красная, 10",
      tariff: "home-300",
      options: ["routerRent"],
      consent: true,
      sourcePath: "/connect/"
    });

    const lead = buildLeadSubmission({
      input,
      tariffs: [tariff],
      coverageAreas: [coverage],
      now: new Date("2026-05-07T10:00:00.000Z")
    });

    expect(lead.id).toMatch(/^KBT-20260507-/);
    expect(lead.pricing.total).toBe(850);
    expect(lead.coverage.status).toBe("manual_check");
  });

  it("rejects options unavailable for the selected tariff", () => {
    const input = leadFormSchema.parse({
      name: "Юрий",
      phone: "+79181234567",
      address: "Краснодар, Красная, 10",
      tariff: "home-300",
      options: ["tvPack"],
      consent: true
    });

    expect(() =>
      buildLeadSubmission({
        input,
        tariffs: [tariff],
        coverageAreas: [coverage]
      })
    ).toThrow(LeadSubmissionError);
  });
});
