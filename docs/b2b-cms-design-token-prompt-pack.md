# Kubtel.ru: prompt pack для B2B, CMS и дизайн-токенов

Дата подготовки: 2026-05-08.

Документ задает последовательность промптов для дальнейшей реализации бизнес-направления Kubtel, перехода на Headless CMS и централизации дизайна через дизайн-токены. Промпты выполняются по порядку: каждый следующий шаг опирается на артефакты предыдущего.

## 0. Текущий контекст

В проекте уже есть Astro + TypeScript, content collections, server actions, lead workflow, SEO, launch-control и первая визуальная система. Но есть три стратегических пробела:

- B2B-направление отсутствует как полноценная продуктовая и конверсионная ветка.
- Контент хранится локально, а не в CMS, хотя редактировать его должны не разработчики.
- CSS-переменные уже есть, но нужен отдельный token source of truth и централизованная сборка токенов.

## 1. Что есть на текущем kubtel.ru по бизнесу

Публичный сайт содержит раздел `Бизнесу` с направлениями:

- малый и средний бизнес;
- операторы связи;
- государственный сектор;
- интернет в офис;
- телефония и IP-телефония;
- видеонаблюдение;
- Wi-Fi авторизация публичных точек;
- услуги дата-центра;
- аренда виртуального сервера;
- аренда виртуального рабочего места;
- размещение оборудования;
- заявка на доступ в ЦОД.

Зафиксированные публичные смыслы:

- интернет в офис: корпоративный интернет, гарантированная полоса, резервирование, мониторинг, симметричный канал, персональный документооборот;
- телефония: IP-телефония, многоканальный телефон, виртуальная АТС, тарифы серии PRO, сервисные услуги;
- видеонаблюдение: онлайн-просмотр, архив на 3/7/14/30 дней, камеры Kubtel.Dome v2 и Kubtel.Bullet v2;
- VDS/VPS: экономия на серверном железе, масштабируемость, безопасность в РФ, бесплатное тестирование до 10 дней;
- colocation: две площадки, резервирование питания, ДГУ, физическая охрана, круглосуточная поддержка, связность, SEA-IX;
- Wi-Fi авторизация: соответствие требованиям публичных Wi-Fi-точек, маркетинговые возможности, клиентская база, управление трафиком, личный кабинет;
- операторам связи: инфраструктура, расширение покрытия, управляемость сервисов, партнерство, точка обмена трафиком SEA-IX.

Источники:

- `https://kubtel.ru/legal/`
- `https://kubtel.ru/legal/smallbusiness/inet/`
- `https://kubtel.ru/legal/smallbusiness/tel/`
- `https://kubtel.ru/legal/smallbusiness/cctv/`
- `https://kubtel.ru/legal/smallbusiness/wifi/`
- `https://kubtel.ru/legal/smallbusiness/datac/vserver/`
- `https://kubtel.ru/legal/smallbusiness/datac/colocation`
- `https://kubtel.ru/legal/smallbusiness/datac/admission`
- `https://kubtel.ru/legal/operators/`

## 2. Целевой результат

После реализации направление должно получить:

- отдельный B2B hub `/business/`;
- страницы услуг `/business/internet/`, `/business/telephony/`, `/business/cctv/`, `/business/wifi-auth/`, `/business/vps/`, `/business/vdi/`, `/business/colocation/`, `/business/datacenter-access/`;
- страницы аудиторий `/business/smb/`, `/business/operators/`, `/business/government/`;
- B2B-конфигураторы и калькуляторы;
- B2B lead form с компанией, сегментом, услугой, срочностью, конфигурацией и отдельной маршрутизацией в CRM;
- CMS-модели для услуг, тарифов, опций, страниц, FAQ, кейсов, SLA, форм и дизайн-настроек;
- дизайн-токены как отдельный источник истины;
- генерацию CSS-переменных из токенов;
- документацию для редакторов CMS и дизайнеров.

## Prompt 01: аудит B2B-контента текущего сайта

```txt
Ты - senior B2B strategist и информационный архитектор телеком-продуктов.

Проведи аудит B2B-раздела Kubtel на основе публичных страниц:
- https://kubtel.ru/legal/
- https://kubtel.ru/legal/smallbusiness/inet/
- https://kubtel.ru/legal/smallbusiness/tel/
- https://kubtel.ru/legal/smallbusiness/cctv/
- https://kubtel.ru/legal/smallbusiness/wifi/
- https://kubtel.ru/legal/smallbusiness/datac/vserver/
- https://kubtel.ru/legal/smallbusiness/datac/colocation
- https://kubtel.ru/legal/smallbusiness/datac/admission
- https://kubtel.ru/legal/operators/

Собери таблицу "B2B-инвентаризация истины":
1. услуга;
2. текущий смысл на сайте;
3. конкретная бизнес-польза;
4. доказательные факты;
5. слабые места и неподтвержденные обещания;
6. коммерческие поля, которые нужно запросить у Kubtel;
7. рекомендуемый CTA;
8. приоритет для первой B2B-версии.

Все утверждения помечай статусом:
- confirmed, если есть публичный источник;
- needs_verification, если нужна сверка с Kubtel;
- draft, если это гипотеза.

Артефакты:
- таблица B2B-инвентаризации;
- список недостающих данных;
- список страниц для переноса.
```

Критерий приемки: каждая B2B-услуга имеет бизнес-смысл, факты и список CMS-полей.

## Prompt 02: стратегия B2B-позиционирования

```txt
Ты - стратег B2B-маркетинга для регионального телеком-оператора.

На основе B2B-инвентаризации разработай позиционирование Kubtel для бизнеса Краснодара и Краснодарского края.

Сегменты:
- малый бизнес: офисы, магазины, кафе, клиники, салоны, склады;
- средний бизнес: сети точек, производства, логистика, B2B-сервисы;
- IT и инфраструктура: серверы, 1С, телефония, удаленные рабочие места;
- операторы связи и контент-партнеры;
- государственный сектор.

Для каждого сегмента опиши:
1. боль;
2. триггер покупки;
3. ключевую услугу Kubtel;
4. аргумент доверия;
5. CTA;
6. поля заявки;
7. контент страницы.

Сформулируй umbrella-message для B2B: "Kubtel для бизнеса - ...".

Не используй "надежный партнер" без расшифровки. Надежность раскрывай через резервирование, мониторинг, SLA, персонального менеджера, документооборот, ЦОД, связность и локальную инженерную команду.

Артефакты:
- B2B positioning statement;
- сегментная матрица;
- рекомендации по CTA;
- content gaps.
```

Критерий приемки: B2B становится отдельной воронкой под бизнес-задачи.

## Prompt 03: B2B-информационная архитектура

```txt
Ты - UX architect для сайта телеком-оператора.

Спроектируй информационную архитектуру B2B-раздела Kubtel.

Обязательные маршруты:
- /business/
- /business/smb/
- /business/operators/
- /business/government/
- /business/internet/
- /business/telephony/
- /business/cctv/
- /business/wifi-auth/
- /business/vps/
- /business/vdi/
- /business/colocation/
- /business/datacenter-access/
- /business/request/

Для каждого маршрута опиши:
1. цель страницы;
2. аудиторию;
3. первый экран;
4. основные секции;
5. CTA;
6. данные из CMS;
7. SEO intent;
8. Schema.org;
9. связанные услуги.

Отдельно спроектируй верхнее меню, B2B subnav, mobile navigation, sticky CTA и footer links.

Артефакты:
- карта маршрутов;
- карта связей;
- список компонентов;
- список CMS-зависимостей.
```

Критерий приемки: B2B-раздел реализуется как связная система страниц.

## Prompt 04: B2B-конверсионная воронка

```txt
Ты - growth product lead и CRO-специалист.

Спроектируй B2B-воронку Kubtel.

Воронки:
1. интернет в офис -> расчет скорости и заявка;
2. телефония -> подбор конфигурации;
3. видеонаблюдение -> расчет камер и архива;
4. VPS/VDI -> подбор ресурсов;
5. colocation -> расчет юнитов, питания, портов, IP;
6. Wi-Fi авторизация -> выбор тарифа;
7. операторам связи -> партнерская заявка.

Для каждой воронки опиши:
- главную микро-конверсию;
- поля формы;
- что считать MQL;
- что считать SQL;
- события аналитики;
- payload в CRM;
- тревоги и ошибки, которые нужно закрыть в UI.

Артефакты:
- conversion flow map;
- lead scoring rules;
- analytics event map;
- CRM payload contract.
```

Критерий приемки: B2B-заявки квалифицируются и измеряются отдельно от B2C.

## Prompt 05: CMS selection и ADR

```txt
Ты - senior solution architect.

Нужно выбрать Headless CMS для Kubtel.ru. Контент будут редактировать не разработчики.

Сравни Strapi, Sanity, Storyblok и Directus по критериям:
1. редакторский UX;
2. self-host/cloud;
3. visual preview;
4. dynamic zones/page builder;
5. Astro integration;
6. roles and workflow;
7. миграции схем;
8. работа с русским контентом;
9. vendor lock-in;
10. стоимость владения;
11. хранение theme/design settings.

Дай рекомендацию:
- основной вариант;
- запасной вариант;
- почему он подходит Kubtel;
- риски;
- proof of concept checklist.

Артефакт:
- ADR "Выбор CMS для Kubtel".
```

Стартовая позиция: если важен self-host и контроль данных - Strapi/Directus; если важен лучший visual editing - Storyblok; если нужна гибкая редакторская студия - Sanity. Финальное решение принимать после ограничений Kubtel.

Критерий приемки: CMS закрывает редакторов, разработчиков, безопасность и масштабирование.

## Prompt 06: CMS-модели

```txt
Ты - content model architect.

Спроектируй CMS-модели Kubtel, совместимые с текущими Astro content contracts и будущим B2B-разделом.

Обязательные модели:
- Page;
- NavigationItem;
- SeoMeta;
- MediaAsset;
- ProofPoint;
- ContentSource;
- CommercialReview;
- Tariff;
- TariffOption;
- Service;
- BusinessService;
- BusinessSegment;
- BusinessSolution;
- BusinessOffer;
- BusinessCalculator;
- CalculatorOption;
- HardwareItem;
- SLAFeature;
- CaseStudy;
- FAQItem;
- CoverageArea;
- Promo;
- LeadFormVariant;
- LegalDocument;
- DesignTheme;
- DesignTokenSet.

Для каждой модели опиши:
1. поля;
2. типы данных;
3. обязательность;
4. связи;
5. кто редактирует;
6. workflow статусы;
7. валидацию;
8. как используется в Astro;
9. какие поля нельзя отдавать на клиент.

Workflow:
- draft;
- ready for review;
- commercial approved;
- legal approved;
- published;
- archived.

Артефакты:
- таблица моделей;
- JSON/Zod-псевдосхемы;
- migration map из текущих `src/content/*.json`;
- editorial guide для менеджеров.
```

Критерий приемки: разработчик может реализовать CMS-интеграцию, а редактор понимает, где менять контент.

## Prompt 07: CMS integration layer в Astro

```txt
Ты - senior Astro developer.

Текущий проект использует локальные content collections. Спроектируй CMS integration layer так, чтобы компоненты не знали источник данных.

Требования:
- сохранить текущий contract компонентов;
- добавить `src/lib/cms/`;
- добавить adapters: `localContentAdapter`, `cmsAdapter`;
- нормализовать данные к внутренним TypeScript types;
- сохранить Zod validation;
- предусмотреть preview mode;
- предусмотреть fallback на локальные данные;
- server-only CMS token;
- webhook invalidation/rebuild strategy;
- тесты на нормализацию B2B-сущностей.

Опиши:
1. структуру файлов;
2. interfaces adapter-ов;
3. env-переменные;
4. обработку ошибок;
5. cache;
6. миграцию страниц;
7. тест-план.

Артефакты:
- implementation plan;
- TypeScript interfaces;
- список файлов;
- критерии приемки.
```

Критерий приемки: локальные JSON можно заменить CMS-данными без переписывания компонентов.

## Prompt 08: миграция контента в CMS

```txt
Ты - migration lead.

Подготовь план миграции текущего контента Kubtel в CMS.

Источники:
- текущий публичный kubtel.ru;
- локальные JSON в `src/content`;
- документы проекта в `docs`;
- будущие коммерческие таблицы Kubtel.

Нужно:
1. mapping старых URL к новым URL;
2. определить модели Page, Service, BusinessService, BusinessOffer;
3. сохранить source attribution;
4. поставить статусы confirmed/needs_verification/draft;
5. подготовить redirect map;
6. определить, что нельзя публиковать без коммерческого подтверждения;
7. подготовить порядок ручной редакторской проверки.

Артефакты:
- migration checklist;
- URL redirect table;
- content freeze plan;
- CMS import order;
- QA checklist.
```

Критерий приемки: перенос в CMS не ломает SEO, редакторский процесс и доверие к данным.

## Prompt 09: дизайн-токены как source of truth

```txt
Ты - design systems architect.

Преврати текущие CSS-переменные Kubtel в полноценную систему дизайн-токенов.

Спроектируй структуру:
- `src/design/tokens/primitives.json`;
- `src/design/tokens/semantic.json`;
- `src/design/tokens/components.json`;
- `src/design/tokens/themes/light.json`;
- `src/design/tokens/themes/dark.json`;
- `src/design/tokens/business.json`;
- `scripts/build-tokens.mjs`;
- generated `src/styles/tokens.css`.

Категории:
- color;
- typography;
- spacing;
- radius;
- shadow;
- motion;
- breakpoint;
- z-index;
- layout;
- component;
- state.

Правила:
- primitive tokens не используются напрямую в компонентах;
- компоненты используют semantic/component tokens;
- B2B может иметь свои semantic tokens, но не отдельную визуальную вселенную;
- любые изменения токенов проходят visual smoke;
- CSS пишется через токены, а не raw hex/rem.

Артефакты:
- token taxonomy;
- naming convention;
- пример JSON tokens;
- пример generated CSS;
- migration checklist из `global.css`.
```

Критерий приемки: цвет, радиусы, типографика, отступы и состояния меняются централизованно.

## Prompt 10: токены в CMS и редакторские ограничения

```txt
Ты - design governance lead.

Определи, какие настройки дизайна можно давать редакторам CMS, а какие должны оставаться только в коде.

Раздели токены на уровни:
1. locked tokens - только разработчики/дизайнеры;
2. governed tokens - редактор выбирает из утвержденных вариантов;
3. content styling choices - редактор выбирает layout preset, density, media position, CTA variant.

Примеры governed settings:
- hero variant;
- page accent: default/business/critical;
- section density;
- CTA variant из allowed list;
- service card layout;
- proof/status visibility.

Артефакты:
- DesignTheme CMS model;
- permission matrix;
- editorial guardrails;
- contrast safety rules;
- preview QA checklist.
```

Критерий приемки: редактор управляет страницами, но не может разрушить дизайн-систему.

## Prompt 11: B2B UI-компоненты

```txt
Ты - senior product designer и frontend lead.

Спроектируй UI-компоненты для бизнес-раздела Kubtel:
- BusinessHero;
- BusinessSegmentTabs;
- BusinessServiceGrid;
- BusinessServiceCard;
- BusinessProofStrip;
- BusinessCalculatorShell;
- InternetOfficeCalculator;
- TelephonyConfigurator;
- CctvCalculator;
- VpsConfigurator;
- ColocationCalculator;
- WifiAuthPlanCards;
- B2BLeadForm;
- SLAFeatureList;
- CaseStudyCard;
- OperatorPartnerBlock;
- DatacenterAccessForm;
- BusinessFAQ;
- StickyBusinessCTA.

Для каждого компонента опиши:
1. назначение;
2. props/data contract;
3. CMS fields;
4. states;
5. accessibility;
6. analytics events;
7. token usage;
8. mobile behavior.

Артефакты:
- component inventory;
- props contracts;
- token dependency map;
- implementation order.
```

Критерий приемки: B2B-интерфейс собирается из системных компонентов.

## Prompt 12: B2B-калькуляторы

```txt
Ты - senior product engineer.

Спроектируй расчетные модели для B2B-услуг Kubtel.

Калькуляторы:
- интернет в офис: скорость, статические IP, детализация, аренда порта, настройка роутера;
- телефония: тип подключения, тариф, порты, номера, внешние линии, автооператор;
- видеонаблюдение: количество камер, архив, камеры Kubtel.Dome/Bullet, годовая скидка;
- VPS: OS, CPU, RAM, HDD/SSD, DDoS-protected internet, IP, backups;
- VDI: количество рабочих мест, CPU/RAM/storage preset;
- colocation: U, питание, IPv4/IPv6, порты, IPMI/ILO/iDRAC, первичное размещение;
- Wi-Fi authorization: Базовый/Стандарт/Премиум.

Требования:
- расчет отделен от UI;
- все цены приходят из CMS;
- если цена не подтверждена, UI показывает "индивидуальный расчет";
- расчет возвращает monthly, oneTime, unknownItems, requiredConsultation;
- все выбранные опции передаются в CRM.

Артефакты:
- TypeScript types;
- pure calculation functions;
- test matrix;
- error states;
- CRM payload extension.
```

Критерий приемки: B2B-цены и конфигурации меняются в CMS, расчет остается тестируемым.

## Prompt 13: B2B forms, CRM routing и аналитика

```txt
Ты - CRM integration architect.

Расширь текущую заявку Kubtel под B2B.

Новые поля:
- leadType: b2c | b2b;
- companyName;
- inn optional;
- contactPerson;
- phone;
- email;
- city;
- businessSegment;
- serviceInterest;
- urgency;
- employeesOrSites optional;
- configurationSummary;
- monthlyEstimate;
- oneTimeEstimate;
- message;
- consent.

Нужно:
- расширить Zod-схему;
- добавить B2B-specific validation;
- маршрутизировать B2B в отдельный CRM pipeline;
- в Telegram отправлять резюме конфигурации;
- аналитика различает B2B и B2C;
- антиспам и rate limit;
- outbox fallback;
- тесты.

Артефакты:
- schema changes;
- action changes;
- CRM payload;
- Telegram template;
- analytics event map;
- tests checklist.
```

Критерий приемки: B2B-заявки не теряются и не смешиваются с домашними подключениями.

## Prompt 14: B2B-копирайтинг

```txt
Ты - B2B copy lead в духе Ogilvy и McCann Truth Well Told.

Перепиши B2B-контент Kubtel без клише, на основе подтверждаемых фактов.

Для каждой услуги создай:
1. headline;
2. subheadline;
3. 3-5 proof points;
4. кому подходит;
5. что получите;
6. как подключаем;
7. FAQ;
8. CTA labels;
9. sales objection answers.

Услуги:
- интернет в офис;
- телефония;
- видеонаблюдение;
- Wi-Fi авторизация;
- VPS;
- VDI;
- colocation;
- доступ в ЦОД;
- операторам связи;
- государственному сектору.

Запрещено:
- "лучший";
- "надежный" без объяснения;
- "индивидуальный подход" без процесса;
- "высокое качество" без признаков.

Каждое утверждение помечай proof status.

Артефакты:
- тексты страниц;
- FAQ;
- objections matrix;
- microcopy для форм.
```

Критерий приемки: B2B-контент продает через бизнес-результат, доказательства и снижение риска.

## Prompt 15: B2B SEO

```txt
Ты - SEO strategist для B2B-телекома в Краснодарском крае.

Собери SEO-структуру B2B-раздела Kubtel.

Нужно:
- keyword clusters;
- title/description;
- H1/H2 structure;
- FAQ Schema;
- Service/LocalBusiness schema;
- internal linking;
- redirects со старых URL;
- приоритеты индексации;
- content gaps.

Ключевые направления:
- интернет для офиса Краснодар;
- корпоративный интернет Краснодар;
- IP телефония Краснодар;
- виртуальная АТС Краснодар;
- видеонаблюдение для бизнеса Краснодар;
- Wi-Fi авторизация для кафе/отеля;
- аренда VPS Краснодар;
- colocation Краснодар;
- размещение сервера Краснодар;
- дата-центр Краснодар;
- доступ в ЦОД;
- оператор связи партнерство Краснодар.

Артефакты:
- SEO map;
- metadata table;
- schema plan;
- redirect map.
```

Критерий приемки: B2B-раздел получает поисковую структуру, а не только брендовый трафик.

## Prompt 16: реализация B2B MVP

```txt
Ты - senior fullstack developer в текущем проекте Kubtel.

Реализуй B2B MVP строго по утвержденным артефактам.

Scope:
- добавить business content models;
- добавить страницы `/business/**`;
- добавить B2B hub;
- добавить service pages;
- добавить B2B lead form;
- добавить минимум один расчетный калькулятор;
- добавить CRM payload `leadType=b2b`;
- добавить SEO metadata;
- использовать design tokens;
- не ломать B2C routes.

Требования:
- компоненты получают данные через props;
- данные приходят через content/cms adapter;
- все новые CSS-значения берутся из tokens;
- формы доступны с клавиатуры;
- мобильный сценарий первый;
- тесты на расчет и schema обязательны.

Перед финалом выполнить:
- npm run format:check;
- npm run check;
- npm test;
- npm run build;
- npm run test:ux, если окружение позволяет.

Артефакты:
- список измененных файлов;
- результаты проверок;
- обновление docs/project-state.md;
- обновление docs/implementation-log.md.
```

Критерий приемки: B2B MVP работает как отдельная конверсионная ветка.

## Prompt 17: CMS MVP implementation

```txt
Ты - CMS implementation engineer.

Реализуй выбранную CMS в проекте Kubtel.

Scope:
- поднять CMS локально или подключить cloud workspace;
- создать модели;
- добавить роли: admin, developer, content editor, commercial reviewer, legal reviewer;
- настроить preview;
- добавить seed content для B2C и B2B;
- подключить Astro к CMS через adapter;
- сохранить fallback на local content;
- добавить env example;
- добавить документацию запуска и редактирования.

Важно:
- не отдавать CMS token на клиент;
- не давать редактору raw HTML без необходимости;
- добавить workflow статусов;
- добавить webhooks/rebuild notes;
- добавить backup/export procedure.

Артефакты:
- CMS schema;
- integration code;
- editor guide;
- developer guide;
- adapter tests.
```

Критерий приемки: редактор может изменить тариф/услугу/FAQ/страницу в CMS без участия разработчика.

## Prompt 18: design tokens implementation

```txt
Ты - frontend infrastructure engineer по design systems.

Реализуй централизованную систему дизайн-токенов.

Scope:
- создать `src/design/tokens/**`;
- создать build script генерации CSS;
- вынести текущие CSS variables из `global.css` в generated `tokens.css`;
- подключить `tokens.css`;
- заменить raw значения в CSS на semantic/component tokens, где это разумно;
- добавить `npm run tokens:build` и `npm run tokens:check`;
- добавить проверку, запрещающую неразрешенные raw hex в компонентных стилях;
- обновить `docs/visual-system.md`.

Требования:
- не менять визуальный результат без необходимости;
- обеспечить backward compatibility токенов;
- добавить theme-ready структуру;
- зафиксировать, какие токены могут управляться CMS.

Артефакты:
- token files;
- generated CSS;
- scripts;
- docs;
- check results.
```

Критерий приемки: дизайн меняется через token source of truth, а не ручным поиском по CSS.

## Prompt 19: редакторская документация

```txt
Ты - technical writer для команды Kubtel.

Напиши документацию для неинженерной команды, которая будет работать с CMS.

Разделы:
- как изменить тариф;
- как изменить услугу;
- как добавить B2B-страницу;
- как добавить FAQ;
- как добавить акцию;
- как обновить цену;
- как поставить статус "нужно подтверждение";
- как отправить контент на коммерческое согласование;
- как проверить preview;
- что нельзя менять без разработчика;
- как работают дизайн-варианты;
- как работает публикация;
- что делать, если заявка не пришла в CRM.

Стиль: простой, пошаговый, без инженерного жаргона.

Артефакт:
- `docs/editor-guide.md`.
```

Критерий приемки: менеджер контента может безопасно вести сайт без доступа к коду.

## Prompt 20: финальный B2B/CMS/design QA

```txt
Ты - QA lead.

Проведи финальную проверку B2B, CMS и design tokens.

Проверить:
- все B2B routes;
- mobile/desktop;
- формы;
- CRM payload;
- Telegram message;
- outbox fallback;
- калькуляторы;
- SEO metadata;
- schema.org;
- redirect map;
- CMS preview;
- CMS publish workflow;
- design token build;
- отсутствие raw design drift;
- Lighthouse;
- accessibility;
- визуальные регрессии.

Отдельно проверь:
- может ли редактор изменить контент без кода;
- может ли редактор сломать дизайн;
- все ли неподтвержденные цены помечены как needs_verification/draft;
- не смешиваются ли B2B и B2C заявки.

Артефакты:
- QA report;
- blocker list;
- launch readiness update;
- project-state update.
```

Критерий приемки: сайт готов к production launch как управляемая CMS-платформа с сильной B2B-воронкой.

## Рекомендуемый порядок выполнения

1. Prompt 01-04: B2B-стратегия, IA и воронка.
2. Prompt 05-08: CMS-решение, модели, интеграция и миграция.
3. Prompt 09-12: дизайн-токены, UI-компоненты и калькуляторы.
4. Prompt 13-16: B2B forms, copy, SEO и B2B MVP.
5. Prompt 17-18: CMS MVP и token implementation.
6. Prompt 19-20: редакторская документация и финальный QA.

## Что запросить у Kubtel перед реализацией

- актуальные B2B-прайсы;
- SLA и регламенты поддержки для бизнеса;
- матрицу услуг и коммерческих опций;
- условия НДС/без НДС;
- правила расчетов по VPS, colocation, телефонии и видеонаблюдению;
- ответственных менеджеров по B2B;
- CRM pipeline для бизнес-заявок;
- юридические тексты согласий и договоров;
- требования к self-host/cloud CMS;
- брендовые материалы;
- список разрешенных дизайн-настроек для редакторов.

## Definition of Done

B2B/CMS/design-token направление считается реализованным, когда:

- B2B-раздел покрывает ключевые услуги и аудитории с отдельной воронкой;
- все B2B-данные управляются через CMS или CMS adapter;
- редактор может менять контент без разработчика;
- B2B-заявки идут отдельным типом в CRM/outbox/analytics;
- калькуляторы берут цены из CMS;
- дизайн-токены вынесены из `global.css` в source of truth;
- CSS использует semantic/component tokens;
- токены проверяются скриптами;
- документация для редакторов и разработчиков обновлена;
- `project-state.md` и `implementation-log.md` отражают фактический статус.
