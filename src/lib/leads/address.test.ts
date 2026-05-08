import { describe, expect, it } from "vitest";
import { checkAddressCoverage } from "@lib/leads/address";
import type { CoverageArea } from "@models/domain";

const draftKrasnodarCoverage: CoverageArea = {
  title: "Краснодар",
  slug: "krasnodar",
  type: "city",
  city: "Краснодар",
  district: null,
  streets: [],
  houses: [],
  connectionStatus: "draft",
  availableTariffs: ["home-100", "home-300"],
  contactHint: "Введите адрес, чтобы команда Kubtel проверила возможность подключения.",
  contentSource: {
    status: "draft",
    type: "editorial_assumption",
    label: "Тестовая зона",
    checkedAt: null,
    responsible: "coverage",
    note: "Тест"
  }
};

describe("checkAddressCoverage", () => {
  it("returns manual check for the draft Krasnodar coverage area", () => {
    const result = checkAddressCoverage("Краснодар, ул. Красная, 10", [draftKrasnodarCoverage]);

    expect(result.status).toBe("manual_check");
    expect(result.areaSlug).toBe("krasnodar");
    expect(result.availableTariffs).toEqual(["home-100", "home-300"]);
  });

  it("returns uncertain status when address has no house number", () => {
    const result = checkAddressCoverage("Красная улица", [draftKrasnodarCoverage]);

    expect(result.status).toBe("uncertain");
    expect(result.confidence).toBe("low");
  });
});
