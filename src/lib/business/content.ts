export type ProofStatus = "confirmed" | "needs_verification" | "draft";

export type BusinessProof = {
  label: string;
  value: string;
  status: ProofStatus;
};

export type BusinessService = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  businessBenefit: string;
  proofPoints: BusinessProof[];
  ctaLabel: string;
  priority: "P0" | "P1";
  audience: string[];
  options: string[];
  calculatorFields: string[];
  relatedServices: string[];
  seoTitle: string;
  seoDescription: string;
};

export type BusinessSegment = {
  slug: string;
  title: string;
  summary: string;
  pain: string;
  trigger: string;
  ctaLabel: string;
  fields: string[];
  serviceSlugs: string[];
  seoTitle: string;
  seoDescription: string;
};

export const businessServices: BusinessService[] = [
  {
    slug: "internet",
    title: "Интернет в\u00a0офис",
    category: "Связь",
    summary: "Корпоративный интернет для офиса, магазина, склада или точки обслуживания.",
    businessBenefit:
      "Рабочие сервисы, кассы, телефония и видеонаблюдение остаются на связи, а вопросы решаются через поддержку 24/7 и персонального менеджера.",
    proofPoints: [
      { label: "Поддержка", value: "24/7", status: "confirmed" },
      { label: "Аварийная бригада", value: "выезд в\u00a0течение часа", status: "confirmed" },
      { label: "Платежи", value: "кредитный лимит для бизнеса", status: "confirmed" }
    ],
    ctaLabel: "Подключить",
    priority: "P0",
    audience: ["офисы", "магазины", "клиники", "склады"],
    options: ["скорость", "резервный канал", "статический IP", "настройка роутера"],
    calculatorFields: ["адрес", "скорость", "резервирование", "статические IP"],
    relatedServices: ["telephony", "wifi-auth", "cctv"],
    seoTitle: "Интернет в\u00a0офис в\u00a0Краснодаре",
    seoDescription:
      "Корпоративный интернет Kubtel для офиса и бизнеса в\u00a0Краснодаре: стабильный канал, поддержка 24/7, выезд аварийной бригады и заявка на расчёт."
  },
  {
    slug: "static-ip",
    title: "Статические IP-адреса",
    category: "Связь",
    summary:
      "Выделенные IP-адреса для касс, VPN, удалённого доступа, видеонаблюдения, серверов и сервисов, которым нужен стабильный внешний адрес.",
    businessBenefit:
      "Администраторы и подрядчики получают предсказуемый доступ к инфраструктуре, а бизнес не теряет управление сервисами из-за смены адреса.",
    proofPoints: [
      { label: "Сценарии", value: "кассы, VPN, камеры, серверы", status: "confirmed" },
      { label: "Поддержка", value: "через персонального менеджера", status: "confirmed" },
      { label: "Подключение", value: "в\u00a0составе корпоративной связи", status: "confirmed" }
    ],
    ctaLabel: "Подключить",
    priority: "P0",
    audience: ["офисы", "магазины", "склады", "IT-команды"],
    options: ["количество IPv4", "назначение", "маршрутизация", "привязка к\u00a0услуге"],
    calculatorFields: ["лицевой счет", "количество IP", "адрес объекта", "назначение"],
    relatedServices: ["internet", "vps", "colocation"],
    seoTitle: "Статические IP-адреса для бизнеса в\u00a0Краснодаре",
    seoDescription:
      "Статические IP-адреса Kubtel для бизнеса: VPN, кассы, видеонаблюдение, серверы и заявка на подключение."
  },
  {
    slug: "telephony",
    title: "Телефония и IP-телефония",
    category: "Связь",
    summary:
      "Подбор телефонной схемы для офиса: IP-телефония, многоканальный телефон, виртуальная АТС, номера и автооператор.",
    businessBenefit:
      "Продажи и поддержка получают управляемую схему входящих звонков без отдельной телефонной инфраструктуры.",
    proofPoints: [
      { label: "Виртуальная АТС", value: "есть на публичном сайте", status: "confirmed" },
      { label: "Номера и линии", value: "есть в\u00a0конфигураторе", status: "confirmed" },
      { label: "CRM-интеграция", value: "требует сверки", status: "needs_verification" }
    ],
    ctaLabel: "Подключить",
    priority: "P0",
    audience: ["офисы продаж", "службы поддержки", "клиники", "сервисы"],
    options: [
      "тип подключения",
      "SIP-порты",
      "городские номера",
      "одновременные внешние разговоры",
      "автооператор"
    ],
    calculatorFields: [
      "SIP-порты",
      "городские номера",
      "одновременные внешние разговоры",
      "виртуальная АТС",
      "автооператор"
    ],
    relatedServices: ["internet", "vps"],
    seoTitle: "IP-телефония для бизнеса в\u00a0Краснодаре",
    seoDescription:
      "IP-телефония Kubtel для бизнеса: виртуальная АТС, многоканальный телефон, номера, линии и заявка на подбор конфигурации."
  },
  {
    slug: "cctv",
    title: "Видеонаблюдение для бизнеса",
    category: "Безопасность",
    summary:
      "Облачное видеонаблюдение Kubtel Watcher с онлайн-доступом, архивом и камерами Dome/Bullet для точек и складов.",
    businessBenefit:
      "Бизнес видит объект онлайн, получает архив событий и не держит отдельный сервер записи в\u00a0офисе.",
    proofPoints: [
      { label: "Архив", value: "3/7/14/30\u00a0дней", status: "confirmed" },
      { label: "Камеры", value: "Dome v2 и Bullet v2", status: "confirmed" },
      { label: "Монтаж", value: "нужно подтвердить", status: "needs_verification" }
    ],
    ctaLabel: "Подключить",
    priority: "P0",
    audience: ["магазины", "склады", "офисы", "клиники"],
    options: ["количество камер", "срок архива", "модель камеры", "годовая оплата"],
    calculatorFields: ["камеры", "архив", "оборудование", "монтаж"],
    relatedServices: ["internet"],
    seoTitle: "Видеонаблюдение для бизнеса в\u00a0Краснодаре",
    seoDescription:
      "Видеонаблюдение Kubtel для бизнеса: онлайн-просмотр, архив 3–30\u00a0дней, камеры Dome/Bullet и заявка на расчёт."
  },
  {
    slug: "wifi-auth",
    title: "Гостевой Wi‑Fi Hot-spot",
    category: "Публичный Wi‑Fi",
    summary:
      "Гостевой Wi‑Fi с авторизацией для кафе, магазинов, клиник и других публичных точек, где посетителям нужен стабильный доступ в сеть.",
    businessBenefit:
      "Посетители могут оплатить заказ, сделать перевод или просто выйти в интернет, а бизнес раздаёт публичный Wi‑Fi с корректной авторизацией.",
    proofPoints: [
      { label: "Спрос", value: "самая быстрорастущая B2B-услуга", status: "confirmed" },
      { label: "Сценарий", value: "общепит, магазины, сервисы", status: "confirmed" },
      { label: "Авторизация", value: "публичный Wi‑Fi с идентификацией", status: "confirmed" }
    ],
    ctaLabel: "Подключить",
    priority: "P1",
    audience: ["кафе", "отели", "салоны", "клиники"],
    options: ["способ авторизации", "брендированная страница", "SMS-пакет", "редирект"],
    calculatorFields: ["тип точки", "тариф", "SMS", "брендинг"],
    relatedServices: ["internet"],
    seoTitle: "Гостевой Wi‑Fi Hot-spot для кафе и магазинов",
    seoDescription:
      "Гостевой Wi‑Fi Hot-spot Kubtel для публичных точек: авторизация посетителей, доступ в интернет и заявка на запуск услуги."
  },
  {
    slug: "vps",
    title: "VPS/VDS",
    category: "Инфраструктура",
    summary:
      "Виртуальный сервер для 1С, CRM, терминального доступа, телефонии и бизнес-приложений с подбором ресурсов.",
    businessBenefit:
      "Компания запускает серверные сервисы без покупки железа и масштабирует CPU, RAM, диски и backup под задачу.",
    proofPoints: [
      { label: "Тест", value: "до 10\u00a0дней", status: "confirmed" },
      { label: "Данные", value: "в\u00a0РФ", status: "confirmed" },
      { label: "Backup/SLA", value: "нужно подтвердить", status: "needs_verification" }
    ],
    ctaLabel: "Подключить",
    priority: "P1",
    audience: ["IT", "1С", "CRM", "терминальный доступ"],
    options: ["OS", "CPU", "RAM", "HDD/SSD", "IP", "backup"],
    calculatorFields: ["OS", "CPU", "RAM", "диск", "backup"],
    relatedServices: ["vdi", "colocation"],
    seoTitle: "Аренда VPS в\u00a0Краснодаре",
    seoDescription:
      "VPS/VDS Kubtel для бизнеса: сервер под 1С, CRM, телефонию и удалённый доступ с заявкой на подбор ресурсов."
  },
  {
    slug: "vdi",
    title: "Виртуальные рабочие места",
    category: "Инфраструктура",
    summary:
      "VDI для компаний: виртуальное рабочее место сотрудника с выбранной ОС, ресурсами и доступом с разных устройств.",
    businessBenefit:
      "Новые рабочие места запускаются быстрее, а обслуживание железа и резервирование переезжают в инфраструктурный контур.",
    proofPoints: [
      { label: "Preset", value: "2\u00a0ядра / 4\u00a0ГБ / 50\u00a0ГБ", status: "confirmed" },
      { label: "Удалённый доступ", value: "публично заявлен", status: "confirmed" },
      { label: "Лицензии ПО", value: "нужно подтвердить", status: "needs_verification" }
    ],
    ctaLabel: "Подключить",
    priority: "P1",
    audience: ["распределённые команды", "быстро растущий штат", "несколько офисов"],
    options: ["количество мест", "ресурсный preset", "ОС", "backup"],
    calculatorFields: ["рабочие места", "preset", "ОС", "backup"],
    relatedServices: ["vps", "internet"],
    seoTitle: "Виртуальное рабочее место для бизнеса",
    seoDescription:
      "VDI Kubtel для бизнеса: аренда виртуального рабочего места для сотрудников и масштабирования рабочих мест."
  },
  {
    slug: "colocation",
    title: "Colocation",
    category: "ЦОД",
    summary:
      "Размещение серверного оборудования на площадках Kubtel с питанием, охраной, доступом и операторской связностью.",
    businessBenefit:
      "Серверы переезжают из офисной серверной в контролируемую инфраструктуру с регламентом доступа и связностью.",
    proofPoints: [
      { label: "Площадки", value: "две", status: "confirmed" },
      { label: "ДГУ", value: "19\u00a0часов", status: "confirmed" },
      { label: "SEA-IX", value: "51 оператор", status: "confirmed" }
    ],
    ctaLabel: "Подключить",
    priority: "P0",
    audience: ["IT-команды", "владельцы серверов", "операторы"],
    options: ["юниты", "питание", "порты", "IPv4/IPv6", "IPMI"],
    calculatorFields: ["U", "питание", "порты", "IP", "удалённые руки"],
    relatedServices: ["datacenter-access", "operators"],
    seoTitle: "Colocation и размещение сервера в\u00a0Краснодаре",
    seoDescription:
      "Colocation Kubtel: размещение оборудования в\u00a0ЦОД, питание, охрана, связность, SEA-IX и заявка на расчёт."
  },
  {
    slug: "datacenter-access",
    title: "Доступ в\u00a0ЦОД",
    category: "ЦОД",
    summary:
      "Операционная заявка на плановый доступ к оборудованию в\u00a0ЦОД: площадка, время, длительность и работы.",
    businessBenefit:
      "Работы в\u00a0ЦОД проходят по регламенту, а аварийные и плановые визиты не смешиваются с продажной заявкой.",
    proofPoints: [
      { label: "Плановый доступ", value: "не менее чем за 24\u00a0часа", status: "confirmed" },
      { label: "Площадки", value: "выбор в\u00a0форме", status: "confirmed" },
      { label: "Права заявителя", value: "нужно подтвердить", status: "needs_verification" }
    ],
    ctaLabel: "Подать заявку на доступ",
    priority: "P1",
    audience: ["клиенты colocation", "ответственные за серверы", "инженеры"],
    options: ["площадка", "дата", "время", "работы", "длительность"],
    calculatorFields: ["лицевой счет", "площадка", "дата", "работы"],
    relatedServices: ["colocation"],
    seoTitle: "Заявка на доступ в\u00a0ЦОД Kubtel",
    seoDescription:
      "Заявка на доступ в\u00a0ЦОД Kubtel: плановые работы, выбор площадки, дата, время, длительность и описание работ."
  }
];

export const businessSegments: BusinessSegment[] = [
  {
    slug: "smb",
    title: "Малому и среднему бизнесу",
    summary: "Связь для офисов, магазинов, кафе, клиник, салонов и складов.",
    pain: "Нужны интернет, телефония, камеры и гостевой Wi‑Fi с единым сопровождением.",
    trigger:
      "Открытие точки, переезд, плохой текущий канал, ограничения мобильного интернета или запуск гостевого Wi‑Fi.",
    ctaLabel: "Подобрать связь для точки",
    fields: ["тип объекта", "адрес", "услуги", "срок запуска"],
    serviceSlugs: ["internet", "telephony", "cctv", "wifi-auth"],
    seoTitle: "Связь для малого бизнеса в\u00a0Краснодаре",
    seoDescription:
      "Kubtel для малого и среднего бизнеса: интернет в\u00a0офис, телефония, видеонаблюдение и Wi‑Fi-авторизация."
  },
  {
    slug: "operators",
    title: "Операторам связи",
    summary: "Инфраструктура, размещение, связность и партнёрская заявка для операторов.",
    pain: "Нужно расширять покрытие, подключать мощности, обмениваться трафиком и размещать оборудование.",
    trigger:
      "Выход в\u00a0Краснодарский край, рост трафика, cross-connect, peering или размещение оборудования.",
    ctaLabel: "Запросить партнёрские условия",
    fields: ["компания", "ASN", "тип партнёрства", "порты", "ёмкость"],
    serviceSlugs: ["colocation", "datacenter-access"],
    seoTitle: "Операторам связи и партнёрам",
    seoDescription:
      "Kubtel для операторов связи: инфраструктура, colocation, SEA-IX, партнёрская заявка и региональная связность."
  },
  {
    slug: "government",
    title: "Государственному сектору",
    summary: "Телеком- и инфраструктурные решения для учреждений с юридической сверкой условий.",
    pain: "Нужны безопасные каналы, хранение информации, стабильная инфраструктура и понятный процесс согласования.",
    trigger: "Закупка, модернизация сети, требования к безопасности или перенос инфраструктуры.",
    ctaLabel: "Запросить решение для учреждения",
    fields: ["учреждение", "тип закупки", "услуги", "срок", "требования"],
    serviceSlugs: ["internet", "vps", "colocation", "cctv"],
    seoTitle: "Связь для государственного сектора",
    seoDescription:
      "Kubtel для государственных учреждений: телеком-услуги, инфраструктура, хранение информации и заявка на консультацию."
  }
];

export const businessProofStrip: BusinessProof[] = [
  { label: "Локальная авария", value: "устраняем в\u00a0течение 1\u00a0часа", status: "confirmed" },
  { label: "Менеджер", value: "связь по заявке", status: "confirmed" },
  { label: "Связность", value: "несколько аплинков вместо одного", status: "confirmed" },
  { label: "Команда", value: "связь и инфраструктура в одном контуре", status: "confirmed" }
];

export function getBusinessService(slug: string): BusinessService | undefined {
  return businessServices.find((service) => service.slug === slug);
}

export function getBusinessSegment(slug: string): BusinessSegment | undefined {
  return businessSegments.find((segment) => segment.slug === slug);
}

export function getRelatedBusinessServices(slugs: string[]): BusinessService[] {
  return slugs
    .map((slug) => getBusinessService(slug))
    .filter((service): service is BusinessService => Boolean(service));
}
