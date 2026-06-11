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
        mobilePhone: null,
        preferredContact: "",
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

  it("routes B2G requests to the dedicated pipeline with 30 minute response SLA", () => {
    const lead = buildBusinessLeadSubmission({
      now: new Date("2026-06-11T09:00:00.000Z"),
      input: {
        companyName: "Муниципальное учреждение",
        contactPerson: "Анна Петровна",
        phone: "+78612001032",
        mobilePhone: "+79990000000",
        preferredContact: "рабочий телефон",
        email: "tender@example.ru",
        inn: null,
        segment: "b2g",
        service: "b2g-consultation",
        city: "",
        address: "Краснодар",
        urgency: "planning",
        employeesOrSites: null,
        configurationSummary: "Просим связаться по услугам связи для государственного заказчика",
        monthlyEstimate: null,
        oneTimeEstimate: null,
        message: "",
        consent: true,
        website: "",
        formStartedAt: 100,
        sourcePath: "/business/request/?segment=b2g"
      }
    });

    expect(lead.routing.pipeline).toBe("b2g");
    expect(lead.routing.department).toBe("b2g");
    expect(lead.routing.priority).toBe("urgent");
    expect(lead.routing.slaResponseMinutes).toBe(30);
    expect(lead.configuration.summary).toContain("предпочтительный канал связи: рабочий телефон");
    expect(lead.configuration.details.mobilePhone).toBe("+79990000000");
  });
});
