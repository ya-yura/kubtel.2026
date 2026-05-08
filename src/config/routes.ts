export type NavItem = {
  href: string;
  label: string;
};

export type SitemapRoute = {
  path: string;
  label: string;
  title: string;
  description: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
  lastModified: string;
};

export type RouteMetadata = SitemapRoute;

const lastModified = "2026-05-07";

export const mainNavItems: NavItem[] = [
  { href: "/tariffs/", label: "Тарифы" },
  { href: "/connect/", label: "Подключение" },
  { href: "/support/", label: "Поддержка" },
  { href: "/about/", label: "О компании" },
  { href: "/contacts/", label: "Контакты" }
];

export const footerNavItems: NavItem[] = [
  { href: "/tariffs/", label: "Тарифы" },
  { href: "/support/", label: "Поддержка" },
  { href: "/contacts/", label: "Контакты" }
];

export const sitemapRoutes: SitemapRoute[] = [
  {
    path: "/",
    label: "Главная",
    title: "Домашний интернет в Краснодаре",
    description:
      "Kubtel помогает проверить адрес, выбрать домашний интернет или ТВ и отправить заявку локальной команде в Краснодаре.",
    changeFrequency: "weekly",
    priority: 1,
    lastModified
  },
  {
    path: "/tariffs/",
    label: "Тарифы",
    title: "Тарифы домашнего интернета",
    description:
      "Сравнение тарифов Kubtel для квартиры, семьи, удаленной работы и ТВ с понятным переходом к проверке адреса.",
    changeFrequency: "weekly",
    priority: 0.9,
    lastModified
  },
  {
    path: "/connect/",
    label: "Подключение",
    title: "Проверка адреса подключения",
    description:
      "Форма заявки Kubtel: адрес, тариф, опции, контакт и серверная проверка возможности подключения в Краснодаре.",
    changeFrequency: "weekly",
    priority: 0.9,
    lastModified
  },
  {
    path: "/support/",
    label: "Поддержка",
    title: "Поддержка и FAQ",
    description:
      "Ответы Kubtel по подключению, тарифам, частному сектору и сценариям обращения в поддержку.",
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified
  },
  {
    path: "/about/",
    label: "О компании",
    title: "О локальном провайдере",
    description:
      "Смысловой каркас страницы Kubtel как локального интернет-провайдера для жителей Краснодара.",
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified
  },
  {
    path: "/contacts/",
    label: "Контакты",
    title: "Контакты для подключения",
    description:
      "Основные сценарии обращения в Kubtel: проверка адреса, поддержка и уточнение офисных контактов.",
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified
  }
];

export function getRouteMetadata(path: string): RouteMetadata | undefined {
  return sitemapRoutes.find((route) => route.path === path);
}
