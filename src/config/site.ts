const defaultOrigin = "http://127.0.0.1:4321";

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, "");
}

function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === "/") {
    return "/";
  }

  return `/${basePath.replace(/^\/+|\/+$/g, "")}/`;
}

function getOptionalPublicUrl(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

const basePath = normalizeBasePath(import.meta.env.BASE_URL ?? "/");
const unifiedResidentialPhone = "8 800 222-17-30";
const unifiedCompanyEmail = "kubtel@kubtel.ru";

export const SITE = {
  name: "Kubtel",
  legalName: "ООО «КУБАНЬ-ТЕЛЕКОМ»",
  language: "ru",
  locale: "ru_RU",
  origin: normalizeOrigin(import.meta.env.PUBLIC_SITE_URL ?? defaultOrigin),
  basePath,
  defaultTitle: "Интернет Kubtel в\u00a0Краснодаре",
  defaultDescription:
    "Домашний интернет Kubtel в\u00a0Краснодаре: тарифы, оплата, поддержка и понятное подключение.",
  accountUrl: "https://my.kubtel.ru/",
  paymentUrl: "https://kubtel.ru/individual/pay/",
  paymentDocumentsUrl: "https://kubtel.ru/individual/pay/",
  licensesUrl: "https://kubtel.ru/about/licencies/",
  privacyUrl: "https://kubtel.ru/about/personsdata/",
  individualTermsUrl: "https://kubtel.ru/individual/termsofuse",
  officialDocumentsUrl: "https://kubtel.ru/docs/",
  officialNewsUrl: "https://kubtel.ru/about/news/",
  officialContactsUrl: "https://kubtel.ru/about/contactus/",
  maxChatUrl:
    getOptionalPublicUrl(import.meta.env.PUBLIC_MAX_CHAT_URL) ??
    "https://max.ru/id2311128247_1_bot",
  vkChatUrl:
    getOptionalPublicUrl(import.meta.env.PUBLIC_VK_CHAT_URL) ?? "https://vk.me/club40805692",
  vkGroupUrl: "https://vk.ru/kubtel",
  maxGroupUrl: "https://max.ru/channel_kubtel",
  supportPhone: unifiedResidentialPhone,
  supportDirectPhone: unifiedResidentialPhone,
  salesPhone: unifiedResidentialPhone,
  supportEmail: "support@kubtel.ru",
  email: unifiedCompanyEmail,
  businessEmail: unifiedCompanyEmail,
  businessPhone: "8 861 200-10-60",
  budgetEmail: "tender@kubtel.ru",
  budgetPhone: "8 861 200-10-32",
  officeAddress: "г. Краснодар, ул. им. Володи Головатого, 585",
  legalAddress: "350075, г. Краснодар, ул. Стасова, 182/1",
  inn: "2311128247",
  kpp: "231201001",
  ogrn: "1102311005862",
  titleTemplate: "%s | Kubtel",
  themeColor: "#c43d87",
  shortDescription: "Местная команда связи для жителей и\u00a0бизнеса Краснодара.",
  areaServed: "Краснодар",
  serviceLocations: [
    "Краснодар",
    "Динская",
    "Анапа",
    "Тимашевск",
    "Яблоновский",
    "Тлюстенхабль",
    "Агроном",
    "Дружелюбный",
    "Новая Адыгея"
  ],
  countryCode: "RU",
  currency: "RUB",
  dateModified: "2026-05-07",
  audience:
    "Жители Краснодара, которым нужен надёжный домашний интернет, живой сервис и понятные условия."
} as const;

export const SOCIAL_LINKS = [
  {
    id: "vk",
    label: "ВКонтакте",
    shortLabel: "VK",
    href: SITE.vkGroupUrl,
    description: "Новости и объявления"
  },
  {
    id: "max",
    label: "MAX",
    shortLabel: "MAX",
    href: SITE.maxGroupUrl,
    description: "Новости и общение"
  }
] as const;

export function getAbsoluteUrl(path = "/"): string {
  return new URL(getSitePath(path), `${SITE.origin}/`).href;
}

export function getSitePath(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  if (SITE.basePath === "/") {
    return `/${normalizedPath}`;
  }

  return `${SITE.basePath}${normalizedPath}`;
}

export function getPhoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalizedDigits =
    digits.length === 11 && digits.startsWith("8") ? `7${digits.slice(1)}` : digits;

  return `tel:+${normalizedDigits}`;
}
