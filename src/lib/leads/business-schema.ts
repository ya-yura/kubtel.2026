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

const nullableText = (maxLength: number) =>
  z
    .preprocess((value) => value ?? "", z.string().trim().max(maxLength))
    .transform((value) => (value ? value : null));

const optionalText = (maxLength: number) =>
  z
    .preprocess((value) => value ?? "", z.string().trim().max(maxLength))
    .transform((value) => (value ? value : ""));

const requiredText = (maxLength: number, message: string) =>
  z.preprocess((value) => value ?? "", z.string().trim().min(1, message).max(maxLength, message));

const nullableNumber = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return Number(value);
}, z.number().nonnegative().nullable());

export const businessLeadFormSchema = z.object({
  companyName: z
    .preprocess(
      (value) => value ?? "",
      z.string().trim().max(160, "Название компании слишком длинное")
    )
    .transform((value) => (value ? value : "Компания не указана")),
  contactPerson: z
    .preprocess((value) => value ?? "", z.string().trim().max(120, "Имя слишком длинное"))
    .transform((value) => (value ? value : "Контакт не указан")),
  phone: z
    .string("Укажите телефон")
    .trim()
    .min(5, "Укажите телефон")
    .max(32, "Телефон слишком длинный")
    .transform(normalizePhone)
    .refine((phone) => phonePattern.test(phone), "Укажите телефон в международном формате"),
  email: nullableText(120),
  inn: nullableText(12),
  segment: optionalText(80),
  service: requiredText(80, "Выберите услугу"),
  city: optionalText(200),
  address: requiredText(240, "Укажите город или адрес объекта"),
  urgency: z.enum(["planning", "30_days", "7_days", "asap"]).default("planning"),
  employeesOrSites: nullableNumber.default(null),
  configurationSummary: nullableText(1200),
  monthlyEstimate: nullableNumber.default(null),
  oneTimeEstimate: nullableNumber.default(null),
  message: optionalText(800),
  consent: consentSchema,
  website: honeypotSchema.default(""),
  formStartedAt: formStartedAtSchema.default(null),
  sourcePath: z.string().trim().max(160).optional().default("/business/request/")
});

export type BusinessLeadFormInput = z.infer<typeof businessLeadFormSchema>;

export { hasHoneypotValue, isSuspiciousSubmitSpeed };
