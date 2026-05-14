import type { BusinessPricingCatalog } from "@lib/business/calculators";

export type CalculatorType = "telephony" | "cctv" | "vps" | "colocation" | "wifi_auth";

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
    }
  | {
      kind: "checkbox";
      name: string;
      label: string;
      checked: boolean;
    }
  | {
      kind: "select";
      name: string;
      label: string;
      value: string;
      options: Array<{ value: string; label: string }>;
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
    }
  | {
      kind: "repeatedSelect";
      keyPrefix: string;
      selectField: string;
      quantityField: string;
      labelPrefix: string;
    };

export type BusinessCalculatorConfig = {
  type: CalculatorType;
  serviceSlug: string;
  title: string;
  lead: string;
  submitLabel: string;
  fields: CalculatorField[];
  lines: CalculatorLine[];
};

export const businessCalculatorPricing: BusinessPricingCatalog = {
  "telephony.port": { monthly: 250, status: "confirmed" },
  "telephony.phone_number": { monthly: 150, status: "confirmed" },
  "telephony.external_line": { monthly: 450, status: "confirmed" },
  "telephony.virtual_pbx": { monthly: 1000, status: "confirmed" },
  "telephony.auto_attendant": { monthly: 350, oneTime: 1200, status: "confirmed" },

  "cctv.archive.3": { monthly: 250, status: "confirmed" },
  "cctv.archive.7": { monthly: 390, status: "confirmed" },
  "cctv.archive.14": { monthly: 590, status: "confirmed" },
  "cctv.archive.30": { monthly: 890, status: "confirmed" },
  "cctv.camera": { oneTime: 4500, status: "confirmed" },
  "cctv.install": { oneTime: 2500, status: "confirmed" },

  "vps.cpu": { monthly: 450, status: "confirmed" },
  "vps.ram_gb": { monthly: 180, status: "confirmed" },
  "vps.ssd_gb": { monthly: 18, status: "confirmed" },
  "vps.hdd_gb": { monthly: 6, status: "confirmed" },
  "vps.ip": { monthly: 180, status: "confirmed" },
  "vps.backup": { monthly: 500, status: "confirmed" },
  "vps.ddos": { monthly: null, status: "unknown" },

  "colocation.unit": { monthly: 2500, status: "confirmed" },
  "colocation.power_100w": { monthly: 800, status: "confirmed" },
  "colocation.ipv4": { monthly: 150, status: "confirmed" },
  "colocation.port.100m": { monthly: 1000, status: "confirmed" },
  "colocation.port.1g": { monthly: 3000, status: "confirmed" },
  "colocation.port.10g": { monthly: null, status: "unknown" },
  "colocation.ipmi": { monthly: 500, status: "confirmed" },
  "colocation.remote_hands": { oneTime: 2000, status: "confirmed" },

  "wifi_auth.basic": { monthly: 1500, status: "confirmed" },
  "wifi_auth.standard": { monthly: 3000, status: "confirmed" },
  "wifi_auth.premium": { monthly: 5000, status: "confirmed" },
  "wifi_auth.sms": { monthly: 900, status: "confirmed" },
  "wifi_auth.branded_page": { oneTime: 8000, status: "confirmed" }
};

export const businessCalculatorConfigs: Record<CalculatorType, BusinessCalculatorConfig> = {
  telephony: {
    type: "telephony",
    serviceSlug: "telephony",
    title: "Калькулятор телефонии",
    lead: "Соберите конфигурацию по портам, номерам, внешним линиям и функциям ВАТС.",
    submitLabel: "Передать расчет телефонии",
    fields: [
      { kind: "number", name: "ports", label: "SIP-порты", min: 1, max: 200, step: 1, value: 8 },
      {
        kind: "number",
        name: "phoneNumbers",
        label: "Городские номера",
        min: 1,
        max: 100,
        step: 1,
        value: 2
      },
      {
        kind: "number",
        name: "externalLines",
        label: "Внешние линии",
        min: 0,
        max: 100,
        step: 1,
        value: 2
      },
      { kind: "checkbox", name: "virtualPbx", label: "Виртуальная АТС", checked: true },
      { kind: "checkbox", name: "autoAttendant", label: "Автооператор", checked: false }
    ],
    lines: [
      { kind: "repeated", key: "telephony.port", quantityField: "ports", label: "SIP-порты" },
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
        label: "Внешние линии"
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
      }
    ]
  },
  cctv: {
    type: "cctv",
    serviceSlug: "cctv",
    title: "Калькулятор видеонаблюдения",
    lead: "Посчитайте камеры, глубину архива, оборудование и монтаж для объекта.",
    submitLabel: "Передать расчет камер",
    fields: [
      { kind: "number", name: "camerasCount", label: "Камер", min: 1, max: 128, step: 1, value: 8 },
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
        ]
      },
      {
        kind: "number",
        name: "hardwareCount",
        label: "Камер к поставке",
        min: 0,
        max: 128,
        step: 1,
        value: 8
      },
      { kind: "checkbox", name: "installNeed", label: "Нужен монтаж", checked: true }
    ],
    lines: [
      {
        kind: "repeatedSelect",
        keyPrefix: "cctv.archive.",
        selectField: "archiveDays",
        quantityField: "camerasCount",
        labelPrefix: "Архив на камеру"
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
    title: "Калькулятор VPS",
    lead: "Подберите CPU, RAM, диск, IP и опции для виртуального сервера.",
    submitLabel: "Передать расчет VPS",
    fields: [
      { kind: "number", name: "vCpu", label: "vCPU", min: 1, max: 64, step: 1, value: 4 },
      {
        kind: "number",
        name: "ramGb",
        label: "RAM",
        min: 1,
        max: 256,
        step: 1,
        value: 8,
        suffix: "ГБ"
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
      { kind: "number", name: "ipCount", label: "IPv4", min: 0, max: 64, step: 1, value: 1 },
      { kind: "checkbox", name: "backup", label: "Backup", checked: true },
      { kind: "checkbox", name: "ddosProtection", label: "DDoS-защита", checked: false }
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
    title: "Калькулятор размещения",
    lead: "Посчитайте юниты, питание, порт, IPMI, IPv4 и удаленные руки.",
    submitLabel: "Передать расчет размещения",
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
      { kind: "number", name: "ipv4Count", label: "IPv4", min: 0, max: 128, step: 1, value: 1 },
      {
        kind: "select",
        name: "internetPort",
        label: "Порт",
        value: "1g",
        options: [
          { value: "100m", label: "100 Мбит/с" },
          { value: "1g", label: "1 Гбит/с" },
          { value: "10g", label: "10 Гбит/с" }
        ]
      },
      { kind: "checkbox", name: "ipmi", label: "IPMI", checked: true },
      { kind: "checkbox", name: "remoteHands", label: "Удаленные руки", checked: false }
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
      { kind: "repeated", key: "colocation.ipv4", quantityField: "ipv4Count", label: "IPv4" },
      {
        kind: "select",
        keyPrefix: "colocation.port.",
        selectField: "internetPort",
        labelPrefix: "Порт"
      },
      { kind: "optional", key: "colocation.ipmi", enabledField: "ipmi", label: "IPMI" },
      {
        kind: "optional",
        key: "colocation.remote_hands",
        enabledField: "remoteHands",
        label: "Удаленные руки"
      }
    ]
  },
  wifi_auth: {
    type: "wifi_auth",
    serviceSlug: "wifi-auth",
    title: "Калькулятор Hot-spot",
    lead: "Выберите тариф авторизации Wi‑Fi, количество площадок, SMS и брендированную страницу.",
    submitLabel: "Передать расчет Hot-spot",
    fields: [
      {
        kind: "select",
        name: "plan",
        label: "Тариф",
        value: "standard",
        options: [
          { value: "basic", label: "Basic" },
          { value: "standard", label: "Standard" },
          { value: "premium", label: "Premium" }
        ]
      },
      {
        kind: "number",
        name: "sitesCount",
        label: "Площадок",
        min: 1,
        max: 100,
        step: 1,
        value: 1
      },
      { kind: "checkbox", name: "smsNeed", label: "SMS-авторизация", checked: true },
      { kind: "checkbox", name: "brandedPage", label: "Брендированная страница", checked: false }
    ],
    lines: [
      {
        kind: "repeatedSelect",
        keyPrefix: "wifi_auth.",
        selectField: "plan",
        quantityField: "sitesCount",
        labelPrefix: "Тариф"
      },
      { kind: "optional", key: "wifi_auth.sms", enabledField: "smsNeed", label: "SMS-авторизация" },
      {
        kind: "optional",
        key: "wifi_auth.branded_page",
        enabledField: "brandedPage",
        label: "Брендированная страница"
      }
    ]
  }
};

const serviceToCalculator: Record<string, CalculatorType | undefined> = {
  telephony: "telephony",
  cctv: "cctv",
  vps: "vps",
  colocation: "colocation",
  "wifi-auth": "wifi_auth"
};

export function getBusinessCalculatorConfig(
  serviceSlug: string
): BusinessCalculatorConfig | undefined {
  const type = serviceToCalculator[serviceSlug];

  return type ? businessCalculatorConfigs[type] : undefined;
}
