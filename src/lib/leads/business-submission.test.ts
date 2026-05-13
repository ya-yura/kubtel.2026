import { describe, expect, it } from "vitest";
import { buildBusinessLeadSubmission } from "@lib/leads/business-submission";

describe("buildBusinessLeadSubmission", () => {
  it("builds extended B2B CRM payload fields", () => {
    const lead = buildBusinessLeadSubmission({
      now: new Date("2026-05-13T09:00:00.000Z"),
      input: {
        companyName: "ООО Пример",
        contactPerson: "Ирина",
        phone: "+79990000000",
        email: "sales@example.ru",
        inn: "2300000000",
        segment: "smb",
        service: "internet",
        city: "Краснодар",
        address: "ул. Красная, 1",
        urgency: "7_days",
        employeesOrSites: 3,
        configurationSummary: "Офис, 300 Мбит/с, резерв",
        monthlyEstimate: null,
        oneTimeEstimate: null,
        message: "",
        consent: true,
        website: "",
        formStartedAt: 100,
        sourcePath: "/business/internet/"
      }
    });

    expect(lead.leadType).toBe("b2b");
    expect(lead.contact.inn).toBe("2300000000");
    expect(lead.contact.address).toBe("ул. Красная, 1");
    expect(lead.qualification.leadScore).toBeGreaterThanOrEqual(50);
    expect(lead.qualification.qualification).toMatch(/mql|sql/);
    expect(lead.routing.pipeline).toBe("b2b");
    expect(lead.configuration.summary).toContain("300 Мбит/с");
  });
});
