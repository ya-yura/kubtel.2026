# Доступ, администрирование и изменение шаблонов сайта Kubtel

Документ описывает, как сейчас управлять сайтом, где находится "админская" часть, как менять контент и шаблоны, как собирать проект и как применять изменения.

## Коротко

В текущей версии у сайта нет отдельной веб-админки с адресом вида `/admin`, логином и паролем.

Система управления сейчас состоит из:

- GitHub-репозитория;
- локальной рабочей папки;
- JSON-файлов контента;
- Astro-шаблонов и компонентов;
- production-переменных окружения на хостинге;
- проверочных команд `npm`.

Это сделано осознанно: контент уже отделен от интерфейса, поэтому позже можно подключить Headless CMS без переписывания страниц.

## Где находится управление

| Зона | Где находится | Для чего нужна |
| --- | --- | --- |
| Репозиторий | `https://github.com/ya-yura/kubtel.2026.git` | код, контент, шаблоны, история изменений |
| Локальная папка | `O:\Dev\kubtel-best-redesign` | рабочая копия проекта |
| Контент | `src/content/**` | тарифы, услуги, FAQ, покрытие, промо |
| Шаблоны страниц | `src/pages/**` | структура отдельных URL |
| Общий layout | `src/layouts/BaseLayout.astro` | HTML-каркас, SEO, JSON-LD, общая обертка |
| Компоненты | `src/components/**` | секции, карточки, форма, header/footer |
| Стили | `src/styles/global.css` | визуальная система и адаптивность |
| Конфиги сайта | `src/config/site.ts`, `src/config/routes.ts` | бренд, origin, навигация, title/description, sitemap |
| Схемы контента | `src/content.config.ts` | правила полей для JSON-контента |
| Интеграции | `src/actions/**`, `src/lib/integrations/**`, `src/lib/leads/**` | заявки, CRM, Telegram, outbox, антиспам |
| Health endpoint | `/api/health.json` | runtime-проверка production |

## Доступы и роли

### Администратор репозитория

Что должен иметь:

- доступ к GitHub-репозиторию;
- включенную 2FA в GitHub;
- право создавать ветки, pull request и merge/deploy по согласованному процессу.

Что может делать:

- менять код, контент и шаблоны;
- обновлять зависимости;
- управлять CI/CD и релизными ветками;
- назначать доступы другим участникам.

### Редактор контента

Что должен иметь:

- доступ к репозиторию с правом создать ветку или pull request.

Что может делать:

- менять файлы в `src/content/**`;
- править тексты, тарифы, FAQ, промо и coverage;
- менять статусы достоверности `draft`, `needs_verification`, `confirmed`.

Что нельзя делать без согласования:

- менять production-секреты;
- менять серверную логику заявок;
- публиковать неподтвержденные цены, SLA, coverage или юридические тексты как `confirmed`.

### Release manager

Что делает:

- запускает `npm run launch:check`;
- отдельно запускает UX smoke при поднятом сервере;
- проверяет production-домен, DNS, SSL, redirects и `/api/health.json`;
- подтверждает, что форма заявки реально доходит в CRM, Telegram или outbox.

### Оператор интеграций

Что должен иметь:

- доступ к CRM webhook;
- Telegram bot token;
- Telegram sales chat id;
- analytics webhook;
- доступ к панели хостинга для установки env-переменных.

Важно: реальные секреты не коммитятся в репозиторий. Для примера используется только `.env.example`.

### Оператор продаж

Что делает:

- получает заявки в CRM или Telegram;
- подтверждает, что заявка понятна и содержит нужные поля;
- передает обратную связь по качеству заявок и частым вопросам клиентов.

## Переменные окружения

Шаблон лежит в `.env.example`. Локальный `.env` и production env не хранятся в git.

| Переменная | Назначение |
| --- | --- |
| `PUBLIC_SITE_URL` | боевой HTTPS origin сайта |
| `CRM_WEBHOOK_URL` | endpoint CRM для заявок |
| `CRM_WEBHOOK_SECRET` | секрет подписи CRM-запроса, если используется |
| `TELEGRAM_BOT_TOKEN` | токен Telegram-бота |
| `TELEGRAM_SALES_CHAT_ID` | чат отдела продаж |
| `ANALYTICS_WEBHOOK_URL` | endpoint серверной аналитики |
| `ANALYTICS_WEBHOOK_SECRET` | секрет аналитического webhook |
| `LEAD_OUTBOX_DIR` | путь серверного резерва заявок |

Если CRM/Telegram не настроены, заявка сохраняется в outbox. Для production это резервный режим, а не полноценная замена CRM.

## Локальный запуск

Первый запуск или установка зависимостей:

```bash
npm install
```

Запуск dev-сервера:

```bash
npm run dev
```

Адрес:

```text
http://127.0.0.1:4321/
```

На Windows также есть быстрый запуск:

```bat
start-kubtel-site.bat
```

## Сборка и проверки

Базовая проверка типов, Astro и content collections:

```bash
npm run check
```

Полный тестовый набор:

```bash
npm test
```

Предрелизный аудит:

```bash
npm run test:prelaunch
```

Launch-аудит:

```bash
npm run test:launch
```

Форматирование:

```bash
npm run format
```

Проверка форматирования:

```bash
npm run format:check
```

Production-сборка:

```bash
npm run build
```

Единая проверка перед релизом:

```bash
npm run launch:check
```

Она выполняет:

- `npm audit --omit=dev`;
- `npm run test:prelaunch`;
- `npm run test:launch`;
- `npm run check`;
- `npm run build`.

UX smoke запускается отдельно, когда dev-сервер уже поднят:

```bash
npm run dev
npm run test:ux
```

## Как устроены шаблоны

### Страницы

Страницы лежат в `src/pages/**`.

Основные страницы:

- `src/pages/index.astro` - главная;
- `src/pages/tariffs/index.astro` - тарифы;
- `src/pages/connect.astro` - подключение;
- `src/pages/support.astro` - поддержка и FAQ;
- `src/pages/contacts.astro` - контакты;
- `src/pages/about.astro` - о компании.

Страница обычно:

1. импортирует `BaseLayout`;
2. получает данные через helpers из `src/lib/content.ts`;
3. собирает нужные секции из `src/components/**`;
4. передает title, description, canonical и schema в layout.

### Layout

`src/layouts/BaseLayout.astro` отвечает за:

- базовую HTML-структуру;
- canonical;
- robots;
- Open Graph;
- Twitter summary;
- JSON-LD;
- header/footer/sticky CTA;
- подключение глобальных стилей.

Менять layout нужно осторожно: ошибка здесь затрагивает все страницы.

### Компоненты

`src/components/layout/**`:

- `Header.astro`;
- `Footer.astro`;
- `StickyCta.astro`.

`src/components/sections/**`:

- крупные секции страниц;
- hero;
- тарифы;
- услуги;
- FAQ;
- форма проверки адреса;
- сценарии поддержки.

`src/components/ui/**`:

- малые переиспользуемые UI-части, например карточка тарифа.

### Стили

Основные стили находятся в `src/styles/global.css`.

Там лежат:

- цветовые токены;
- типографика;
- сетки;
- состояния hover/focus/disabled;
- адаптивность;
- стили форм;
- стили карточек и секций.

При изменении CSS обязательно проверить mobile и desktop.

### Контент

Контент лежит в `src/content/**`.

| Что меняем | Где менять |
| --- | --- |
| тарифы | `src/content/tariffs/*.json` |
| услуги | `src/content/services/*.json` |
| FAQ | `src/content/faq/*.json` |
| покрытие | `src/content/coverage/*.json` |
| акции | `src/content/promos/*.json` |

Схемы полей описаны в `src/content.config.ts`. Если добавить новое обязательное поле, нужно обновить:

- JSON-файлы соответствующей коллекции;
- типы в `src/types/domain.ts`, если поле используется в коде;
- компоненты, которые выводят это поле;
- тесты и документацию.

## Что править в типовых задачах

### Изменить цену или скорость тарифа

1. Открыть нужный файл в `src/content/tariffs/*.json`.
2. Изменить `priceMonth`, `speedDownload`, `speedUpload`, опции или текст.
3. Обновить `commercialReview`.
4. Если данные подтверждены, поставить соответствующие статусы `confirmed`.
5. Запустить:

```bash
npm run test:prelaunch
npm run check
npm run build
```

### Добавить новый тариф

1. Скопировать существующий JSON из `src/content/tariffs`.
2. Переименовать файл и `slug`.
3. Заполнить цену, скорость, аудиторию, опции, proof и `commercialReview`.
4. Проверить, что `slug` уникален.
5. При необходимости обновить связанные услуги, coverage и промо.
6. Запустить:

```bash
npm run test:prelaunch
npm run check
npm run build
```

### Изменить текст на странице

Если текст приходит из JSON, менять файл в `src/content/**`.

Если текст зашит в интерфейсной секции, менять компонент в `src/components/sections/**` или страницу в `src/pages/**`.

После изменения:

```bash
npm run format
npm run check
npm run build
```

### Изменить hero главной

Обычно нужны:

- `src/components/sections/Hero.astro`;
- `src/pages/index.astro`, если меняется состав секций;
- `src/styles/global.css`, если меняется визуальная композиция.

Проверить:

- первый экран на mobile;
- CTA;
- отсутствие перекрытий текста;
- Lighthouse/UX smoke при значимых изменениях.

### Изменить форму заявки

Форма затрагивает несколько слоев:

- UI: `src/components/sections/AddressCheckPanel.astro`;
- server action: `src/actions/index.ts`;
- схема валидации: `src/lib/leads/schema.ts`;
- сборка заявки: `src/lib/leads/submission.ts`;
- outbox: `src/lib/leads/outbox.ts`;
- интеграции: `src/lib/integrations/**`;
- тесты: `src/lib/leads/*.test.ts`, `src/lib/prelaunch/*.test.ts`.

После изменения формы обязательно:

```bash
npm test
npm run test:prelaunch
npm run check
npm run build
```

И вручную проверить успешную и ошибочную отправку на `/`, `/connect/`, `/tariffs/`.

### Добавить новую страницу

1. Создать файл в `src/pages`, например `src/pages/new-page.astro`.
2. Использовать `BaseLayout`.
3. Добавить metadata в `src/config/routes.ts`.
4. Если страница должна быть в меню, добавить пункт в `mainNavItems` или `footerNavItems`.
5. Если нужна Schema.org-разметка, добавить helper или использовать существующий из `src/lib/seo/schema.ts`.
6. Запустить:

```bash
npm run check
npm run build
```

7. Проверить, что страница попала в sitemap, если должна индексироваться.

### Изменить SEO title или description

1. Открыть `src/config/routes.ts`.
2. Изменить `title`, `description`, `priority`, `changeFrequency` или `lastModified`.
3. Если менялся canonical/origin, проверить `src/config/site.ts`.
4. Запустить:

```bash
npm run check
npm run build
```

5. Проверить `/sitemap.xml` и нужную страницу.

## Как применять изменения

### Локально

1. Внести изменения.
2. Запустить форматирование:

```bash
npm run format
```

3. Запустить проверки:

```bash
npm test
npm run test:prelaunch
npm run check
npm run build
```

4. Запустить сайт:

```bash
npm run dev
```

5. Проверить страницу в браузере на `http://127.0.0.1:4321/`.
6. Если менялись UX, форма или адаптивность, выполнить:

```bash
npm run test:ux
```

### Через GitHub

1. Создать ветку под задачу.
2. Внести изменения.
3. Запустить проверки локально.
4. Сделать commit.
5. Отправить ветку в GitHub.
6. Создать pull request.
7. Проверить diff, preview и результаты проверок.
8. Выполнить merge/deploy после согласования.

### На production

1. Убедиться, что production env настроены на хостинге.
2. Выполнить deploy из согласованной ветки.
3. После deploy проверить:

```text
/api/health.json
/ 
/tariffs/
/connect/
/support/
/contacts/
/about/
/sitemap.xml
/robots.txt
```

4. Отправить тестовую заявку.
5. Подтвердить доставку заявки в CRM, Telegram или outbox.
6. Проверить analytics-событие `lead_submitted`.
7. Проверить DNS, SSL, redirects и canonical origin.

Важно: любые изменения JSON-контента и Astro-шаблонов требуют пересборки и redeploy. Это не live-CMS, где правка мгновенно появляется на сайте.

## Минимальный регламент перед публикацией

Перед публикацией должны пройти:

```bash
npm run launch:check
```

При поднятом локальном сервере:

```bash
npm run test:ux
```

Production-блокеры, которые нельзя закрыть кодом:

- боевой `PUBLIC_SITE_URL`;
- DNS и SSL;
- CRM webhook;
- Telegram bot token и sales chat id;
- analytics webhook;
- подтвержденная тарифная матрица;
- подтвержденная coverage-база;
- юридические тексты и реквизиты оператора;
- согласованный процесс обработки заявок отделом продаж.

## Что нужно для будущей полноценной админки

Будущая CMS должна подключаться к уже существующему content layer.

Минимальные разделы CMS:

- тарифы;
- услуги;
- FAQ;
- coverage;
- промо;
- route metadata;
- media assets, если появятся реальные изображения.

Минимальные роли:

- `admin`;
- `editor`;
- `viewer`.

Обязательные функции CMS:

- предпросмотр перед публикацией;
- журнал изменений;
- статусы `draft`, `needs_verification`, `confirmed`;
- запрет публикации тарифов, промо, coverage и юридических текстов без подтверждения владельца;
- разграничение доступа к секретам: CMS не должна показывать CRM/Telegram tokens редакторам контента.

До подключения CMS репозиторий является системой управления сайтом.
