import { z } from "astro/zod";
import { hasHoneypotValue, isSuspiciousSubmitSpeed, normalizePhone } from "@lib/leads/schema";

const phonePattern = /^\+[1-9]\d{7,14}$/;

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

export const businessLeadFormSchema = z.object({
  companyName: z
    .string("Укажите компанию")
    .trim()
    .min(2, "Укажите компанию")
    .max(160, "Название компании слишком длинное"),
  contactPerson: z
    .string("Укажите контактное лицо")
    .trim()
    .min(2, "Укажите контактное лицо")
    .max(120, "Имя слишком длинное"),
  phone: z
    .string("Укажите телефон")
    .trim()
    .min(5, "Укажите телефон")
    .max(32, "Телефон слишком длинный")
    .transform(normalizePhone)
    .refine((phone) => phonePattern.test(phone), "Укажите телефон в международном формате"),
  email: z
    .string()
    .trim()
    .max(120, "Email слишком длинный")
    .optional()
    .transform((value) => (value ? value : null)),
  segment: z.string().trim().max(80).optional().default(""),
  service: z.string("Выберите услугу").trim().min(1, "Выберите услугу").max(80),
  city: z.string().trim().max(200).optional().default(""),
  urgency: z.enum(["planning", "30_days", "7_days", "asap"]).default("planning"),
  message: z.string().trim().max(800).optional().default(""),
  consent: consentSchema,
  website: honeypotSchema.default(""),
  formStartedAt: formStartedAtSchema.default(null),
  sourcePath: z.string().trim().max(160).optional().default("/business/request/")
});

export type BusinessLeadFormInput = z.infer<typeof businessLeadFormSchema>;

export { hasHoneypotValue, isSuspiciousSubmitSpeed };
