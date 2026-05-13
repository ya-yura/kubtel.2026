import { describe, expect, it } from "vitest";
import {
  calculateColocation,
  calculateInternetOffice,
  calculateVps,
  type BusinessPricingCatalog
} from "@lib/business/calculators";

const pricing: BusinessPricingCatalog = {
  "internet.speed.300": { monthly: 3000, status: "confirmed" },
  "internet.static_ip": { monthly: 250, status: "confirmed" },
  "internet.router_setup": { oneTime: 1500, status: "needs_verification" },
  "vps.cpu": { monthly: 400, status: "confirmed" },
  "vps.ram_gb": { monthly: 150, status: "confirmed" },
  "vps.ssd_gb": { monthly: 12, status: "confirmed" },
  "colocation.unit": { monthly: 2000, status: "confirmed" },
  "colocation.power_100w": { monthly: 700, status: "confirmed" },
  "colocation.port.10g": { monthly: null, status: "unknown" }
};

describe("business calculators", () => {
  it("calculates known monthly and one-time values while flagging unconfirmed items", () => {
    const result = calculateInternetOffice(
      {
        speedMbps: 300,
        staticIpCount: 2,
        routerSetup: true
      },
      pricing
    );

    expect(result.monthly).toBe(3500);
    expect(result.oneTime).toBe(1500);
    expect(result.requiredConsultation).toBe(true);
    expect(result.unknownItems).toContain("internet.router_setup");
  });

  it("returns required consultation when a selected price is missing", () => {
    const result = calculateVps(
      {
        vCpu: 2,
        ramGb: 4,
        ssdGb: 100,
        backup: true
      },
      pricing
    );

    expect(result.monthly).toBe(2600);
    expect(result.requiredConsultation).toBe(true);
    expect(result.unknownItems).toContain("vps.backup");
  });

  it("forces consultation for high colocation thresholds", () => {
    const result = calculateColocation(
      {
        rackUnits: 2,
        powerWatts: 1200,
        internetPort: "10g"
      },
      pricing
    );

    expect(result.monthly).toBe(12400);
    expect(result.requiredConsultation).toBe(true);
    expect(result.unknownItems).toContain("colocation.port.10g");
  });
});
