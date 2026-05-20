import { z } from "astro/zod";
import { hasHoneypotValue, isSuspiciousSubmitSpeed, normalizePhone } from "@lib/leads/schema";

const phonePattern = /^\+[1-9]\d{7,14}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const optionalText = (maxLength: number) =>
  z
    .preprocess((value) => value ?? "", z.string().trim().max(maxLength))
    .transform((value) => (value ? value : ""));

export const careerApplicationFormSchema = z.object({
  name: z
    .string("Укажите имя")
    .trim()
    .min(2, "Укажите имя полностью")
    .max(100, "Имя слишком длинное"),
  phone: z
    .string("Укажите телефон")
    .trim()
    .min(5, "Укажите телефон")
    .max(32, "Телефон слишком длинный")
    .transform(normalizePhone)
    .refine((phone) => phonePattern.test(phone), "Укажите телефон в международном формате"),
  email: z
    .string("Укажите e-mail")
    .trim()
    .max(120, "E-mail слишком длинный")
    .refine((value) => emailPattern.test(value), "Укажите корректный e-mail")
    .transform((value) => value.toLowerCase()),
  vacancySlug: z.string("Выберите вакансию").trim().min(1, "Выберите вакансию").max(120),
  message: optionalText(1200),
  consent: consentSchema,
  website: honeypotSchema.default(""),
  formStartedAt: formStartedAtSchema.default(null),
  sourcePath: z.string().trim().max(160).optional().default("/careers/")
});

export type CareerApplicationFormInput = z.infer<typeof careerApplicationFormSchema>;

export { hasHoneypotValue, isSuspiciousSubmitSpeed };
