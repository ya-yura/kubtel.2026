import type { BusinessPricingCatalog } from "@lib/business/calculators";

export type CalculatorType =
  | "internet"
  | "telephony"
  | "telephony_intrazone"
  | "telephony_long_distance"
  | "telephony_international"
  | "telephony_services"
  | "cctv"
  | "vps"
  | "vdi"
  | "colocation"
  | "wifi_auth";

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
  glossary?: CalculatorGlossaryItem[];
};

export const businessCalculatorPricing: BusinessPricingCatalog = {
  "internet.speed.100": {
    monthly: 1800,
    status: "needs_verification",
    unitLabel: "за канал 100 Мбит/с в месяц"
  },
  "internet.speed.300": {
    monthly: 3000,
    status: "needs_verification",
    unitLabel: "за канал 300 Мбит/с в месяц"
  },
  "internet.speed.500": {
    monthly: 4500,
    status: "needs_verification",
    unitLabel: "за канал 500 Мбит/с в месяц"
  },
  "internet.static_ip": {
    monthly: 250,
    status: "needs_verification",
    unitLabel: "за IPv4-адрес в месяц"
  },
  "internet.backup_channel": {
    monthly: 1800,
    status: "needs_verification",
    unitLabel: "за резервный канал в месяц"
  },
  "internet.router_setup": {
    oneTime: 1500,
    status: "needs_verification",
    unitLabel: "разовая настройка маршрутизатора"
  },

  "telephony.port": {
    monthly: 250,
    status: "needs_verification",
    unitLabel: "за SIP-порт в месяц"
  },
  "telephony.phone_number": {
    monthly: 150,
    status: "needs_verification",
    unitLabel: "за городской номер в месяц"
  },
  "telephony.external_line": {
    monthly: 450,
    status: "needs_verification",
    unitLabel: "за одновременный внешний разговор в месяц"
  },
  "telephony.virtual_pbx": {
    monthly: 1000,
    status: "needs_verification",
    unitLabel: "за виртуальную АТС в месяц"
  },
  "telephony.auto_attendant": {
    monthly: 350,
    oneTime: 1200,
    status: "needs_verification",
    unitLabel: "за автооператор: абонентская плата и настройка"
  },
  "telephony.intrazone.city": {
    monthly: 1.2,
    status: "needs_verification",
    unitLabel: "за минуту внутризоновой связи"
  },
  "telephony.intrazone.mobile": {
    monthly: 1.8,
    status: "needs_verification",
    unitLabel: "за минуту на мобильные номера региона"
  },
  "telephony.long_distance.russia": {
    monthly: 2.5,
    status: "needs_verification",
    unitLabel: "за минуту междугородной связи по РФ"
  },
  "telephony.long_distance.cis": {
    monthly: 7,
    status: "needs_verification",
    unitLabel: "за минуту связи со странами СНГ"
  },
  "telephony.international.europe": {
    monthly: 18,
    status: "needs_verification",
    unitLabel: "за минуту международной связи: Европа"
  },
  "telephony.international.world": {
    monthly: 35,
    status: "needs_verification",
    unitLabel: "за минуту международной связи: прочие направления"
  },
  "telephony.service.call_recording": {
    monthly: 300,
    status: "needs_verification",
    unitLabel: "за запись разговоров в месяц"
  },
  "telephony.service.call_forwarding": {
    monthly: 150,
    status: "needs_verification",
    unitLabel: "за переадресацию в месяц"
  },
  "telephony.service.number_identification": {
    monthly: 100,
    status: "needs_verification",
    unitLabel: "за определитель номера в месяц"
  },

  "cctv.archive.3": { monthly: 250, status: "needs_verification", unitLabel: "за камеру в месяц" },
  "cctv.archive.7": { monthly: 390, status: "needs_verification", unitLabel: "за камеру в месяц" },
  "cctv.archive.14": { monthly: 590, status: "needs_verification", unitLabel: "за камеру в месяц" },
  "cctv.archive.30": { monthly: 890, status: "needs_verification", unitLabel: "за камеру в месяц" },
  "cctv.camera": { oneTime: 4500, status: "needs_verification", unitLabel: "за камеру разово" },
  "cctv.install": {
    oneTime: 2500,
    status: "needs_verification",
    unitLabel: "за монтаж точки разово"
  },

  "vps.cpu": { monthly: 450, status: "needs_verification", unitLabel: "за vCPU в месяц" },
  "vps.ram_gb": { monthly: 180, status: "needs_verification", unitLabel: "за 1 ГБ RAM в месяц" },
  "vps.ssd_gb": { monthly: 18, status: "needs_verification", unitLabel: "за 1 ГБ SSD в месяц" },
  "vps.hdd_gb": { monthly: 6, status: "needs_verification", unitLabel: "за 1 ГБ HDD в месяц" },
  "vps.ip": { monthly: 180, status: "needs_verification", unitLabel: "за IPv4-адрес в месяц" },
  "vps.backup": {
    monthly: 500,
    status: "needs_verification",
    unitLabel: "за резервное копирование в месяц"
  },
  "vps.ddos": { monthly: null, status: "unknown", unitLabel: "по параметрам защиты" },

  "vdi.basic": {
    monthly: 1800,
    status: "needs_verification",
    unitLabel: "за базовое рабочее место в месяц"
  },
  "vdi.standard": {
    monthly: 2800,
    status: "needs_verification",
    unitLabel: "за стандартное рабочее место в месяц"
  },
  "vdi.power": {
    monthly: 4200,
    status: "needs_verification",
    unitLabel: "за усиленное рабочее место в месяц"
  },
  "vdi.backup": {
    monthly: 450,
    status: "needs_verification",
    unitLabel: "за резервное копирование места в месяц"
  },

  "colocation.unit": { monthly: 2500, status: "needs_verification", unitLabel: "за 1U в месяц" },
  "colocation.power_100w": {
    monthly: 800,
    status: "needs_verification",
    unitLabel: "за каждые 100 Вт в месяц"
  },
  "colocation.ipv4": {
    monthly: 150,
    status: "needs_verification",
    unitLabel: "за IPv4-адрес в месяц"
  },
  "colocation.port.100m": {
    monthly: 1000,
    status: "needs_verification",
    unitLabel: "за порт 100 Мбит/с в месяц"
  },
  "colocation.port.1g": {
    monthly: 3000,
    status: "needs_verification",
    unitLabel: "за порт 1 Гбит/с в месяц"
  },
  "colocation.port.10g": { monthly: null, status: "unknown", unitLabel: "по проекту" },
  "colocation.ipmi": {
    monthly: 500,
    status: "needs_verification",
    unitLabel: "за IPMI-доступ в месяц"
  },
  "colocation.remote_hands": {
    oneTime: 2000,
    status: "needs_verification",
    unitLabel: "за разовый выезд инженера"
  },

  "wifi_auth.basic": {
    monthly: 1500,
    status: "needs_verification",
    unitLabel: "за площадку в месяц"
  },
  "wifi_auth.standard": {
    monthly: 3000,
    status: "needs_verification",
    unitLabel: "за площадку в месяц"
  },
  "wifi_auth.premium": {
    monthly: 5000,
    status: "needs_verification",
    unitLabel: "за площадку в месяц"
  },
  "wifi_auth.sms": {
    monthly: 900,
    status: "needs_verification",
    unitLabel: "за SMS-пакет в месяц"
  },
  "wifi_auth.branded_page": {
    oneTime: 8000,
    status: "needs_verification",
    unitLabel: "за подготовку страницы разово"
  }
};

export const businessCalculatorConfigs: Record<CalculatorType, BusinessCalculatorConfig> = {
  internet: {
    type: "internet",
    serviceSlug: "internet",
    title: "Калькулятор интернета в офис",
    lead: "Соберите ориентир по скорости, статическим IP, резервному каналу и настройке маршрутизатора.",
    submitLabel: "Подключить",
    sourceNote:
      "Расчёт предварительный; итоговая стоимость фиксируется по действующим коммерческим условиям.",
    fields: [
      {
        kind: "select",
        name: "speedMbps",
        label: "Скорость канала",
        value: "300",
        help: "Скорость доступа для офиса или точки обслуживания.",
        options: [
          { value: "100", label: "100 Мбит/с" },
          { value: "300", label: "300 Мбит/с" },
          { value: "500", label: "500 Мбит/с" }
        ]
      },
      {
        kind: "number",
        name: "staticIpCount",
        label: "Статические IP",
        min: 0,
        max: 32,
        step: 1,
        value: 1,
        help: "Постоянные IPv4-адреса для касс, VPN, камер, серверов или удалённого администрирования."
      },
      {
        kind: "checkbox",
        name: "backupChannel",
        label: "Резервный канал",
        checked: false,
        help: "Дополнительный канал связи, который снижает риск простоя при аварии основного канала."
      },
      {
        kind: "checkbox",
        name: "routerSetup",
        label: "Настройка маршрутизатора",
        checked: true,
        help: "Разовая настройка оборудования на объекте."
      },
      {
        kind: "checkbox",
        name: "slaNeed",
        label: "Нужен SLA",
        checked: false,
        help: "Фиксированные параметры реакции и восстановления требуют отдельного согласования."
      }
    ],
    lines: [
      {
        kind: "select",
        keyPrefix: "internet.speed.",
        selectField: "speedMbps",
        labelPrefix: "Канал",
        valueLabels: {
          "100": "100 Мбит/с",
          "300": "300 Мбит/с",
          "500": "500 Мбит/с"
        }
      },
      {
        kind: "repeated",
        key: "internet.static_ip",
        quantityField: "staticIpCount",
        label: "Статические IPv4-адреса"
      },
      {
        kind: "optional",
        key: "internet.backup_channel",
        enabledField: "backupChannel",
        label: "Резервный канал"
      },
      {
        kind: "optional",
        key: "internet.router_setup",
        enabledField: "routerSetup",
        label: "Настройка маршрутизатора"
      }
    ],
    glossary: [
      {
        term: "Статический IP",
        description:
          "постоянный внешний адрес, который не меняется после перезагрузки оборудования."
      },
      {
        term: "Резервный канал",
        description: "запасной доступ в интернет для критичных сервисов на объекте."
      },
      {
        term: "SLA",
        description: "согласованный уровень сервиса: реакция, восстановление и порядок эскалации."
      }
    ]
  },
  telephony: {
    type: "telephony",
    serviceSlug: "telephony",
    title: "IP-телефония и ВАТС",
    lead: "Соберите конфигурацию по портам, номерам, одновременным внешним разговорам и функциям ВАТС.",
    submitLabel: "Подключить",
    sourceNote:
      "Цены за единицу показаны отдельно; итоговая стоимость фиксируется по действующим тарифам.",
    fields: [
      {
        kind: "number",
        name: "ports",
        label: "SIP-порты",
        min: 1,
        max: 200,
        step: 1,
        value: 8,
        help: "Один SIP-порт нужен для телефона, софтфона или подключения к АТС."
      },
      {
        kind: "number",
        name: "phoneNumbers",
        label: "Городские номера",
        min: 1,
        max: 100,
        step: 1,
        value: 2,
        help: "Номера, по которым клиенты звонят в компанию."
      },
      {
        kind: "number",
        name: "externalLines",
        label: "Одновременные внешние разговоры",
        min: 0,
        max: 100,
        step: 1,
        value: 2,
        help: "Сколько входящих или исходящих разговоров может идти параллельно."
      },
      {
        kind: "checkbox",
        name: "virtualPbx",
        label: "Виртуальная АТС",
        checked: true,
        help: "Облачная телефонная станция: очереди, переадресация, правила звонков."
      },
      {
        kind: "checkbox",
        name: "autoAttendant",
        label: "Автооператор",
        checked: false,
        help: "Голосовое меню, которое направляет звонок в нужный отдел."
      }
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
        label: "Одновременные внешние разговоры"
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
    ],
    glossary: [
      {
        term: "SIP-порт",
        description: "подключение для одного телефона, софтфона или устройства в IP-телефонии."
      },
      {
        term: "Внешний разговор",
        description: "один одновременный звонок между компанией и внешним номером."
      },
      {
        term: "ВАТС",
        description:
          "виртуальная АТС: облачная система управления звонками без отдельной станции в офисе."
      }
    ]
  },
  telephony_intrazone: {
    type: "telephony_intrazone",
    serviceSlug: "telephony",
    title: "Внутризоновая связь",
    lead: "Расчёт ориентировочной стоимости звонков внутри региона по минутам.",
    submitLabel: "Подключить",
    sourceNote: "Расчёт отображает стоимость за минуту по выбранному внутризоновому направлению.",
    fields: [
      {
        kind: "select",
        name: "direction",
        label: "Направление",
        value: "city",
        help: "Выберите тип номеров внутри региона, по которым нужно оценить расход.",
        options: [
          { value: "city", label: "Городские номера региона" },
          { value: "mobile", label: "Мобильные номера региона" }
        ]
      },
      {
        kind: "number",
        name: "minutes",
        label: "Минут в месяц",
        min: 1,
        max: 100000,
        step: 10,
        value: 500,
        help: "Ориентировочный объём разговоров для расчёта."
      }
    ],
    lines: [
      {
        kind: "repeatedSelect",
        keyPrefix: "telephony.intrazone.",
        selectField: "direction",
        quantityField: "minutes",
        labelPrefix: "Внутризоновая связь",
        valueLabels: {
          city: "городские номера региона",
          mobile: "мобильные номера региона"
        }
      }
    ]
  },
  telephony_long_distance: {
    type: "telephony_long_distance",
    serviceSlug: "telephony",
    title: "Междугородная связь",
    lead: "Расчёт междугородных направлений по минутам.",
    submitLabel: "Подключить",
    sourceNote: "Расчёт отображает стоимость за минуту по выбранному междугородному направлению.",
    fields: [
      {
        kind: "select",
        name: "direction",
        label: "Направление",
        value: "russia",
        help: "Направление влияет на поминутную стоимость междугородной связи.",
        options: [
          { value: "russia", label: "Россия" },
          { value: "cis", label: "СНГ" }
        ]
      },
      {
        kind: "number",
        name: "minutes",
        label: "Минут в месяц",
        min: 1,
        max: 100000,
        step: 10,
        value: 300,
        help: "Ориентировочный месячный объём разговоров."
      }
    ],
    lines: [
      {
        kind: "repeatedSelect",
        keyPrefix: "telephony.long_distance.",
        selectField: "direction",
        quantityField: "minutes",
        labelPrefix: "Междугородная связь",
        valueLabels: {
          russia: "Россия",
          cis: "СНГ"
        }
      }
    ]
  },
  telephony_international: {
    type: "telephony_international",
    serviceSlug: "telephony",
    title: "Международная связь",
    lead: "Расчёт международных направлений по минутам.",
    submitLabel: "Подключить",
    sourceNote: "Расчёт отображает стоимость за минуту по выбранному международному направлению.",
    fields: [
      {
        kind: "select",
        name: "direction",
        label: "Направление",
        value: "europe",
        help: "Для нестандартных стран итоговую стоимость уточняет менеджер.",
        options: [
          { value: "europe", label: "Европа" },
          { value: "world", label: "Прочие направления" }
        ]
      },
      {
        kind: "number",
        name: "minutes",
        label: "Минут в месяц",
        min: 1,
        max: 50000,
        step: 10,
        value: 100,
        help: "Оценка регулярного месячного объёма звонков."
      }
    ],
    lines: [
      {
        kind: "repeatedSelect",
        keyPrefix: "telephony.international.",
        selectField: "direction",
        quantityField: "minutes",
        labelPrefix: "Международная связь",
        valueLabels: {
          europe: "Европа",
          world: "прочие направления"
        }
      }
    ]
  },
  telephony_services: {
    type: "telephony_services",
    serviceSlug: "telephony",
    title: "Услуги телефонии",
    lead: "Дополнительные услуги телефонии: запись, переадресация, определитель номера.",
    submitLabel: "Подключить",
    sourceNote: "Состав и стоимость услуг фиксируются по действующим тарифам телефонии.",
    fields: [
      {
        kind: "checkbox",
        name: "callRecording",
        label: "Запись разговоров",
        checked: true,
        help: "Помогает контролировать качество продаж и поддержки."
      },
      {
        kind: "checkbox",
        name: "callForwarding",
        label: "Переадресация",
        checked: true,
        help: "Перевод звонков между сотрудниками, отделами или внешними номерами."
      },
      {
        kind: "checkbox",
        name: "numberIdentification",
        label: "Определитель номера",
        checked: false,
        help: "Показывает номер входящего звонка, если услуга доступна на выбранной схеме."
      }
    ],
    lines: [
      {
        kind: "optional",
        key: "telephony.service.call_recording",
        enabledField: "callRecording",
        label: "Запись разговоров"
      },
      {
        kind: "optional",
        key: "telephony.service.call_forwarding",
        enabledField: "callForwarding",
        label: "Переадресация"
      },
      {
        kind: "optional",
        key: "telephony.service.number_identification",
        enabledField: "numberIdentification",
        label: "Определитель номера"
      }
    ]
  },
  cctv: {
    type: "cctv",
    serviceSlug: "cctv",
    title: "Калькулятор видеонаблюдения",
    lead: "Посчитайте камеры, глубину архива, оборудование и монтаж для объекта.",
    submitLabel: "Подключить",
    fields: [
      {
        kind: "number",
        name: "camerasCount",
        label: "Камер",
        min: 1,
        max: 128,
        step: 1,
        value: 8,
        help: "Сколько точек наблюдения нужно видеть в облачном архиве."
      },
      {
        kind: "select",
        name: "archiveDays",
        label: "Архив",
        value: "7",
        help: "Глубина хранения записей по каждой камере.",
        options: [
          { value: "3", label: "3\u00a0дня" },
          { value: "7", label: "7\u00a0дней" },
          { value: "14", label: "14\u00a0дней" },
          { value: "30", label: "30\u00a0дней" }
        ]
      },
      {
        kind: "number",
        name: "hardwareCount",
        label: "Камер к\u00a0поставке",
        min: 0,
        max: 128,
        step: 1,
        value: 8,
        help: "Сколько камер нужно поставить вместе с услугой. Если оборудование уже есть, оставьте 0."
      },
      {
        kind: "checkbox",
        name: "installNeed",
        label: "Нужен монтаж",
        checked: true,
        help: "Выезд и настройка точки на объекте; точный объём работ подтверждается после осмотра."
      }
    ],
    lines: [
      {
        kind: "repeatedSelect",
        keyPrefix: "cctv.archive.",
        selectField: "archiveDays",
        quantityField: "camerasCount",
        labelPrefix: "Архив на камеру",
        valueLabels: {
          "3": "3 дня",
          "7": "7 дней",
          "14": "14 дней",
          "30": "30 дней"
        }
      },
      {
        kind: "repeated",
        key: "cctv.camera",
        quantityField: "hardwareCount",
        label: "Камеры к\u00a0поставке"
      },
      { kind: "optional", key: "cctv.install", enabledField: "installNeed", label: "Монтаж" }
    ]
  },
  vps: {
    type: "vps",
    serviceSlug: "vps",
    title: "Калькулятор VPS",
    lead: "Подберите CPU, RAM, диск, IP и опции для виртуального сервера.",
    submitLabel: "Подключить",
    fields: [
      {
        kind: "number",
        name: "vCpu",
        label: "vCPU",
        min: 1,
        max: 64,
        step: 1,
        value: 4,
        help: "Виртуальные процессорные ядра для приложений и сервисов."
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
        help: "Оперативная память для серверных приложений, 1С, CRM или телефонии."
      },
      {
        kind: "number",
        name: "ssdGb",
        label: "SSD",
        min: 0,
        max: 4000,
        step: 10,
        value: 160,
        suffix: "ГБ",
        help: "Быстрый диск для системы, базы данных и активных файлов."
      },
      {
        kind: "number",
        name: "hddGb",
        label: "HDD",
        min: 0,
        max: 20000,
        step: 100,
        value: 0,
        suffix: "ГБ",
        help: "Более объёмное хранение для архивов и редко используемых данных."
      },
      {
        kind: "number",
        name: "ipCount",
        label: "IPv4",
        min: 0,
        max: 64,
        step: 1,
        value: 1,
        help: "Публичные адреса для доступа к серверу и сервисам."
      },
      {
        kind: "checkbox",
        name: "backup",
        label: "Backup",
        checked: true,
        help: "Регулярное резервное копирование для восстановления после сбоя."
      },
      {
        kind: "checkbox",
        name: "ddosProtection",
        label: "DDoS-защита",
        checked: false,
        help: "Подбирается по профилю трафика и рискам, поэтому может требовать отдельного расчёта."
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
  vdi: {
    type: "vdi",
    serviceSlug: "vdi",
    title: "Калькулятор виртуальных рабочих мест",
    lead: "Оцените количество рабочих мест, профиль ресурсов и резервное копирование.",
    submitLabel: "Подключить",
    sourceNote: "VDI относится к бизнес-услугам и не подменяет домашние тарифы для физических лиц.",
    fields: [
      {
        kind: "number",
        name: "seats",
        label: "Рабочие места",
        min: 1,
        max: 200,
        step: 1,
        value: 5,
        help: "Количество сотрудников, которым нужен виртуальный рабочий стол."
      },
      {
        kind: "select",
        name: "preset",
        label: "Профиль",
        value: "standard",
        help: "Набор CPU, RAM и диска для одного рабочего места.",
        options: [
          { value: "basic", label: "Базовый" },
          { value: "standard", label: "Стандартный" },
          { value: "power", label: "Усиленный" }
        ]
      },
      {
        kind: "checkbox",
        name: "backup",
        label: "Резервное копирование",
        checked: true,
        help: "Опция для восстановления рабочего места после сбоя."
      }
    ],
    lines: [
      {
        kind: "repeatedSelect",
        keyPrefix: "vdi.",
        selectField: "preset",
        quantityField: "seats",
        labelPrefix: "Рабочее место",
        valueLabels: {
          basic: "базовое",
          standard: "стандартное",
          power: "усиленное"
        }
      },
      {
        kind: "optional",
        key: "vdi.backup",
        enabledField: "backup",
        label: "Резервное копирование"
      }
    ],
    glossary: [
      {
        term: "VDI",
        description:
          "виртуальное рабочее место для сотрудника, размещённое в серверной инфраструктуре."
      },
      {
        term: "Профиль",
        description: "типовой набор ресурсов для одного рабочего места."
      }
    ]
  },
  colocation: {
    type: "colocation",
    serviceSlug: "colocation",
    title: "Калькулятор размещения",
    lead: "Посчитайте юниты, питание, порт, IPMI, IPv4 и удалённые руки.",
    submitLabel: "Подключить",
    fields: [
      {
        kind: "number",
        name: "rackUnits",
        label: "Юниты",
        min: 1,
        max: 48,
        step: 1,
        value: 2,
        suffix: "U",
        help: "Высота оборудования в стойке. 1U - один стандартный юнит серверной стойки."
      },
      {
        kind: "number",
        name: "powerWatts",
        label: "Питание",
        min: 100,
        max: 5000,
        step: 50,
        value: 400,
        suffix: "Вт",
        help: "Потребляемая мощность оборудования. Расчёт округляет питание до блоков по 100 Вт."
      },
      {
        kind: "number",
        name: "ipv4Count",
        label: "IPv4",
        min: 0,
        max: 128,
        step: 1,
        value: 1,
        help: "Публичные адреса для серверов, VPN, сервисов или администрирования."
      },
      {
        kind: "select",
        name: "internetPort",
        label: "Порт",
        value: "1g",
        help: "Скорость порта подключения. 10 Гбит/с требует инженерной проверки.",
        options: [
          { value: "100m", label: "100\u00a0Мбит/с" },
          { value: "1g", label: "1\u00a0Гбит/с" },
          { value: "10g", label: "10\u00a0Гбит/с" }
        ]
      },
      {
        kind: "checkbox",
        name: "ipmi",
        label: "IPMI",
        checked: true,
        help: "Отдельный канал управления сервером для перезагрузки и диагностики."
      },
      {
        kind: "checkbox",
        name: "remoteHands",
        label: "Удалённые руки",
        checked: false,
        help: "Разовая работа инженера на площадке: кабель, перезагрузка, проверка индикации."
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
      { kind: "repeated", key: "colocation.ipv4", quantityField: "ipv4Count", label: "IPv4" },
      {
        kind: "select",
        keyPrefix: "colocation.port.",
        selectField: "internetPort",
        labelPrefix: "Порт",
        valueLabels: {
          "100m": "100 Мбит/с",
          "1g": "1 Гбит/с",
          "10g": "10 Гбит/с"
        }
      },
      { kind: "optional", key: "colocation.ipmi", enabledField: "ipmi", label: "IPMI" },
      {
        kind: "optional",
        key: "colocation.remote_hands",
        enabledField: "remoteHands",
        label: "Удалённые руки"
      }
    ],
    glossary: [
      {
        term: "Юнит",
        description: "единица высоты оборудования в серверной стойке; 1U равен 44,45 мм."
      },
      {
        term: "IPMI",
        description:
          "интерфейс удалённого управления сервером, который работает независимо от основной ОС."
      },
      {
        term: "Удалённые руки",
        description: "работа инженера ЦОД с оборудованием клиента по согласованной заявке."
      }
    ]
  },
  wifi_auth: {
    type: "wifi_auth",
    serviceSlug: "wifi-auth",
    title: "Калькулятор Hot-spot",
    lead: "Выберите тариф авторизации Wi‑Fi, количество площадок, SMS и брендированную страницу.",
    submitLabel: "Подключить",
    fields: [
      {
        kind: "select",
        name: "plan",
        label: "Тариф",
        value: "standard",
        help: "Пакет авторизации подбирается по нагрузке и требованиям публичной точки.",
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
        value: 1,
        help: "Количество кафе, офисов, торговых точек или других площадок."
      },
      {
        kind: "checkbox",
        name: "smsNeed",
        label: "SMS-авторизация",
        checked: true,
        help: "Подходит для публичного Wi-Fi, где нужна идентификация посетителей."
      },
      {
        kind: "checkbox",
        name: "brandedPage",
        label: "Брендированная страница",
        checked: false,
        help: "Стартовая страница Wi-Fi с брендом точки и полезной информацией для посетителей."
      }
    ],
    lines: [
      {
        kind: "repeatedSelect",
        keyPrefix: "wifi_auth.",
        selectField: "plan",
        quantityField: "sitesCount",
        labelPrefix: "Тариф",
        valueLabels: {
          basic: "Basic",
          standard: "Standard",
          premium: "Premium"
        }
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
  internet: "internet",
  telephony: "telephony",
  cctv: "cctv",
  vps: "vps",
  vdi: "vdi",
  colocation: "colocation",
  "wifi-auth": "wifi_auth"
};

export function getBusinessCalculatorConfig(
  serviceSlug: string
): BusinessCalculatorConfig | undefined {
  const type = serviceToCalculator[serviceSlug];

  return type ? businessCalculatorConfigs[type] : undefined;
}
