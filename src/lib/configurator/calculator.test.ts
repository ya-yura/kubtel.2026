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
});
