import { describe, expect, it } from "vitest";
import {
  hasHoneypotValue,
  isSuspiciousSubmitSpeed,
  leadFormSchema,
  normalizePhone
} from "@lib/leads/schema";

describe("leadFormSchema", () => {
  it("normalizes Russian phone numbers and selected options", () => {
    const result = leadFormSchema.parse({
      phone: "8 (918) 123-45-67",
      tariff: "home-300",
      options: "routerRent",
      consent: "true",
      sourcePath: "/connect/"
    });

    expect(result.name).toBe("Не указано");
    expect(result.phone).toBe("+79181234567");
    expect(result.address).toBe("");
    expect(result.options).toEqual(["routerRent"]);
    expect(result.consent).toBe(true);
  });

  it("rejects a lead without personal data consent", () => {
    const result = leadFormSchema.safeParse({
      phone: "+79181234567",
      tariff: "home-300",
      consent: false
    });

    expect(result.success).toBe(false);
  });
});

describe("lead spam helpers", () => {
  it("detects honeypot values and suspicious submit speed", () => {
    expect(normalizePhone("+7 918 123-45-67")).toBe("+79181234567");
    expect(hasHoneypotValue({ website: "https://spam.test" })).toBe(true);
    expect(isSuspiciousSubmitSpeed({ formStartedAt: Date.now() })).toBe(true);
  });
});
