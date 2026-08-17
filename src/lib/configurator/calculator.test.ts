import { describe, expect, it } from "vitest";
import { calculateConfiguratorPrice } from "@lib/configurator/calculator";
import type { ConfiguratorCatalog } from "@models/configurator";

const catalog: ConfiguratorCatalog = {
  title: "Тестовый каталог",
  slug: "test",
  updatedAt: "2026-07-16",
  sourceNote: "test",
  services: [
    {
      id: "internet",
      tabLabel: "Интернет",
      title: "Тестовая услуга",
      description: "Тест",
      eyebrow: "Тест",
      notes: [],
      fields: [
        {
          id: "plan",
          label: "План",
          type: "select",
          required: true,
          choices: [{ id: "base", label: "База", monthlyPrice: 500, oneTimePrice: 0 }]
        },
        {
          id: "new-field",
          label: "Новое поле",
          type: "checkbox",
          monthlyPrice: 90,
          oneTimePrice: 250
        },
        {
          id: "house",
          label: "Частный дом",
          type: "checkbox",
          priceByFieldId: "plan",
          monthlyPriceBy: { base: 390 },
          oneTimePrice: 4990
        },
        {
          id: "tv",
          label: "Телевидение",
          type: "checkbox",
          monthlyPrice: 100,
          oneTimePrice: 0
        },
        {
          id: "cinema",
          label: "Кино",
          type: "checkbox",
          priceByFieldIds: ["plan", "house"],
          monthlyPriceBy: {
            "base|false": 200,
            "base|true": 210
          },
          monthlyPrice: 200,
          oneTimePrice: 0
        },
        {
          id: "quantity",
          label: "Количество",
          type: "counter",
          min: 0,
          max: 5,
          defaultValue: 0,
          monthlyPrice: 10,
          oneTimePrice: 20
        }
      ]
    }
  ],
  tv: {
    channelCount: 0,
    channelGroups: [],
    appLinks: [],
    offers: [],
    setupSteps: [],
    supportedDevices: []
  },
  cctv: { appLinks: [], offers: [], benefits: [], setupSteps: [], cameraModels: [] },
  internet: { offers: [], benefits: [], connectionSteps: [] }
};

describe("calculateConfiguratorPrice", () => {
  it("calculates arbitrary future fields without changing the calculator", () => {
    const result = calculateConfiguratorPrice(catalog, "internet", {
      plan: "base",
      "new-field": true,
      quantity: 2
    });

    expect(result.monthlyTotal).toBe(610);
    expect(result.oneTimeTotal).toBe(290);
    expect(result.lines.map((line) => line.label)).toEqual(["План", "Новое поле", "Количество"]);
  });

  it("supports checkbox prices that depend on the selected plan", () => {
    const result = calculateConfiguratorPrice(catalog, "internet", {
      plan: "base",
      house: true
    });

    expect(result.monthlyTotal).toBe(890);
    expect(result.oneTimeTotal).toBe(4990);
    expect(result.lines.map((line) => line.label)).toEqual(["План", "Частный дом"]);
  });

  it("supports prices that depend on a plan and a second option", () => {
    const result = calculateConfiguratorPrice(catalog, "internet", {
      plan: "base",
      house: true,
      tv: true,
      cinema: true
    });

    expect(result.monthlyTotal).toBe(1200);
    expect(result.oneTimeTotal).toBe(4990);
    expect(result.lines.map((line) => line.label)).toEqual([
      "План",
      "Частный дом",
      "Телевидение",
      "Кино"
    ]);
  });
});
