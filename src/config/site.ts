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
  legalName: "Kubtel",
  language: "ru",
  locale: "ru_RU",
  origin: normalizeOrigin(import.meta.env.PUBLIC_SITE_URL ?? defaultOrigin),
  basePath,
  defaultTitle: "Интернет Kubtel в Краснодаре",
  defaultDescription: "Домашний интернет, ТВ и заявка на подключение Kubtel в Краснодаре.",
  titleTemplate: "%s | Kubtel",
  themeColor: "#f47b20",
  shortDescription: "Локальная цифровая платформа для подключения жителей Краснодара.",
  areaServed: "Краснодар",
  countryCode: "RU",
  currency: "RUB",
  dateModified: "2026-05-07",
  audience:
    "Жители Краснодара, которым нужен домашний интернет, ТВ и проверка подключения по адресу."
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
