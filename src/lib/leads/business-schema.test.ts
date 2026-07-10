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
      address: "Краснодар",
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

  it("accepts the shortened business request form", () => {
    const input = businessLeadFormSchema.parse({
      companyName: "",
      contactPerson: "",
      phone: "+7 900 765 43 21",
      service: "internet",
      address: "Краснодар, Красная, 1",
      configurationSummary: "Нужен интернет в офис",
      consent: "on",
      website: "",
      formStartedAt: Date.now(),
      sourcePath: "/business/request/"
    });

    expect(input.companyName).toBe("Компания не указана");
    expect(input.contactPerson).toBe("Контакт не указан");
    expect(input.service).toBe("internet");
    expect(input.address).toBe("Краснодар, Красная, 1");
  });

  it("requires service and object address", () => {
    const result = businessLeadFormSchema.safeParse({
      companyName: "",
      contactPerson: "",
      phone: "+7 900 765 43 21",
      service: "",
      address: "",
      consent: "on",
      website: "",
      formStartedAt: Date.now(),
      sourcePath: "/business/request/"
    });

    expect(result.success).toBe(false);
  });

  it("allows document and callback requests without an object address", () => {
    const input = businessLeadFormSchema.parse({
      companyName: "ООО Тест",
      contactPerson: "Иван",
      phone: "+7 900 765 43 21",
      service: "documents-payment",
      address: "",
      consent: "on",
      website: "",
      formStartedAt: Date.now(),
      sourcePath: "/business/request/?segment=legal"
    });

    expect(input.address).toBeNull();
    expect(input.service).toBe("documents-payment");
  });
});
