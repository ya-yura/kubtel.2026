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
  { href: "/individual/configurator/", label: "Услуги" },
  { href: "/news/", label: "Новости" },
  { href: "/payment/", label: "Оплата" },
  { href: "/devices/", label: "Устройства" },
  { href: "/business/", label: "Бизнесу" },
  { href: "/search/", label: "Поиск" },
  { href: "/about/", label: "О компании" },
  { href: "/careers/", label: "Вакансии" },
  { href: "/contacts/", label: "Контакты" }
];

export const footerNavItems: NavItem[] = [
  { href: "/individual/", label: "Частным лицам" },
  { href: "/individual/configurator/", label: "Конфигуратор услуг" },
  { href: "/individual/tv/", label: "Телевидение" },
  { href: "/individual/cctv/", label: "Видеонаблюдение" },
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
    path: "/individual/",
    label: "Частным лицам",
    title: "Услуги Kubtel для физических лиц",
    description:
      "Домашний интернет, Кубтел ТВ и облачное видеонаблюдение: описание услуг и расчёт до заявки.",
    changeFrequency: "weekly",
    priority: 0.94,
    lastModified
  },
  {
    path: "/individual/configurator/",
    label: "Конфигуратор услуг",
    title: "Конфигуратор услуг для физических лиц",
    description:
      "Выберите интернет, ТВ или видеонаблюдение, добавьте оборудование и дополнительные услуги, затем оставьте контакты.",
    changeFrequency: "weekly",
    priority: 0.96,
    lastModified
  },
  {
    path: "/individual/internet/",
    label: "Интернет для дома",
    title: "Домашний интернет Kubtel",
    description:
      "Тарифы домашнего интернета Kubtel для квартиры и частного дома, роутер, статический IP и условия подключения.",
    changeFrequency: "weekly",
    priority: 0.88,
    lastModified
  },
  {
    path: "/individual/tv/",
    label: "Телевидение",
    title: "Кубтел ТВ — 177 каналов и приложения",
    description:
      "Кубтел ТВ: список каналов, приложения, приставка, дополнительные пакеты, оферты и подключение.",
    changeFrequency: "weekly",
    priority: 0.92,
    lastModified
  },
  {
    path: "/individual/cctv/",
    label: "Видеонаблюдение",
    title: "Облачное видеонаблюдение Kubtel Watcher",
    description:
      "Онлайн-просмотр, архив, камеры, приложения и публичная оферта Kubtel Watcher для физических лиц.",
    changeFrequency: "weekly",
    priority: 0.88,
    lastModified
  },
  {
    path: "/business/",
    label: "Бизнесу",
    title: "Размещение оборудования и услуги связи для бизнеса",
    description:
      "ЦОД в Краснодаре, размещение оборудования и сервера, связь для бизнеса, калькуляторы и заявка на расчёт Kubtel.",
    changeFrequency: "weekly",
    priority: 0.95,
    lastModified
  },
  {
    path: "/business/colocation/",
    label: "Размещение оборудования",
    title: "ЦОД в Краснодаре — размещение оборудования и сервера",
    description:
      "Разместить сервер в Краснодаре в ЦОД Kubtel: питание, охрана, связность, IPv4, удалённый доступ и расчёт стоимости.",
    changeFrequency: "weekly",
    priority: 0.99,
    lastModified
  },
  {
    path: "/business/b2b/",
    label: "B2B",
    title: "B2B: связь для бизнеса",
    description:
      "Интернет, телефония, видеонаблюдение, гостевой Wi‑Fi и инфраструктура Kubtel для компаний и предпринимателей.",
    changeFrequency: "weekly",
    priority: 0.9,
    lastModified
  },
  {
    path: "/business/b2o/",
    label: "B2O",
    title: "B2O: услуги для операторов связи",
    description:
      "ЦОД, colocation, связность, cross-connect и партнёрские условия Kubtel для операторов связи.",
    changeFrequency: "monthly",
    priority: 0.86,
    lastModified
  },
  {
    path: "/devices/",
    label: "Устройства",
    title: "Устройства для подключения",
    description:
      "Роутеры, ТВ-приставки, Smart TV-приложения, IP-телефоны и другое оборудование, которое может понадобиться для услуг Kubtel.",
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
    path: "/business/b2g/",
    label: "B2G",
    title: "B2G: связь для государственных заказчиков",
    description:
      "КУБАНЬ-ТЕЛЕКОМ для государственных заказчиков: услуги связи по 44-ФЗ и 223-ФЗ, ЕИС, федеральные ЭТП, телефония, интернет и контакты сектора B2G.",
    changeFrequency: "monthly",
    priority: 0.74,
    lastModified
  },
  {
    path: "/business/datacenter-access/",
    label: "Доступ в ЦОД",
    title: "Заявка на доступ в ЦОД",
    description:
      "Заявка на доступ в ЦОД Kubtel: ФИО, лицевой счёт, телефон, площадка, дата, длительность посещения и планируемые работы.",
    changeFrequency: "monthly",
    priority: 0.78,
    lastModified
  },
  {
    path: "/business/request/",
    label: "Заявка для бизнеса",
    title: "Заявка для бизнеса",
    description:
      "Короткая B2B/B2G-заявка Kubtel: контакт, услуга, адрес или учреждение, предпочтительный канал связи и комментарий.",
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
