import { describe, expect, it } from "vitest";
import {
  calculateCctv,
  calculateColocation,
  calculateMultichannelTelephony,
  calculateOrdinaryTelephony,
  calculateProTelephony,
  calculateTelephony,
  calculateVirtualPbxTelephony,
  calculateVps,
  type BusinessPricingCatalog
} from "@lib/business/calculators";

const pricing: BusinessPricingCatalog = {
  "telephony.port": { monthly: 250, status: "needs_verification" },
  "telephony.phone_number": { monthly: 100, status: "confirmed" },
  "cctv.archive.7": { monthly: 600, status: "confirmed" },
  "cctv.archive.14": { monthly: 800, status: "confirmed" },
  "cctv.archive.30": { monthly: 1000, status: "confirmed" },
  "cctv.camera": { status: "unknown" },
  "cctv.install": { status: "unknown" },
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

  it("calculates ordinary telephony by connection type and tariff", () => {
    const result = calculateOrdinaryTelephony({ connectionType: "digital", tariff: "unlimited" });

    expect(result.monthly).toBe(555);
    expect(result.oneTime).toBe(155);
    expect(result.requiredConsultation).toBe(false);
  });

  it("calculates multichannel telephony for 2–30 ports", () => {
    const result = calculateMultichannelTelephony({
      connectionType: "analog",
      tariff: "unlimited",
      ports: 10
    });

    expect(result.monthly).toBe(7990);
    expect(result.oneTime).toBe(17500);
  });

  it("calculates PRO monthly lines, extra numbers and installation", () => {
    const result = calculateProTelephony({
      tariff: "timed",
      phoneNumbers: 4,
      externalLines: 3
    });

    expect(result.monthly).toBe(565);
    expect(result.oneTime).toBe(5620);
  });

  it("calculates virtual PBX ports, numbers, lines and setup", () => {
    const result = calculateVirtualPbxTelephony({
      connectionType: "digital",
      tariff: "unlimited",
      ports: 6,
      phoneNumbers: 3,
      externalLines: 2
    });

    expect(result.monthly).toBe(2140);
    expect(result.oneTime).toBe(5465);
  });

  it("returns required consultation when a selected price is missing", () => {
    const result = calculateVps({ vCpu: 2, ramGb: 4, ssdGb: 100, backup: true }, pricing);

    expect(result.monthly).toBe(2600);
    expect(result.requiredConsultation).toBe(true);
    expect(result.unknownItems).toContain("vps.backup");
  });

  it.each([
    { camerasCount: 3, archiveDays: 7 as const, expected: 1800 },
    { camerasCount: 4, archiveDays: 14 as const, expected: 3200 },
    { camerasCount: 2, archiveDays: 30 as const, expected: 2000 }
  ])("calculates CCTV archive for $camerasCount cameras and $archiveDays days", (input) => {
    const result = calculateCctv(input, pricing);

    expect(result.monthly).toBe(input.expected);
    expect(result.requiredConsultation).toBe(false);
  });

  it("switches CCTV configurations above 30 cameras to a personal calculation", () => {
    const result = calculateCctv({ camerasCount: 31, archiveDays: 7 }, pricing);

    expect(result.monthly).toBeNull();
    expect(result.requiredConsultation).toBe(true);
    expect(result.unknownItems).toContain("cctv.more_than_30");
  });

  it("keeps quote-only CCTV items and their quantities in the request summary", () => {
    const result = calculateCctv(
      { camerasCount: 2, archiveDays: 7, hardwareCount: 3, installNeed: true },
      pricing
    );

    expect(result.monthly).toBe(1200);
    expect(result.unknownItems).toEqual(expect.arrayContaining(["cctv.camera", "cctv.install"]));
    expect(result.summary).toContain("камер к поставке: 3");
    expect(result.summary).toContain("нужен монтаж");
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
