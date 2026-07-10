import { describe, expect, it } from "vitest";
import {
  calculateColocation,
  calculateTelephony,
  calculateVps,
  type BusinessPricingCatalog
} from "@lib/business/calculators";

const pricing: BusinessPricingCatalog = {
  "telephony.port": { monthly: 250, status: "needs_verification" },
  "telephony.phone_number": { monthly: 100, status: "confirmed" },
  "vps.cpu": { monthly: 400, status: "confirmed" },
  "vps.ram_gb": { monthly: 150, status: "confirmed" },
  "vps.ssd_gb": { monthly: 12, status: "confirmed" },
  "colocation.unit": { monthly: 2000, status: "confirmed" },
  "colocation.power_100w": { monthly: 700, status: "confirmed" },
  "colocation.port.10g": { monthly: null, status: "unknown" }
};

describe("business calculators", () => {
  it("never includes needs_verification values in a public total", () => {
    const result = calculateTelephony({ ports: 2, phoneNumbers: 1 }, pricing);

    expect(result.monthly).toBe(100);
    expect(result.requiredConsultation).toBe(true);
    expect(result.unknownItems).toContain("telephony.port");
  });

  it("returns required consultation when a selected price is missing", () => {
    const result = calculateVps({ vCpu: 2, ramGb: 4, ssdGb: 100, backup: true }, pricing);

    expect(result.monthly).toBe(2600);
    expect(result.requiredConsultation).toBe(true);
    expect(result.unknownItems).toContain("vps.backup");
  });

  it("forces consultation for high colocation thresholds", () => {
    const result = calculateColocation(
      { rackUnits: 2, powerWatts: 1200, internetPort: "10g" },
      pricing
    );

    expect(result.monthly).toBe(12400);
    expect(result.requiredConsultation).toBe(true);
    expect(result.unknownItems).toContain("colocation.port.10g");
  });
});
