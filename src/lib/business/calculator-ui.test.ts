import { describe, expect, it } from "vitest";
import {
  businessCalculatorConfigs,
  businessCalculatorPricing,
  getBusinessCalculatorConfig
} from "@lib/business/calculator-ui";
import {
  calculateInternetOffice,
  calculateCctv,
  calculateColocation,
  calculateTelephony,
  calculateVdi,
  calculateVps,
  calculateWifiAuth
} from "@lib/business/calculators";

describe("business calculator UI config", () => {
  it("exposes calculators for the priced B2B service set", () => {
    expect(getBusinessCalculatorConfig("internet")?.type).toBe("internet");
    expect(getBusinessCalculatorConfig("telephony")?.type).toBe("telephony");
    expect(getBusinessCalculatorConfig("cctv")?.type).toBe("cctv");
    expect(getBusinessCalculatorConfig("vps")?.type).toBe("vps");
    expect(getBusinessCalculatorConfig("vdi")?.type).toBe("vdi");
    expect(getBusinessCalculatorConfig("colocation")?.type).toBe("colocation");
    expect(getBusinessCalculatorConfig("wifi-auth")?.type).toBe("wifi_auth");
    expect(getBusinessCalculatorConfig("static-ip")).toBeUndefined();
  });

  it("keeps telephony split into current tariff directions", () => {
    expect(businessCalculatorConfigs.telephony.title).toContain("IP-телефония");
    expect(businessCalculatorConfigs.telephony_intrazone.title).toBe("Внутризоновая связь");
    expect(businessCalculatorConfigs.telephony_long_distance.title).toBe("Междугородная связь");
    expect(businessCalculatorConfigs.telephony_international.title).toBe("Международная связь");
    expect(businessCalculatorConfigs.telephony_services.title).toBe("Услуги телефонии");
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

  it("calculates the visible default services", () => {
    expect(
      calculateInternetOffice(
        { speedMbps: 300, staticIpCount: 1, routerSetup: true },
        businessCalculatorPricing
      ).monthly
    ).toBeGreaterThan(0);

    expect(
      calculateTelephony(
        { ports: 8, phoneNumbers: 2, externalLines: 2, virtualPbx: true },
        businessCalculatorPricing
      ).monthly
    ).toBeGreaterThan(0);

    expect(
      calculateVdi({ seats: 5, preset: "standard", backup: true }, businessCalculatorPricing)
        .monthly
    ).toBeGreaterThan(0);

    expect(
      calculateCctv(
        { camerasCount: 8, archiveDays: 7, hardwareCount: 8, installNeed: true },
        businessCalculatorPricing
      ).oneTime
    ).toBeGreaterThan(0);

    expect(
      calculateVps(
        { vCpu: 4, ramGb: 8, ssdGb: 160, ipCount: 1, backup: true },
        businessCalculatorPricing
      ).monthly
    ).toBeGreaterThan(0);

    expect(
      calculateColocation(
        { rackUnits: 2, powerWatts: 400, ipv4Count: 1, internetPort: "1g", ipmi: true },
        businessCalculatorPricing
      ).monthly
    ).toBeGreaterThan(0);

    expect(
      calculateWifiAuth(
        { plan: "standard", sitesCount: 1, smsNeed: true },
        businessCalculatorPricing
      ).monthly
    ).toBeGreaterThan(0);
  });
});
