import { z } from "astro/zod";

const configuratorChoiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  monthlyPrice: z.number().nonnegative(),
  oneTimePrice: z.number().nonnegative(),
  default: z.boolean().optional()
});

const configuratorFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["select", "radio", "checkbox", "counter"]),
  required: z.boolean().optional(),
  multiple: z.boolean().optional(),
  help: z.string().optional(),
  helpLink: z
    .object({
      label: z.string().min(1),
      href: z.string().min(1)
    })
    .optional(),
  unit: z.string().optional(),
  min: z.number().int().nonnegative().optional(),
  max: z.number().int().positive().optional(),
  step: z.number().positive().optional(),
  showWhen: z
    .object({
      fieldId: z.string().min(1),
      equals: z.union([z.string(), z.number(), z.boolean()]).optional(),
      in: z.array(z.union([z.string(), z.number(), z.boolean()])).optional()
    })
    .optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
  monthlyPrice: z.number().nonnegative().optional(),
  oneTimePrice: z.number().nonnegative().optional(),
  priceByFieldId: z.string().min(1).optional(),
  priceByFieldIds: z.array(z.string().min(1)).min(1).optional(),
  monthlyPriceBy: z.record(z.string(), z.number().nonnegative()).optional(),
  oneTimePriceBy: z.record(z.string(), z.number().nonnegative()).optional(),
  choices: z.array(configuratorChoiceSchema).optional()
});

const appLinkSchema = z.object({
  label: z.string().min(1),
  platform: z.string().min(1),
  href: z.string().refine(isAbsoluteUrl, "Ссылка должна быть абсолютной"),
  external: z.boolean().optional()
});

const offerLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().refine(isAbsoluteUrl, "Ссылка должна быть абсолютной")
});

function isAbsoluteUrl(value: string): boolean {
  try {
    return Boolean(new URL(value).protocol);
  } catch {
    return false;
  }
}

export const configuratorSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  updatedAt: z.string(),
  sourceNote: z.string(),
  services: z.array(
    z.object({
      id: z.enum(["internet", "cctv"]),
      tabLabel: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      eyebrow: z.string().min(1),
      fields: z.array(configuratorFieldSchema),
      notes: z.array(z.string())
    })
  ),
  tv: z.object({
    channelCount: z.number().int().positive(),
    channelGroups: z.array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        channels: z.array(
          z.object({
            id: z.string().min(1),
            name: z.string().min(1),
            logo: z.string().min(1).nullable().optional(),
            description: z.string().optional()
          })
        )
      })
    ),
    appLinks: z.array(appLinkSchema),
    offers: z.array(offerLinkSchema),
    setupSteps: z.array(z.string()),
    supportedDevices: z.array(z.string())
  }),
  cctv: z.object({
    appLinks: z.array(appLinkSchema),
    offers: z.array(offerLinkSchema),
    benefits: z.array(z.string()),
    setupSteps: z.array(z.string()),
    cameraModels: z.array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        price: z.number().nonnegative(),
        specs: z.array(z.string())
      })
    )
  }),
  internet: z.object({
    offers: z.array(offerLinkSchema),
    benefits: z.array(z.string()),
    connectionSteps: z.array(z.string())
  })
});
