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
        },
        {
          id: "field-work",
          label: "Выездные работы",
          type: "checkbox",
          monthlyPrice: 0,
          oneTimePrice: 500,
          includeInTotal: false,
          priceNote: "От 500 ₽. Точную стоимость специалист сообщит до проведения работ."
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

const summaryCatalog: ConfiguratorCatalog = {
  ...catalog,
  services: [
    {
      ...catalog.services[0],
      fields: [
        {
          id: "internet-plan",
          label: "Тариф интернета",
          type: "select",
          required: true,
          choices: [
            { id: "internet-100", label: "Интернет 100", monthlyPrice: 500, oneTimePrice: 0 }
          ]
        },
        {
          id: "house-connection",
          label: "Частный дом",
          type: "checkbox",
          monthlyPrice: 390,
          oneTimePrice: 4990
        }
      ]
    }
  ]
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

  it("keeps estimate-only work in the breakdown without adding it to the total", () => {
    const result = calculateConfiguratorPrice(catalog, "internet", {
      plan: "base",
      "field-work": true
    });

    expect(result.oneTimeTotal).toBe(0);
    expect(result.lines[result.lines.length - 1]).toMatchObject({
      label: "Выездные работы",
      oneTimePrice: 500,
      includeInTotal: false,
      priceNote: "От 500 ₽. Точную стоимость специалист сообщит до проведения работ."
    });
  });

  it("shows the private-house price as part of the internet tariff", () => {
    const result = calculateConfiguratorPrice(summaryCatalog, "internet", {
      "internet-plan": "internet-100",
      "house-connection": true
    });

    expect(result.monthlyTotal).toBe(890);
    expect(result.oneTimeTotal).toBe(4990);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0]).toMatchObject({
      fieldId: "internet-plan",
      label: "Тариф интернета",
      valueLabel: "Интернет 100",
      monthlyPrice: 890,
      oneTimePrice: 4990
    });
  });
});
