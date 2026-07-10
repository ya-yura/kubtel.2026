import { describe, expect, it } from "vitest";
import {
  buildBusinessLeadEmailSubject,
  buildBusinessLeadEmailText,
  sendBusinessLeadToEmail
} from "@lib/integrations/email";
import { buildBusinessLeadSubmission } from "@lib/leads/business-submission";

function createBudgetLead() {
  return buildBusinessLeadSubmission({
    now: new Date("2026-07-10T10:00:00.000Z"),
    input: {
      companyName: "Бюджетное учреждение",
      contactPerson: "Анна Петровна",
      phone: "+78612001032",
      mobilePhone: null,
      preferredContact: "e-mail",
      email: "office@example.ru",
      inn: null,
      segment: "b2g",
      service: "b2g-consultation",
      city: "",
      address: "Краснодар",
      urgency: "asap",
      employeesOrSites: null,
      configurationSummary: "Нужны документы для подключения",
      monthlyEstimate: null,
      oneTimeEstimate: null,
      message: "",
      consent: true,
      website: "",
      formStartedAt: 100,
      sourcePath: "/business/request/?segment=b2g"
    }
  });
}

describe("business lead email delivery", () => {
  it("formats a budget request for the dedicated recipient", () => {
    const lead = createBudgetLead();

    expect(buildBusinessLeadEmailSubject(lead)).toContain("Бюджетная организация");
    expect(buildBusinessLeadEmailText(lead)).toContain("Получатель: tender@kubtel.ru");
    expect(buildBusinessLeadEmailText(lead)).toContain("Нужны документы для подключения");
  });

  it("skips delivery safely when SMTP is not configured", async () => {
    const result = await sendBusinessLeadToEmail(createBudgetLead(), {});

    expect(result).toMatchObject({ channel: "email", status: "skipped" });
  });
});
