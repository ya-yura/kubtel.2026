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
  { href: "/business/", label: "Бизнесу" },
  { href: "/support/", label: "Поддержка" },
  { href: "/about/", label: "О компании" },
  { href: "/contacts/", label: "Контакты" }
];

export const footerNavItems: NavItem[] = [
  { href: "/tariffs/", label: "Тарифы" },
  { href: "/business/", label: "Бизнесу" },
  { href: "/business/request/", label: "B2B-заявка" },
  { href: "/support/", label: "Поддержка" },
  { href: "/contacts/", label: "Контакты" }
];

export const sitemapRoutes: SitemapRoute[] = [
  {
    path: "/",
    label: "Главная",
    title: "Домашний интернет в Краснодаре",
    description:
      "Kubtel помогает оставить телефон, получить живой звонок и подключить домашний интернет без скрытых условий.",
    changeFrequency: "weekly",
    priority: 1,
    lastModified
  },
  {
    path: "/tariffs/",
    label: "Тарифы",
    title: "Тарифы домашнего интернета",
    description:
      "Сравнение тарифов Kubtel для квартиры, семьи, удаленной работы и ТВ с переходом к обратному звонку.",
    changeFrequency: "weekly",
    priority: 0.9,
    lastModified
  },
  {
    path: "/connect/",
    label: "Подключение",
    title: "Заявка на подключение",
    description:
      "Форма заявки Kubtel: оставьте телефон, а специалист уточнит задачу и предложит подключение.",
    changeFrequency: "weekly",
    priority: 0.9,
    lastModified
  },
  {
    path: "/business/",
    label: "Бизнесу",
    title: "Kubtel для бизнеса",
    description:
      "Связь Kubtel для бизнеса Краснодара: поддержка 24/7, аварийная бригада в течение часа, персональный менеджер и Hot-spot.",
    changeFrequency: "weekly",
    priority: 0.95,
    lastModified
  },
  {
    path: "/business/smb/",
    label: "Малому бизнесу",
    title: "Связь для малого бизнеса",
    description:
      "Kubtel для малого и среднего бизнеса: интернет в офис, телефония, видеонаблюдение и Wi-Fi авторизация.",
    changeFrequency: "weekly",
    priority: 0.82,
    lastModified
  },
  {
    path: "/business/operators/",
    label: "Операторам связи",
    title: "Операторам связи",
    description:
      "Kubtel для операторов связи: инфраструктура, colocation, SEA-IX, партнерская заявка и региональная связность.",
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified
  },
  {
    path: "/business/government/",
    label: "Госсектору",
    title: "Связь для государственного сектора",
    description:
      "Kubtel для государственных учреждений: телеком-услуги, инфраструктура, хранение данных и заявка на консультацию.",
    changeFrequency: "monthly",
    priority: 0.74,
    lastModified
  },
  {
    path: "/business/internet/",
    label: "Интернет в офис",
    title: "Интернет в офис",
    description:
      "Корпоративный интернет Kubtel для офиса и бизнеса в Краснодаре: стабильность, поддержка 24/7, выезд аварийной бригады и заявка на расчет.",
    changeFrequency: "weekly",
    priority: 0.88,
    lastModified
  },
  {
    path: "/business/telephony/",
    label: "Телефония",
    title: "IP-телефония для бизнеса",
    description:
      "IP-телефония Kubtel для бизнеса: виртуальная АТС, многоканальный телефон, номера, линии и заявка на подбор конфигурации.",
    changeFrequency: "weekly",
    priority: 0.84,
    lastModified
  },
  {
    path: "/business/cctv/",
    label: "Видеонаблюдение",
    title: "Видеонаблюдение для бизнеса",
    description:
      "Видеонаблюдение Kubtel для бизнеса: онлайн-просмотр, архив 3-30 дней, камеры Dome/Bullet и заявка на расчет.",
    changeFrequency: "weekly",
    priority: 0.84,
    lastModified
  },
  {
    path: "/business/wifi-auth/",
    label: "Hot-spot",
    title: "Гостевой Wi-Fi Hot-spot",
    description:
      "Гостевой Wi-Fi Hot-spot Kubtel для публичных точек: авторизация посетителей, стабильный доступ и заявка на запуск.",
    changeFrequency: "monthly",
    priority: 0.78,
    lastModified
  },
  {
    path: "/business/vps/",
    label: "VPS",
    title: "Аренда VPS",
    description:
      "VPS/VDS Kubtel для бизнеса: сервер под 1С, CRM, телефонию и удаленный доступ с заявкой на подбор ресурсов.",
    changeFrequency: "monthly",
    priority: 0.78,
    lastModified
  },
  {
    path: "/business/vdi/",
    label: "VDI",
    title: "Виртуальное рабочее место",
    description:
      "VDI Kubtel: аренда виртуального рабочего места для сотрудников, удаленного доступа и масштабирования рабочих мест.",
    changeFrequency: "monthly",
    priority: 0.72,
    lastModified
  },
  {
    path: "/business/colocation/",
    label: "Colocation",
    title: "Colocation",
    description:
      "Colocation Kubtel: размещение оборудования в ЦОД, питание, охрана, связность, SEA-IX и заявка на расчет.",
    changeFrequency: "monthly",
    priority: 0.84,
    lastModified
  },
  {
    path: "/business/datacenter-access/",
    label: "Доступ в ЦОД",
    title: "Заявка на доступ в ЦОД",
    description:
      "Заявка на доступ в ЦОД Kubtel: плановые работы, выбор площадки, дата, время, длительность и описание работ.",
    changeFrequency: "monthly",
    priority: 0.66,
    lastModified
  },
  {
    path: "/business/request/",
    label: "B2B-заявка",
    title: "Заявка для бизнеса",
    description:
      "B2B-заявка Kubtel: компания, контакт, услуга, срочность и расчет связи без простоя.",
    changeFrequency: "weekly",
    priority: 0.86,
    lastModified
  },
  {
    path: "/support/",
    label: "Поддержка",
    title: "Поддержка и FAQ",
    description:
      "Ответы Kubtel по подключению, тарифам, бесплатному доверительному платежу и добровольной блокировке.",
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified
  },
  {
    path: "/about/",
    label: "О компании",
    title: "О локальном провайдере",
    description:
      "Kubtel как локальный интернет-провайдер Краснодара: живое отношение, честные условия и рекомендации клиентов.",
    changeFrequency: "monthly",
    priority: 0.6,
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
