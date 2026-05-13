# Kubtel.ru: B2B-конверсионная воронка

Дата: 2026-05-08.

Роль: growth product lead / CRO.

Статус: product-ready funnel contract. Текущий код уже отделяет B2B-заявку от B2C через `/business/request/` и `submitBusinessLead`, но расширенные конфигурации, scoring и полная CRM-routing схема должны быть реализованы в следующих инженерных шагах.

Связанные файлы:

- `docs/b2b-strategy-ia-funnel.md` - общий B2B strategy/IA artifact.
- `src/lib/leads/business-schema.ts` - текущая MVP-схема B2B-заявки.
- `src/lib/leads/business-submission.ts` - текущая сборка B2B submission.
- `src/actions/index.ts` - текущий Astro Action `submitBusinessLead`.

## Цель

B2B-заявка должна квалифицироваться и измеряться отдельно от домашнего подключения:

- отдельный `leadType=b2b`;
- отдельные `serviceInterest`, `businessSegment`, `configurationSummary`;
- отдельный scoring: `mql`, `sql`, `needs_enrichment`;
- отдельная CRM routing логика: `b2b`, `operators`, `datacenter`;
- отдельные analytics events для страницы, калькулятора, формы, успеха и ошибки;
- UI закрывает тревоги до отправки: неизвестная цена, покрытие, SLA, legal/compliance, лимиты конфигурации.

## Conversion flow map

### 1. Интернет в офис -> расчет скорости и заявка

Главная микро-конверсия: пользователь указал адрес/тип объекта, нужную скорость или задачу и нажал `Рассчитать интернет`.

Поля формы:

- базовые: `companyName`, `contactPerson`, `phone`, `email`, `city`, `businessSegment`, `serviceInterest=internet`, `urgency`, `consent`;
- квалификация: `address`, `objectType`, `employeesOrSites`, `currentProvider`, `launchDate`;
- конфигурация: `speedNeed`, `symmetryRequired`, `backupChannel`, `staticIpCount`, `routerSetup`, `slaNeed`, `legalEntityBilling`;
- свободное поле: `message`.

MQL:

- заполнены компания, телефон, услуга и адрес или город;
- выбран срок `asap`, `7_days` или `30_days`;
- есть хотя бы один параметр конфигурации: скорость, резервирование, статический IP, SLA.

SQL:

- адрес предварительно покрывается Kubtel или нужен выезд/строительство;
- указан срок запуска до 30 дней;
- есть B2B-признак: юридическое лицо, офис/точка/склад, SLA, резервирование, 2+ площадки или статические IP;
- контакт похож на ЛПР/ИТ/администратора.

Analytics events:

- `b2b_service_view` `{ serviceSlug: "internet", sourcePath, sourceStatus }`;
- `b2b_calculator_start` `{ calculatorType: "internet", serviceSlug }`;
- `b2b_calculator_change` `{ field: "speedNeed|backupChannel|staticIpCount|slaNeed", valueBand, hasUnknownPrice }`;
- `b2b_estimate_ready` `{ monthlyKnown, oneTimeKnown, unknownItemsCount, requiredConsultation }`;
- `b2b_lead_submit`, `b2b_lead_success`, `b2b_lead_failure`.

CRM payload:

```json
{
  "leadType": "b2b",
  "serviceInterest": "internet",
  "routing": { "pipeline": "b2b", "department": "business_sales" },
  "configuration": {
    "internet": {
      "address": "string",
      "objectType": "office|retail|clinic|warehouse|other",
      "speedNeed": "100|300|500|1000|custom",
      "symmetryRequired": true,
      "backupChannel": true,
      "staticIpCount": 1,
      "slaNeed": true
    }
  }
}
```

UI тревоги и ошибки:

- адрес вне зоны покрытия или требует ручной проверки;
- цена/срок подключения неизвестны;
- SLA не подтвержден коммерчески;
- резервный канал может требовать отдельного проекта;
- нельзя отправить без согласия и телефона;
- duplicate submit, rate limit, CRM unavailable -> outbox fallback.

### 2. Телефония -> подбор конфигурации

Главная микро-конверсия: пользователь выбрал тип подключения, номера/линии/порты и нажал `Подобрать телефонию`.

Поля формы:

- базовые: `companyName`, `contactPerson`, `phone`, `email`, `city`, `serviceInterest=telephony`, `urgency`, `consent`;
- квалификация: `officeType`, `currentPhoneProvider`, `numberPorting`, `salesTeamSize`;
- конфигурация: `connectionType`, `tariffPlan`, `ports`, `phoneNumbers`, `externalLines`, `numberCategory`, `virtualPbx`, `autoAttendant`, `callRecording`, `crmIntegration`;
- свободное поле: `message`.

MQL:

- выбран тип подключения или виртуальная АТС;
- указаны контакты;
- ports/externalLines/phoneNumbers больше 0 или есть запрос на перенос номера.

SQL:

- есть запрос на перенос номера, многоканал, виртуальную АТС или автооператор;
- срок запуска до 30 дней;
- указано 3+ пользователей/линий или CRM-интеграция;
- менеджер подтвердил связь с ЛПР/администратором.

Analytics events:

- `b2b_service_view` `{ serviceSlug: "telephony" }`;
- `b2b_calculator_start` `{ calculatorType: "telephony" }`;
- `b2b_calculator_change` `{ field: "connectionType|ports|phoneNumbers|virtualPbx|autoAttendant", valueBand }`;
- `b2b_form_validation_error` for invalid counts or missing phone;
- `b2b_lead_submit`, `b2b_lead_success`, `b2b_lead_failure`.

CRM payload:

```json
{
  "leadType": "b2b",
  "serviceInterest": "telephony",
  "routing": { "pipeline": "b2b", "department": "business_sales" },
  "configuration": {
    "telephony": {
      "connectionType": "ip|analog|digital|unknown",
      "ports": 4,
      "phoneNumbers": 2,
      "externalLines": 2,
      "virtualPbx": true,
      "autoAttendant": true,
      "numberPorting": false,
      "crmIntegration": false
    }
  }
}
```

UI тревоги и ошибки:

- выбран несовместимый тариф/тип подключения;
- перенос номера требует ручной проверки;
- цены PRO и сервисных услуг `needs_verification`;
- отрицательные или нулевые количества;
- CRM-интеграция требует консультации.

### 3. Видеонаблюдение -> расчет камер и архива

Главная микро-конверсия: пользователь выбрал количество камер, срок архива, модель/монтаж и нажал `Рассчитать видеонаблюдение`.

Поля формы:

- базовые: `companyName`, `contactPerson`, `phone`, `email`, `city`, `address`, `serviceInterest=cctv`, `urgency`, `consent`;
- квалификация: `venueType`, `indoorOutdoor`, `installNeed`, `annualPayment`;
- конфигурация: `camerasCount`, `archiveDays`, `cameraModels`, `onlineOnly`, `poeNeed`, `mobileAccess`, `storageLocation`;
- свободное поле: `message`.

MQL:

- `camerasCount >= 1`;
- выбран архив или online-only сценарий;
- есть телефон и компания.

SQL:

- `camerasCount >= 3` или нужен монтаж/оборудование;
- есть адрес объекта;
- запуск до 30 дней;
- годовая оплата или сеть объектов.

Analytics events:

- `b2b_service_view` `{ serviceSlug: "cctv" }`;
- `b2b_calculator_start` `{ calculatorType: "cctv" }`;
- `b2b_calculator_change` `{ field: "camerasCount|archiveDays|cameraModels|installNeed", valueBand, hasUnknownPrice }`;
- `b2b_estimate_ready`;
- `b2b_lead_submit`, `b2b_lead_success`, `b2b_lead_failure`.

CRM payload:

```json
{
  "leadType": "b2b",
  "serviceInterest": "cctv",
  "routing": { "pipeline": "b2b", "department": "business_sales" },
  "configuration": {
    "cctv": {
      "camerasCount": 6,
      "archiveDays": 14,
      "cameraModels": ["kubtel-dome-v2", "kubtel-bullet-v2"],
      "installNeed": true,
      "annualPayment": false,
      "mobileAccess": true
    }
  }
}
```

UI тревоги и ошибки:

- ноль камер;
- архив не выбран;
- монтаж не подтвержден в районе;
- цена оборудования/архива не подтверждена;
- stock unknown для камер;
- юридическая заметка о видеонаблюдении и персональных данных.

### 4. VPS/VDI -> подбор ресурсов

Главная микро-конверсия: пользователь выбрал VPS или VDI, ресурсы/рабочие места и нажал `Подобрать ресурсы`.

Поля формы:

- базовые: `companyName`, `contactPerson`, `phone`, `email`, `city`, `serviceInterest=vps|vdi`, `urgency`, `consent`;
- квалификация: `workloadType`, `migrationNeed`, `adminSupportNeed`, `securityNeed`;
- VPS config: `os`, `vCpu`, `ramGb`, `hddGb`, `ssdGb`, `internetPort`, `ddosProtection`, `ipCount`, `backupFrequency`, `backupRetention`;
- VDI config: `seats`, `resourcePreset`, `os`, `includedApps`, `userAccessMethod`, `backupPolicy`;
- свободное поле: `message`.

MQL:

- выбран subtype `vps` или `vdi`;
- указаны ресурсы или количество мест;
- есть телефон и компания.

SQL:

- 1С/CRM/терминальный сервер/телефония или другой критичный workload;
- `seats >= 5`, backup/security need или миграция;
- запуск до 30 дней;
- есть email плюс телефон.

Analytics events:

- `b2b_service_view` `{ serviceSlug: "vps"|"vdi" }`;
- `b2b_calculator_start` `{ calculatorType: "infrastructure" }`;
- `b2b_calculator_change` `{ field: "serviceSubtype|vCpu|ramGb|ssdGb|seats|backupFrequency", valueBand }`;
- `b2b_estimate_ready`;
- `b2b_lead_submit`, `b2b_lead_success`, `b2b_lead_failure`.

CRM payload:

```json
{
  "leadType": "b2b",
  "serviceInterest": "vps",
  "routing": { "pipeline": "b2b", "department": "business_sales" },
  "configuration": {
    "infrastructure": {
      "serviceSubtype": "vps",
      "workloadType": "1c|crm|terminal|telephony|custom",
      "vCpu": 4,
      "ramGb": 8,
      "ssdGb": 120,
      "ipCount": 1,
      "backupFrequency": "daily",
      "ddosProtection": true
    }
  }
}
```

UI тревоги и ошибки:

- ресурсы ниже минимального preset;
- конфликт HDD/SSD;
- backup не выбран для критичного workload;
- лицензии ОС/ПО требуют подтверждения;
- цена неизвестна -> индивидуальный расчет;
- DDoS/backups/SLA требуют коммерческой сверки.

### 5. Colocation -> расчет юнитов, питания, портов, IP

Главная микро-конверсия: пользователь ввел U, питание, порты/IP и нажал `Рассчитать размещение`.

Поля формы:

- базовые: `companyName`, `inn`, `contactPerson`, `phone`, `email`, `city`, `serviceInterest=colocation`, `urgency`, `consent`;
- квалификация: `equipmentType`, `placementDate`, `datacenterPreference`, `operatorProfile`;
- конфигурация: `rackUnits`, `powerWatts`, `ipv4Count`, `ipv6Need`, `internetPort`, `switchPort1G`, `switchPort10G`, `ipmi`, `remoteHands`, `accessNeed`, `crossConnect`;
- свободное поле: `message`.

MQL:

- указаны `rackUnits` и `powerWatts`;
- есть компания и телефон;
- выбран хотя бы один порт/IP/access option.

SQL:

- есть дата размещения или срочность до 30 дней;
- `rackUnits >= 1`, power выше базового порога, 1G/10G порт, IPMI/remote hands или cross-connect;
- операторский/серверный профиль;
- есть ИНН или технический контакт.

Analytics events:

- `b2b_service_view` `{ serviceSlug: "colocation" }`;
- `b2b_calculator_start` `{ calculatorType: "colocation" }`;
- `b2b_calculator_change` `{ field: "rackUnits|powerWatts|internetPort|switchPort10G|remoteHands", valueBand }`;
- `b2b_estimate_ready` or `b2b_individual_required`;
- `b2b_lead_submit`, `b2b_lead_success`, `b2b_lead_failure`.

CRM payload:

```json
{
  "leadType": "b2b",
  "serviceInterest": "colocation",
  "routing": { "pipeline": "datacenter", "department": "business_sales", "priority": "high" },
  "configuration": {
    "colocation": {
      "rackUnits": 2,
      "powerWatts": 600,
      "ipv4Count": 2,
      "ipv6Need": true,
      "internetPort": "1g",
      "switchPort10G": false,
      "ipmi": true,
      "remoteHands": true,
      "crossConnect": false
    }
  }
}
```

UI тревоги и ошибки:

- power/units above threshold -> ручное предложение;
- 10G availability unknown;
- IP count availability unknown;
- access rules consent required;
- дата размещения не указана для срочного лида;
- цена неизвестна -> individual calculation.

### 6. Wi-Fi авторизация -> выбор тарифа

Главная микро-конверсия: пользователь выбрал тариф Базовый/Стандарт/Премиум, тип точки и нажал `Подключить Wi-Fi авторизацию`.

Поля формы:

- базовые: `companyName`, `contactPerson`, `phone`, `email`, `city`, `address`, `serviceInterest=wifi-auth`, `urgency`, `consent`;
- квалификация: `venueType`, `sitesCount`, `guestTraffic`, `legalResponsibilityOwner`;
- конфигурация: `plan`, `authMethods`, `smsNeed`, `voucherSupport`, `brandedPage`, `adBanner`, `redirectNeed`, `trafficControl`, `customerDatabase`;
- свободное поле: `message`.

MQL:

- выбран тариф;
- есть публичная точка или тип площадки;
- есть телефон и компания.

SQL:

- 2+ площадки, нужен SMS/брендинг/redirect/база клиентов;
- запуск до 30 дней;
- юридическая ответственность понятна клиенту;
- есть адрес или список точек.

Analytics events:

- `b2b_service_view` `{ serviceSlug: "wifi-auth" }`;
- `wifi_plan_view` `{ plan }`;
- `wifi_plan_selected` `{ plan, venueType }`;
- `b2b_calculator_change` `{ field: "authMethods|smsNeed|brandedPage|sitesCount", valueBand }`;
- `b2b_lead_submit`, `b2b_lead_success`, `b2b_lead_failure`.

CRM payload:

```json
{
  "leadType": "b2b",
  "serviceInterest": "wifi-auth",
  "routing": { "pipeline": "b2b", "department": "business_sales" },
  "configuration": {
    "wifiAuth": {
      "venueType": "cafe|hotel|clinic|retail|other",
      "plan": "basic|standard|premium",
      "sitesCount": 1,
      "authMethods": ["sms", "call", "voucher"],
      "brandedPage": true,
      "redirectNeed": true,
      "trafficControl": true
    }
  }
}
```

UI тревоги и ошибки:

- legal basis requires review;
- SMS package/limits unknown;
- не выбран тип точки;
- public Wi-Fi personal data notice required;
- plan price unknown;
- несколько точек требуют отдельного расчета.

### 7. Операторам связи -> партнерская заявка

Главная микро-конверсия: пользователь указал тип партнерства, capacity/ports/ASN и нажал `Обсудить партнерство`.

Поля формы:

- базовые: `companyName`, `inn`, `contactPerson`, `phone`, `email`, `city`, `serviceInterest=operators`, `consent`;
- квалификация: `partnerType`, `asn`, `nocContact`, `desiredLocation`, `launchDate`;
- конфигурация: `coverageGoal`, `requiredCapacity`, `portSpeed`, `trafficProfile`, `crossConnect`, `peeringInterest`, `transitInterest`, `colocationNeed`, `ndaNeed`;
- свободное поле: `message`.

MQL:

- есть компания, контакт, тип партнерства;
- указан capacity/port/coverage goal или colocation interest.

SQL:

- есть ASN или NOC contact;
- указан port speed/capacity/cross-connect/peering/transit;
- есть дата запуска или конкретная площадка;
- запрос требует партнерского менеджера или технической пресейл-сессии.

Analytics events:

- `b2b_segment_view` `{ segment: "operators" }`;
- `operators_page_view` `{ sourcePath }`;
- `partner_request_start` `{ partnerType }`;
- `port_speed_selected` `{ portSpeed }`;
- `b2b_lead_submit`, `b2b_lead_success`, `b2b_lead_failure`.

CRM payload:

```json
{
  "leadType": "b2b",
  "serviceInterest": "operators",
  "routing": { "pipeline": "operators", "department": "partner_sales", "priority": "high" },
  "configuration": {
    "operatorPartner": {
      "partnerType": "operator|content|integrator|other",
      "asn": "AS12345",
      "requiredCapacity": "1g|10g|custom",
      "portSpeed": "1g",
      "trafficProfile": "peering|transit|mixed|unknown",
      "crossConnect": true,
      "peeringInterest": true,
      "colocationNeed": true,
      "nocContact": "string"
    }
  }
}
```

UI тревоги и ошибки:

- ASN желательно запросить, но не блокировать форму;
- NDA/manual review required;
- capacity availability unknown;
- нет NOC/технического контакта;
- 10G/cross-connect требует ручного подтверждения;
- операторский pipeline не должен смешиваться с обычной B2B-заявкой.

## Lead scoring rules

Базовая scoring-модель:

| Rule                                                                                  | Points |
| ------------------------------------------------------------------------------------- | -----: |
| `leadType=b2b`                                                                        |    +20 |
| `companyName` заполнен                                                                |    +10 |
| телефон валиден                                                                       |    +10 |
| email заполнен вместе с телефоном                                                     |    +10 |
| выбран `serviceInterest`                                                              |    +10 |
| есть `configurationSummary` или calculator details                                    |    +10 |
| urgency = `asap` или `7_days`                                                         |    +15 |
| urgency = `30_days`                                                                   |    +10 |
| указан address, desiredLocation или datacenterPreference                              |    +10 |
| есть INN, ASN, accountNumber или procurementType                                      |    +15 |
| high-intent service: `colocation`, `operators`, `internet+SLA`, `VPS/VDI migration`   |    +15 |
| employeesOrSites >= 2, camerasCount >= 3, seats >= 5, rackUnits >= 1, portSpeed >= 1G |    +10 |
| есть explicit SLA/security/backup/remoteHands/crossConnect need                       |    +10 |
| consent отсутствует                                                                   |   -100 |
| serviceInterest отсутствует                                                           |    -20 |
| только message без конфигурации                                                       |    -10 |
| spam/rate limit/honeypot signal                                                       |   -100 |

Thresholds:

- `MQL`: score >= 50, consent=true, phone valid, serviceInterest exists.
- `SQL`: score >= 80 or manual sales qualification. Automatic SQL also applies for colocation/operators, explicit SLA, urgent launch, migration, закупка, cross-connect, 10G, 5+ VDI seats, 3+ cameras with installation.
- `needs_enrichment`: score 25-49 or missing company/email/config details.
- `disqualified`: spam/rate-limit/honeypot, invalid phone, no consent, no service after follow-up.

Priority:

- `urgent`: SQL + urgency `asap` or `7_days`.
- `high`: SQL or operators/colocation.
- `normal`: MQL.
- `low`: needs_enrichment.

## Analytics event map

| Event                       | When                                      | Required properties                                                                           |
| --------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| `b2b_nav_click`             | Клик по B2B в top/mobile nav/sticky CTA   | `sourcePath`, `targetPath`, `viewport`, `label`                                               |
| `b2b_segment_view`          | Просмотр сегментной страницы/таба         | `segment`, `sourcePath`, `proofStatus`                                                        |
| `b2b_service_view`          | Просмотр страницы услуги                  | `serviceSlug`, `category`, `sourceStatus`                                                     |
| `b2b_cta_click`             | Клик по любому B2B CTA                    | `ctaId`, `ctaLabel`, `serviceInterest`, `segment`, `sourcePath`                               |
| `b2b_calculator_start`      | Первый ввод в калькулятор                 | `calculatorType`, `serviceSlug`, `sourcePath`                                                 |
| `b2b_calculator_change`     | Значимое изменение конфигурации           | `calculatorType`, `field`, `valueBand`, `hasUnknownPrice`                                     |
| `b2b_estimate_ready`        | Расчет готов или требуется ручной расчет  | `calculatorType`, `monthlyKnown`, `oneTimeKnown`, `unknownItemsCount`, `requiredConsultation` |
| `b2b_individual_required`   | Конфигурация вышла за публичные лимиты    | `calculatorType`, `reason`, `serviceInterest`                                                 |
| `b2b_form_start`            | Первый focus/input в форме                | `formVariant`, `sourcePath`, `serviceInterest`                                                |
| `b2b_form_validation_error` | Клиентская/серверная ошибка поля          | `formVariant`, `field`, `errorCode`                                                           |
| `b2b_lead_submit`           | Submit формы до результата доставки       | `formVariant`, `serviceInterest`, `segment`, `scoreBand`                                      |
| `b2b_lead_success`          | Сервер принял лид                         | `leadId`, `deliveryStatus`, `crmStatus`, `outboxUsed`, `leadScore`, `qualification`           |
| `b2b_lead_failure`          | Сервер не принял лид                      | `errorCode`, `deliveryStatus`, `outboxUsed`, `serviceInterest`                                |
| `b2b_outbox_saved`          | CRM недоступна, заявка сохранена локально | `leadId`, `serviceInterest`, `routingPipeline`                                                |

Client-safe analytics payload must not include:

- full phone;
- email;
- companyName;
- INN;
- exact address;
- free-form message;
- CRM secrets or anti-spam internals.

## CRM payload contract

```json
{
  "schemaVersion": "b2b-lead-v1",
  "leadType": "b2b",
  "leadId": "KBT-B2B-YYYYMMDD-HASH",
  "source": {
    "sourcePath": "/business/internet/",
    "sourceRouteType": "business_service",
    "utm": {},
    "referrer": "optional",
    "analyticsClientId": "optional"
  },
  "contact": {
    "companyName": "required",
    "inn": "optional",
    "contactPerson": "required",
    "phone": "required_normalized",
    "email": "optional",
    "city": "optional",
    "address": "optional"
  },
  "qualification": {
    "businessSegment": "smb|midmarket|it_infrastructure|operators|government|unknown",
    "serviceInterest": "internet|telephony|cctv|wifi-auth|vps|vdi|colocation|datacenter-access|operators|government",
    "urgency": "asap|7_days|30_days|quarter|planning",
    "employeesOrSites": 0,
    "leadScore": 0,
    "qualification": "mql|sql|needs_enrichment|disqualified",
    "priority": "low|normal|high|urgent"
  },
  "configuration": {
    "summary": "human readable summary",
    "monthlyEstimate": {
      "amount": 0,
      "currency": "RUB",
      "status": "confirmed|needs_verification|unknown"
    },
    "oneTimeEstimate": {
      "amount": 0,
      "currency": "RUB",
      "status": "confirmed|needs_verification|unknown"
    },
    "unknownItems": [],
    "requiredConsultation": true,
    "details": {
      "internet": {},
      "telephony": {},
      "cctv": {},
      "infrastructure": {},
      "colocation": {},
      "wifiAuth": {},
      "operatorPartner": {}
    }
  },
  "consent": {
    "accepted": true,
    "textVersion": "2026-05-08",
    "acceptedAt": "ISO-8601"
  },
  "routing": {
    "pipeline": "b2b|operators|datacenter",
    "department": "business_sales|partner_sales|noc",
    "ownerHint": "optional",
    "slaResponseMinutes": 120
  },
  "system": {
    "submittedAt": "ISO-8601",
    "spamSignals": [],
    "outboxFallbackAllowed": true,
    "deliveryStatus": "crm_sent|outbox_saved|failed"
  }
}
```

Server-only fields:

- CRM webhook URL and secret;
- Telegram bot token and sales chat id;
- analytics webhook secret;
- full spam/rate-limit diagnostics;
- internal scoring weights if Kubtel decides to hide them from CMS editors.

## Implementation gaps vs current MVP

Already in code:

- B2B route `/business/request/`;
- separate Astro Action `submitBusinessLead`;
- `leadType=b2b`;
- company, contact, phone, email, segment, service, city, urgency, message, consent;
- CRM/outbox fallback boundary.

Still needed:

- `inn`, `employeesOrSites`, exact `address`, `configurationSummary`, estimates and calculator details;
- scoring function and `qualification` classification;
- routing pipelines `b2b`, `operators`, `datacenter`;
- Telegram B2B configuration summary;
- analytics events before/after calculator and form events;
- UI calculators with unknown-price state and required-consultation state;
- tests for scoring, payload normalization and B2B/B2C separation.

## Acceptance checklist

- [x] Each B2B funnel has a clear micro-conversion.
- [x] Each funnel has explicit form fields.
- [x] MQL and SQL rules are separate and measurable.
- [x] Analytics events are separated from B2C.
- [x] CRM payload uses `leadType=b2b`.
- [x] Routing can split ordinary B2B, operators and datacenter leads.
- [x] UI risks and errors are listed before implementation.
- [x] Current MVP gaps are explicit for the next engineering prompts.
