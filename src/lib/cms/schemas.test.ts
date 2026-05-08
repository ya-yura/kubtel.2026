import { describe, expect, it } from "vitest";
import { businessServiceSchema, leadFormVariantSchema } from "@lib/cms/schemas";

const source = {
  status: "confirmed",
  type: "public_site",
  label: "kubtel.ru/legal/",
  url: "https://kubtel.ru/legal/",
  checkedAt: "2026-05-08",
  responsible: "content",
  note: ""
};

describe("CMS normalized schemas", () => {
  it("validates a B2B service contract", () => {
    const parsed = businessServiceSchema.parse({
      title: "Интернет в офис",
      slug: "internet",
      category: "internet",
      summary: "Корпоративный интернет для офиса",
      businessBenefit: "Стабильная связь для рабочих сервисов",
      proofPoints: [
        {
          label: "Симметричный канал",
          value: "Да",
          status: "confirmed",
          source
        }
      ],
      ctaLabel: "Рассчитать интернет",
      priority: "P0",
      relatedSegmentSlugs: ["smb"],
      calculatorSlug: "internet-office",
      formVariantSlug: "b2b-default",
      workflowStatus: "ready_for_review",
      verificationStatus: "needs_verification"
    });

    expect(parsed.slug).toBe("internet");
    expect(parsed.proofPoints[0].source.label).toBe("kubtel.ru/legal/");
  });

  it("rejects an unknown workflow status", () => {
    expect(() =>
      businessServiceSchema.parse({
        title: "Colocation",
        slug: "colocation",
        category: "colocation",
        summary: "Размещение оборудования",
        businessBenefit: "Контролируемая инфраструктура",
        ctaLabel: "Рассчитать размещение",
        workflowStatus: "approved",
        verificationStatus: "confirmed"
      })
    ).toThrow();
  });

  it("validates lead form variants used by the B2B adapter", () => {
    const parsed = leadFormVariantSchema.parse({
      title: "B2B заявка",
      slug: "b2b-default",
      leadType: "b2b",
      formKey: "business-request",
      fields: [
        {
          key: "companyName",
          label: "Компания",
          type: "text",
          required: true,
          maxLength: 160
        }
      ],
      requiredFields: ["companyName", "phone", "consent"],
      routingKey: "business_sales",
      crmPipeline: "b2b",
      consentDocumentSlug: "personal-data-consent",
      workflowStatus: "published"
    });

    expect(parsed.fields[0].options).toEqual([]);
  });
});
