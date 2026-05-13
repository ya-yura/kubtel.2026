# Kubtel.ru: состояние реализации

Документ является рабочей памятью проекта. После завершения каждого этапа здесь фиксируется статус, результат, проверки, принятые решения и следующий шаг. Реализованное можно менять при необходимости, но изменения должны учитывать уже зафиксированный контекст.

## Текущий статус

- Дата старта системной реализации: 2026-05-06.
- Рабочая директория: `O:\Dev\kubtel-best-redesign`.
- Базовое ТЗ: `docs/kubtel-project-tz.md`.
- Git remote: `https://github.com/ya-yura/kubtel.2026.git`.
- Локальный dev URL: `http://127.0.0.1:4321/`.
- Текущий этап: Этап 10 - B2B, CMS и дизайн-токены.
- Общий статус: technical launch-control completed, B2B strategy/IA/funnel completed, CMS adapter layer implemented, CMS migration plan completed, design token architecture completed.

## Принципы ведения

1. Каждый этап закрывается только после отметки результата и чекапа.
2. Если ранее реализованное меняется, причина фиксируется в журнале.
3. Контент, дизайн и логика ведутся как отдельные слои, но проверяются вместе.
4. Временные заглушки допустимы, если они явно отмечены.
5. Следующий этап начинается от зафиксированного состояния, а не с повторной ревизии всего проекта.

## Этапы

| Этап | Название                                  | Статус                                  | Результат                                                                                                                                                                                       |
| ---- | ----------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | Подготовка и инвентаризация               | completed                               | Создан проектный контур, Astro-каркас, локальный контентный слой и первичная структура данных                                                                                                   |
| 1    | Контентная модель и смысловая переработка | completed                               | Контентная модель ужесточена, черновые коммерческие данные отделены от подтверждаемых фактов                                                                                                    |
| 2    | UX-прототип                               | completed                               | Собран структурный UX-прототип воронки, тарифного сравнения, формы заявки, sticky CTA и состояний адресной проверки                                                                             |
| 3    | Визуальная система                        | completed                               | Введена первая версия визуальной системы: токены, типографика, сетка, состояния, микро-взаимодействия и документация                                                                            |
| 4    | Технический фундамент                     | completed                               | Формализован технический каркас: site/routes config, content helpers, SEO endpoints, TypeScript/Zod-ограничения и проверки                                                                      |
| 5    | Разработка интерфейса                     | completed                               | Собран frontend первой версии: услуги, адаптивная навигация, sticky CTA, CSS-анимации и связные страницы                                                                                        |
| 6    | Бизнес-логика и интеграции                | completed                               | Подключены Astro Actions, серверная Zod-валидация, заявочный workflow, адресная проверка, CRM/Telegram/analytics adapters, антиспам и outbox                                                    |
| 7    | SEO, производительность и доступность     | completed                               | Усилены метаданные, Schema.org, sitemap/robots, клавиатурная доступность и Lighthouse mobile проверки                                                                                           |
| 8    | Предрелизное тестирование                 | completed                               | Предрелизный QA-контур добавлен, критичные технические дефекты исправлены, внешние launch-блокеры явно зафиксированы                                                                            |
| 9    | Запуск и пострелизный контроль            | technical completed, production blocked | Реализованы health endpoint, launch-readiness audit, postrelease checklist, BAT-запуск и документация доступа; production DNS/SSL/CRM/Telegram/analytics/контент требуют внешнего подтверждения |
| 10   | B2B, CMS и дизайн-токены                  | in progress                             | Подготовлен prompt pack; выполнены Prompts 01-09: B2B-аудит, позиционирование, IA, воронка, CMS ADR, CMS-модели, Astro CMS adapter layer, CMS migration plan и token architecture               |

## Выполненные результаты

- Создано базовое ТЗ и дорожная карта реализации.
- Создана рабочая память проекта: статус, журнал реализации и журнал решений.
- Создан Astro + TypeScript каркас сайта.
- Настроены локальные content collections: тарифы, услуги, FAQ, зоны покрытия, промо.
- Созданы базовые страницы: главная, тарифы, подключение, поддержка, о компании, контакты.
- Реализованы базовые компоненты: header, footer, hero, тарифная сетка, карточка тарифа, форма проверки адреса, FAQ, HumanKind-сценарии.
- Вынесен расчет стоимости тарифа в отдельный модуль `src/lib/pricing.ts`.
- Выполнена проверка `npm run build`: 0 ошибок, 0 предупреждений.
- Запущен локальный Astro dev-сервер на `127.0.0.1:4321`, HTTP-проверка вернула 200 OK.
- Инициализирован отдельный git-репозиторий проекта и выполнен первый push в `https://github.com/ya-yura/kubtel.2026.git`.
- Этап 1 завершен на уровне модели: добавлены `contentSource`, `commercialReview`, статусы достоверности для FAQ и промо, документирована CMS-модель.
- Текущие тарифы, акции, coverage и часть FAQ явно помечены как `draft` или `needs_verification`.
- Этап 2 завершен как структурный UX-прототип: добавлены сценарий воронки, сравнение тарифов, расширенная форма проверки адреса, карта состояний и mobile sticky CTA.
- UX-карта этапа 2 зафиксирована в `docs/ux-prototype.md`.
- Этап 3 завершен как первая визуальная система: обновлены дизайн-токены, responsive-типографика без viewport-зависимого масштабирования, CTA/hover/focus/checked/invalid-состояния, контактные карточки и документ `docs/visual-system.md`.
- QA этапа 3 зафиксирован в `docs/visual-qa.md`: 6 страниц проверены на mobile/desktop, без console errors, горизонтального overflow и мелких критичных targets.
- Этап 4 завершен как технический фундамент: добавлены `src/config/site.ts`, `src/config/routes.ts`, `src/lib/content.ts`, SEO endpoints `robots.txt` и `sitemap.xml`, Prettier/format-скрипты и документ `docs/technical-foundation.md`.
- Страницы переведены с прямых `getCollection`-выборок на общий content-access слой.
- Базовый layout теперь управляет canonical, robots, Open Graph, Twitter summary и theme-color.
- Этап 5 завершен как frontend первой версии: главная получила карточки услуг из content layer, шапка получила адаптивное mobile-menu, а интерфейсные состояния и CSS-анимации зафиксированы в `docs/interface-implementation.md`.
- Этап 6 завершен как серверный контур заявки: добавлены Astro Actions, Node adapter, Zod-валидация, проверка тарифа/опций, локальная address coverage logic, CRM/Telegram adapters, серверная аналитика, honeypot/rate limit и локальный outbox.
- Страницы `/` и `/connect/` переведены в on-demand rendering, остальные ключевые страницы продолжают prerender-сборку.
- Контракт бизнес-логики и интеграций описан в `docs/business-logic-integrations.md`.
- Этап 7 завершен как SEO/performance/accessibility-контур: добавлены route metadata, Schema.org helper-ы, JSON-LD, sitemap `lastmod`, robots restrictions, skip-link, live/focus states формы и `content-visibility` для отложенных секций.
- Контракт SEO, производительности и доступности описан в `docs/seo-performance-accessibility.md`.
- Этап 8 завершен как предрелизный QA-контур: добавлен `src/lib/prelaunch/audit.ts`, отдельный `npm run test:prelaunch`, contract tests страниц с формой и документ `docs/pre-release-testing.md`.
- В рамках этапа 8 исправлены дефекты формы: `/tariffs/` переведен в on-demand rendering и теперь показывает результат `submitLead`, а опции заявки отключаются при выборе тарифа, где они недоступны.
- Этап 9 технически реализован как launch-control: добавлены `/api/health.json`, `src/lib/launch/readiness.ts`, `npm run launch:check`, `start-kubtel-site.bat`, документация доступа и пострелизный checklist.
- Добавлен повторяемый Chrome UX smoke `scripts/ux-smoke.mjs` / `npm run test:ux`: маршруты, responsive, CTA и отправка заявки проверяются фактически.
- Production dependency advisory закрыт обновлением до `astro@^6.3.0`, `@astrojs/node@^10.1.0` и чистым `npm audit --omit=dev`.
- Выявлен стратегический пробел: текущая реализация не покрывает полноценный B2B-раздел, хотя публичный kubtel.ru содержит отдельные услуги для бизнеса.
- Подготовлен последовательный prompt pack `docs/b2b-cms-design-token-prompt-pack.md` для B2B, CMS и дизайн-токенов.
- Выполнены Prompt 01-04 и зафиксированы в `docs/b2b-strategy-ia-funnel.md`: B2B-инвентаризация истины, недостающие данные, страницы для переноса, positioning statement, сегментная матрица, карта маршрутов `/business/**`, B2B-компоненты, conversion flow map, lead scoring, analytics events и CRM payload contract.
- B2B-конверсионная воронка Prompt 04 дополнительно вынесена в `docs/b2b-conversion-funnel.md`: по каждой воронке зафиксированы микро-конверсия, поля формы, MQL/SQL, analytics events, CRM payload, UI тревоги и implementation gaps текущего MVP.
- Выполнен Prompt 05 и зафиксирован в `docs/cms-selection-adr.md`: основным CMS POC выбран Strapi 5 self-hosted + PostgreSQL, запасным вариантом оставлен Directus self-hosted + PostgreSQL.
- Выполнен Prompt 06 и зафиксирован в `docs/cms-content-models.md`: описаны CMS-модели, Strapi mapping, внутренние Zod-псевдосхемы, migration map из текущего `src/content/**`, import order и editorial guide.
- Выполнен Prompt 07 и зафиксирован в `docs/cms-integration-layer.md`: добавлен `src/lib/cms/` с source-independent adapter interface, local content adapter, Strapi adapter, Zod validation, normalizers, cache/preview/fallback strategy и тестами.
- После замечания пользователя о невидимости результата добавлен первый видимый B2B-раздел в коде: `/business/`, сервисные и сегментные страницы, `/business/request/`, навигация, sitemap metadata, mobile sticky CTA и серверная B2B-заявка с outbox fallback.
- Выполнен Prompt 08 и зафиксирован в `docs/cms-migration-plan.md`: подготовлены CMS migration checklist, URL redirect table для `/legal/** -> /business/**`, content freeze plan, CMS import order, список данных без права публикации и ручной QA для редакторов.
- Выполнен Prompt 09 и зафиксирован в `docs/design-tokens-source-of-truth.md`: подготовлены token taxonomy, naming convention, target file structure, JSON token examples, generated CSS example, build script contract, CMS/editor governance, visual smoke rules и migration checklist из `global.css`.

## Активные допущения

- Пока нет подтвержденной выгрузки тарифов, зон покрытия, CRM и биллинга Kubtel.
- Первая техническая версия строится на локальных структурированных данных, чтобы позже заменить источник на Headless CMS без переписывания UI.
- В отсутствие production-доступов интеграции реализованы через изолированные адаптеры и переменные окружения; если CRM/Telegram не настроены, заявка сохраняется в серверный outbox.

## Открытые вопросы

- Нужна актуальная таблица тарифов, услуг, цен и акций.
- Нужна карта районов, улиц, ЖК и частного сектора, где возможно подключение.
- Нужно предоставить production CRM webhook или выбрать временный webhook для заявок.
- Нужно предоставить Telegram bot token и sales chat id для боевого чата отдела продаж.
- Нужно определить production-хранилище или регламент обработки outbox-заявок.
- Нужно определить источник адресной нормализации: внутренняя база, Dadata или ручная проверка.

## Следующий шаг

Перейти к Prompt 10 из `docs/b2b-cms-design-token-prompt-pack.md`: определить, какие design settings доступны редакторам CMS, какие токены locked/governed/content-level, permission matrix, editorial guardrails, contrast safety rules и preview QA checklist. Production launch-входы из этапа 9 остаются актуальными и не отменяются.

## Чекап этапа 0

- [x] Базовое ТЗ создано.
- [x] Проектная память заведена.
- [x] Журнал решений создан.
- [x] Технический стек выбран и зафиксирован.
- [x] Astro + TypeScript каркас создан.
- [x] Локальный контентный слой создан.
- [x] Базовые страницы созданы.
- [x] Сборка проходит без ошибок.
- [x] Локальный dev-сервер отвечает на `http://127.0.0.1:4321/`.
- [ ] Актуальные тарифы Kubtel подтверждены.
- [ ] Зоны покрытия подтверждены.
- [ ] CRM/биллинг/Telegram-интеграции подтверждены.

Незакрытые пункты этапа 0 остаются как входные данные для этапов 1 и 6, но не блокируют техническое движение вперед.

## Чекап этапа 1

- [x] "Инвентаризация истины" обновлена в `docs/content-inventory.md`.
- [x] Контентная модель описана в `docs/content-model.md`.
- [x] У каждой локальной content collection есть источник достоверности `contentSource`.
- [x] Коммерческие поля тарифов отделены в `commercialReview`.
- [x] FAQ и промо получили явный `proof` со статусом.
- [x] Черновые тарифы и акции не маркируются как подтвержденные.
- [x] Сборка `npm run build` проходит без ошибок.
- [ ] Актуальные коммерческие данные Kubtel подтверждены.
- [ ] Адресная база покрытия подтверждена.
- [ ] SLA, контакты и юридические тексты подтверждены.

Незакрытые пункты этапа 1 являются внешними бизнес-входами. Технически модель готова принять подтвержденные данные без изменения UI-контракта.

## Чекап этапа 2

- [x] Мобильный сценарий подключения спроектирован вокруг адресной проверки.
- [x] Структура главной ведет от hero к воронке, тарифам, адресу и FAQ.
- [x] Тарифная сетка дополнена таблицей сравнения.
- [x] Проверка адреса оформлена как форма с адресом, тарифом, опциями и контактом.
- [x] Карта состояний форм и ошибок описана в `docs/ux-prototype.md`.
- [x] Sticky CTA определен: шапка на desktop, нижняя панель на mobile.
- [x] Заявка доступна за 4 основных действия.
- [x] Пользователь видит месячную цену до отправки заявки.
- [x] Сборка `npm run build` проходит без ошибок.
- [ ] Реальная адресная база и CRM-обработка подключены.
- [ ] Финальные SLA, контакты и юридический текст подтверждены.

Незакрытые пункты этапа 2 относятся к этапам бизнес-логики, интеграций и юридического согласования. Они не блокируют переход к визуальной системе.

## Чекап этапа 3

- [x] Визуальный DNA зафиксирован в `docs/visual-system.md`.
- [x] Палитра, типографика, сетка и состояния оформлены через CSS-токены.
- [x] CTA заметны и имеют hover, active и focus-visible состояния.
- [x] Тарифные карточки получили единый визуальный ритм, featured-состояние и компактные proof/status-блоки.
- [x] Формы получили крупные поля, checked/invalid состояния и понятную юридическую заметку.
- [x] FAQ, таблица сравнения, support pathways, address states и contact cards приведены к единой системе.
- [x] Типографика не масштабируется через viewport width.
- [x] Учтен `prefers-reduced-motion`.
- [x] Проведен bundled Playwright QA на 6 страницах в mobile и desktop viewport.
- [x] Горизонтальный overflow и console errors не обнаружены.
- [x] Контраст ключевых цветовых пар зафиксирован в `docs/visual-qa.md`.
- [x] Сборка `npm run build` проходит без ошибок.
- [ ] Финальные брендовые материалы Kubtel подтверждены.
- [ ] Финальные фото, иконки или медиа-активы Kubtel получены.

Незакрытые пункты этапа 3 относятся к бренд-активам и реальным материалам компании. Технический визуальный слой готов принимать финальные изображения, логотипы и подтвержденные контакты без пересборки UX.

## Чекап этапа 4

- [x] Astro + TypeScript каркас закреплен как static output с `trailingSlash: "always"`.
- [x] Структура каталогов формализована в `docs/technical-foundation.md`.
- [x] Site config, маршруты, навигация и sitemap routes вынесены в `src/config`.
- [x] Content collections подключены через общий слой `src/lib/content.ts`.
- [x] Данные отделены от компонентов: страницы получают данные через helpers, компоненты - через пропсы.
- [x] Тарифные опции и роли владельцев проверки ограничены в TypeScript и Zod.
- [x] `BaseLayout.astro` содержит базовую SEO-технику: canonical, robots, Open Graph, Twitter summary, theme-color.
- [x] Добавлены `robots.txt` и `sitemap.xml`.
- [x] Настроены `lint`, `format`, `format:check`, `check`, `build`.
- [x] `npm run format:check` проходит без ошибок.
- [x] `npm run check` проходит без ошибок и предупреждений.
- [x] `npm run build` проходит без ошибок и собирает 6 страниц, `robots.txt` и `sitemap.xml`.
- [ ] Отдельный ESLint-контур не подключен; текущий `lint` является алиасом на `astro check`.

Незакрытый пункт этапа 4 не блокирует переход к интерфейсной разработке: в проекте почти нет клиентского TypeScript, а Astro diagnostics уже закрывает текущий типовой и content-контракт. Полноценный ESLint стоит добавить при расширении клиентской логики.

## Чекап этапа 5

- [x] Главная страница реализует полный frontend-путь: hero, воронка, сценарии, услуги, тарифы, проверка адреса и FAQ.
- [x] Тарифы реализованы как карточки и сравнительная таблица с CTA к выбранному тарифу.
- [x] Карточки услуг подключены к `services` collection без изменения content-схем.
- [x] FAQ, контакты, поддержка, подключение и о компании оформлены как адаптивные страницы первой версии.
- [x] Навигация адаптивна: desktop menu и native mobile menu без тяжелого клиентского JS.
- [x] Sticky CTA ведет к `/connect/#address-check` и скрывается на desktop.
- [x] UI имеет hover, focus-visible, active, checked, invalid и open states.
- [x] Базовые CSS-анимации добавлены и отключаются через `prefers-reduced-motion`.
- [x] Интерфейсный контракт этапа описан в `docs/interface-implementation.md`.
- [x] `npm run format:check` проходит без ошибок.
- [x] `npm run check` проходит без ошибок, предупреждений и hints.
- [x] `npm run build` проходит без ошибок и собирает 6 страниц, `robots.txt` и `sitemap.xml`.
- [x] Bundled Playwright smoke проверил 6 страниц на mobile/tablet/desktop: overflow, console warnings/errors и мелкие критичные targets не обнаружены.
- [ ] Реальные брендовые материалы, фотографии, контакты, SLA и юридические тексты Kubtel подтверждены.

Незакрытый пункт этапа 5 относится к внешним бизнес- и бренд-входам. Технический frontend готов принимать подтвержденные данные без пересборки UI-контрактов.

## Чекап этапа 6

- [x] Заявка обрабатывается сервером через Astro Action `submitLead`.
- [x] Серверная Zod-валидация проверяет имя, телефон, адрес, тариф, опции и согласие.
- [x] Телефон нормализуется на сервере до международного формата.
- [x] Тариф существует в content layer, а выбранные опции доступны для этого тарифа.
- [x] Расчет стоимости выполняется через независимый модуль `src/lib/pricing.ts`.
- [x] Адресная проверка возвращает статусы `available`, `manual_check`, `unavailable` или `uncertain`.
- [x] CRM webhook, Telegram и analytics изолированы в серверных adapter-модулях.
- [x] Токены и webhook-секреты читаются только из переменных окружения.
- [x] Форма получила honeypot, timestamp check и in-memory rate limiting.
- [x] Если внешние интеграции не настроены или падают, заявка сохраняется в `.lead-outbox/`.
- [x] Пользователь видит понятный success/error state после отправки.
- [x] `.lead-outbox/` исключен из git, потому что содержит персональные данные.
- [x] `npm test` проходит: 4 test files, 8 tests.
- [x] `npm run check` проходит без ошибок, предупреждений и hints.
- [x] `npm run build` проходит; `/` и `/connect/` собираются как on-demand routes, остальные страницы prerender.
- [ ] Production CRM webhook не предоставлен.
- [ ] Telegram bot token и sales chat id не предоставлены.
- [ ] Финальный юридический текст согласия и политика персональных данных не подтверждены.

Незакрытые пункты этапа 6 являются внешними операционными и юридическими входами. Технический серверный контур готов принять реальные секреты через `.env` без изменения клиентского кода.

## Чекап этапа 7

- [x] У ключевых страниц уникальные title и description через `src/config/routes.ts` и page props.
- [x] `BaseLayout.astro` генерирует canonical, robots, Open Graph, Twitter summary и базовую JSON-LD разметку.
- [x] Добавлена Schema.org разметка Organization, WebSite, WebPage, BreadcrumbList, Service, OfferCatalog, FAQPage, ContactPage и AboutPage.
- [x] `sitemap.xml` содержит `lastmod`, `changefreq`, `priority` и генерируется из единой карты маршрутов.
- [x] `robots.txt` ссылается на sitemap и закрывает служебные пути `/.lead-outbox/` и `/_actions/`.
- [x] Изображения проверены: bitmap-активов в `src` и `public` нет, глобальный CSS закрепляет безопасное масштабирование будущих `img`.
- [x] Core Web Vitals проверены через Lighthouse mobile на production preview.
- [x] Lighthouse mobile Performance 90+ достигнут на `/`, `/connect/`, `/tariffs/`, `/support/`.
- [x] Lighthouse mobile Accessibility 95+ достигнут на `/`, `/connect/`, `/tariffs/`, `/support/`.
- [x] Lighthouse mobile SEO 95+ достигнут на `/`, `/connect/`, `/tariffs/`, `/support/`.
- [x] Нет layout shift в критичных блоках по Lighthouse: CLS 0 на проверенных страницах.
- [x] Формы и навигация работают с клавиатуры: native controls, skip-link, details/summary menu, focus-visible, status focus после submit.
- [x] `npm test` проходит: 5 test files, 11 tests.
- [x] `npm run check` проходит без ошибок, предупреждений и hints.
- [x] `npm run build` проходит; `/`, `/connect/` и `/tariffs/` являются on-demand routes, остальные страницы prerender.
- [ ] Production-origin, финальные контакты, юридические тексты, брендовые медиа и подтвержденные тарифы Kubtel не предоставлены.
- [x] Production dependency advisory закрыт на этапе 9: `npm audit --omit=dev` проходит без уязвимостей после перехода на Astro 6.x.

Незакрытые пункты этапа 7 относятся к внешним production-входам. SEO, performance и accessibility контур первой версии готов к предрелизному тестированию.

## Чекап этапа 8

- [x] Все страницы с формой заявки проверены контрактно: `/`, `/connect/`, `/tariffs/` server-rendered и читают результат `submitLead`.
- [x] `/tariffs/` больше не является статической страницей с формой: результат success/error теперь может быть показан пользователю после отправки.
- [x] Форма заявки отключает опции, недоступные для выбранного тарифа, и не оставляет выбранную несовместимую опцию при переключении тарифа.
- [x] Добавлен предрелизный аудит `src/lib/prelaunch/audit.ts`.
- [x] Добавлен отдельный скрипт `npm run test:prelaunch`.
- [x] Prelaunch-аудит проверяет технические дефекты форм, route metadata, связи контента, тарифные значения, featured-тариф, external blockers по контенту, coverage, юридике и env.
- [x] `npm run test:prelaunch` проходит: 2 test files, 5 tests.
- [x] `npm test` проходит: 7 test files, 16 tests.
- [x] `npm run check` проходит без ошибок, предупреждений и hints.
- [x] `npm run build` проходит; `/`, `/connect/` и `/tariffs/` являются on-demand routes, остальные публичные страницы prerender.
- [x] Dev server smoke на `http://127.0.0.1:4321/` возвращает 200 для `/`, `/connect/`, `/tariffs/`, `/support/`, `/contacts/`, `/about/`.
- [x] Контракт этапа описан в `docs/pre-release-testing.md`.
- [ ] Production CRM webhook не предоставлен.
- [ ] Telegram bot token и sales chat id не предоставлены.
- [ ] Production analytics webhook не предоставлен.
- [ ] Актуальные цены, скорости, опции, условия подключения и акции Kubtel не подтверждены.
- [ ] Адресная база покрытия не подтверждена.
- [ ] Финальное согласие на обработку персональных данных, политика и реквизиты оператора не подтверждены.
- [x] `npm audit --omit=dev` advisory закрыта на этапе 9 обновлением Astro и Node adapter.

Незакрытые пункты этапа 8 являются внешними launch-блокерами. Критичных технических дефектов в предрелизном QA-контуре не осталось, но сайт нельзя считать готовым к публикации без подтвержденных коммерческих, юридических и production-интеграционных входов.

## Чекап этапа 9

- [x] Добавлен runtime health endpoint `/api/health.json`.
- [x] Добавлен launch-readiness audit `src/lib/launch/readiness.ts`.
- [x] Добавлены тесты launch-аудита `src/lib/launch/readiness.test.ts`.
- [x] Добавлен скрипт `npm run test:launch`.
- [x] Добавлен фактический Chrome UX smoke `scripts/ux-smoke.mjs`.
- [x] Добавлен скрипт `npm run test:ux`.
- [x] Добавлен скрипт `npm run launch:check`.
- [x] Production dependency audit очищен: `npm audit --omit=dev` проходит без уязвимостей.
- [x] Astro обновлен до `^6.3.0`, Node adapter - до `^10.1.0`.
- [x] Добавлен простой Windows-запуск `start-kubtel-site.bat`.
- [x] Описан доступ к системе управления сайтом в `docs/site-management-access.md`.
- [x] Описан launch/postrelease контроль в `docs/launch-postrelease-control.md`.
- [x] Локальный Chrome UX smoke прошел: 6 маршрутов, health endpoint, tariff CTA, mobile navigation и отправка заявки.
- [ ] Production-домен не развернут и не проверен.
- [ ] DNS, SSL и redirects production-домена не подтверждены.
- [ ] Production-форма не проверена на боевых CRM/Telegram/analytics env.
- [ ] Команда продаж не подтвердила первый production feedback loop.

Этап 9 технически закрывает контур запуска и пострелизного контроля внутри проекта. Фактическая публикация на production остается заблокированной внешними доступами, секретами, доменом и подтвержденными бизнес-данными.

## Чекап этапа 10

- [x] Зафиксирован стратегический пробел: полноценный B2B-раздел отсутствует в текущей реализации.
- [x] Проверены публичные B2B-направления текущего kubtel.ru.
- [x] Зафиксировано, что текущий проект не подключен к CMS: контент хранится в local content layer.
- [x] Зафиксировано, что дизайн-токены пока живут как CSS-переменные, а не как отдельный token source of truth.
- [x] Создан `docs/b2b-cms-design-token-prompt-pack.md`.
- [x] Prompt pack покрывает B2B-аудит, позиционирование, IA, воронки, CMS selection, CMS-модели, Astro CMS adapter, миграцию, дизайн-токены, B2B UI, калькуляторы, CRM routing, SEO, редакторскую документацию и QA.
- [x] Prompt 01-04 выполнены как реализационный этап и зафиксированы в `docs/b2b-strategy-ia-funnel.md`.
- [x] Для каждой B2B-услуги зафиксированы бизнес-смысл, публичные факты, слабые места, CMS/коммерческие поля, CTA и приоритет.
- [x] Спроектированы B2B positioning, сегментная матрица, IA маршрутов `/business/**` и отдельная B2B-конверсионная воронка.
- [x] Prompt 04 детализирован отдельным CRO-артефактом `docs/b2b-conversion-funnel.md`: conversion flow map, lead scoring rules, analytics event map и CRM payload contract.
- [x] Prompt 05 выполнен: CMS ADR зафиксирован в `docs/cms-selection-adr.md`.
- [x] Основной CMS POC выбран: Strapi 5 self-hosted + PostgreSQL.
- [x] Запасной CMS вариант выбран: Directus self-hosted + PostgreSQL.
- [x] Prompt 06 выполнен: CMS-модели зафиксированы в `docs/cms-content-models.md`.
- [x] Для CMS-моделей определены поля, типы, обязательность, связи, владельцы редактирования, workflow, validation, Astro usage и server-only/private поля.
- [x] Подготовлены JSON/Zod-псевдосхемы, migration map из `src/content/**` и editorial guide для менеджеров.
- [x] Prompt 07 выполнен: Astro CMS integration layer зафиксирован в `docs/cms-integration-layer.md` и реализован в `src/lib/cms/`.
- [x] Добавлены `localContentAdapter`, `strapiAdapter`, adapter selection, fallback на local content, preview mode, in-memory cache и private-field stripping.
- [x] `src/lib/content.ts` переведен на `createCmsAdapter()`, сохраняя текущий contract для существующих страниц.
- [x] Добавлены тесты на CMS-схемы, Strapi normalizers и Strapi adapter.
- [x] Добавлен видимый B2B-раздел: `/business/`, `/business/internet/`, `/business/telephony/`, `/business/cctv/`, `/business/wifi-auth/`, `/business/vps/`, `/business/vdi/`, `/business/colocation/`, `/business/datacenter-access/`, `/business/smb/`, `/business/operators/`, `/business/government/`, `/business/request/`.
- [x] B2B-раздел добавлен в header, footer, sitemap metadata и mobile sticky CTA.
- [x] B2B-заявка отправляется через отдельный Astro Action `submitBusinessLead`, не смешивается с домашней заявкой и использует CRM/outbox fallback.
- [x] Prompt 08 выполнен: CMS migration plan зафиксирован в `docs/cms-migration-plan.md`.
- [x] Подготовлены URL redirect table, current routes to CMS mapping, content freeze plan, CMS import order, redirect QA и manual editorial QA.
- [x] Prompt 09 выполнен: design token source-of-truth architecture зафиксирована в `docs/design-tokens-source-of-truth.md`.
- [x] Подготовлены token taxonomy, naming convention, JSON examples, generated CSS example, build script contract, CMS/editor governance, visual smoke rules и migration checklist из `global.css`.
- [ ] Strapi runtime не поднят и не подключен к production.
- [x] B2B-раздел в коде реализован как первый visible MVP.
- [ ] Token source of truth не реализован в коде как `src/design/tokens/**`, `scripts/build-tokens.mjs` и generated `src/styles/tokens.css`.

Этап 10 начат как стратегическое расширение после launch-control. Prompts 01-09 закрывают продуктовую основу B2B, CMS ADR, CMS-модели, adapter boundary, план миграции в Strapi-first CMS и архитектуру дизайн-токенов; дополнительно добавлен видимый B2B MVP. Следующий практический шаг - CMS design governance и затем углубление B2B-калькуляторов.
