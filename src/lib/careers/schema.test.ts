import { describe, expect, it } from "vitest";
import { careerApplicationFormSchema } from "@lib/careers/schema";

describe("careerApplicationFormSchema", () => {
  it("normalizes contacts and empty optional fields", () => {
    const input = careerApplicationFormSchema.parse({
      name: "Ирина",
      phone: "8 (900) 123-45-67",
      email: "IRINA@EXAMPLE.RU",
      vacancySlug: "support-specialist",
      resumeUrl: null,
      resumeFile: null,
      message: null,
      consent: "on",
      website: null,
      formStartedAt: null,
      sourcePath: "/careers/"
    });

    expect(input.phone).toBe("+79001234567");
    expect(input.email).toBe("irina@example.ru");
    expect(input.resumeUrl).toBe("");
    expect(input.resumeFile).toBe("");
    expect(input.message).toBe("");
    expect(input.consent).toBe(true);
  });
});
