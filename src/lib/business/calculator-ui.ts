import type { BusinessPricingCatalog } from "@lib/business/calculators";

export type TelephonyVariant = "basic" | "multichannel" | "pro" | "virtual-pbx";

export type CalculatorType = "telephony" | "cctv" | "vps" | "colocation";

export type CalculatorField =
  | {
      kind: "number";
      name: string;
      label: string;
      min: number;
      max: number;
      step: number;
      value: number;
      individualAbove?: number;
      suffix?: string;
      help?: string;
    }
  | {
      kind: "checkbox";
      name: string;
      label: string;
      checked: boolean;
      help?: string;
    }
  | {
      kind: "select";
      name: string;
      label: string;
      value: string;
      options: Array<{ value: string; label: string }>;
      help?: string;
    };

export type CalculatorLine =
  | {
      kind: "fixed";
      key: string;
      label: string;
    }
  | {
      kind: "repeated";
      key: string;
      quantityField: string;
      quantityStep?: number;
      label: string;
    }
  | {
      kind: "optional";
      key: string;
      enabledField: string;
      label: string;
    }
  | {
      kind: "select";
      keyPrefix: string;
      selectField: string;
      labelPrefix: string;
      valueLabels?: Record<string, string>;
    }
  | {
      kind: "repeatedSelect";
      keyPrefix: string;
      selectField: string;
      quantityField: string;
      labelPrefix: string;
      valueLabels?: Record<string, string>;
    }
  | {
      kind: "telephony";
      label: string;
    };

export type CalculatorGlossaryItem = {
  term: string;
  description: string;
};

export type BusinessCalculatorConfig = {
  type: CalculatorType;
  id?: string;
  serviceSlug: string;
  title: string;
  lead: string;
  submitLabel: string;
  fields: CalculatorField[];
  lines: CalculatorLine[];
  telephonyVariant?: TelephonyVariant;
  showKnownTotalsWithQuoteItems?: boolean;
  sourceNote?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  glossary?: CalculatorGlossaryItem[];
};

const individualPrice = (unitLabel: string) => ({
  monthly: null,
  oneTime: null,
  status: "unknown" as const,
  unitLabel
});

/**
 * Public calculator prices are intentionally restricted to commercially confirmed values.
 * Telephony e-mail detailing and the approved colocation matrix are published below; options
 * without an approved price remain an individual calculation.
 */
export const businessCalculatorPricing: BusinessPricingCatalog = {
  "telephony.port": individualPrice("за SIP-порт"),
  "telephony.phone_number": individualPrice("за городской номер"),
  "telephony.external_line": individualPrice("за одновременную внешнюю линию"),
  "telephony.virtual_pbx": individualPrice("за виртуальную АТС"),
  "telephony.auto_attendant": individualPrice("за автооператор"),
  "telephony.monthly_detail_email": {
    monthly: 0,
    status: "confirmed",
    unitLabel: "ежемесячная детализация по электронной почте"
  },

  "cctv.archive.7": {
    monthly: 600,
    status: "confirmed",
    unitLabel: "за камеру с архивом 7 дней"
  },
  "cctv.archive.14": {
    monthly: 800,
    status: "confirmed",
    unitLabel: "за камеру с архивом 14 дней"
  },
  "cctv.archive.30": {
    monthly: 1000,
    status: "confirmed",
    unitLabel: "за камеру с архивом 30 дней"
  },
  "cctv.camera": individualPrice("камеры к поставке"),
  "cctv.install": individualPrice("монтаж камер"),

  "vps.cpu": individualPrice("за vCPU"),
  "vps.ram_gb": individualPrice("за 1 ГБ RAM"),
  "vps.ssd_gb": individualPrice("за 1 ГБ SSD"),
  "vps.ip": individualPrice("за IPv4-адрес"),
  "vps.backup": individualPrice("за резервное копирование"),

  "colocation.unit": { monthly: 600, status: "confirmed", unitLabel: "за 1U" },
  "colocation.power_100w": {
    monthly: 1000,
    status: "confirmed",
    unitLabel: "за каждые 100 Вт"
  },
  "colocation.ipv4": { monthly: 530, status: "confirmed", unitLabel: "за IPv4-адрес" },
  "colocation.internet.100m": {
    monthly: 3000,
    status: "confirmed",
    unitLabel: "100 Мбит/с"
  },
  "colocation.internet.1g-50tb": {
    monthly: 5000,
    status: "confirmed",
    unitLabel: "1 Гбит/с, 50 ТБ"
  },
  "colocation.internet.1g-unlimited": {
    monthly: 25000,
    status: "confirmed",
    unitLabel: "1 Гбит/с, безлимит"
  },
  "colocation.ipmi": {
    monthly: 530,
    status: "confirmed",
    unitLabel: "удалённый доступ"
  },
  "colocation.initial_placement": {
    oneTime: 1200,
    status: "confirmed",
    unitLabel: "размещение оборудования"
  }
};

export const businessCalculatorConfigs: Record<CalculatorType, BusinessCalculatorConfig> = {
  telephony: {
    type: "telephony",
    serviceSlug: "telephony",
    title: "Телефония Kubtel",
    lead: "Укажите SIP-порты, номера, одновременные линии и собственные сервисы Kubtel. Неподтверждённые позиции передаются менеджеру для индивидуального расчёта.",
    submitLabel: "Оставить заявку",
    sourceNote:
      "Доступность и состав услуг сверены с официальной страницей Kubtel. Внутризоновая, междугородная и международная связь оказываются по агентской схеме и в этот расчёт не входят.",
    sourceUrl: "https://kubtel.ru/legal/smallbusiness/tel/",
    sourceLabel: "Официальная страница телефонии Kubtel",
    fields: [
      {
        kind: "select",
        name: "location",
        label: "Населённый пункт",
        value: "krasnodar",
        options: [
          { value: "krasnodar", label: "Краснодар" },
          { value: "takhtamukay", label: "Тахтамукайский район" },
          { value: "manual", label: "Другой — проверить возможность" }
        ],
        help: "География влияет на техническую возможность и схему подключения."
      },
      {
        kind: "number",
        name: "ports",
        label: "SIP-порты",
        min: 1,
        max: 200,
        step: 1,
        value: 8,
        help: "Один порт обычно используется телефоном, софтфоном или подключением к АТС."
      },
      {
        kind: "number",
        name: "phoneNumbers",
        label: "Городские номера",
        min: 0,
        max: 100,
        step: 1,
        value: 2,
        help: "Количество номеров ТФОП для компании."
      },
      {
        kind: "number",
        name: "externalLines",
        label: "Одновременные линии",
        min: 0,
        max: 100,
        step: 1,
        value: 2,
        help: "Максимальное число параллельных внешних разговоров."
      },
      {
        kind: "checkbox",
        name: "virtualPbx",
        label: "Виртуальная АТС",
        checked: true,
        help: "Облачное управление очередями, правилами и переадресацией звонков."
      },
      {
        kind: "checkbox",
        name: "autoAttendant",
        label: "Автооператор",
        checked: false,
        help: "Голосовое приветствие и распределение звонков по отделам."
      },
      {
        kind: "checkbox",
        name: "monthlyDetailEmail",
        label: "Ежемесячная детализация по e-mail",
        checked: true,
        help: "Официальная страница Kubtel указывает стоимость этой услуги 0 ₽."
      }
    ],
    lines: [
      {
        kind: "repeated",
        key: "telephony.port",
        quantityField: "ports",
        label: "SIP-порты"
      },
      {
        kind: "repeated",
        key: "telephony.phone_number",
        quantityField: "phoneNumbers",
        label: "Городские номера"
      },
      {
        kind: "repeated",
        key: "telephony.external_line",
        quantityField: "externalLines",
        label: "Одновременные линии"
      },
      {
        kind: "optional",
        key: "telephony.virtual_pbx",
        enabledField: "virtualPbx",
        label: "Виртуальная АТС"
      },
      {
        kind: "optional",
        key: "telephony.auto_attendant",
        enabledField: "autoAttendant",
        label: "Автооператор"
      },
      {
        kind: "optional",
        key: "telephony.monthly_detail_email",
        enabledField: "monthlyDetailEmail",
        label: "Ежемесячная детализация по e-mail"
      }
    ],
    glossary: [
      {
        term: "SIP-порт",
        description: "подключение для одного телефона, софтфона или устройства."
      },
      {
        term: "Одновременная линия",
        description: "один параллельный внешний входящий или исходящий разговор."
      },
      {
        term: "ВАТС",
        description: "виртуальная АТС — облачная система управления звонками."
      }
    ]
  },
  cctv: {
    type: "cctv",
    serviceSlug: "cctv",
    title: "Видеонаблюдение",
    lead: "Рассчитайте хранение записей для 1–30 камер. Камеры к поставке и монтаж добавляются в заявку по запросу, а конфигурации свыше 30 камер рассчитываются персонально.",
    submitLabel: "Оставить заявку",
    showKnownTotalsWithQuoteItems: true,
    fields: [
      {
        kind: "number",
        name: "camerasCount",
        label: "Камер",
        min: 1,
        max: 128,
        step: 1,
        value: 8,
        individualAbove: 30,
        help: "От 1 до 30 камер рассчитываются автоматически, свыше — персонально."
      },
      {
        kind: "select",
        name: "archiveDays",
        label: "Архив",
        value: "7",
        options: [
          { value: "7", label: "7 дней" },
          { value: "14", label: "14 дней" },
          { value: "30", label: "30 дней" }
        ],
        help: "Глубина хранения записей по каждой камере."
      },
      {
        kind: "number",
        name: "hardwareCount",
        label: "Камер к поставке",
        min: 0,
        max: 128,
        step: 1,
        value: 0,
        help: "Стоимость камер рассчитывается по запросу. Если оборудование уже есть, укажите 0."
      },
      {
        kind: "checkbox",
        name: "installNeed",
        label: "Нужен монтаж",
        checked: false,
        help: "Стоимость монтажа рассчитывается по запросу после осмотра объекта."
      }
    ],
    lines: [
      {
        kind: "repeatedSelect",
        keyPrefix: "cctv.archive.",
        selectField: "archiveDays",
        quantityField: "camerasCount",
        labelPrefix: "Архив",
        valueLabels: { "7": "7 дней", "14": "14 дней", "30": "30 дней" }
      },
      {
        kind: "repeated",
        key: "cctv.camera",
        quantityField: "hardwareCount",
        label: "Камеры к поставке"
      },
      { kind: "optional", key: "cctv.install", enabledField: "installNeed", label: "Монтаж" }
    ]
  },
  vps: {
    type: "vps",
    serviceSlug: "vps",
    title: "Виртуальный сервер",
    lead: "Подберите CPU, RAM, SSD, IP и резервное копирование. Конфигурация целиком передаётся в заявку на индивидуальный расчёт.",
    submitLabel: "Оставить заявку",
    fields: [
      {
        kind: "number",
        name: "vCpu",
        label: "vCPU",
        min: 1,
        max: 64,
        step: 1,
        value: 4,
        help: "Виртуальные процессорные ядра."
      },
      {
        kind: "number",
        name: "ramGb",
        label: "RAM",
        min: 1,
        max: 256,
        step: 1,
        value: 8,
        suffix: "ГБ",
        help: "Оперативная память виртуального сервера."
      },
      {
        kind: "number",
        name: "ssdGb",
        label: "SSD",
        min: 0,
        max: 4000,
        step: 10,
        value: 160,
        suffix: "ГБ"
      },
      {
        kind: "number",
        name: "ipCount",
        label: "IPv4",
        min: 0,
        max: 64,
        step: 1,
        value: 1
      },
      {
        kind: "checkbox",
        name: "backup",
        label: "Резервное копирование",
        checked: true
      }
    ],
    lines: [
      { kind: "repeated", key: "vps.cpu", quantityField: "vCpu", label: "vCPU" },
      { kind: "repeated", key: "vps.ram_gb", quantityField: "ramGb", label: "RAM" },
      { kind: "repeated", key: "vps.ssd_gb", quantityField: "ssdGb", label: "SSD" },
      { kind: "repeated", key: "vps.ip", quantityField: "ipCount", label: "IPv4" },
      { kind: "optional", key: "vps.backup", enabledField: "backup", label: "Backup" }
    ]
  },
  colocation: {
    type: "colocation",
    serviceSlug: "colocation",
    title: "Размещение оборудования",
    lead: "Укажите юниты, питание, интернет, IPv4 и удалённый доступ. Калькулятор покажет ежемесячную стоимость и разовый платёж за первичное размещение.",
    submitLabel: "Оставить заявку",
    fields: [
      {
        kind: "number",
        name: "rackUnits",
        label: "Юниты",
        min: 1,
        max: 48,
        step: 1,
        value: 2,
        suffix: "U"
      },
      {
        kind: "number",
        name: "powerWatts",
        label: "Питание",
        min: 100,
        max: 10000,
        step: 100,
        value: 400,
        suffix: "Вт",
        help: "Стоимость начисляется за каждые начатые 100 Вт."
      },
      {
        kind: "number",
        name: "ipv4Count",
        label: "IPv4",
        min: 0,
        max: 128,
        step: 1,
        value: 1
      },
      {
        kind: "select",
        name: "internetPlan",
        label: "Интернет",
        value: "1g-50tb",
        options: [
          { value: "100m", label: "100 Мбит/с" },
          { value: "1g-50tb", label: "1 Гбит/с (50 ТБ)" },
          { value: "1g-unlimited", label: "1 Гбит/с (безлимит)" }
        ],
        help: "Выберите подходящую скорость и включённый объём трафика."
      },
      {
        kind: "checkbox",
        name: "ipmi",
        label: "Удалённый доступ (IPMI/ILO/iDRAC)",
        checked: true
      }
    ],
    lines: [
      { kind: "repeated", key: "colocation.unit", quantityField: "rackUnits", label: "Юниты" },
      {
        kind: "repeated",
        key: "colocation.power_100w",
        quantityField: "powerWatts",
        quantityStep: 100,
        label: "Питание"
      },
      {
        kind: "repeated",
        key: "colocation.ipv4",
        quantityField: "ipv4Count",
        label: "IPv4"
      },
      {
        kind: "select",
        keyPrefix: "colocation.internet.",
        selectField: "internetPlan",
        labelPrefix: "Интернет",
        valueLabels: {
          "100m": "100 Мбит/с",
          "1g-50tb": "1 Гбит/с (50 ТБ)",
          "1g-unlimited": "1 Гбит/с (безлимит)"
        }
      },
      {
        kind: "optional",
        key: "colocation.ipmi",
        enabledField: "ipmi",
        label: "Удалённый доступ (IPMI/ILO/iDRAC)"
      },
      {
        kind: "fixed",
        key: "colocation.initial_placement",
        label: "Первичное размещение оборудования"
      }
    ],
    glossary: [
      { term: "Юнит", description: "единица высоты оборудования в серверной стойке." },
      {
        term: "IPMI/ILO/iDRAC",
        description: "интерфейсы удалённого управления сервером независимо от основной ОС."
      }
    ]
  }
};

const telephonySourceNote =
  "Формулы и цены перенесены из заявки 213727 «Новая номенклатура». Платежи за местный трафик указаны отдельно и не входят в фиксированную абонентскую плату.";

const telephonyGlossary: CalculatorGlossaryItem[] = [
  {
    term: "Порт",
    description: "подключение телефона, устройства или сотрудника к телефонной схеме."
  },
  {
    term: "Соединительная линия",
    description: "один одновременный внешний разговор для серии ПРО."
  },
  {
    term: "Внешняя линия",
    description: "один одновременный внешний разговор в виртуальной АТС."
  }
];

export const telephonyCalculatorConfigs: Record<TelephonyVariant, BusinessCalculatorConfig> = {
  basic: {
    id: "telephony-basic",
    type: "telephony",
    telephonyVariant: "basic",
    serviceSlug: "telephony",
    title: "Обычное подключение",
    lead: "Выберите тип подключения и тариф. Абонентская плата и единовременный платёж посчитаются отдельно.",
    submitLabel: "Оставить заявку",
    sourceNote: telephonySourceNote,
    fields: [
      {
        kind: "select",
        name: "connectionType",
        label: "Тип подключения",
        value: "digital",
        options: [
          { value: "analog", label: "Аналоговое" },
          { value: "digital", label: "Цифровое" }
        ]
      },
      {
        kind: "select",
        name: "tariff",
        label: "Тариф",
        value: "unlimited",
        options: [
          { value: "unlimited", label: "Безлимитный Плюс" },
          { value: "timed", label: "Повременный Плюс" }
        ],
        help: "Для повременного тарифа местные разговоры тарифицируются отдельно: 0,60 ₽/мин."
      }
    ],
    lines: [{ kind: "telephony", label: "Обычное подключение" }],
    glossary: telephonyGlossary
  },
  multichannel: {
    id: "telephony-multichannel",
    type: "telephony",
    telephonyVariant: "multichannel",
    serviceSlug: "telephony-multichannel",
    title: "Многоканальный телефон",
    lead: "Выберите тип подключения, тариф и количество портов — от 2 до 30.",
    submitLabel: "Оставить заявку",
    sourceNote: telephonySourceNote,
    fields: [
      {
        kind: "select",
        name: "connectionType",
        label: "Тип подключения",
        value: "digital",
        options: [
          { value: "analog", label: "Аналоговое" },
          { value: "digital", label: "Цифровое" }
        ]
      },
      {
        kind: "select",
        name: "tariff",
        label: "Тариф",
        value: "unlimited",
        options: [
          { value: "unlimited", label: "Безлимитный Многоканальный" },
          { value: "timed", label: "Повременный Многоканальный" }
        ],
        help: "Для повременного тарифа местные разговоры тарифицируются отдельно: 0,60 ₽/мин."
      },
      {
        kind: "number",
        name: "ports",
        label: "Количество портов",
        min: 2,
        max: 30,
        step: 1,
        value: 4
      }
    ],
    lines: [{ kind: "telephony", label: "Многоканальный телефон" }],
    glossary: telephonyGlossary
  },
  pro: {
    id: "telephony-pro",
    type: "telephony",
    telephonyVariant: "pro",
    serviceSlug: "telephony-pro",
    title: "Подключение серии ПРО",
    lead: "Выберите тариф, количество номеров ТФОП и соединительных линий — от 1 до 30.",
    submitLabel: "Оставить заявку",
    sourceNote: telephonySourceNote,
    fields: [
      {
        kind: "select",
        name: "tariff",
        label: "Тариф",
        value: "unlimited",
        options: [
          { value: "unlimited", label: "Безлимитный Про" },
          { value: "timed", label: "Повременный Про" }
        ],
        help: "Для повременного тарифа местные разговоры тарифицируются отдельно: 0,60 ₽/мин."
      },
      {
        kind: "number",
        name: "phoneNumbers",
        label: "Количество номеров ТФОП",
        min: 1,
        max: 30,
        step: 1,
        value: 1
      },
      {
        kind: "number",
        name: "externalLines",
        label: "Количество соединительных линий",
        min: 1,
        max: 30,
        step: 1,
        value: 1
      }
    ],
    lines: [{ kind: "telephony", label: "Серия ПРО" }],
    glossary: telephonyGlossary
  },
  "virtual-pbx": {
    id: "telephony-virtual-pbx",
    type: "telephony",
    telephonyVariant: "virtual-pbx",
    serviceSlug: "telephony-virtual-pbx",
    title: "Виртуальная АТС",
    lead: "Соберите виртуальную АТС: тип подключения, тариф, порты, номера ТФОП и внешние линии.",
    submitLabel: "Оставить заявку",
    sourceNote: telephonySourceNote,
    fields: [
      {
        kind: "select",
        name: "connectionType",
        label: "Тип подключения",
        value: "digital",
        options: [
          { value: "analog", label: "Аналоговое" },
          { value: "digital", label: "Цифровое" }
        ]
      },
      {
        kind: "select",
        name: "tariff",
        label: "Тариф",
        value: "unlimited",
        options: [
          { value: "unlimited", label: "Безлимитный Виртуальный" },
          { value: "timed", label: "Повременный Виртуальный" }
        ],
        help: "Для повременного тарифа местные разговоры тарифицируются отдельно: 0,60 ₽/мин."
      },
      {
        kind: "number",
        name: "ports",
        label: "Количество портов",
        min: 2,
        max: 30,
        step: 1,
        value: 4
      },
      {
        kind: "number",
        name: "phoneNumbers",
        label: "Количество номеров ТФОП",
        min: 1,
        max: 30,
        step: 1,
        value: 1
      },
      {
        kind: "number",
        name: "externalLines",
        label: "Количество внешних линий",
        min: 1,
        max: 30,
        step: 1,
        value: 1
      }
    ],
    lines: [{ kind: "telephony", label: "Виртуальная АТС" }],
    glossary: telephonyGlossary
  }
};

const serviceToCalculator: Partial<Record<string, CalculatorType>> = {
  telephony: "telephony",
  cctv: "cctv",
  vps: "vps",
  colocation: "colocation"
};

export function getBusinessCalculatorConfig(
  serviceSlug: string
): BusinessCalculatorConfig | undefined {
  if (serviceSlug === "telephony") {
    return telephonyCalculatorConfigs.basic;
  }

  const type = serviceToCalculator[serviceSlug];

  return type ? businessCalculatorConfigs[type] : undefined;
}
