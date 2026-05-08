import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { tariffOptions } from "@models/domain";

const verificationStatus = z.enum(["confirmed", "needs_verification", "draft"]);
const responsibleRole = z.enum(["commercial", "operations", "coverage", "content"]);
const tariffOption = z.enum(tariffOptions);
const sourceType = z.enum([
  "kubtel_team",
  "public_site",
  "legacy_site",
  "technical_audit",
  "editorial_assumption"
]);

const proofSchema = z.object({
  label: z.string(),
  value: z.string(),
  status: verificationStatus
});

const contentSourceSchema = z.object({
  status: verificationStatus,
  type: sourceType,
  label: z.string(),
  checkedAt: z.string().nullable(),
  responsible: responsibleRole,
  note: z.string()
});

const commercialReviewSchema = z.object({
  status: verificationStatus,
  priceStatus: verificationStatus,
  speedStatus: verificationStatus,
  optionsStatus: verificationStatus,
  connectionStatus: verificationStatus,
  requiredEvidence: z.array(z.string()),
  note: z.string()
});

const tariffCollection = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/tariffs" }),
  schema: z.object({
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
    availableOptions: z.array(tariffOption),
    connectionPrice: z.number().nullable(),
    routerRentPrice: z.number().nullable(),
    staticIpPrice: z.number().nullable(),
    isFeatured: z.boolean(),
    sortOrder: z.number(),
    proof: proofSchema,
    contentSource: contentSourceSchema,
    commercialReview: commercialReviewSchema
  })
});

const serviceCollection = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/services" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    category: z.string(),
    shortDescription: z.string(),
    fullDescription: z.string(),
    facts: z.array(proofSchema),
    benefits: z.array(z.string()),
    relatedTariffs: z.array(z.string()),
    contentSource: contentSourceSchema
  })
});

const faqCollection = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/faq" }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    category: z.string(),
    priority: z.number(),
    relatedServices: z.array(z.string()),
    proof: proofSchema,
    contentSource: contentSourceSchema
  })
});

const coverageCollection = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/coverage" }),
  schema: z.object({
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
    contentSource: contentSourceSchema
  })
});

const promoCollection = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/promos" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    startDate: z.string(),
    endDate: z.string().nullable(),
    description: z.string(),
    conditions: z.array(z.string()),
    relatedTariffs: z.array(z.string()),
    targetArea: z.string().nullable(),
    ctaLabel: z.string(),
    proof: proofSchema,
    contentSource: contentSourceSchema
  })
});

export const collections = {
  tariffs: tariffCollection,
  services: serviceCollection,
  faq: faqCollection,
  coverage: coverageCollection,
  promos: promoCollection
};
