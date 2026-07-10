import { describe, expect, it } from "vitest";
import {
  businessCalculatorConfigs,
  businessCalculatorPricing,
  getBusinessCalculatorConfig
} from "@lib/business/calculator-ui";

describe("business calculator UI config", () => {
  it("exposes exactly four public B2B calculators", () => {
    expect(Object.keys(businessCalculatorConfigs).sort()).toEqual([
      "cctv",
      "colocation",
      "telephony",
      "vps"
    ]);
    expect(getBusinessCalculatorConfig("internet")).toBeUndefined();
    expect(getBusinessCalculatorConfig("wifi-auth")).toBeUndefined();
    expect(getBusinessCalculatorConfig("vdi")).toBeUndefined();
  });

  it("keeps every UI line connected to a price key", () => {
    const availableKeys = new Set(Object.keys(businessCalculatorPricing));

    for (const config of Object.values(businessCalculatorConfigs)) {
      for (const line of config.lines) {
        if (line.kind === "repeated" || line.kind === "optional") {
          expect(availableKeys.has(line.key), `${config.type} ${line.key}`).toBe(true);
        }

        if (line.kind === "select" || line.kind === "repeatedSelect") {
          const field = config.fields.find((item) => item.name === line.selectField);
          expect(field?.kind, `${config.type} ${line.selectField}`).toBe("select");

          if (field?.kind === "select") {
            for (const option of field.options) {
              const key = `${line.keyPrefix}${option.value}`;
              expect(availableKeys.has(key), `${config.type} ${key}`).toBe(true);
            }
          }
        }
      }
    }
  });

  it("publishes unit prices only for confirmed values", () => {
    const publicNumbers = Object.entries(businessCalculatorPricing).filter(
      ([, value]) =>
        value &&
        (typeof value.monthly === "number" || typeof value.oneTime === "number") &&
        value.status !== "confirmed"
    );

    expect(publicNumbers).toEqual([]);
    expect(businessCalculatorPricing["telephony.monthly_detail_email"]).toMatchObject({
      monthly: 0,
      status: "confirmed"
    });
  });
});
