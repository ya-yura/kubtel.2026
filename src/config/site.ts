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

const basePath = normalizeBasePath(import.meta.env.BASE_URL ?? "/");

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
  paymentUrl: "https://my.kubtel.ru/",
  supportPhone: "8 800 222-17-30",
  salesPhone: "8 800 222-17-30",
  supportEmail: "support@kubtel.ru",
  email: "kubtel@kubtel.ru",
  officeAddress: "350049, г. Краснодар, ул. им. Тургенева, д. 135/1",
  legalAddress: "350020, г. Краснодар, ул. Красная, д. 145/1",
  inn: "2311077082",
  kpp: "231101001",
  ogrn: "1042306433221",
  titleTemplate: "%s | Kubtel",
  themeColor: "#d7569c",
  shortDescription: "Местная команда связи для жителей и\u00a0бизнеса Краснодара.",
  areaServed: "Краснодар",
  countryCode: "RU",
  currency: "RUB",
  dateModified: "2026-05-07",
  audience:
    "Жители Краснодара, которым нужен надёжный домашний интернет, живой сервис и понятные условия."
} as const;

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
