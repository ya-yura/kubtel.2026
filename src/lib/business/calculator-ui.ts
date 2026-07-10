import type { BusinessPricingCatalog } from "@lib/business/calculators";

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
    };

export type CalculatorGlossaryItem = {
  term: string;
  description: string;
};

export type BusinessCalculatorConfig = {
  type: CalculatorType;
  serviceSlug: string;
  title: string;
  lead: string;
  submitLabel: string;
  fields: CalculatorField[];
  lines: CalculatorLine[];
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
 * The official Kubtel page confirms that monthly e-mail detailing is free. All other values
 * remain an individual calculation until Kubtel supplies an approved commercial matrix.
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

  "cctv.archive.3": individualPrice("за камеру с архивом 3 дня"),
  "cctv.archive.7": individualPrice("за камеру с архивом 7 дней"),
  "cctv.archive.14": individualPrice("за камеру с архивом 14 дней"),
  "cctv.archive.30": individualPrice("за камеру с архивом 30 дней"),
  "cctv.camera": individualPrice("за камеру"),
  "cctv.install": individualPrice("за монтаж точки"),

  "vps.cpu": individualPrice("за vCPU"),
  "vps.ram_gb": individualPrice("за 1 ГБ RAM"),
  "vps.ssd_gb": individualPrice("за 1 ГБ SSD"),
  "vps.hdd_gb": individualPrice("за 1 ГБ HDD"),
  "vps.ip": individualPrice("за IPv4-адрес"),
  "vps.backup": individualPrice("за резервное копирование"),
  "vps.ddos": individualPrice("по параметрам защиты"),

  "colocation.unit": individualPrice("за 1U"),
  "colocation.power_100w": individualPrice("за каждые 100 Вт"),
  "colocation.ipv4": individualPrice("за IPv4-адрес"),
  "colocation.port.100m": individualPrice("за порт 100 Мбит/с"),
  "colocation.port.1g": individualPrice("за порт 1 Гбит/с"),
  "colocation.port.10g": individualPrice("за порт 10 Гбит/с"),
  "colocation.ipmi": individualPrice("за IPMI-доступ"),
  "colocation.remote_hands": individualPrice("за удалённые работы инженера")
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
    lead: "Соберите конфигурацию камер, облачного архива, оборудования и монтажа. Стоимость рассчитывается индивидуально до утверждения коммерческой матрицы.",
    submitLabel: "Оставить заявку",
    fields: [
      {
        kind: "number",
        name: "camerasCount",
        label: "Камер",
        min: 1,
        max: 128,
        step: 1,
        value: 8,
        help: "Количество точек наблюдения на объекте."
      },
      {
        kind: "select",
        name: "archiveDays",
        label: "Архив",
        value: "7",
        options: [
          { value: "3", label: "3 дня" },
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
        value: 8,
        help: "Если совместимое оборудование уже есть, укажите 0."
      },
      {
        kind: "checkbox",
        name: "installNeed",
        label: "Нужен монтаж",
        checked: true,
        help: "Объём работ определяется после осмотра объекта."
      }
    ],
    lines: [
      {
        kind: "repeatedSelect",
        keyPrefix: "cctv.archive.",
        selectField: "archiveDays",
        quantityField: "camerasCount",
        labelPrefix: "Архив",
        valueLabels: { "3": "3 дня", "7": "7 дней", "14": "14 дней", "30": "30 дней" }
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
    lead: "Подберите CPU, RAM, диски, IP и резервное копирование. Конфигурация целиком передаётся в заявку на индивидуальный расчёт.",
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
        name: "hddGb",
        label: "HDD",
        min: 0,
        max: 20000,
        step: 100,
        value: 0,
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
      },
      {
        kind: "checkbox",
        name: "ddosProtection",
        label: "DDoS-защита",
        checked: false,
        help: "Параметры защиты подбираются по профилю трафика."
      }
    ],
    lines: [
      { kind: "repeated", key: "vps.cpu", quantityField: "vCpu", label: "vCPU" },
      { kind: "repeated", key: "vps.ram_gb", quantityField: "ramGb", label: "RAM" },
      { kind: "repeated", key: "vps.ssd_gb", quantityField: "ssdGb", label: "SSD" },
      { kind: "repeated", key: "vps.hdd_gb", quantityField: "hddGb", label: "HDD" },
      { kind: "repeated", key: "vps.ip", quantityField: "ipCount", label: "IPv4" },
      { kind: "optional", key: "vps.backup", enabledField: "backup", label: "Backup" },
      { kind: "optional", key: "vps.ddos", enabledField: "ddosProtection", label: "DDoS-защита" }
    ]
  },
  colocation: {
    type: "colocation",
    serviceSlug: "colocation",
    title: "Размещение оборудования",
    lead: "Укажите юниты, питание, порт, IPv4, IPMI и удалённые работы. Инженер подтвердит совместимость и индивидуальную стоимость.",
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
        max: 5000,
        step: 50,
        value: 400,
        suffix: "Вт"
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
        name: "internetPort",
        label: "Порт",
        value: "1g",
        options: [
          { value: "100m", label: "100 Мбит/с" },
          { value: "1g", label: "1 Гбит/с" },
          { value: "10g", label: "10 Гбит/с" }
        ],
        help: "10 Гбит/с и питание свыше 1 кВт требуют инженерной проверки."
      },
      { kind: "checkbox", name: "ipmi", label: "IPMI", checked: true },
      {
        kind: "checkbox",
        name: "remoteHands",
        label: "Удалённые работы инженера",
        checked: false
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
        keyPrefix: "colocation.port.",
        selectField: "internetPort",
        labelPrefix: "Порт",
        valueLabels: { "100m": "100 Мбит/с", "1g": "1 Гбит/с", "10g": "10 Гбит/с" }
      },
      { kind: "optional", key: "colocation.ipmi", enabledField: "ipmi", label: "IPMI" },
      {
        kind: "optional",
        key: "colocation.remote_hands",
        enabledField: "remoteHands",
        label: "Удалённые работы инженера"
      }
    ],
    glossary: [
      { term: "Юнит", description: "единица высоты оборудования в серверной стойке." },
      {
        term: "IPMI",
        description: "интерфейс удалённого управления сервером независимо от основной ОС."
      }
    ]
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
  const type = serviceToCalculator[serviceSlug];

  return type ? businessCalculatorConfigs[type] : undefined;
}
