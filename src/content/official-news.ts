export type OfficialNewsItem = {
  title: string;
  summary: string;
  category: "Компания" | "Бизнес" | "Тарифы";
  publishedLabel: string;
  href: string;
  effectiveDate?: string;
  affectedTariffs?: string;
  basis?: string;
};

/**
 * Managed index of publications already available on the official Kubtel website.
 * Editors can update this list without changing page markup; a future CMS adapter can expose
 * the same fields.
 */
export const officialNews: OfficialNewsItem[] = [
  {
    title: "ООО «Кубань-Телеком» — лучший оператор связи города Краснодара 2023 года",
    summary: "Официальная публикация о награде компании и работе команды Kubtel.",
    category: "Компания",
    publishedLabel: "2023",
    href: "https://kubtel.ru/about/news/2023/06/311"
  },
  {
    title: "Kubtel для бизнеса",
    summary:
      "Официальный материал об услугах размещения оборудования и аренды виртуального сервера.",
    category: "Бизнес",
    publishedLabel: "Декабрь 2019",
    href: "https://kubtel.ru/about/news/2019/12/263/"
  },
  {
    title: "Изменение тарифов на услуги международной связи ОАО МТТ",
    summary: "Официальное сообщение Kubtel с таблицей направлений и поминутной стоимости.",
    category: "Тарифы",
    publishedLabel: "Официальный архив",
    effectiveDate: "6 января 2015 года",
    affectedTariffs: "международная связь ОАО «Межрегиональный Транзит Телеком»",
    basis: "изменение тарифов оператора дальней связи",
    href: "https://kubtel.ru/about/news/2015/12/87/"
  }
];
