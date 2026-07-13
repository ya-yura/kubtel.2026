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
  "colocation.unit": { monthly: 600, status: "confirmed" },
  "colocation.power_100w": { monthly: 1000, status: "confirmed" },
  "colocation.ipv4": { monthly: 530, status: "confirmed" },
  "colocation.internet.1g-50tb": { monthly: 5000, status: "confirmed" },
  "colocation.ipmi": { monthly: 530, status: "confirmed" },
  "colocation.initial_placement": { oneTime: 1200, status: "confirmed" }
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

  it("calculates all approved colocation monthly and one-time prices", () => {
    const result = calculateColocation(
      {
        rackUnits: 2,
        powerWatts: 1200,
        ipv4Count: 1,
        internetPlan: "1g-50tb",
        ipmi: true
      },
      pricing
    );

    expect(result.monthly).toBe(19260);
    expect(result.oneTime).toBe(1200);
    expect(result.requiredConsultation).toBe(false);
    expect(result.unknownItems).toEqual([]);
  });

  it("rounds colocation power up to the next 100 watts", () => {
    const result = calculateColocation(
      { rackUnits: 1, powerWatts: 450, internetPlan: "1g-50tb" },
      pricing
    );

    expect(result.monthly).toBe(10600);
  });
});
