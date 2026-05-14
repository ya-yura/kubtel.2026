import { describe, expect, it } from "vitest";
import {
  businessCalculatorConfigs,
  businessCalculatorPricing,
  getBusinessCalculatorConfig
} from "@lib/business/calculator-ui";
import {
  calculateCctv,
  calculateColocation,
  calculateTelephony,
  calculateVps,
  calculateWifiAuth
} from "@lib/business/calculators";

describe("business calculator UI config", () => {
  it("exposes calculators for legacy B2B services but not internet or VDI", () => {
    expect(getBusinessCalculatorConfig("telephony")?.type).toBe("telephony");
    expect(getBusinessCalculatorConfig("cctv")?.type).toBe("cctv");
    expect(getBusinessCalculatorConfig("vps")?.type).toBe("vps");
    expect(getBusinessCalculatorConfig("colocation")?.type).toBe("colocation");
    expect(getBusinessCalculatorConfig("wifi-auth")?.type).toBe("wifi_auth");
    expect(getBusinessCalculatorConfig("internet")).toBeUndefined();
    expect(getBusinessCalculatorConfig("vdi")).toBeUndefined();
  });

  it("keeps every UI line connected to a price key", () => {
    const availableKeys = new Set(Object.keys(businessCalculatorPricing));

    for (const config of Object.values(businessCalculatorConfigs)) {
      for (const line of config.lines) {
        if (line.kind === "repeated" || line.kind === "optional") {
          expect(availableKeys.has(line.key), `${config.type} ${line.key}`).toBe(true);
        }
      }
    }
  });

  it("calculates the visible default services", () => {
    expect(
      calculateTelephony(
        { ports: 8, phoneNumbers: 2, externalLines: 2, virtualPbx: true },
        businessCalculatorPricing
      ).monthly
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
