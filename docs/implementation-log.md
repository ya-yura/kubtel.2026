# Kubtel.ru: журнал реализации

## 2026-05-06

### Создано базовое ТЗ

Файл: `docs/kubtel-project-tz.md`.

Результат:

- зафиксированы стратегическая цель, продуктовые принципы и бизнес-цели;
- описаны аудитории, пользовательские сценарии и объем первой версии;
- определены требования к контенту, UX/UI, архитектуре, бизнес-логике, SEO, производительности, доступности и безопасности;
- описаны этапы реализации и критерии приемки.

Статус: completed.

### Запущен системный контур реализации

Файлы:

- `docs/project-state.md`;
- `docs/implementation-log.md`;
- `docs/decision-log.md`.

Результат:

- введена единая рабочая память проекта;
- зафиксировано правило отметки завершенных этапов;
- выделены активные допущения и открытые вопросы;
- подготовлена основа для последовательной реализации.

Статус: in progress.

### Завершен этап 0: подготовка и технический старт

Файлы:

- `package.json`;
- `astro.config.mjs`;
- `tsconfig.json`;
- `.env.example`;
- `src/content.config.ts`;
- `src/content/**`;
- `src/components/**`;
- `src/layouts/BaseLayout.astro`;
- `src/pages/**`;
- `src/lib/pricing.ts`;
- `src/lib/format.ts`;
- `src/styles/global.css`.

Результат:

- создан Astro + TypeScript проект;
- настроены локальные content collections для тарифов, услуг, FAQ, покрытия и промо;
- добавлены черновые структурированные данные;
- реализованы базовые страницы первого контура;
- компоненты получают данные через типизированные пропсы;
- расчет стоимости вынесен из UI;
- сборка `npm run build` прошла успешно.

Проверка:

- `npm install` выполнен;
- `npm run build` выполнен;
- `astro check`: 0 ошибок, 0 предупреждений;
- `astro build`: собрано 6 страниц.
- dev-сервер запущен на `http://127.0.0.1:4321/`;
- HTTP-проверка главной страницы вернула 200 OK.

Ограничения:

- тарифы, цены, SLA, зоны покрытия и контакты пока черновые;
- форма заявки пока статическая, серверная обработка будет на этапе бизнес-логики;
- аудит npm показывает 6 moderate vulnerabilities в зависимостях, force-исправление не применялось из-за риска несовместимых обновлений.

Статус: completed.

### Исправлен запуск локального dev-сервера

Контекст:

- первый запуск Astro слушал `::1:4321`, из-за чего проверка через `127.0.0.1` не проходила;
- npm-скрипт был уточнен до явного `astro dev --host 127.0.0.1 --port 4321`.

Результат:

- `npm run dev` стабильно поднимает сайт на `http://127.0.0.1:4321/`;
- лог dev-сервера добавлен в `.gitignore`.

Статус: completed.

### Подключен отдельный git-репозиторий проекта

Контекст:

- рабочая папка проекта находилась внутри родительского git-корня `O:\Dev`;
- для сайта нужен отдельный репозиторий и регулярные push-контрольные точки.

Результат:

- в `O:\Dev\kubtel-best-redesign` инициализирован отдельный git-репозиторий;
- основная ветка названа `main`;
- подключен remote `https://github.com/ya-yura/kubtel.2026.git`;
- создан и отправлен первый коммит `Initial Kubtel Astro project`.

Статус: completed.

### Завершен этап 1: контентная модель и смысловая переработка

Файлы:

- `docs/content-model.md`;
- `docs/content-inventory.md`;
- `docs/project-state.md`;
- `src/content.config.ts`;
- `src/types/domain.ts`;
- `src/content/**`;
- `src/lib/verification.ts`;
- `src/components/ui/TariffCard.astro`;
- `src/components/sections/FaqList.astro`;
- `src/styles/global.css`.

Результат:

- добавлен общий вложенный тип `contentSource` для всех content collections;
- для тарифов добавлен отдельный `commercialReview`, чтобы цена, скорость, опции и подключение не смешивались с редакционным текстом;
- FAQ и промо получили явные доказательные статусы `proof`;
- все текущие тарифы, промо и coverage помечены как `draft` или `needs_verification`;
- карточки тарифов и FAQ показывают статус данных;
- описана CMS-модель и правила публикации неподтвержденных данных.

Проверка:

- `npm run build` выполнен;
- `astro check`: 0 ошибок, 0 предупреждений;
- `astro build`: собрано 6 страниц.

Ограничения:

- фактические тарифы, цены, SLA, coverage, контакты и юридические тексты все еще требуют подтверждения Kubtel;
- этап закрыт как техническая и смысловая модель, а не как подтверждение коммерческих условий.

Статус: completed.

### Завершен этап 2: UX-прототип

Файлы:

- `docs/ux-prototype.md`;
- `docs/project-state.md`;
- `src/components/layout/StickyCta.astro`;
- `src/components/sections/FunnelOverview.astro`;
- `src/components/sections/TariffComparison.astro`;
- `src/components/sections/AddressStateMap.astro`;
- `src/components/sections/SupportPathways.astro`;
- `src/components/sections/AddressCheckPanel.astro`;
- `src/components/sections/FaqList.astro`;
- `src/components/sections/Hero.astro`;
- `src/components/layout/Header.astro`;
- `src/layouts/BaseLayout.astro`;
- `src/pages/index.astro`;
- `src/pages/tariffs/index.astro`;
- `src/pages/connect.astro`;
- `src/pages/support.astro`;
- `src/styles/global.css`.

Результат:

- главная получила структурный сценарий подключения от адреса к заявке;
- тарифы дополнены таблицей сравнения по скорости, цене, опциям и подключению;
- форма проверки адреса расширена до прототипа заявки с выбором тарифа, опций и контактов;
- страница подключения получила карту состояний адресной проверки и ошибок;
- поддержка разделена на быстрые сценарии: авария, тарифы и новое подключение;
- добавлен mobile sticky CTA, который ведет к проверке адреса;
- UX-карта, состояния формы, sticky CTA и список компонентов зафиксированы в `docs/ux-prototype.md`.

Проверка:

- `npm run build` выполнен;
- `astro check`: 0 ошибок, 0 предупреждений;
- `astro build`: собрано 6 страниц;
- локальный URL `http://127.0.0.1:4321/` отвечает 200 OK.

Ограничения:

- адресная проверка и отправка заявки остаются структурным прототипом до этапа бизнес-логики и интеграций;
- фактические тарифы, зоны покрытия, SLA, контакты и юридический текст требуют подтверждения Kubtel.

Статус: completed.

### Завершен этап 3: визуальная система

Файлы:

- `docs/visual-system.md`;
- `docs/visual-qa.md`;
- `docs/project-state.md`;
- `docs/implementation-log.md`;
- `src/styles/global.css`;
- `src/components/layout/Header.astro`;
- `src/components/sections/AddressCheckPanel.astro`;
- `src/pages/contacts.astro`.

Результат:

- зафиксирован визуальный DNA первой версии: локальная технологичность, светлая интерфейсная основа, графитовый контраст и теплый CTA;
- глобальные стили переведены на системные дизайн-токены для цвета, радиусов, теней, сетки, состояний и responsive-слоя;
- типографика переведена на rem/breakpoint-подход без viewport-зависимого масштабирования;
- добавлены hover, active, focus-visible, checked, invalid и active navigation состояния;
- тарифные карточки, таблица сравнения, FAQ, address states, support pathways, форма заявки и sticky CTA приведены к единому визуальному языку;
- шапка получила `aria-current` для активного раздела;
- форма заявки получила обязательные поля адреса, имени и телефона, `aria-describedby` и input mode для телефона;
- страница контактов получила первые contact cards для сценариев подключения, поддержки и уточняемых офисных данных;
- правила визуальной системы, палитры, контраста, микро-взаимодействий и адаптивности описаны в `docs/visual-system.md`.
- QA визуальной системы зафиксирован в `docs/visual-qa.md`.

Проверка:

- `npm run build` выполнен;
- `astro check`: 0 ошибок, 0 предупреждений;
- `astro build`: собрано 6 страниц.
- bundled Playwright QA выполнен на `/`, `/tariffs/`, `/connect/`, `/support/`, `/contacts/`, `/about/`;
- viewport `390x844` и `1440x1000` проверены;
- HTTP-статусы: 200 OK;
- console warnings/errors: не обнаружены;
- горизонтальный overflow: не обнаружен;
- критичные CTA, кнопки и поля формы: не меньше 44px;
- контраст ключевых пар: основной текст 17.96, вторичный текст 5.64, primary CTA 6.78, hero metric 13.48.

Корректировка по итогам QA:

- внутренний фон hero metrics переведен с полупрозрачного слоя на solid dark `#2a2f36`, чтобы автоматическая проверка контраста видела фактическую пару без неоднозначности.

Ограничения:

- финальные брендовые материалы, фотографии, иконки, контакты и офисные данные Kubtel не подтверждены;
- визуальная система закрывает технический UI-слой, но финальный брендовый аудит нужен после получения реальных медиа и фирменных материалов.

Статус: completed.

## 2026-05-07

### Завершен этап 4: технический фундамент

Файлы:

- `astro.config.mjs`;
- `.env.example`;
- `package.json`;
- `package-lock.json`;
- `prettier.config.mjs`;
- `.prettierignore`;
- `tsconfig.json`;
- `src/config/site.ts`;
- `src/config/routes.ts`;
- `src/lib/content.ts`;
- `src/pages/robots.txt.ts`;
- `src/pages/sitemap.xml.ts`;
- `src/layouts/BaseLayout.astro`;
- `src/components/layout/Header.astro`;
- `src/components/layout/Footer.astro`;
- `src/pages/**`;
- `src/content.config.ts`;
- `src/types/domain.ts`;
- `docs/technical-foundation.md`;
- `docs/project-state.md`;
- `docs/decision-log.md`.

Результат:

- добавлен единый site config с origin, locale, meta-описанием и theme color;
- навигация, footer-навигация и sitemap routes вынесены в общий конфиг маршрутов;
- страницы переведены на `src/lib/content.ts`, чтобы не дублировать `getCollection` и сортировки;
- `BaseLayout.astro` получил canonical URL, robots meta, Open Graph и Twitter summary;
- добавлены static endpoints `robots.txt` и `sitemap.xml`;
- Astro config закрепил `trailingSlash: "always"` и локальный origin `http://127.0.0.1:4321`;
- тарифные опции и роли владельцев проверки ужесточены в TypeScript и Zod-схемах;
- добавлены прямые dev-зависимости Prettier и `prettier-plugin-astro`, scripts `lint`, `format`, `format:check`;
- технический контракт этапа описан в `docs/technical-foundation.md`.

Проверка:

- `npm run check` выполнен;
- `astro check`: 0 ошибок, 0 предупреждений, 0 hints;
- `npm run build` выполнен;
- `astro build`: собрано 6 страниц, `robots.txt` и `sitemap.xml`;
- `npm run format` выполнен после настройки Prettier для Astro.
- `npm run format:check` выполнен, все проверяемые файлы соответствуют Prettier.

Ограничения:

- `lint` пока является алиасом на `astro check`; отдельный ESLint-контур можно добавить позже, если появится больше клиентского TypeScript;
- npm audit по-прежнему показывает 6 moderate vulnerabilities в зависимостях, force-исправление не применялось из-за риска несовместимых обновлений;
- реальная CMS, CRM, адресная база и серверная обработка заявки остаются задачами следующих этапов.

Статус: completed.

### Завершен этап 5: разработка интерфейса

Файлы:

- `src/components/sections/ServiceCards.astro`;
- `src/components/layout/Header.astro`;
- `src/pages/index.astro`;
- `src/styles/global.css`;
- `docs/interface-implementation.md`;
- `docs/project-state.md`;
- `docs/implementation-log.md`.

Результат:

- главная страница получила полный frontend-путь первой версии: hero, воронка, HumanKind-сценарии, карточки услуг, тарифы, проверка адреса и FAQ;
- карточки услуг подключены к существующей `services` collection и показывают пользу, связанные тарифы и статус достоверности данных;
- шапка получила адаптивную навигацию с desktop menu и native mobile menu на `details/summary`;
- mobile sticky CTA сохранен как основной быстрый переход к проверке адреса;
- добавлены легкие CSS-анимации появления и меню, отключаемые через `prefers-reduced-motion`;
- интерфейсный контракт этапа описан в `docs/interface-implementation.md`.

Проверка:

- `npm run format` выполнен;
- `npm run check` выполнен;
- `astro check`: 0 ошибок, 0 предупреждений, 0 hints;
- `npm run format:check` выполнен;
- `npm run build` выполнен;
- `astro build`: собрано 6 страниц, `robots.txt` и `sitemap.xml`.
- bundled Playwright smoke выполнен на `/`, `/tariffs/`, `/connect/`, `/support/`, `/contacts/`, `/about/`;
- viewport `390x844`, `768x1024`, `1440x1000` проверены;
- горизонтальный overflow, console warnings/errors и мелкие критичные targets не обнаружены;
- mobile/tablet navigation menu открывается и показывает основные ссылки.

Ограничения:

- форма заявки не отправляет данные в CRM до этапа 6;
- адресная проверка остается ручным прототипом до подключения адресной базы;
- финальные тарифы, зоны покрытия, контакты, SLA, юридические тексты и брендовые медиа требуют подтверждения Kubtel.

Статус: completed.

### Завершен этап 6: бизнес-логика и интеграции

Файлы:

- `astro.config.mjs`;
- `.env.example`;
- `.gitignore`;
- `package.json`;
- `package-lock.json`;
- `vitest.config.ts`;
- `src/actions/index.ts`;
- `src/lib/leads/**`;
- `src/lib/integrations/**`;
- `src/lib/analytics/server.ts`;
- `src/lib/spam/rate-limit.ts`;
- `src/components/sections/AddressCheckPanel.astro`;
- `src/pages/index.astro`;
- `src/pages/connect.astro`;
- `src/styles/global.css`;
- `docs/business-logic-integrations.md`;
- `docs/project-state.md`;
- `docs/implementation-log.md`;
- `docs/decision-log.md`.

Результат:

- подключен совместимый с Astro 5 Node adapter `@astrojs/node@9.5.5`;
- добавлен `vitest` и тестовый alias config для бизнес-логики;
- форма заявки переведена на Astro Action `submitLead`;
- страницы `/` и `/connect/` переведены на on-demand rendering, чтобы показывать action result после POST;
- добавлена Zod-схема заявки: имя, телефон, адрес, тариф, опции, согласие, honeypot, timestamp и source path;
- телефон нормализуется на сервере, тариф и опции сверяются с content layer;
- расчет стоимости использует существующий `calculateMonthlyPrice()`;
- адресная проверка работает через локальную coverage collection и возвращает статусы `available`, `manual_check`, `unavailable`, `uncertain`;
- добавлены CRM webhook adapter, Telegram Bot API adapter и server analytics webhook adapter;
- добавлен in-memory rate limiting по IP + телефону;
- добавлен локальный `.lead-outbox/` как резерв заявок при отсутствии или ошибке внешней доставки;
- форма получила явное согласие на обработку данных, success/error state и антиспам honeypot.

Проверка:

- `npm test` выполнен: 4 test files, 8 tests passed;
- `npm run check` выполнен: 0 ошибок, 0 предупреждений, 0 hints;
- `npm run build` выполнен: проект собирается, `/` и `/connect/` являются on-demand routes, статические страницы prerender.

Ограничения:

- реальные `CRM_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_SALES_CHAT_ID` и analytics webhook не предоставлены;
- `.lead-outbox/` является серверным резервом для первой Node standalone версии, а не полноценной production CRM;
- финальный юридический текст согласия и политика персональных данных требуют согласования.

Статус: completed.

### Завершен этап 7: SEO, производительность и доступность

Файлы:

- `package.json`;
- `package-lock.json`;
- `src/config/site.ts`;
- `src/config/routes.ts`;
- `src/lib/seo/schema.ts`;
- `src/lib/seo/schema.test.ts`;
- `src/layouts/BaseLayout.astro`;
- `src/pages/robots.txt.ts`;
- `src/pages/sitemap.xml.ts`;
- `src/pages/index.astro`;
- `src/pages/tariffs/index.astro`;
- `src/pages/connect.astro`;
- `src/pages/support.astro`;
- `src/pages/contacts.astro`;
- `src/pages/about.astro`;
- `src/components/layout/Header.astro`;
- `src/components/layout/StickyCta.astro`;
- `src/components/sections/Hero.astro`;
- `src/components/sections/AddressCheckPanel.astro`;
- `src/styles/global.css`;
- `docs/seo-performance-accessibility.md`;
- `docs/project-state.md`;
- `docs/implementation-log.md`;
- `docs/decision-log.md`.

Результат:

- в проект добавлен `lighthouse` как dev-инструмент для повторяемого mobile-аудита;
- route metadata расширены уникальными title, description, lastmod, sitemap priority и changefreq;
- `BaseLayout.astro` теперь строит базовую JSON-LD разметку Organization, WebSite, WebPage и BreadcrumbList;
- добавлен `src/lib/seo/schema.ts` с helper-ами для Service, OfferCatalog и FAQPage;
- JSON-LD сериализуется через безопасный `serializeJsonLd()` с экранированием `<`;
- тарифные schema-offers помечаются как `PreOrder`, пока коммерческие данные остаются черновыми;
- `sitemap.xml` получил `lastmod`, а `robots.txt` закрывает служебные `/.lead-outbox/` и `/_actions/`;
- добавлен skip-link, фокусная точка `main`, уточненное mobile menu label, status focus после submit и `aria-live` для выбранного тарифа;
- CSS получил `content-visibility: auto` и `contain-intrinsic-size` для отложенных секций;
- контракт этапа описан в `docs/seo-performance-accessibility.md`.

Проверка:

- `npm test` выполнен: 5 test files, 11 tests passed;
- `npm run check` выполнен: 0 ошибок, 0 предупреждений, 0 hints;
- `npm run build` выполнен: проект собирается, `/` и `/connect/` являются on-demand routes, статические страницы prerender;
- `robots.txt` и `sitemap.xml` проверены через production preview;
- Lighthouse mobile production preview:
  - `/`: Performance 100, Accessibility 100, SEO 100, Best Practices 96;
  - `/connect/`: Performance 100, Accessibility 100, SEO 100, Best Practices 96;
  - `/tariffs/`: Performance 100, Accessibility 96, SEO 100, Best Practices 96;
  - `/support/`: Performance 100, Accessibility 100, SEO 100, Best Practices 96.

Ограничения:

- production-origin зависит от `PUBLIC_SITE_URL`, локальные отчеты используют `http://127.0.0.1:4321/`;
- финальные контакты, юридические тексты, брендовые медиа и подтвержденные тарифы Kubtel не предоставлены;
- `npm audit --omit=dev` показывает умеренную advisory в Astro 5.x; автоматическое исправление требует перехода на Astro 6.x и должно идти отдельным решением.

Статус: completed.

### Завершен этап 8: предрелизное тестирование

Файлы:

- `package.json`;
- `src/components/sections/AddressCheckPanel.astro`;
- `src/pages/tariffs/index.astro`;
- `src/styles/global.css`;
- `src/lib/prelaunch/audit.ts`;
- `src/lib/prelaunch/audit.test.ts`;
- `src/lib/prelaunch/page-contract.test.ts`;
- `docs/pre-release-testing.md`;
- `docs/project-state.md`;
- `docs/seo-performance-accessibility.md`;
- `docs/decision-log.md`;
- `docs/implementation-log.md`.

Результат:

- добавлен отдельный prelaunch-аудит, который разделяет критичные технические дефекты и внешние launch-блокеры;
- добавлен скрипт `npm run test:prelaunch`;
- контракт страниц с формой теперь тестируется: `/`, `/connect/` и `/tariffs/` должны быть on-demand и читать результат `submitLead`;
- исправлен дефект `/tariffs/`: страница с формой больше не prerender-ится статически и показывает success/error state после отправки заявки;
- исправлен дефект несовместимых опций: при смене тарифа недоступные опции отключаются и снимаются;
- предрелизный "детектор лжи" фиксирует неподтвержденные тарифы, coverage, FAQ, промо, юридику и production env как external blockers;
- контракт этапа описан в `docs/pre-release-testing.md`.

Проверка:

- `npm run test:prelaunch` выполнен: 2 test files, 5 tests passed;
- `npm test` выполнен: 7 test files, 16 tests passed;
- `npm run check` выполнен: 0 ошибок, 0 предупреждений, 0 hints;
- `npm run build` выполнен: проект собирается, `/`, `/connect/` и `/tariffs/` являются on-demand routes, остальные публичные страницы prerender;
- dev server smoke на `http://127.0.0.1:4321/` возвращает 200 для `/`, `/connect/`, `/tariffs/`, `/support/`, `/contacts/`, `/about/`.

Ограничения:

- реальные `CRM_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_SALES_CHAT_ID` и analytics webhook не предоставлены;
- актуальная тарифная матрица, адресная база покрытия, финальные юридические тексты, контакты и промо-условия не подтверждены;
- публикация требует отдельного решения по `npm audit --omit=dev` advisory в Astro 5.x;
- финальный ручной browser pass нужно провести на production origin после подстановки внешних launch-входов.

Статус: completed.

### Реализован этап 9: запуск и пострелизный контроль

Файлы:

- `package.json`;
- `package-lock.json`;
- `start-kubtel-site.bat`;
- `scripts/ux-smoke.mjs`;
- `src/pages/api/health.json.ts`;
- `src/lib/launch/readiness.ts`;
- `src/lib/launch/readiness.test.ts`;
- `docs/launch-postrelease-control.md`;
- `docs/site-management-access.md`;
- `docs/project-state.md`;
- `docs/decision-log.md`;
- `docs/pre-release-testing.md`;
- `docs/seo-performance-accessibility.md`.

Результат:

- добавлен runtime health endpoint `/api/health.json` для production-мониторинга;
- добавлен launch-readiness audit, который проверяет prelaunch-статус, production origin, DNS/SSL/redirects, формы, dependency audit, мониторинг, аналитику и цикл обратной связи продаж;
- добавлены тесты launch-аудита и отдельный скрипт `npm run test:launch`;
- добавлен Chrome UX smoke `npm run test:ux`, который проверяет реальные пользовательские пути в локальном браузере;
- добавлен единый запуск проверок перед релизом `npm run launch:check`;
- добавлен простой Windows launcher `start-kubtel-site.bat`;
- описана текущая система управления сайтом: репозиторий, content layer, route/site config, env и роли доступа;
- описан stage 9 launch/postrelease checklist;
- закрыт production dependency advisory обновлением до `astro@^6.3.0`, `@astrojs/node@^10.1.0`, `@astrojs/check@^0.9.9`.

Проверка:

- `npm audit --omit=dev` выполнен: 0 vulnerabilities;
- `npm test` выполнен: 8 test files, 18 tests passed;
- `npm run launch:check` выполнен успешно;
- dev server запущен на `http://127.0.0.1:4321/`;
- HTTP smoke вернул 200 для `/`, `/connect/`, `/tariffs/`, `/support/`, `/contacts/`, `/about/`;
- `/api/health.json` вернул 200 OK;
- `npm run test:ux` выполнен: desktop routes, health endpoint, tariff CTA path, mobile navigation и lead form submit path passed.

Ограничения:

- production-домен, DNS, SSL и redirects нельзя подтвердить без доступа к боевому домену;
- реальные CRM/Telegram/analytics env не предоставлены;
- тарифы, coverage, юридические тексты и контакты остаются внешними launch-блокерами;
- production browser pass нужно повторить после подстановки внешних launch-входов и деплоя на боевой домен.

Статус: technical completed, production blocked by external confirmations.

## 2026-05-08

### Подготовлен prompt pack для B2B, CMS и дизайн-токенов

Файл:

- `docs/b2b-cms-design-token-prompt-pack.md`.

Контекст:

- пользователь указал, что текущая реализация не задействует услуги для бизнеса;
- пользователь подтвердил необходимость CMS, потому что контентом будут управлять не инженеры;
- пользователь запросил централизованную работу с дизайном через дизайн-токены.

Проверка текущего сайта:

- изучен публичный B2B-раздел Kubtel;
- зафиксированы направления: интернет в офис, телефония, видеонаблюдение, Wi-Fi авторизация, VPS/VDI, colocation, доступ в ЦОД, операторы связи, государственный сектор;
- текущая реализация проекта сверена с `src/content.config.ts`, `src/styles/global.css`, `docs/visual-system.md` и `package.json`.

Результат:

- подготовлены 20 последовательных промптов;
- промпты покрывают B2B-стратегию, IA, воронки, CMS selection, CMS-модели, Astro CMS adapter, миграцию, дизайн-токены, B2B UI, калькуляторы, CRM routing, SEO, редакторскую документацию и QA;
- `docs/project-state.md` обновлен: добавлен этап 10.

Ограничения:

- prompt pack не является реализацией B2B-раздела;
- CMS еще не выбрана и не подключена;
- token source of truth еще не вынесен в отдельные JSON/design-token файлы.

Статус: completed для prompt pack, implementation pending.

### Выполнены Prompt 01-04: B2B-аудит, позиционирование, IA и воронка

Файл:

- `docs/b2b-strategy-ia-funnel.md`.

Контекст:

- после подготовки prompt pack пользователь запросил выполнить первые четыре промпта, чтобы на их основе перейти к CMS-решению и коду;
- публичный B2B-раздел Kubtel был повторно сверён по услугам, фактам, старым конфигураторам и маршрутам;
- текущий проект уже имеет local content layer и lead workflow, поэтому артефакты сразу оформлены как входы для будущих CMS-моделей и B2B lead schema.

Результат:

- собрана B2B-инвентаризация истины для интернета в офис, телефонии, видеонаблюдения, Wi-Fi авторизации, VPS/VDS, VDI, colocation, доступа в ЦОД, операторов связи и госсектора;
- для каждой услуги зафиксированы текущий смысл, бизнес-польза, доказательные факты, слабые места, коммерческие/CMS-поля, CTA и приоритет;
- составлен список недостающих данных Kubtel и таблица переноса старых `/legal/**` страниц в новые `/business/**` маршруты;
- сформулировано B2B positioning statement без пустого клише "надежный партнер";
- построена сегментная матрица для малого бизнеса, среднего бизнеса, IT/инфраструктуры, операторов и госсектора;
- спроектирована B2B IA: routes, navigation, subnav, mobile navigation, sticky CTA, components and CMS dependencies;
- спроектирована B2B conversion flow map, lead scoring, analytics event map и CRM payload contract.

Проверка:

- публичные источники проверены через `kubtel.ru`;
- статусы фактов разделены на `confirmed`, `needs_verification` и `draft`;
- артефакт связан с текущими content contracts и следующим этапом CMS-моделирования.

Ограничения:

- актуальные B2B-цены, SLA, география покрытия, юридические тексты и CRM pipeline остаются внешними входами;
- документ не реализует маршруты `/business/**` в коде, а задает утверждаемую основу для CMS selection, CMS models и B2B MVP.

Статус: completed для Prompts 01-04; CMS decision and implementation pending.

### Выполнен Prompt 05: CMS selection и ADR

Файл:

- `docs/cms-selection-adr.md`.

Связанные решения:

- `docs/decision-log.md`, ADR-013.

Контекст:

- после B2B-инвентаризации и IA нужно выбрать CMS до проектирования моделей и кода интеграционного слоя;
- требования Kubtel: редакторы не должны работать через код, нужен self-host/control, preview, roles/workflow, structured content, B2B-калькуляторы, proof statuses и дизайн-настройки;
- текущий Astro-проект уже имеет local content layer, Zod validation и изолированные lead/integration adapters.

Проверка источников:

- официальные docs Strapi, Directus, Sanity и Storyblok проверены 2026-05-08;
- отдельно сверены Strapi Content-type Builder, Draft & Publish, Preview, RBAC, Review Workflows, Releases;
- отдельно сверены Directus Many-to-Any blocks, Content Versioning, Flows и pricing/licensing;
- отдельно сверены Sanity Astro integration, Visual Editing, schema/content migrations, Studio deployment и pricing/roles;
- отдельно сверены Storyblok Visual Editor, Blocks, Workflows, Roles, Astro package и pricing.

Результат:

- основным вариантом для POC выбран Strapi 5 self-hosted + PostgreSQL;
- запасным вариантом выбран Directus self-hosted + PostgreSQL;
- Sanity и Storyblok не выбраны основными из-за SaaS-зависимости и большего vendor lock-in при текущем приоритете self-host/control;
- зафиксированы decision drivers, сравнительная таблица, weighted score, риски, plan guidance и proof of concept checklist;
- зафиксировано правило: Astro-компоненты не получают сырые CMS-ответы, CMS подключается только через `src/lib/cms/` adapter и внутренние TypeScript/Zod contracts.

Ограничения:

- production-выбор требует подтверждения Kubtel по legal/security, бюджету, data residency, backup, SSO, workflow и support;
- CMS пока не поднята локально и не подключена к Astro;
- Prompt 06 должен спроектировать модели под Strapi-first POC, но сохранить возможность заменить Strapi на Directus через adapter.

Статус: completed для Prompt 05; CMS models and adapter planning pending.

### Выполнен Prompt 06: CMS-модели

Файл:

- `docs/cms-content-models.md`.

Контекст:

- после CMS ADR нужно спроектировать модели так, чтобы Strapi 5 был первым POC-target, но Astro-компоненты оставались независимыми от конкретной CMS;
- входами стали текущие Astro content collections, domain types, lead schema, B2B IA/воронка и CMS ADR.

Результат:

- описана двухслойная модель: Strapi CMS layer и internal TypeScript/Zod layer;
- зафиксирован workflow `draft -> ready_for_review -> commercial_approved -> legal_approved -> published -> archived`;
- описаны роли admin, developer, content editor, commercial reviewer и legal reviewer;
- для моделей Page, NavigationItem, SeoMeta, MediaAsset, ProofPoint, ContentSource, CommercialReview, Tariff, TariffOption, Service, BusinessService, BusinessSegment, BusinessSolution, BusinessOffer, BusinessCalculator, CalculatorOption, HardwareItem, SLAFeature, CaseStudy, FAQItem, CoverageArea, Promo, LeadFormVariant, LegalDocument, DesignTheme и DesignTokenSet зафиксированы поля, типы, обязательность, связи, владельцы, workflow/validation, использование в Astro и private/server-only поля;
- подготовлены Zod-псевдосхемы для будущего `src/lib/cms/schemas.ts`;
- описаны Strapi collection types, reusable components и разрешенные Dynamic Zones;
- подготовлена migration map из текущих `src/content/tariffs`, `services`, `faq`, `coverage`, `promos` и `src/config/routes.ts`;
- добавлены import order и редакторский guide для менеджеров.

Ограничения:

- CMS пока не поднята и не подключена;
- Zod-схемы пока являются проектным контрактом в документации, а не кодом в `src/lib/cms`;
- фактические коммерческие данные, SLA, legal texts и production CRM-routing по-прежнему требуют подтверждения Kubtel.

Статус: completed для Prompt 06; Astro CMS integration layer pending.

### Выполнен Prompt 07: Astro CMS integration layer

Файлы:

- `src/lib/cms/types.ts`;
- `src/lib/cms/schemas.ts`;
- `src/lib/cms/normalizers.ts`;
- `src/lib/cms/cms-adapter.ts`;
- `src/lib/cms/local-content-adapter.ts`;
- `src/lib/cms/strapi-adapter.ts`;
- `src/lib/cms/index.ts`;
- `src/lib/cms/*.test.ts`;
- `src/lib/content.ts`;
- `.env.example`;
- `docs/cms-integration-layer.md`;
- `docs/project-state.md`;
- `docs/implementation-log.md`.

Контекст:

- после CMS-моделей нужно было ввести source-independent boundary, чтобы текущие Astro-компоненты не зависели от Strapi;
- текущие страницы уже использовали `src/lib/content.ts`, поэтому этот файл стал стабильной фасадной точкой поверх нового `src/lib/cms/`.

Результат:

- добавлен `CmsAdapter` interface с local и Strapi provider-ами;
- добавлен `localContentAdapter`, который читает текущие Astro content collections и валидирует их через Zod-схемы;
- добавлен `strapiAdapter`, который читает Strapi REST endpoints, нормализует payload, поддерживает preview mode, bearer token и in-memory cache;
- добавлены normalizers для Strapi entity/list shape и recursive stripping private CMS fields;
- добавлен fallback strategy: `CMS_PROVIDER=strapi` может возвращаться к local content при `CMS_FALLBACK_TO_LOCAL=true`;
- `src/lib/content.ts` переведен на `createCmsAdapter()`, сохранив текущие public functions для страниц;
- `.env.example` расширен CMS-переменными;
- добавлены тесты для схем, normalizers и Strapi adapter.

Проверка:

- `npm test` выполнен: 11 test files, 29 tests passed;
- `npm run check` выполнен: 0 errors, 0 warnings, 0 hints.

Ограничения:

- Strapi runtime пока не поднят;
- реальные Strapi collection API IDs и populate strategy нужно подтвердить на POC;
- preview route и webhook invalidation будут частью следующих CMS implementation этапов;
- B2B routes пока не реализованы, но adapter уже содержит B2B read methods.

Статус: completed для Prompt 07; migration plan pending.
