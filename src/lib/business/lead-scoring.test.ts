import { describe, expect, it } from "vitest";
import { scoreBusinessLead } from "@lib/business/lead-scoring";

describe("scoreBusinessLead", () => {
  it("qualifies urgent colocation leads as SQL with high priority", () => {
    const score = scoreBusinessLead({
      leadType: "b2b",
      companyName: "ООО Пример",
      phone: "+79990000000",
      email: "it@example.ru",
      consentAccepted: true,
      serviceInterest: "colocation",
      urgency: "7_days",
      inn: "2300000000",
      address: "Краснодар",
      employeesOrSites: 2,
      configurationSummary: "2U, 600 Вт, 1G"
    });

    expect(score.qualification).toBe("sql");
    expect(score.priority).toBe("urgent");
    expect(score.score).toBeGreaterThanOrEqual(80);
  });

  it("disqualifies leads without consent", () => {
    const score = scoreBusinessLead({
      leadType: "b2b",
      companyName: "ООО Пример",
      phone: "+79990000000",
      email: null,
      consentAccepted: false,
      serviceInterest: "internet",
      urgency: "planning"
    });

    expect(score.qualification).toBe("disqualified");
    expect(score.priority).toBe("low");
    expect(score.score).toBe(0);
  });
});
