import { getAbsoluteUrl, SITE } from "@config/site";
import { calculateMonthlyPrice } from "@lib/pricing";
import type { FaqItem, Tariff } from "@models/domain";

export type JsonLdObject = Record<string, unknown>;
export type JsonLdInput = JsonLdObject | JsonLdObject[];
export type PageSchemaType = "WebPage" | "CollectionPage" | "FAQPage" | "ContactPage" | "AboutPage";

type BreadcrumbItem = {
  name: string;
  path: string;
};

type BaseStructuredDataOptions = {
  pageType?: PageSchemaType;
  title: string;
  description: string;
  canonicalPath: string;
  canonicalUrl: string;
  breadcrumbLabel?: string;
};

const SCHEMA_CONTEXT = "https://schema.org";
const organizationId = `${getAbsoluteUrl("/")}#organization`;
const websiteId = `${getAbsoluteUrl("/")}#website`;

function withContext(schema: JsonLdObject): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    ...schema
  };
}

function withoutContext(schema: JsonLdObject): JsonLdObject {
  const { "@context": _context, ...jsonLd } = schema;

  return jsonLd;
}

function buildAreaServed(): JsonLdObject {
  return {
    "@type": "City",
    name: SITE.areaServed,
    addressCountry: SITE.countryCode
  };
}

export function serializeJsonLd(input: JsonLdInput): string {
  return JSON.stringify(input).replaceAll("<", "\\u003c");
}

export function buildOrganizationSchema(): JsonLdObject {
  return withContext({
    "@type": "Organization",
    "@id": organizationId,
    name: SITE.name,
    legalName: SITE.legalName,
    url: getAbsoluteUrl("/"),
    description: SITE.shortDescription,
    areaServed: buildAreaServed(),
    knowsAbout: ["домашний интернет", "цифровое ТВ", "подключение по адресу", "связь в Краснодаре"]
  });
}

export function buildWebSiteSchema(): JsonLdObject {
  return withContext({
    "@type": "WebSite",
    "@id": websiteId,
    name: SITE.name,
    url: getAbsoluteUrl("/"),
    inLanguage: SITE.language,
    publisher: {
      "@id": organizationId
    }
  });
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[], idPath: string): JsonLdObject {
  return withContext({
    "@type": "BreadcrumbList",
    "@id": `${getAbsoluteUrl(idPath)}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.path)
    }))
  });
}

export function buildBaseStructuredData(options: BaseStructuredDataOptions): JsonLdObject[] {
  const {
    pageType = "WebPage",
    title,
    description,
    canonicalPath,
    canonicalUrl,
    breadcrumbLabel
  } = options;
  const pageId = `${canonicalUrl}#webpage`;
  const breadcrumb =
    canonicalPath === "/"
      ? null
      : buildBreadcrumbSchema(
          [
            { name: "Главная", path: "/" },
            { name: breadcrumbLabel ?? title, path: canonicalPath }
          ],
          canonicalPath
        );
  const pageSchema: JsonLdObject = withContext({
    "@type": pageType,
    "@id": pageId,
    url: canonicalUrl,
    name: title,
    description,
    inLanguage: SITE.language,
    isPartOf: {
      "@id": websiteId
    },
    about: {
      "@id": organizationId
    },
    publisher: {
      "@id": organizationId
    },
    dateModified: SITE.dateModified
  });

  if (breadcrumb) {
    pageSchema.breadcrumb = {
      "@id": `${getAbsoluteUrl(canonicalPath)}#breadcrumb`
    };
  }

  return [
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    pageSchema,
    ...(breadcrumb ? [breadcrumb] : [])
  ];
}

export function buildOfferCatalogSchema(tariffs: Tariff[], pagePath = "/tariffs/"): JsonLdObject {
  return withContext({
    "@type": "OfferCatalog",
    "@id": `${getAbsoluteUrl(pagePath)}#tariff-offers`,
    name: "Тарифы Kubtel",
    itemListElement: tariffs.map((tariff, index) => {
      const price = calculateMonthlyPrice(tariff);
      const availability =
        tariff.commercialReview.status === "confirmed"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder";

      return {
        "@type": "Offer",
        position: index + 1,
        name: tariff.title,
        description: tariff.benefitDescription,
        url: getAbsoluteUrl(`/connect/?tariff=${tariff.slug}#address-check`),
        price: price.total,
        priceCurrency: SITE.currency,
        availability,
        itemOffered: {
          "@type": "Service",
          name: `Домашний интернет ${tariff.title}`,
          serviceType: "Домашний интернет",
          provider: {
            "@id": organizationId
          },
          areaServed: buildAreaServed(),
          additionalProperty: [
            {
              "@type": "PropertyValue",
              name: "Скорость загрузки",
              value: `${tariff.speedDownload} Мбит/с`
            },
            {
              "@type": "PropertyValue",
              name: "Статус коммерческих данных",
              value: tariff.commercialReview.status
            }
          ]
        }
      };
    })
  });
}

export function buildInternetServiceSchema(tariffs: Tariff[], pagePath = "/"): JsonLdObject {
  const offerCatalog = withoutContext(buildOfferCatalogSchema(tariffs, pagePath));

  return withContext({
    "@type": "Service",
    "@id": `${getAbsoluteUrl(pagePath)}#internet-service`,
    name: "Домашний интернет и ТВ Kubtel",
    serviceType: "Домашний интернет",
    description: SITE.defaultDescription,
    provider: {
      "@id": organizationId
    },
    areaServed: buildAreaServed(),
    audience: {
      "@type": "Audience",
      audienceType: SITE.audience
    },
    hasOfferCatalog: offerCatalog
  });
}

export function buildFaqSchema(items: FaqItem[], pagePath: string): JsonLdObject {
  return withContext({
    "@type": "FAQPage",
    "@id": `${getAbsoluteUrl(pagePath)}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  });
}
