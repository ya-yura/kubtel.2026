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
        if (line.kind === "fixed" || line.kind === "repeated" || line.kind === "optional") {
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

  it("uses the approved colocation prices and service options", () => {
    expect(businessCalculatorPricing).toMatchObject({
      "colocation.unit": { monthly: 600, status: "confirmed" },
      "colocation.power_100w": { monthly: 1000, status: "confirmed" },
      "colocation.ipv4": { monthly: 530, status: "confirmed" },
      "colocation.internet.100m": { monthly: 3000, status: "confirmed" },
      "colocation.internet.1g-50tb": { monthly: 5000, status: "confirmed" },
      "colocation.internet.1g-unlimited": { monthly: 25000, status: "confirmed" },
      "colocation.ipmi": { monthly: 530, status: "confirmed" },
      "colocation.initial_placement": { oneTime: 1200, status: "confirmed" }
    });

    const colocation = businessCalculatorConfigs.colocation;
    const power = colocation.fields.find((field) => field.name === "powerWatts");
    const internet = colocation.fields.find((field) => field.name === "internetPlan");

    expect(power).toMatchObject({ kind: "number", max: 10000, step: 100 });
    expect(internet).toMatchObject({
      kind: "select",
      label: "Интернет",
      value: "1g-50tb"
    });
    expect(colocation.fields.some((field) => field.name === "remoteHands")).toBe(false);
  });

  it("offers VPS with SSD only and without DDoS protection", () => {
    const vps = businessCalculatorConfigs.vps;
    const fieldNames = vps.fields.map((field) => field.name);

    expect(fieldNames).toContain("ssdGb");
    expect(fieldNames).not.toContain("hddGb");
    expect(fieldNames).not.toContain("ddosProtection");
    expect(businessCalculatorPricing).not.toHaveProperty("vps.hdd_gb");
    expect(businessCalculatorPricing).not.toHaveProperty("vps.ddos");
  });
});
