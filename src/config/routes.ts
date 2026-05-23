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

const lastModified = "2026-05-08";

export const mainNavItems: NavItem[] = [
  { href: "/tariffs/", label: "Тарифы" },
  { href: "/connect/", label: "Подключение" },
  { href: "/payment/", label: "Оплата" },
  { href: "/devices/", label: "Устройства" },
  { href: "/business/", label: "Бизнесу" },
  { href: "/support/", label: "Поддержка" },
  { href: "/search/", label: "Поиск" },
  { href: "/about/", label: "О компании" },
  { href: "/careers/", label: "Вакансии" },
  { href: "/contacts/", label: "Контакты" }
];

export const footerNavItems: NavItem[] = [
  { href: "/tariffs/", label: "Тарифы" },
  { href: "/payment/", label: "Оплата" },
  { href: "/devices/", label: "Устройства" },
  { href: "/search/", label: "Поиск" },
  { href: "/news/", label: "Новости" },
  { href: "/business/", label: "Бизнесу" },
  { href: "/business/request/", label: "Заявка для бизнеса" },
  { href: "/support/", label: "Поддержка" },
  { href: "/careers/", label: "Вакансии" },
  { href: "/contacts/", label: "Контакты" },
  { href: "/documents/", label: "Документы" }
];

export const sitemapRoutes: SitemapRoute[] = [
  {
    path: "/",
    label: "Главная",
    title: "Домашний интернет в\u00a0Краснодаре",
    description:
      "Kubtel помогает выбрать домашний интернет, проверить подключение, оплатить услуги и обратиться в поддержку.",
    changeFrequency: "weekly",
    priority: 1,
    lastModified
  },
  {
    path: "/tariffs/",
    label: "Тарифы",
    title: "Тарифы домашнего интернета",
    description:
      "Сравнение тарифов Kubtel для квартиры, семьи, видео, онлайн-учёбы и домашних устройств.",
    changeFrequency: "weekly",
    priority: 0.9,
    lastModified
  },
  {
    path: "/connect/",
    label: "Подключение",
    title: "Заявка на подключение",
    description:
      "Форма заявки Kubtel: населённый пункт, адрес, тариф и телефон для связи со специалистом.",
    changeFrequency: "weekly",
    priority: 0.9,
    lastModified
  },
  {
    path: "/business/",
    label: "Бизнесу",
    title: "Услуги связи для бизнеса",
    description:
      "Услуги связи Kubtel для бизнеса: заявка, калькуляторы, доступ в\u00a0ЦОД и оплата услуг.",
    changeFrequency: "weekly",
    priority: 0.95,
    lastModified
  },
  {
    path: "/devices/",
    label: "Устройства",
    title: "Устройства для подключения",
    description:
      "Роутеры, ТВ-приставки, IP-телефоны и другое оборудование, которое может понадобиться для услуг Kubtel.",
    changeFrequency: "monthly",
    priority: 0.74,
    lastModified
  },
  {
    path: "/search/",
    label: "Поиск",
    title: "Поиск по сайту",
    description:
      "Поиск по разделам Kubtel: тарифы, оплата, поддержка, документы, устройства и услуги для бизнеса.",
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified
  },
  {
    path: "/business/smb/",
    label: "Малому бизнесу",
    title: "Связь для малого бизнеса",
    description:
      "Kubtel для малого и среднего бизнеса: интернет в\u00a0офис, телефония, видеонаблюдение и Wi‑Fi-авторизация.",
    changeFrequency: "weekly",
    priority: 0.82,
    lastModified
  },
  {
    path: "/business/operators/",
    label: "Операторам связи",
    title: "Операторам связи",
    description:
      "Kubtel для операторов связи: инфраструктура, colocation, SEA-IX, партнёрская заявка и региональная связность.",
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified
  },
  {
    path: "/business/government/",
    label: "Госсектору",
    title: "Связь для государственного сектора",
    description:
      "Kubtel для государственных учреждений: телеком-услуги, инфраструктура, хранение информации и заявка на консультацию.",
    changeFrequency: "monthly",
    priority: 0.74,
    lastModified
  },
  {
    path: "/business/request/",
    label: "Заявка для бизнеса",
    title: "Заявка для бизнеса",
    description: "Короткая B2B-заявка Kubtel: телефон, услуга, адрес объекта и комментарий.",
    changeFrequency: "weekly",
    priority: 0.86,
    lastModified
  },
  {
    path: "/support/",
    label: "Поддержка",
    title: "Поддержка и FAQ",
    description:
      "Ответы Kubtel по подключению, тарифам, бесплатному доверительному платёжу и добровольной блокировке.",
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified
  },
  {
    path: "/payment/",
    label: "Оплата",
    title: "Оплата услуг Kubtel",
    description:
      "Способы оплаты услуг Kubtel: личный кабинет, банковский платёж и контакты для вопросов по начислениям.",
    changeFrequency: "monthly",
    priority: 0.72,
    lastModified
  },
  {
    path: "/news/",
    label: "Новости",
    title: "Новости и изменения тарифов",
    description:
      "Официальные новости Kubtel: изменения тарифов, сервисные уведомления и важные сообщения для абонентов.",
    changeFrequency: "weekly",
    priority: 0.68,
    lastModified
  },
  {
    path: "/documents/",
    label: "Документы",
    title: "Документы, реквизиты и условия",
    description:
      "Реквизиты ООО «КУБАНЬ-ТЕЛЕКОМ», документы, лицензии, условия оказания услуг связи и политика обработки персональных данных.",
    changeFrequency: "monthly",
    priority: 0.64,
    lastModified
  },
  {
    path: "/about/",
    label: "О компании",
    title: "О локальном провайдере",
    description:
      "Kubtel как местный интернет-провайдер Краснодара: живое отношение, честные условия и рекомендации клиентов.",
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified
  },
  {
    path: "/careers/",
    label: "Вакансии",
    title: "Работа в Kubtel",
    description:
      "Открытые вакансии Kubtel в Краснодаре: технические, клиентские и сервисные роли с простой формой отклика.",
    changeFrequency: "weekly",
    priority: 0.58,
    lastModified
  },
  {
    path: "/contacts/",
    label: "Контакты",
    title: "Контакты для подключения",
    description:
      "Основные сценарии обращения в Kubtel: оставить телефон для подключения, поддержка и офисные контакты.",
    changeFrequency: "monthly",
    priority: 0.6,
    lastModified
  }
];

export function getRouteMetadata(path: string): RouteMetadata | undefined {
  return sitemapRoutes.find((route) => route.path === path);
}
