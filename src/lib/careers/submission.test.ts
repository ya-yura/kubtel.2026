import { describe, expect, it } from "vitest";
import { buildCareerApplicationSubmission, CareerApplicationError } from "@lib/careers/submission";
import type { JobVacancy } from "@models/domain";

const vacancy: JobVacancy = {
  title: "Специалист технической поддержки",
  slug: "support-specialist",
  department: "Поддержка",
  location: "Краснодар",
  employmentType: "shift",
  status: "open",
  shortDescription: "Помощь абонентам",
  requirements: ["Грамотная речь"],
  conditions: ["Сменный график"],
  isActive: true,
  sortOrder: 10,
  contentSource: {
    status: "needs_verification",
    type: "editorial_assumption",
    label: "Тест",
    checkedAt: null,
    responsible: "content",
    note: ""
  }
};

describe("buildCareerApplicationSubmission", () => {
  it("builds a stable HR payload for CRM, Telegram and outbox", () => {
    const application = buildCareerApplicationSubmission({
      now: new Date("2026-05-20T09:00:00.000Z"),
      vacancies: [vacancy],
      input: {
        name: "Ирина",
        phone: "+79001234567",
        email: "irina@example.ru",
        vacancySlug: "support-specialist",
        message: "Есть опыт в поддержке",
        consent: true,
        website: "",
        formStartedAt: 100,
        sourcePath: "/careers/"
      }
    });

    expect(application.id).toMatch(/^KBT-HR-20260520-/);
    expect(application.applicationType).toBe("career");
    expect(application.vacancy.title).toBe("Специалист технической поддержки");
    expect(application.routing.pipeline).toBe("hr");
  });

  it("rejects inactive or missing vacancies", () => {
    expect(() =>
      buildCareerApplicationSubmission({
        vacancies: [{ ...vacancy, isActive: false }],
        input: {
          name: "Ирина",
          phone: "+79001234567",
          email: "irina@example.ru",
          vacancySlug: "support-specialist",
          message: "",
          consent: true,
          website: "",
          formStartedAt: null,
          sourcePath: "/careers/"
        }
      })
    ).toThrow(CareerApplicationError);
  });
});
