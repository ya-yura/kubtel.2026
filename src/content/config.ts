import { defineCollection, z } from "astro:content";

const verificationStatus = z.enum(["confirmed", "needs_verification", "draft"]);

const proofSchema = z.object({
  label: z.string(),
  value: z.string(),
  status: verificationStatus
});

const tariffCollection = defineCollection({
  type: "data",
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
    availableOptions: z.array(z.string()),
    connectionPrice: z.number().nullable(),
    routerRentPrice: z.number().nullable(),
    staticIpPrice: z.number().nullable(),
    isFeatured: z.boolean(),
    sortOrder: z.number(),
    proof: proofSchema
  })
});

const serviceCollection = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    category: z.string(),
    shortDescription: z.string(),
    fullDescription: z.string(),
    facts: z.array(proofSchema),
    benefits: z.array(z.string()),
    relatedTariffs: z.array(z.string())
  })
});

const faqCollection = defineCollection({
  type: "data",
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    category: z.string(),
    priority: z.number(),
    relatedServices: z.array(z.string())
  })
});

const coverageCollection = defineCollection({
  type: "data",
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
    contactHint: z.string()
  })
});

const promoCollection = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    startDate: z.string(),
    endDate: z.string().nullable(),
    description: z.string(),
    conditions: z.array(z.string()),
    relatedTariffs: z.array(z.string()),
    targetArea: z.string().nullable(),
    ctaLabel: z.string()
  })
});

export const collections = {
  tariffs: tariffCollection,
  services: serviceCollection,
  faq: faqCollection,
  coverage: coverageCollection,
  promos: promoCollection
};
