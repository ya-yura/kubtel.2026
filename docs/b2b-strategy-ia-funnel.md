# Kubtel.ru: B2B-аудит, позиционирование, IA и воронка

Дата: 2026-05-08.

Документ закрывает Prompt 01-04 из `docs/b2b-cms-design-token-prompt-pack.md` и является входом для следующего шага: CMS selection, CMS-модели, Astro CMS adapter и B2B MVP.

## Источники и статусы

Публичные источники:

- `https://kubtel.ru/legal/`
- `https://kubtel.ru/legal/smallbusiness/inet/`
- `https://kubtel.ru/legal/smallbusiness/tel/`
- `https://kubtel.ru/legal/smallbusiness/cctv/`
- `https://kubtel.ru/legal/smallbusiness/wifi/`
- `https://kubtel.ru/legal/smallbusiness/datac/vserver/`
- `https://kubtel.ru/legal/smallbusiness/datac/vdi`
- `https://kubtel.ru/legal/smallbusiness/datac/colocation`
- `https://kubtel.ru/legal/smallbusiness/datac/admission`
- `https://kubtel.ru/legal/operators/`
- `https://kubtel.ru/legal/govsector`

Статусы утверждений:

- `confirmed` - факт найден на публичном сайте Kubtel.
- `needs_verification` - смысл логично следует из услуги, но требует сверки с Kubtel, коммерцией, юристами или эксплуатацией.
- `draft` - продуктовая гипотеза для новой B2B-версии.

## Prompt 01: B2B-инвентаризация истины

| Услуга | Текущий смысл на сайте | Конкретная бизнес-польза | Доказательные факты | Слабые места | Коммерческие поля для CMS/Kubtel | CTA | Приоритет |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Интернет в офис | `confirmed`: корпоративный интернет с гарантированной полосой, выделенной линией, симметричным каналом, резервированием, мониторингом и менеджером по документообороту. | `confirmed`: стабильная работа офиса, равные входящая/исходящая скорости, сопровождение документов. `needs_verification`: SLA, сроки подключения, резервный канал как опция. | `confirmed`: публичная страница говорит о резервировании каналов, круглосуточном мониторинге, симметричном канале и персональном менеджере по документообороту. | Нет видимой матрицы скоростей/цен, нет SLA в цифрах, нет покрытия для B2B-адресов, слово "надежность" нужно раскрывать фактами. | speeds, bandwidthGuarantee, symmetry, backupChannelOptions, staticIp, routerSetup, connectionFee, monthlyPrice, SLA, supportHours, coverageAreas, legalEntityBilling, documentManager, proofPoints. | "Рассчитать интернет для офиса" | P0 |
| Телефония / IP-телефония | `confirmed`: IP-телефония, аналоговое/цифровое подключение, аренда линии, многоканальный телефон, виртуальная АТС, тарифы серии PRO, номера и автооператор. | `confirmed`: снижение стоимости связи и настройка телефонной схемы под офис. `needs_verification`: сценарии для продаж, колл-центра, записи разговоров и интеграции с CRM. | `confirmed`: на сайте есть тип подключения, тарифы, порты, номера ТФОП, внешние линии, категории номеров, автооператор и сервисные услуги. | Много технического текста про VoIP, мало бизнес-сценариев; не видно SLA телефонии, географии номеров, условий переноса номера, CRM-интеграций. | connectionType, tariffPlan, ports, phoneNumbers, externalLines, numberCategory, virtualPbxFeatures, autoAttendant, perMinuteRates, setupFee, monthlyPrice, serviceFees, numberPorting, CRMIntegration, SLA. | "Подобрать телефонию" | P0 |
| Видеонаблюдение | `confirmed`: Kubtel Watcher как облачное видеонаблюдение с онлайн-доступом, архивом, веб/мобильным доступом и камерами Dome/Bullet v2. | `confirmed`: не нужен локальный регистратор/сервер, меньше обслуживания, доступ к архиву из любой точки. `needs_verification`: монтаж, гарантия, хранение персональных данных, ответственность за камеры. | `confirmed`: доступны архивы 3/7/14/30 дней, онлайн-просмотр, годовая скидка 10%, камеры FullHD 1920x1080, ИК 20-30 м, PoE, цена камеры 6500 руб. | Не хватает схемы "камера + архив + монтаж", не подтверждены цены облачного архива, нет условий обслуживания и замены оборудования. | camerasCount, archiveDays, onlineOnly, cameraModels, hardwarePrice, installPrice, annualDiscount, warranty, maintenance, bandwidthImpact, storageLocation, mobileApps, publicOfferUrl. | "Рассчитать камеры и архив" | P0 |
| Wi-Fi авторизация | `confirmed`: публичный Wi-Fi с идентификацией пользователей, брендированной страницей, SMS/звонком/ваучером, рекламными баннерами, базой клиентов и управлением трафиком. | `confirmed`: снижение риска штрафов, легальная авторизация публичного Wi-Fi, маркетинговый канал для кафе/отеля/клиники. | `confirmed`: сайт ссылается на требование идентификации публичных Wi-Fi-точек, описывает тарифы Базовый/Стандарт/Премиум и личный кабинет. | Нужно юридически подтвердить актуальность постановления/требований, условия SMS-пакетов, хранение и выгрузку базы, ответственность клиента. | plan, authMethods, smsPackage, voucherSupport, brandedPage, adBanner, redirectRules, trafficControl, customerDatabase, multilingual, legalBasis, monthlyPrice, setupFee. | "Выбрать тариф Wi-Fi авторизации" | P1 |
| VPS/VDS | `confirmed`: аренда виртуального сервера для 1С, CRM, терминального сервера и телефонии; экономия на железе, масштабирование, данные в РФ, бесплатный тест до 10 дней. | `confirmed`: меньше капитальных затрат, быстрый запуск серверных сервисов. `needs_verification`: SLA, backup policy, DDoS-профиль, производительность. | `confirmed`: конфигуратор включает OS, CPU, RAM, HDD/SSD, DDoS-protected internet, IP-адреса, backups frequency/retention. | Нет прозрачной цены в HTML, не названы гипервизор, SLA, лимиты ресурсов, RPO/RTO, ответственность за администрирование. | OS, vCPU, RAM, HDD, SSD, internetPort, ddosProtection, ipCount, backupFrequency, backupRetention, testPeriod, virtualizationPlatform, SLA, adminSupport, monthlyPrice, setupFee. | "Собрать VPS" | P1 |
| VDI / виртуальное рабочее место | `confirmed`: облачное рабочее место с выбранной ОС и бизнес-приложениями, удаленный доступ с любого устройства, резервное копирование, экономия на оборудовании и лицензиях. | `confirmed`: быстрое расширение штата, меньше локального администрирования, работа вне офиса. `needs_verification`: состав ПО, лицензии, безопасность доступа. | `confirmed`: публичная страница указывает preset 2 ядра, 4 ГБ ОЗУ, 50 ГБ HDD и готовность рабочего места к использованию. | Нужно подтвердить лицензии ОС/ПО, политику backup, MFA/VPN, поддержку пользователей, ответственность за данные. | seats, resourcePreset, OS, includedApps, userAccessMethod, backupPolicy, securityOptions, licenseModel, monthlySeatPrice, setupFee, supportHours, adminScope. | "Рассчитать рабочие места" | P1 |
| Colocation / размещение оборудования | `confirmed`: размещение серверов на двух площадках, резервирование питания, ИБП, ДГУ, охрана, видеонаблюдение, СКУД, 24/7 поддержка, связность и SEA-IX. | `confirmed`: перенос серверного риска из офиса в контролируемую инфраструктуру, связность с операторами и IX. | `confirmed`: два ввода питания, ИБП на 20 минут, ДГУ 19 часов, 24/7 поддержка, операторы RETN/Мегафон/Ростелеком/FIORD/Билайн/KRD-IX/SEA-IX, 51 присоединенный оператор SEA-IX. | Нет SLA по электропитанию/температуре/доступу, нет сертификаций, нет процедур допуска и удаленных рук как тарифа. | rackUnits, powerWatts, ipv4Count, ipv6Count, internetPort, switchPort1G, switchPort10G, ipmiPort, setupPlacement, remoteHands, SLA, accessRules, dcLocation, monthlyPrice, oneTimePrice. | "Рассчитать размещение" | P0 |
| Доступ в ЦОД | `confirmed`: форма допуска в ЦОД с ФИО, лицевым счетом, телефоном/кодом, выбором площадки, датой, временем, длительностью и планируемыми работами. | `confirmed`: управляемый регламент визита и плановых работ. `needs_verification`: роль заявителя, согласования, emergency flow. | `confirmed`: заявка на плановые работы подается не менее чем за 24 часа; для аварийной ситуации нужно связаться с менеджером или техподдержкой. | Текущая форма выглядит как операционный сервис для существующих клиентов, а не sales-страница; нужна авторизация/проверка прав. | accountNumber, visitorFullName, phoneVerification, dcLocation, visitDateTime, duration, plannedWorks, emergencyContact, approvalStatus, consentText, accessPolicy. | "Подать заявку на доступ" | P1 |
| Операторам связи | `confirmed`: использование инфраструктуры Kubtel для расширения покрытия, управляемости сервисов, размещения мощностей и партнерства; SEA-IX на площадках. | `confirmed`: доступ к региональной инфраструктуре, точке обмена трафиком и партнерским сценариям. `needs_verification`: условия peering/transit, cross-connects, capacity. | `confirmed`: публично названы крупные контент-агрегаторы и операторы, а также SEA-IX с 51 оператором. | Нет партнерской оферты, технических портов, SLA, NOC-контактов, процедур подключения и NDA. | partnerType, coverageGoal, requiredCapacity, portSpeed, crossConnect, peeringInterest, transitInterest, ASN, trafficProfile, NOCContacts, SLA, legalDocs. | "Обсудить партнерство" | P0 |
| Государственный сектор | `confirmed`: комплексные телеком-решения, безопасные каналы связи, хранение данных и стабильная IT-инфраструктура для госучреждений. | `confirmed`: помощь в целевых показателях и эффективности учреждений. `needs_verification`: закупочные процедуры, лицензии, compliance, требования к защите информации. | `confirmed`: публичная страница заявляет безопасные каналы связи, хранение данных и IT-инфраструктуру. | Слишком общий текст, нет фактов по лицензиям, сертификациям, SLA, 44-ФЗ/223-ФЗ, защите данных. | institutionType, procurementType, serviceSet, secureChannel, dataStorage, SLA, licenses, certificates, complianceDocs, contactRole, legalReviewStatus. | "Запросить решение для учреждения" | P1 |

### Недостающие данные

- Актуальные B2B-прайсы по всем услугам: ежемесячные платежи, разовые платежи, НДС, скидки, пороги индивидуального расчета.
- Матрица B2B-опций: скорость, SLA, резервирование, статические IP, настройка оборудования, удаленные руки, DDoS, backups, SMS-пакеты, монтаж.
- SLA и регламенты поддержки: время реакции, время восстановления, часы поддержки, NOC/аварийный контакт, эскалация.
- Подтвержденные технические факты по ЦОД: площадки, электропитание, охлаждение, физическая охрана, доступ, сертификации, связность, remote hands.
- География B2B-покрытия: города, районы, БЦ, промзоны, частные территории, доступность оптики и сроки строительства.
- CRM pipeline для B2B: ответственные менеджеры, статусы, маршрутизация, SLA обработки лида, Telegram/почта/CRM fallback.
- Юридические тексты: согласие, политика, договоры, оферты, публичные Wi-Fi требования, порядок доступа в ЦОД.
- Контентные владельцы и workflow: кто подтверждает цены, факты, legal copy, SLA, кейсы и proof points.
- Медиа: фотографии ЦОД/узлов/команды, схемы услуг, презентации, подтвержденные логотипы партнеров, разрешение на публикацию.

### Страницы для переноса

| Старый URL | Новый URL | Что переносить | Статус | Приоритет |
| --- | --- | --- | --- | --- |
| `/legal/` | `/business/` | B2B hub, список услуг, базовые калькуляторы, общая заявка | `confirmed` source, новая структура `draft` | P0 |
| `/legal/smallbusiness/inet/` | `/business/internet/` | Интернет в офис, преимущества, proof points, калькулятор скорости | `confirmed` + коммерция `needs_verification` | P0 |
| `/legal/smallbusiness/tel/` | `/business/telephony/` | IP-телефония, PRO-тарифы, номера, автооператор, сервисные услуги | `confirmed` + коммерция `needs_verification` | P0 |
| `/legal/smallbusiness/cctv/` | `/business/cctv/` | Kubtel Watcher, архивы, камеры Dome/Bullet, годовая скидка | `confirmed` + коммерция `needs_verification` | P0 |
| `/legal/smallbusiness/wifi/` | `/business/wifi-auth/` | тарифы Wi-Fi авторизации, auth methods, marketing options | `confirmed` + legal `needs_verification` | P1 |
| `/legal/smallbusiness/datac/vserver/` | `/business/vps/` | VPS/VDS, сценарии 1С/CRM/терминала/телефонии, конфигуратор | `confirmed` + коммерция `needs_verification` | P1 |
| `/legal/smallbusiness/datac/vdi` | `/business/vdi/` | виртуальные рабочие места, preset, удаленный доступ | `confirmed` + лицензии `needs_verification` | P1 |
| `/legal/smallbusiness/datac/colocation` | `/business/colocation/` | colocation, две площадки, питание, охрана, связность, калькулятор | `confirmed` + SLA `needs_verification` | P0 |
| `/legal/smallbusiness/datac/admission` | `/business/datacenter-access/` | форма доступа в ЦОД и регламент 24 часа | `confirmed` + auth flow `needs_verification` | P1 |
| `/legal/operators/` | `/business/operators/` | операторское партнерство, SEA-IX, инфраструктура, заявка | `confirmed` + оферта `needs_verification` | P0 |
| `/legal/govsector` | `/business/government/` | госсектор, безопасные каналы, хранение данных, IT-инфраструктура | `confirmed` + compliance `needs_verification` | P1 |

## Prompt 02: стратегия B2B-позиционирования

### B2B positioning statement

Kubtel для бизнеса - локальная телеком- и инфраструктурная команда Краснодарского края: подключает офисы, точки продаж, учреждения, операторов и серверные сервисы к интернету, телефонии, видеонаблюдению, Wi-Fi авторизации и ЦОД, раскрывая надежность через резервирование каналов, мониторинг, поддержку 24/7, персональный документооборот, собственные площадки и региональную связность.

Status: `draft`, опирается на `confirmed` публичные факты и требует коммерческого утверждения формулировки.

### Сегментная матрица

| Сегмент | Боль | Триггер покупки | Ключевая услуга | Аргумент доверия | CTA | Поля заявки | Контент страницы |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Малый бизнес: офисы, магазины, кафе, клиники, салоны, склады | `confirmed/draft`: связь и Wi-Fi ломают продажи, кассы, записи, камеры и клиентский опыт. | Открытие точки, переезд, плохой интернет, запуск камер или публичного Wi-Fi. | Интернет в офис, телефония, видеонаблюдение, Wi-Fi авторизация. | `confirmed`: симметричный канал, мониторинг, персональный документооборот; для Wi-Fi есть авторизация и маркетинговые функции. | "Подобрать связь для точки" | companyName, contactPerson, phone, city, address, segment, services, urgency, sitesCount, desiredDate, message. | Пакеты по типам точек, чеклист запуска, калькулятор интернет+Wi-Fi+камеры, FAQ по документам и срокам. |
| Средний бизнес: сети точек, производства, логистика, B2B-сервисы | `draft`: нужно масштабировать связь по адресам, держать телефонию/камеры и быстро открывать новые площадки. | Новая точка, объединение офисов, рост штата, аварии, переход на централизованную поддержку. | Корпоративный интернет, телефония, видеонаблюдение, VPS/VDI. | `confirmed`: мониторинг, резервирование, 24/7 поддержка по ЦОД/colocation; `needs_verification`: SLA по каналам. | "Обсудить сеть площадок" | companyName, inn, contactPerson, phone, email, sitesCount, cities, currentProvider, SLARequired, serviceSet. | Сценарии "сеть точек", "производство", "логистика"; SLA/резервирование; карта внедрения; кейсы. |
| IT и инфраструктура: серверы, 1С, телефония, удаленные рабочие места | `confirmed`: дорого покупать и обслуживать серверы; нужно размещать 1С/CRM/терминал/телефонию и давать удаленный доступ. | Закупка сервера, миграция 1С, рост штата, отказ старого железа, удаленная работа. | VPS, VDI, colocation, интернет с DDoS-protected option. | `confirmed`: данные в РФ, тест VPS до 10 дней, две площадки, питание/ДГУ/охрана/связность. | "Собрать инфраструктуру" | companyName, contactPerson, phone, email, workloadType, users, CPU/RAM/storage, backupNeed, uptimeRequirement. | Конфигуратор ресурсов, comparison VPS vs colocation vs VDI, backup/SLA, migration plan, security FAQ. |
| Операторы связи и контент-партнеры | `confirmed`: нужно расширять покрытие, размещать мощности, получать региональную связность и управляемость сервисов. | Выход в регион, рост трафика, need for IX/peering/cross-connect, размещение оборудования. | Операторское партнерство, colocation, SEA-IX, cross-connects. | `confirmed`: на площадках SEA-IX, названы контент-агрегаторы/операторы, связность с несколькими операторами. | "Запросить партнерские условия" | companyName, ASN, contactPerson, phone, email, partnerType, capacity, ports, trafficProfile, desiredLocation. | Техническая страница: NOC, ports, SLA, IX, cross-connect, access rules, NDA request. |
| Государственный сектор | `confirmed`: нужны безопасные каналы, хранение данных и стабильная IT-инфраструктура для учреждений. | Закупка, модернизация сети, переход на централизованную инфраструктуру, требования по безопасности. | Интернет, защищенные каналы, VPS/colocation, видеонаблюдение. | `needs_verification`: лицензии, сертификаты, регламенты и опыт госзаказов; `confirmed`: публично заявлены безопасные каналы и хранение данных. | "Запросить консультацию для учреждения" | institutionName, procurementType, contactPerson, role, phone, email, serviceSet, deadline, complianceNeeds. | Страница с procurement-friendly структурой: услуги, документы, лицензии, SLA, процесс согласования, FAQ. |

### Рекомендации по CTA

- Hub `/business/`: primary "Рассчитать решение", secondary "Выбрать услугу".
- Сервисные страницы: CTA должен отражать следующий шаг, а не общий "Заказать": "Рассчитать скорость", "Подобрать телефонию", "Рассчитать камеры", "Собрать VPS", "Рассчитать размещение".
- Сегментные страницы: "Подобрать связь для точки", "Обсудить сеть площадок", "Собрать инфраструктуру", "Запросить партнерские условия".
- Sticky CTA: на B2B всегда ведет в `/business/request/`, но передает `serviceInterest`, `segment`, `sourcePath` и текущую конфигурацию.
- Для неподтвержденных цен: CTA "Получить индивидуальный расчет", а не "Купить".

### Content gaps

- Нет B2B umbrella-message и отдельной воронки: сейчас раздел похож на каталог услуг и конфигураторов.
- Нет сегментных страниц SMB, operators, government с задачами, сценариями и заявками.
- Нет кейсов, SLA-карточек, proof points, схем внедрения и "как подключаем".
- Нет CMS-ready структуры: факты, коммерция, legal, proof status и CTA смешаны.
- Нет SEO-кластеров под B2B-запросы Краснодара.
- Нет отдельной аналитики и квалификации B2B-заявок.

## Prompt 03: B2B-информационная архитектура

### Карта маршрутов

| Route | Цель | Аудитория | Первый экран | Основные секции | CTA | CMS data | SEO intent | Schema.org | Связанные услуги |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/business/` | B2B hub и распределитель по сегментам/услугам. | Все бизнес-аудитории. | Umbrella-message, 3-4 quick routes, быстрый выбор задачи. | Сегменты, услуги, proof strip, калькуляторы, FAQ, заявка. | "Рассчитать решение" | Page, BusinessSegment, BusinessService, ProofPoint, FAQ, LeadFormVariant, NavigationItem, SeoMeta. | интернет и телеком-услуги для бизнеса Краснодар. | WebPage, Service, ItemList, BreadcrumbList, FAQPage. | Все B2B. |
| `/business/smb/` | Показать пакетные сценарии для малых точек и офисов. | Офисы, магазины, кафе, клиники, салоны, склады. | Выбор типа точки и service bundle. | Пакеты, сценарии запуска, калькулятор, документы, FAQ. | "Подобрать связь для точки" | BusinessSegment, BusinessOffer, BusinessService, FAQ, ProofPoint. | интернет для офиса/кафе/магазина Краснодар. | WebPage, Service, FAQPage. | internet, telephony, cctv, wifi-auth. |
| `/business/operators/` | Собрать партнерскую заявку с техническими параметрами. | Операторы, контент-партнеры, IX/peering teams. | SEA-IX/инфраструктура, партнерский CTA. | Связность, площадки, ports/cross-connects, NOC, заявка. | "Запросить партнерские условия" | BusinessSegment, SLAFeature, ProofPoint, LeadFormVariant. | операторам связи партнерство Краснодар, SEA-IX Краснодар. | WebPage, Organization, Service. | colocation, datacenter-access. |
| `/business/government/` | Дать procurement-friendly вход для учреждений. | Госучреждения, компании с госучастием. | Безопасные каналы, хранение данных, IT-инфраструктура. | Услуги, документы, compliance, SLA, процесс, заявка. | "Запросить решение для учреждения" | BusinessSegment, LegalDocument, SLAFeature, ProofPoint, FAQ. | телеком услуги для госучреждений Краснодар. | WebPage, Service, FAQPage. | internet, vps, colocation, cctv. |
| `/business/internet/` | Продать корпоративный интернет через скорость, SLA и резервирование. | SMB, средний бизнес, учреждения. | Калькулятор скорости и адреса. | Benefits, proof, options, SLA, FAQ, request. | "Рассчитать интернет" | BusinessService, Tariff, TariffOption, BusinessCalculator, CoverageArea, FAQ. | интернет в офис Краснодар, корпоративный интернет Краснодар. | Service, OfferCatalog, FAQPage. | telephony, wifi-auth, cctv. |
| `/business/telephony/` | Подобрать телефонию и номера под офис. | Офисы, продажи, службы поддержки. | Конфигуратор подключения, портов, номеров. | Сценарии, тарифы, номера, автооператор, FAQ. | "Подобрать телефонию" | BusinessService, Tariff, TariffOption, CalculatorOption, FAQ. | IP телефония Краснодар, виртуальная АТС Краснодар. | Service, OfferCatalog, FAQPage. | internet, vps. |
| `/business/cctv/` | Рассчитать камеры, архив и оборудование. | Магазины, склады, офисы, клиники. | Калькулятор камер и архива. | Benefits, archive plans, cameras, app, legal offer, FAQ. | "Рассчитать видеонаблюдение" | BusinessService, HardwareItem, BusinessCalculator, FAQ, LegalDocument. | видеонаблюдение для бизнеса Краснодар. | Service, Product, OfferCatalog, FAQPage. | internet. |
| `/business/wifi-auth/` | Выбрать тариф публичной Wi-Fi авторизации. | Кафе, отели, клиники, салоны, торговые точки. | Plan cards Базовый/Стандарт/Премиум. | Compliance, marketing, traffic control, tariff compare, FAQ. | "Выбрать тариф" | BusinessService, Tariff, TariffOption, LegalDocument, FAQ. | Wi-Fi авторизация для кафе/отеля Краснодар. | Service, OfferCatalog, FAQPage. | internet. |
| `/business/vps/` | Собрать VPS/VDS по ресурсам и задачам. | IT, 1С, CRM, телефония, терминальные сервисы. | Resource configurator. | Use cases, resources, DDoS, backups, test period, FAQ. | "Собрать VPS" | BusinessService, BusinessCalculator, CalculatorOption, SLAFeature, FAQ. | VPS Краснодар, аренда виртуального сервера Краснодар. | Service, OfferCatalog, FAQPage. | vdi, colocation. |
| `/business/vdi/` | Рассчитать виртуальные рабочие места. | Компании с удаленными рабочими местами и ростом штата. | Количество рабочих мест и preset. | Benefits, access, backups, apps/licenses, FAQ. | "Рассчитать рабочие места" | BusinessService, BusinessCalculator, CalculatorOption, FAQ. | аренда виртуального рабочего места Краснодар. | Service, OfferCatalog, FAQPage. | vps, internet. |
| `/business/colocation/` | Рассчитать размещение оборудования. | IT-команды, владельцы серверов, операторы. | Colocation calculator: U, W, ports, IP. | Power/security/connectivity, SLA, access, remote hands, FAQ. | "Рассчитать размещение" | BusinessService, BusinessCalculator, CalculatorOption, SLAFeature, ProofPoint, FAQ. | colocation Краснодар, размещение сервера Краснодар, дата-центр Краснодар. | Service, OfferCatalog, Place, FAQPage. | datacenter-access, operators. |
| `/business/datacenter-access/` | Операционная заявка на доступ в ЦОД. | Клиенты colocation и ответственные за работы. | Форма доступа с выбором площадки и времени. | Rules, emergency notice, form, FAQ. | "Подать заявку на доступ" | LeadFormVariant, LegalDocument, CoverageArea/DatacenterLocation, FAQ. | доступ в ЦОД Kubtel. | WebPage, ContactPoint. | colocation. |
| `/business/request/` | Единая B2B-заявка и прием payload из калькуляторов. | Все B2B-лиды. | Контекстная форма с выбранной услугой/сегментом. | Contact fields, service config summary, consent, fallback note. | "Отправить заявку" | LeadFormVariant, BusinessService, BusinessSegment, LegalDocument. | заявка на услуги связи для бизнеса Краснодар. | ContactPage, WebPage. | Все B2B. |

### Верхнее меню и навигация

Top navigation:

- `Тарифы` - B2C тарифы.
- `Подключение` - B2C заявка.
- `Бизнесу` - B2B hub с desktop dropdown/mega menu.
- `Поддержка`.
- `О компании`.
- `Контакты`.

B2B mega menu:

- Колонка "По задаче": офис/точка, сеть площадок, серверы и 1С, операторское партнерство, госсектор.
- Колонка "Услуги": интернет, телефония, видеонаблюдение, Wi-Fi авторизация, VPS, VDI, colocation, доступ в ЦОД.
- Колонка "Действие": рассчитать решение, отправить заявку, позвонить.

B2B subnav:

- Обзор.
- Сегменты.
- Услуги.
- Калькуляторы.
- SLA/FAQ.
- Заявка.

Mobile navigation:

- Первый уровень: "Для дома" и "Для бизнеса".
- Внутри "Для бизнеса": сегменты, услуги, "Рассчитать решение".
- Sticky bottom CTA: "B2B-заявка" с передачей текущего route context.

Footer links:

- Бизнесу: `/business/`, `/business/internet/`, `/business/telephony/`, `/business/cctv/`, `/business/wifi-auth/`, `/business/vps/`, `/business/colocation/`, `/business/operators/`, `/business/request/`.
- Операционные: `/business/datacenter-access/`, контакты, документы, политика персональных данных.

### Карта связей

- `/business/` связывает сегменты с услугами и ведет в `/business/request/`.
- `/business/smb/` связывает internet + telephony + cctv + wifi-auth.
- `/business/operators/` связывает colocation + datacenter-access + partner request.
- `/business/government/` связывает internet + vps + colocation + cctv + legal/compliance.
- Все service pages ведут в `/business/request/` с `serviceInterest`.
- Все calculators передают `configurationSummary`, `monthlyEstimate`, `oneTimeEstimate`, `unknownItems`.
- Старые `/legal/**` должны получить redirect на новые `/business/**`.

### Список компонентов

- `BusinessHero`
- `BusinessSegmentTabs`
- `BusinessServiceGrid`
- `BusinessServiceCard`
- `BusinessProofStrip`
- `BusinessCalculatorShell`
- `InternetOfficeCalculator`
- `TelephonyConfigurator`
- `CctvCalculator`
- `VpsConfigurator`
- `VdiConfigurator`
- `ColocationCalculator`
- `WifiAuthPlanCards`
- `B2BLeadForm`
- `SLAFeatureList`
- `CaseStudyCard`
- `OperatorPartnerBlock`
- `DatacenterAccessForm`
- `BusinessFAQ`
- `StickyBusinessCTA`
- `SourceStatusBadge`

### CMS-зависимости для IA

- Page: route, pageType, hero, sections, relatedServices, status, seo.
- BusinessService: slug, category, benefit, proofPoints, calculators, tariffs/options, relatedSegments.
- BusinessSegment: pains, triggers, serviceBundles, CTA, formVariant.
- BusinessCalculator: calculatorType, options, pricingStatus, formulaVersion, disclaimers.
- LeadFormVariant: fields, requiredFields, routingKey, consentText, CRM pipeline.
- ProofPoint: label, value, source, status, reviewer.
- Tariff/TariffOption/CalculatorOption: price, unit, constraints, source status.
- SLAFeature: metric, value, scope, status.
- FAQItem: question, answer, relatedRoutes, proof status.
- LegalDocument: consent, offer, policy, access rules.
- NavigationItem/SeoMeta/DesignTheme: page wiring, SEO and governed design choices.

## Prompt 04: B2B-конверсионная воронка

### Conversion flow map

| Воронка | Главная микро-конверсия | Поля формы | MQL | SQL | Analytics events | CRM payload | UI тревоги и ошибки |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Интернет в офис -> расчет скорости и заявка | Пользователь указал адрес/тип объекта, скорость или задачу и нажал "Рассчитать". | companyName, contactPerson, phone, email, city, address, businessSegment, employeesOrSites, speedNeed, backupChannel, staticIp, urgency, message. | Есть компания, телефон, адрес, интерес к интернету, срок до 30 дней. | Подтвержден B2B-адрес, есть нужная скорость/SLA/срок, лид отвечает или оставил email+phone. | b2b_service_view, calculator_start, speed_selected, backup_toggle, estimate_ready, lead_submit. | leadType=b2b, serviceInterest=internet, configuration.internet. | Адрес вне покрытия, неподтвержденная цена, required SLA unavailable, empty consent, duplicate submit, rate limit. |
| Телефония -> подбор конфигурации | Пользователь выбрал тип подключения, порты/номера/линии. | companyName, contactPerson, phone, email, connectionType, tariffPlan, ports, phoneNumbers, externalLines, numberCategory, autoAttendant, urgency. | Есть тип подключения и контакты; ports/lines > 0. | Указаны номера/линии, срок, нужен перенос/виртуальная АТС, подтвержден контакт ЛПР/ИТ. | telephony_config_start, telephony_connection_type, telephony_numbers_change, estimate_ready, lead_submit. | serviceInterest=telephony, configuration.telephony. | Некорректные количества, несовместимый тариф, перенос номера требует ручной проверки, цены PRO needs_verification. |
| Видеонаблюдение -> расчет камер и архива | Пользователь выбрал камеры и срок архива. | companyName, contactPerson, phone, email, address, camerasCount, archiveDays, cameraModels, installNeed, annualPayment, urgency. | camerasCount >= 1 и контактные данные. | Есть адрес, монтаж/оборудование, срок запуска, 3+ камеры или годовая оплата. | cctv_calc_start, cameras_change, archive_selected, hardware_selected, estimate_ready, lead_submit. | serviceInterest=cctv, configuration.cctv. | Ноль камер, archiveDays пустой, монтаж не подтвержден в районе, camera stock unknown, legal video notice. |
| VPS/VDI -> подбор ресурсов | Пользователь выбрал тип сервиса и ресурсы/рабочие места. | companyName, contactPerson, phone, email, workloadType, serviceSubtype, vCPU, RAM, HDD, SSD, OS, internetPort, ipCount, backupFrequency, seats, urgency. | Есть workload и ресурсы либо seats. | Есть миграционный срок, backup/security need, 1С/CRM/телефония или 5+ VDI seats. | infra_calc_start, service_subtype_selected, resources_change, backup_selected, estimate_ready, lead_submit. | serviceInterest=vps|vdi, configuration.infrastructure. | Конфликт HDD/SSD, resources below minimum, backup not selected, price unknown, license verification needed. |
| Colocation -> расчет U, питания, портов, IP | Пользователь ввел U, W, ports/IP и получил расчет/индивидуальный запрос. | companyName, contactPerson, phone, email, rackUnits, powerWatts, ipv4Count, ipv6Count, internetPort, switchPorts, ipmi, remoteHands, accessNeed, urgency. | Есть U/W и контакты. | Есть оборудование, дата размещения, power > threshold, 1G/10G port, операторский/серверный профиль. | colocation_calc_start, units_change, power_change, port_selected, individual_required, lead_submit. | serviceInterest=colocation, configuration.colocation. | Превышение power/units требует ручного предложения, 10G availability unknown, access rules consent, price unknown. |
| Wi-Fi авторизация -> выбор тарифа | Пользователь выбрал Базовый/Стандарт/Премиум и тип точки. | companyName, contactPerson, phone, email, venueType, plan, authMethods, smsNeed, brandedPage, redirectNeed, sitesCount, urgency. | Выбран plan и контакт. | Есть публичная точка, срок запуска, 2+ sites или нужен SMS/брендинг/redirect. | wifi_plan_view, wifi_plan_selected, auth_method_selected, lead_submit. | serviceInterest=wifi-auth, configuration.wifiAuth. | Legal basis needs update, SMS package exceeded, no venue type, personal data warning, plan price unknown. |
| Операторам связи -> партнерская заявка | Пользователь указал тип партнерства, capacity/ports/ASN. | companyName, inn, ASN, contactPerson, phone, email, partnerType, capacity, portSpeed, trafficProfile, crossConnect, peeringInterest, desiredLocation, message. | Есть компания, партнерский тип и контакт. | Есть ASN/capacity/ports, NOC contact, запрос на cross-connect/peering/размещение. | operators_page_view, partner_request_start, port_speed_selected, lead_submit. | serviceInterest=operators, configuration.operatorPartner. | Missing ASN for operator flow, NDA/manual review required, capacity unavailable, no NOC contact. |

### Lead scoring rules

Базовая модель для первого B2B MVP:

- `+20`: leadType=b2b.
- `+10`: указан companyName.
- `+10`: указан email вместе с телефоном.
- `+10`: выбран serviceInterest.
- `+10`: есть configurationSummary из калькулятора.
- `+10`: urgency = "до 7 дней" или "до 30 дней".
- `+10`: указан address или desiredLocation.
- `+15`: есть company INN, ASN, accountNumber или procurementType.
- `+15`: high-intent услуга: colocation, operators, internet with SLA, VPS/VDI migration.
- `+10`: employeesOrSites >= 2, camerasCount >= 3, seats >= 5, rackUnits >= 1, portSpeed >= 1G.
- `-20`: нет согласия.
- `-15`: неподтвержденный телефон/email.
- `-10`: только message без услуги/сегмента.

Thresholds:

- MQL: score >= 50, consent=true, phone valid, serviceInterest exists.
- SQL: score >= 80 или ручная квалификация менеджером; также SQL, если есть explicit request на срок, SLA, colocation, operator partnership, закупку или миграцию.
- Disqualified/needs enrichment: score < 50, нет компании, нет услуги, неверный телефон, spam/rate-limit.

### Analytics event map

| Event | When | Required properties |
| --- | --- | --- |
| `b2b_nav_click` | Клик по B2B в top/mobile nav. | sourcePath, targetPath, viewport, label. |
| `b2b_segment_view` | Просмотр сегментной страницы/таба. | segment, sourcePath, proofStatus. |
| `b2b_service_view` | Просмотр страницы услуги. | serviceSlug, category, sourceStatus. |
| `b2b_cta_click` | Любой B2B CTA. | ctaId, ctaLabel, serviceInterest, segment, sourcePath. |
| `b2b_calculator_start` | Первый ввод в калькулятор. | calculatorType, serviceSlug. |
| `b2b_calculator_change` | Значимое изменение конфигурации. | calculatorType, field, valueBand, hasUnknownPrice. |
| `b2b_estimate_ready` | Расчет готов или требует ручного расчета. | calculatorType, monthlyKnown, oneTimeKnown, unknownItemsCount, requiredConsultation. |
| `b2b_form_start` | Фокус/первый ввод в B2B форме. | formVariant, sourcePath, serviceInterest. |
| `b2b_form_validation_error` | Ошибка валидации. | formVariant, field, errorCode. |
| `b2b_lead_submit` | Отправка формы. | formVariant, serviceInterest, segment, scoreBand. |
| `b2b_lead_success` | Сервер принял лид. | leadId, deliveryStatus, crmStatus, outboxUsed, leadScore, qualification. |
| `b2b_lead_failure` | Ошибка отправки. | errorCode, deliveryStatus, outboxUsed. |

### CRM payload contract

```json
{
  "leadType": "b2b",
  "source": {
    "sourcePath": "/business/internet/",
    "sourceRouteType": "business_service",
    "utm": {},
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
    "businessSegment": "smb | midmarket | it-infrastructure | operators | government | unknown",
    "serviceInterest": "internet | telephony | cctv | wifi-auth | vps | vdi | colocation | datacenter-access | operators | government",
    "urgency": "asap | 7_days | 30_days | quarter | planning",
    "employeesOrSites": 0,
    "leadScore": 0,
    "qualification": "mql | sql | needs_enrichment"
  },
  "configuration": {
    "summary": "human readable summary",
    "monthlyEstimate": {
      "amount": 0,
      "currency": "RUB",
      "status": "confirmed | needs_verification | unknown"
    },
    "oneTimeEstimate": {
      "amount": 0,
      "currency": "RUB",
      "status": "confirmed | needs_verification | unknown"
    },
    "unknownItems": [],
    "requiredConsultation": true,
    "details": {}
  },
  "consent": {
    "accepted": true,
    "textVersion": "2026-05-08",
    "acceptedAt": "ISO-8601"
  },
  "routing": {
    "pipeline": "b2b",
    "department": "business_sales",
    "priority": "normal | high | urgent",
    "ownerHint": "optional"
  },
  "system": {
    "schemaVersion": "b2b-lead-v1",
    "submittedAt": "ISO-8601",
    "spamSignals": [],
    "outboxFallbackAllowed": true
  }
}
```

Fields not sent to client:

- CRM webhook URL, Telegram bot token, analytics webhook secret.
- Internal lead score formula weights if the business decides to hide scoring.
- Reviewer comments, legal/commercial private notes, unpublished prices.
- Raw anti-spam signals beyond user-safe error messages.

## CMS/code implications for next step

1. CMS selection must support structured content, workflow statuses, preview and repeatable nested options for calculators.
2. The first CMS models should cover `BusinessService`, `BusinessSegment`, `BusinessCalculator`, `CalculatorOption`, `LeadFormVariant`, `ProofPoint`, `SLAFeature`, `FAQItem`, `LegalDocument`, `SeoMeta` and `NavigationItem`.
3. Astro implementation should add B2B routes behind a source-agnostic content layer so local JSON can be replaced by CMS adapter.
4. B2B lead schema should extend the current lead flow with `leadType=b2b`, `companyName`, segment/service fields, configuration summary and routing to the B2B CRM pipeline.
5. All commercial values from this document remain `needs_verification` unless Kubtel provides a current price/SLA table.
