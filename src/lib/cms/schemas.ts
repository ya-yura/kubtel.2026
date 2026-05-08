import { z } from "zod";
import { tariffOptions } from "@models/domain";

export const verificationStatusSchema = z.enum(["confirmed", "needs_verification", "draft"]);

export const workflowStatusSchema = z.enum([
  "draft",
  "ready_for_review",
  "commercial_approved",
  "legal_approved",
  "published",
  "archived"
]);

const domainResponsibleRoleSchema = z.enum(["commercial", "operations", "coverage", "content"]);

const cmsResponsibleRoleSchema = z.enum([
  "commercial",
  "operations",
  "coverage",
  "content",
  "legal",
  "design",
  "developer"
]);

const sourceTypeSchema = z.enum([
  "kubtel_team",
  "public_site",
  "legacy_site",
  "technical_audit",
  "editorial_assumption"
]);

export const domainProofSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  status: verificationStatusSchema
});

export const domainContentSourceSchema = z.object({
  status: verificationStatusSchema,
  type: sourceTypeSchema,
  label: z.string().min(1),
  checkedAt: z.string().nullable(),
  responsible: domainResponsibleRoleSchema,
  note: z.string()
});

export const cmsContentSourceSchema = z.object({
  status: verificationStatusSchema,
  type: sourceTypeSchema,
  label: z.string().min(1),
  url: z.string().url().nullable().default(null),
  checkedAt: z.string().nullable(),
  responsible: cmsResponsibleRoleSchema,
  note: z.string().default("")
});

export const cmsProofPointSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  description: z.string().nullable().default(null),
  status: verificationStatusSchema,
  source: cmsContentSourceSchema
});

export const commercialReviewSchema = z.object({
  status: verificationStatusSchema,
  priceStatus: verificationStatusSchema,
  speedStatus: verificationStatusSchema.optional(),
  optionsStatus: verificationStatusSchema.optional(),
  connectionStatus: verificationStatusSchema.optional(),
  requiredEvidence: z.array(z.string()).default([]),
  note: z.string().default("")
});

export const domainCommercialReviewSchema = z.object({
  status: verificationStatusSchema,
  priceStatus: verificationStatusSchema,
  speedStatus: verificationStatusSchema,
  optionsStatus: verificationStatusSchema,
  connectionStatus: verificationStatusSchema,
  requiredEvidence: z.array(z.string()).default([]),
  note: z.string().default("")
});

export const moneySchema = z.object({
  amount: z.number().int().nonnegative().nullable(),
  currency: z.literal("RUB").default("RUB"),
  status: verificationStatusSchema
});

export const tariffSchema = z.object({
  title: z.string(),
  slug: z.string(),
  audience: z.array(z.string()),
  speedDownload: z.number(),
  speedUpload: z.number().nullable(),
  priceMonth: z.number(),
  promoPrice: z.number().nullable(),
  promoPeriod: z.string().nullable(),
  benefitDescription: z.string(),
  bestFor: z.array(z.string()),
  includedServices: z.array(z.string()),
  availableOptions: z.array(z.enum(tariffOptions)),
  connectionPrice: z.number().nullable(),
  routerRentPrice: z.number().nullable(),
  staticIpPrice: z.number().nullable(),
  isFeatured: z.boolean(),
  sortOrder: z.number(),
  proof: domainProofSchema,
  contentSource: domainContentSourceSchema,
  commercialReview: domainCommercialReviewSchema
});

export const serviceSchema = z.object({
  title: z.string(),
  slug: z.string(),
  category: z.string(),
  shortDescription: z.string(),
  fullDescription: z.string(),
  facts: z.array(domainProofSchema),
  benefits: z.array(z.string()),
  relatedTariffs: z.array(z.string()),
  contentSource: domainContentSourceSchema
});

export const faqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.string(),
  priority: z.number(),
  relatedServices: z.array(z.string()),
  proof: domainProofSchema,
  contentSource: domainContentSourceSchema
});

export const coverageAreaSchema = z.object({
  title: z.string(),
  slug: z.string(),
  type: z.enum(["city", "district", "street", "housing_complex", "private_sector"]),
  city: z.string(),
  district: z.string().nullable(),
  streets: z.array(z.string()),
  houses: z.array(z.string()),
  connectionStatus: z.enum(["available", "manual_check", "unavailable", "draft"]),
  availableTariffs: z.array(z.string()),
  contactHint: z.string(),
  contentSource: domainContentSourceSchema
});

export const promoSchema = z.object({
  title: z.string(),
  slug: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  description: z.string(),
  conditions: z.array(z.string()),
  relatedTariffs: z.array(z.string()),
  targetArea: z.string().nullable(),
  ctaLabel: z.string(),
  proof: domainProofSchema,
  contentSource: domainContentSourceSchema
});

export const businessServiceSchema = z.object({
  title: z.string(),
  slug: z.string(),
  category: z.enum([
    "internet",
    "telephony",
    "cctv",
    "wifi_auth",
    "vps",
    "vdi",
    "colocation",
    "datacenter_access",
    "operators",
    "government"
  ]),
  summary: z.string(),
  businessBenefit: z.string(),
  proofPoints: z.array(cmsProofPointSchema).default([]),
  ctaLabel: z.string(),
  priority: z.enum(["P0", "P1", "P2"]).default("P1"),
  relatedSegmentSlugs: z.array(z.string()).default([]),
  calculatorSlug: z.string().nullable().default(null),
  formVariantSlug: z.string().nullable().default(null),
  workflowStatus: workflowStatusSchema,
  verificationStatus: verificationStatusSchema
});

export const businessSegmentSchema = z.object({
  title: z.string(),
  slug: z.string(),
  audience: z.array(z.string()).default([]),
  painPoints: z.array(z.string()).default([]),
  triggers: z.array(z.string()).default([]),
  primaryCta: z.string(),
  relatedServiceSlugs: z.array(z.string()).default([]),
  formVariantSlug: z.string().nullable().default(null),
  workflowStatus: workflowStatusSchema
});

export const businessCalculatorSchema = z.object({
  title: z.string(),
  slug: z.string(),
  calculatorType: z.enum([
    "internet",
    "telephony",
    "cctv",
    "vps",
    "vdi",
    "colocation",
    "wifi_auth"
  ]),
  formulaVersion: z.string(),
  disclaimer: z.string(),
  requiredConsultation: z.boolean(),
  pricingStatus: verificationStatusSchema,
  optionSlugs: z.array(z.string()).default([]),
  workflowStatus: workflowStatusSchema
});

export const calculatorOptionSchema = z.object({
  title: z.string(),
  slug: z.string(),
  fieldKey: z.string(),
  inputType: z.enum(["select", "number", "checkbox", "radio", "slider"]),
  valueType: z.enum(["string", "number", "boolean"]),
  unit: z.string().nullable().default(null),
  min: z.number().nullable().default(null),
  max: z.number().nullable().default(null),
  step: z.number().nullable().default(null),
  defaultValue: z.unknown().nullable().default(null),
  priceMonthly: moneySchema,
  priceOneTime: moneySchema,
  requiredConsultation: z.boolean().default(false),
  sortOrder: z.number().int(),
  workflowStatus: workflowStatusSchema
});

export const leadFormVariantSchema = z.object({
  title: z.string(),
  slug: z.string(),
  leadType: z.enum(["b2c", "b2b", "datacenter_access", "operator_partner"]),
  formKey: z.string(),
  fields: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(["text", "tel", "email", "select", "textarea", "number", "checkbox", "hidden"]),
      required: z.boolean(),
      maxLength: z.number().int().nullable().default(null),
      options: z.array(z.string()).default([])
    })
  ),
  requiredFields: z.array(z.string()).default([]),
  routingKey: z.string(),
  crmPipeline: z.enum(["b2c", "b2b", "operators", "datacenter"]),
  consentDocumentSlug: z.string(),
  workflowStatus: workflowStatusSchema
});
