import { describe, expect, it } from "vitest";
import { businessLeadFormSchema } from "@lib/leads/business-schema";

describe("businessLeadFormSchema", () => {
  it("normalizes empty optional form fields that Astro actions pass as null", () => {
    const input = businessLeadFormSchema.parse({
      companyName: "ООО Тест",
      contactPerson: "Иван",
      phone: "+7 900 765 43 21",
      email: null,
      inn: null,
      segment: null,
      service: "internet",
      city: null,
      address: null,
      urgency: "30_days",
      employeesOrSites: null,
      configurationSummary: null,
      monthlyEstimate: null,
      oneTimeEstimate: null,
      message: null,
      consent: "on",
      website: null,
      formStartedAt: null,
      sourcePath: "/business/request/"
    });

    expect(input.email).toBeNull();
    expect(input.segment).toBe("");
    expect(input.message).toBe("");
    expect(input.consent).toBe(true);
  });
});
