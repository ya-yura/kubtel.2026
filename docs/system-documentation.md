# Система Kubtel: архитектура, дизайн-система и управление

## 1. Назначение

Сайт разделён на стабильный интерфейсный слой и изменяемый контентный слой. Это позволяет обновлять тарифы, услуги, FAQ и вакансии без переписывания страниц, а изменения внешнего вида проводить через токены и переиспользуемые компоненты.

Главные принципы:

- существующие URL и формат завершающего слеша сохраняются;
- контент не зашит в шаблоны, если он может меняться редактором;
- коммерческие и юридические данные проходят отдельные статусы проверки;
- отсутствие CMS не должно выключать сайт: включён local fallback;
- production-секреты не попадают в Git, CMS и клиентский JavaScript;
- изменения идут коммитами, проверяются в CI и только затем попадают в production.

## 2. Технологический состав

| Слой                    | Реализация                             | Назначение                                                  |
| ----------------------- | -------------------------------------- | ----------------------------------------------------------- |
| Frontend/server runtime | Astro 7.1.3 + `@astrojs/node`          | SSR, страницы, формы и health endpoint                      |
| Язык                    | TypeScript                             | типы компонентов, домена, контентных схем и интеграций      |
| Стили                   | CSS custom properties                  | токены и responsive UI без CSS-фреймворка                   |
| Основной CMS-вход       | Decap CMS 3.8.3                        | бесплатный редактор контента через GitHub                   |
| Резервный CMS-контур    | Strapi 5 scaffold                      | опциональный путь для PostgreSQL, ролей и сложного workflow |
| Данные по умолчанию     | JSON в `src/content/**`                | версия контента в Git и fallback при сбое CMS               |
| SEO                     | canonical, sitemap, robots, JSON-LD    | управляются из Astro layout и route metadata                |
| Интеграции              | CRM webhook, Telegram, SMTP, analytics | только server-side через env                                |

## 3. Карта репозитория

- `src/pages/**` — публичные страницы; файл и путь страницы являются SEO-контрактом.
- `src/components/layout/**` — шапка, footer, sticky CTA.
- `src/components/sections/**` — композиции страниц и крупные блоки.
- `src/components/ui/**` — базовые переиспользуемые компоненты.
- `src/layouts/BaseLayout.astro` — HTML shell, мета-теги, schema.org, подключение общего UI.
- `src/design/tokens/**` — единственный источник дизайн-токенов.
- `src/styles/tokens.css` — generated-файл, не редактировать вручную.
- `src/styles/global.css` — стили компонентов и responsive composition.
- `src/content/**` — локальные JSON-коллекции.
- `src/lib/cms/**` — адаптеры local/Strapi и нормализация данных.
- `public/admin/**` — CMS UI и Git-based конфигурация.
- `public/visuals/**` — публичные изображения.
- `cms/strapi/**` — отдельный необязательный Strapi workspace.
- `docs/**` — эксплуатационные и продуктовые договорённости.

## 4. Дизайн-система

Токены хранятся в JSON по слоям:

1. `primitives.json` — цвета, шрифт, размеры, радиусы, motion, breakpoints.
2. `semantic.json` — роли: текст, фон, action, status, focus, interaction.
3. `components.json` — контракты кнопки, карточки, поля, hero, header, tabs и др.
4. `compositions.json` — сетки и шаблоны страниц.
5. `business.json` — тёмная B2B-вариация.
6. `themes/*.json` — light, business и readable overrides.

После изменения исходников выполнить:

```bash
npm run tokens:build
npm run tokens:check
npm run design:verify
```

Нельзя вводить raw hex/rgb, локальные тени, произвольные z-index, новые радиусы или новые размеры прямо в редакторский контент. Новый визуальный паттерн сначала получает токен и компонентный контракт, затем используется на страницах.

Страница `/design-system/` — внутренний noindex-showcase с образцами foundations, components, recipes и themes.

## 5. CMS и контент

### Decap CMS

`/admin/` редактирует JSON в GitHub через `public/admin/config.yml`. Коллекции: тарифы, услуги, FAQ и вакансии. После сохранения создаётся commit/PR, а deploy запускается только после CI и review.

Открывать CMS нужно по HTTP(S):

```text
http://127.0.0.1:4321/admin/
https://<production-domain>/admin/
```

Открытие `public/admin/index.html` двойным кликом (`file://`) не поддерживается браузером: fetch к `config.yml` блокируется CORS-моделью file-протокола. Страница показывает это явно и не маскирует ошибку.

### Strapi

Strapi остаётся в репозитории как необязательная миграционная/enterprise-ветка. Он требует отдельного runtime, PostgreSQL, резервирования базы и администраторского доступа. Подключается переменными `CMS_PROVIDER=strapi`, `STRAPI_URL`, `STRAPI_API_TOKEN` и `CMS_FALLBACK_TO_LOCAL=true` на переходный период.

### Статусы достоверности

- `confirmed` — проверено ответственным источником.
- `needs_verification` — требует сверки; не использовать как безусловное обещание.
- `draft` — рабочая гипотеза; не публиковать как подтверждённое коммерческое условие.

Тарифы дополнительно проверяют отдельно цену, скорость, опции и подключение через `commercialReview`.

## 6. SEO-контракт

Стабильные маршруты перечислены в `src/config/routes.ts`. Ключевые публичные пути:

```text
/
/individual/
/individual/configurator/
/individual/internet/
/individual/tv/
/individual/cctv/
/business/
/business/<slug>/
/business/request/
/business/datacenter-access/
/payment/
/support/
/news/
/documents/
/about/
/careers/
/contacts/
/devices/
/search/
```

Правила:

- `trailingSlash: "always"` не менять без миграции URL;
- опубликованный slug не переименовывать без 301 redirect;
- legacy B2B-пути обслуживаются `src/lib/redirects/business-legacy.ts`;
- legacy B2B-услуги не генерируются как отдельные HTML-страницы: они дают 301 на новый запрос или калькулятор;
- `canonical`, `sitemap.xml`, `robots.txt` формируются Astro;
- `/design-system/` остаётся `noindex`;
- любые новые страницы добавляются одновременно в page, metadata и sitemap contract.

## 7. Формы и безопасность

Формы проверяются Zod-схемами, rate limit, honeypot и серверной обработкой. Публичный frontend не получает CRM, SMTP, Telegram или Strapi секреты. `LEAD_OUTBOX_DIR` должен быть вне public root и иметь права только для service user.

Тестовая заявка на production выполняется только после согласования с владельцем процесса, потому что содержит контактные данные и создаёт внешнее действие. Логи не должны содержать полный телефон, e-mail, адрес или текст заявки.

## 8. Рабочий процесс изменения

1. Изменение оформляется веткой от `main`.
2. Контент — через `/admin/`; код — через PR.
3. CI запускает форматирование, unit tests, type check, token check и build.
4. Для production merge требует review владельца сайта и ИТ/release owner.
5. Production deploy выполняется по commit SHA или tag, а не по непредсказуемому состоянию рабочей папки.
6. После deploy выполняется health, smoke, SEO и доставка тестовой заявки согласно change window.
7. Rollback возвращает предыдущий good commit/tag и не удаляет текущий backup.
