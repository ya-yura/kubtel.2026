import { z } from "astro/zod";
import { normalizePhone } from "@lib/leads/schema";

const phonePattern = /^\+[1-9]\d{7,14}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess((value) => value ?? "", z.string().trim().max(maxLength));

const optionalNameSchema = optionalTrimmedString(80)
  .refine((value) => value.length === 0 || value.length >= 2, "Укажите имя полностью")
  .transform((value) => value || "Не указано");

const optionalEmailSchema = optionalTrimmedString(160).refine(
  (value) => value.length === 0 || emailPattern.test(value),
  "Проверьте адрес электронной почты"
);

const consentSchema = z
  .union([z.literal(true), z.literal("true"), z.literal("on")])
  .transform(() => true);

const honeypotSchema = z.preprocess((value) => value ?? "", z.string().max(160));

const formStartedAtSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return typeof value === "number" ? value : Number(value);
}, z.number().int().positive().nullable());

export const configuratorFormSchema = z.object({
  name: optionalNameSchema,
  phone: z
    .string("Укажите телефон")
    .trim()
    .min(5, "Укажите телефон")
    .max(32, "Телефон слишком длинный")
    .transform(normalizePhone)
    .refine((phone) => phonePattern.test(phone), "Укажите телефон в международном формате"),
  email: optionalEmailSchema.transform((value) => value || null),
  address: optionalTrimmedString(240),
  service: z.enum(["internet", "tv", "cctv"]),
  configuration: z.string().trim().min(2, "Конфигурация услуги не передана").max(12000),
  consent: consentSchema,
  website: honeypotSchema.default(""),
  formStartedAt: formStartedAtSchema.default(null),
  sourcePath: z.string().trim().max(160).optional().default("/")
});

export type ConfiguratorFormInput = z.infer<typeof configuratorFormSchema>;

export function hasHoneypotValue(input: Pick<ConfiguratorFormInput, "website">): boolean {
  return input.website.trim().length > 0;
}

export function isSuspiciousSubmitSpeed(
  input: Pick<ConfiguratorFormInput, "formStartedAt">,
  now = Date.now()
): boolean {
  if (input.formStartedAt === null) {
    return false;
  }

  return now - input.formStartedAt < 1200;
}
