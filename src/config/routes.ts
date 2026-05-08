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
    path: "/business/",
    label: "Бизнесу",
    title: "Kubtel для бизнеса",
    description:
      "Интернет, телефония, видеонаблюдение, Wi-Fi авторизация, VPS, VDI и colocation для бизнеса Краснодара.",
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
      "Корпоративный интернет Kubtel для офиса и бизнеса в Краснодаре: скорость, резервирование, статический IP и заявка на расчет.",
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
    label: "Wi-Fi авторизация",
    title: "Wi-Fi авторизация",
    description:
      "Wi-Fi авторизация Kubtel для публичных точек: SMS, звонок, ваучеры, брендированная страница и выбор тарифа.",
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
      "B2B-заявка Kubtel: компания, контакт, услуга, сегмент, срочность и конфигурация для расчета.",
    changeFrequency: "weekly",
    priority: 0.86,
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
