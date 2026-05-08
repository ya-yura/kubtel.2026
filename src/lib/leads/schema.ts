import { z } from "astro/zod";
import { tariffOptions } from "@models/domain";

const phonePattern = /^\+[1-9]\d{7,14}$/;

const selectedOptionsSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  },
  z.array(z.enum(tariffOptions)).max(tariffOptions.length)
);

const consentSchema = z
  .union([z.literal(true), z.literal("true"), z.literal("on")])
  .transform(() => true);

const honeypotSchema = z.preprocess((value) => value ?? "", z.string().max(160));

const formStartedAtSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  return Number(value);
}, z.number().int().positive().nullable());

export const leadFormSchema = z.object({
  name: z.string("Укажите имя").trim().min(2, "Укажите имя").max(80, "Имя слишком длинное"),
  phone: z
    .string("Укажите телефон")
    .trim()
    .min(5, "Укажите телефон")
    .max(32, "Телефон слишком длинный")
    .transform(normalizePhone)
    .refine((phone) => phonePattern.test(phone), "Укажите телефон в международном формате"),
  address: z
    .string("Укажите адрес")
    .trim()
    .min(5, "Укажите улицу и дом")
    .max(200, "Адрес слишком длинный"),
  tariff: z.string("Выберите тариф").trim().min(1, "Выберите тариф").max(80, "Некорректный тариф"),
  options: selectedOptionsSchema.default([]),
  consent: consentSchema,
  website: honeypotSchema.default(""),
  formStartedAt: formStartedAtSchema.default(null),
  sourcePath: z.string().trim().max(160).optional().default("/")
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    return `+7${digits}`;
  }

  if (trimmed.startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }

  return trimmed.replace(/[\s()-]/g, "");
}

export function hasHoneypotValue(input: Pick<LeadFormInput, "website">): boolean {
  return input.website.trim().length > 0;
}

export function isSuspiciousSubmitSpeed(
  input: Pick<LeadFormInput, "formStartedAt">,
  now = Date.now()
): boolean {
  if (input.formStartedAt === null) {
    return false;
  }

  return now - input.formStartedAt < 1200;
}
