# Kubtel: инструкция по production-развертыванию, управлению контентом и дальнейшей разработке

Документ описывает практический порядок запуска сайта Kubtel на боевом сервере, ежедневное управление контентом и регламент для программистов. Он написан для трех ролей:

- администратора сервера;
- контент-редактора или менеджера сайта;
- разработчиков, которые будут продолжать проект.

## 1. Что именно разворачивается

Сайт построен на Astro 6 и собирается в Node standalone runtime через `@astrojs/node`.

Важный вывод: production-сайт нужно запускать как Node-приложение за reverse proxy, а не как обычную статическую папку.

Причина:

- формы подключения на `/`, `/connect/`, `/tariffs/` работают через серверный POST;
- B2B-заявка на `/business/request/` работает через серверный POST;
- отклики на вакансии работают через серверный POST;
- `/api/health.json` является runtime endpoint;
- CRM, Telegram, analytics и outbox используют server-side переменные окружения.

GitHub Pages workflow в `.github/workflows/pages.yml` собирает только static preview. Его можно использовать для визуального предпросмотра, но не как полноценный боевой запуск с рабочими заявками.

Поведение static preview:

- `PUBLIC_STATIC_PREVIEW=true` переводит Astro в статическую сборку для GitHub Pages;
- формы B2C, B2B, B2G, ЦОД и вакансий не показывают фиктивный success-state;
- при отправке формы на Pages пользователь получает сообщение "не отправлена с этого адреса" и прямой телефон/e-mail;
- онлайн-оплата ведет только на официальную страницу Kubtel `https://kubtel.ru/individual/pay/`;
- юридические лица и B2G не направляются в онлайн-оплату физлиц, а получают маршрут на запрос документов или прямые контакты.

## 2. Состав проекта

Основные зоны:

| Зона | Путь | Назначение |
| --- | --- | --- |
| Astro frontend | `src/pages/**`, `src/components/**`, `src/layouts/**` | страницы, секции, layout |
| Стили | `src/styles/**` | глобальные стили и generated tokens |
| Дизайн-токены | `src/design/tokens/**` | source of truth для цветов, типографики, spacing |
| Локальный контент | `src/content/**` | тарифы, услуги, FAQ, coverage, промо, вакансии |
| CMS adapter | `src/lib/cms/**` | переключение между local content и Strapi |
| Заявки | `src/lib/leads/**`, `src/lib/integrations/**` | формы, CRM, Telegram, outbox |
| Strapi CMS MVP | `cms/strapi/**` | отдельная CMS-заготовка |
| Документация | `docs/**` | проектные решения, QA, CMS, запуск |

## 3. Production-архитектура

Рекомендуемая схема:

```text
Internet
  -> DNS
  -> Nginx / Caddy / Traefik на 443
  -> Node.js процесс Astro на 127.0.0.1:4321
  -> CRM webhook / Telegram / analytics webhook
  -> server outbox как резерв заявок
```

Если используется Strapi CMS:

```text
Internet
  -> kubtel.ru -> Nginx -> Astro Node runtime
  -> cms.kubtel.ru или private network -> Strapi Node runtime
  -> PostgreSQL для Strapi
  -> backup базы и media uploads
```

## 4. Требования к серверу

Минимально:

- Linux VPS или выделенный сервер;
- Ubuntu 22.04/24.04 LTS или другой современный Linux;
- Node.js 22 LTS или новее;
- npm;
- Git;
- Nginx или аналогичный reverse proxy;
- systemd для автозапуска;
- HTTPS-сертификат, например Let's Encrypt;
- доступ к DNS домена;
- закрытый доступ к production secrets.

Если поднимается Strapi:

- PostgreSQL 15/16;
- отдельная база для CMS;
- backup базы;
- backup media uploads;
- отдельные секреты Strapi.

## 5. Production env

Шаблон переменных лежит в `.env.example`. Реальные значения нельзя коммитить в Git.

На сервере удобно хранить env в `/etc/kubtel-site.env`.

Минимальный пример:

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=4321

PUBLIC_SITE_URL=https://kubtel.ru
PUBLIC_BASE_PATH=/

CMS_PROVIDER=local
CMS_PREVIEW_MODE=false
CMS_FALLBACK_TO_LOCAL=true
CMS_CACHE_TTL_SECONDS=60

CRM_WEBHOOK_URL=https://crm.example.ru/webhook/kubtel
CRM_WEBHOOK_SECRET=replace-with-secret

TELEGRAM_BOT_TOKEN=replace-with-token
TELEGRAM_SALES_CHAT_ID=replace-with-chat-id
TELEGRAM_HR_CHAT_ID=replace-with-hr-chat-id

ANALYTICS_WEBHOOK_URL=https://analytics.example.ru/events
ANALYTICS_WEBHOOK_SECRET=replace-with-secret

LEAD_OUTBOX_DIR=/var/lib/kubtel-site/lead-outbox
```

Если Astro читает Strapi:

```env
CMS_PROVIDER=strapi
STRAPI_URL=https://cms.kubtel.ru
STRAPI_API_TOKEN=replace-with-read-token
STRAPI_WRITE_API_TOKEN=replace-with-write-token-if-needed
STRAPI_PREVIEW_SECRET=replace-with-preview-secret
CMS_FALLBACK_TO_LOCAL=true
```

Назначение важных переменных:

| Переменная | Назначение |
| --- | --- |
| `PUBLIC_SITE_URL` | боевой origin сайта, нужен для canonical, sitemap, robots и SEO |
| `PUBLIC_BASE_PATH` | обычно `/`; менять только при публикации в подпапку |
| `CMS_PROVIDER` | `local` или `strapi` |
| `CMS_FALLBACK_TO_LOCAL` | если `true`, сайт может читать локальный контент при сбое Strapi |
| `STRAPI_URL` | серверный URL Strapi |
| `STRAPI_API_TOKEN` | server-only read token Strapi |
| `CRM_WEBHOOK_URL` | endpoint CRM для заявок |
| `CRM_WEBHOOK_SECRET` | секрет подписи CRM payload |
| `TELEGRAM_BOT_TOKEN` | токен Telegram-бота |
| `TELEGRAM_SALES_CHAT_ID` | чат продаж для B2C/B2B заявок |
| `TELEGRAM_HR_CHAT_ID` | HR-чат для откликов на вакансии |
| `ANALYTICS_WEBHOOK_URL` | серверная аналитика без персональных данных |
| `LEAD_OUTBOX_DIR` | резервная папка заявок, должна быть закрыта от публичного доступа |

## 6. Первый deploy сайта на сервер

Пример ниже использует `/srv/kubtel-site` как рабочую директорию.

### 6.1. Подготовить пользователя и папки

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin kubtel
sudo mkdir -p /srv/kubtel-site
sudo mkdir -p /var/lib/kubtel-site/lead-outbox
sudo chown -R kubtel:kubtel /srv/kubtel-site /var/lib/kubtel-site
sudo chmod 750 /var/lib/kubtel-site/lead-outbox
```

### 6.2. Установить Node.js 22 LTS

Один из вариантов через NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

### 6.3. Получить код

```bash
sudo -u kubtel git clone https://github.com/ya-yura/kubtel.2026.git /srv/kubtel-site
cd /srv/kubtel-site
sudo -u kubtel git checkout main
```

Если production запускается из release tag, вместо `main` используйте тег:

```bash
sudo -u kubtel git fetch --tags
sudo -u kubtel git checkout v2026.05.21
```

### 6.4. Установить зависимости

```bash
cd /srv/kubtel-site
sudo -u kubtel npm ci
```

### 6.5. Создать production env

```bash
sudo nano /etc/kubtel-site.env
sudo chown root:kubtel /etc/kubtel-site.env
sudo chmod 640 /etc/kubtel-site.env
```

Проверьте, что секреты не лежат в репозитории и не попадают в логи.

### 6.6. Запустить проверки перед сборкой

```bash
cd /srv/kubtel-site
sudo -u kubtel bash -lc 'set -a; source /etc/kubtel-site.env; set +a; npm run launch:check'
```

Эта команда выполняет:

- `npm audit --omit=dev`;
- `npm run tokens:check`;
- `npm run test:prelaunch`;
- `npm run test:launch`;
- `npm run check`;
- `npm run build`.

Если нет production CRM/Telegram/analytics или не подтверждены тарифы/юридика/coverage, prelaunch-аудит может указывать внешние launch-блокеры. Их нельзя игнорировать перед реальным публичным запуском.

### 6.7. Собрать production

Если `launch:check` уже прошел, сборка уже сделана. Для отдельной сборки:

```bash
cd /srv/kubtel-site
sudo -u kubtel bash -lc 'set -a; source /etc/kubtel-site.env; set +a; npm run build'
```

После сборки появятся:

```text
dist/client
dist/server
```

Стартовая команда:

```bash
node ./dist/server/entry.mjs
```

## 7. systemd service

Создайте unit:

```bash
sudo nano /etc/systemd/system/kubtel-site.service
```

Содержимое:

```ini
[Unit]
Description=Kubtel Astro site
After=network.target

[Service]
Type=simple
User=kubtel
Group=kubtel
WorkingDirectory=/srv/kubtel-site
EnvironmentFile=/etc/kubtel-site.env
ExecStart=/usr/bin/node /srv/kubtel-site/dist/server/entry.mjs
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Включить и запустить:

```bash
sudo systemctl daemon-reload
sudo systemctl enable kubtel-site
sudo systemctl start kubtel-site
sudo systemctl status kubtel-site
```

Логи:

```bash
sudo journalctl -u kubtel-site -f
```

Локальная проверка на сервере:

```bash
curl -i http://127.0.0.1:4321/api/health.json
curl -I http://127.0.0.1:4321/
```

## 8. Nginx reverse proxy

Пример для домена `kubtel.ru`:

```nginx
server {
    listen 80;
    server_name kubtel.ru www.kubtel.ru;

    return 301 https://kubtel.ru$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.kubtel.ru;

    ssl_certificate /etc/letsencrypt/live/kubtel.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kubtel.ru/privkey.pem;

    return 301 https://kubtel.ru$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kubtel.ru;

    ssl_certificate /etc/letsencrypt/live/kubtel.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kubtel.ru/privkey.pem;

    client_max_body_size 2m;

    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /_astro/ {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Проверить конфиг:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

HTTPS через Certbot:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d kubtel.ru -d www.kubtel.ru
```

## 9. Post-deploy checklist

После каждого deploy:

```bash
curl -i https://kubtel.ru/api/health.json
curl -I https://kubtel.ru/
curl -I https://kubtel.ru/tariffs/
curl -I https://kubtel.ru/connect/
curl -I https://kubtel.ru/support/
curl -I https://kubtel.ru/contacts/
curl -I https://kubtel.ru/about/
curl -I https://kubtel.ru/business/
curl -I https://kubtel.ru/business/request/
curl -I https://kubtel.ru/sitemap.xml
curl -I https://kubtel.ru/robots.txt
```

В браузере проверить:

- главную;
- тарифы;
- подключение;
- поддержку;
- контакты;
- B2B-страницы;
- страницу вакансий;
- мобильное меню;
- sticky CTA;
- форму B2C-заявки;
- форму B2B-заявки;
- форму отклика на вакансию.

Обязательно отправить тестовую заявку и подтвердить, что она дошла в один из каналов:

- CRM;
- Telegram sales chat;
- Telegram HR chat для вакансий;
- `/var/lib/kubtel-site/lead-outbox` как резерв.

Если заявка попала только в outbox, это допустимо как аварийный резерв, но не как нормальный production-режим.

## 10. Обновление сайта на бою

Типовой порядок:

```bash
cd /srv/kubtel-site
sudo -u kubtel git fetch origin
sudo -u kubtel git checkout main
sudo -u kubtel git pull --ff-only
sudo -u kubtel npm ci
sudo -u kubtel bash -lc 'set -a; source /etc/kubtel-site.env; set +a; npm run launch:check'
sudo systemctl restart kubtel-site
sudo systemctl status kubtel-site
```

После рестарта выполнить post-deploy checklist.

Если нужно собрать отдельно:

```bash
sudo -u kubtel bash -lc 'set -a; source /etc/kubtel-site.env; set +a; npm run build'
sudo systemctl restart kubtel-site
```

## 11. Rollback

Правильный rollback делается на предыдущий проверенный commit или tag.

```bash
cd /srv/kubtel-site
sudo -u kubtel git fetch --tags
sudo -u kubtel git checkout <previous-good-tag-or-commit>
sudo -u kubtel npm ci
sudo -u kubtel bash -lc 'set -a; source /etc/kubtel-site.env; set +a; npm run build'
sudo systemctl restart kubtel-site
```

После rollback:

- проверить `/api/health.json`;
- отправить тестовую заявку;
- проверить outbox;
- записать причину rollback в release notes или issue.

## 12. Мониторинг и эксплуатация

Минимально отслеживать:

- доступность `https://kubtel.ru/api/health.json`;
- HTTP 5xx в Nginx;
- ошибки `kubtel-site.service`;
- место на диске;
- заполнение outbox;
- доставку заявок в CRM/Telegram;
- срок действия SSL-сертификата;
- Core Web Vitals после запуска.

Команды:

```bash
sudo systemctl status kubtel-site
sudo journalctl -u kubtel-site --since "1 hour ago"
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
sudo find /var/lib/kubtel-site/lead-outbox -type f | wc -l
df -h
```

Резерв заявок содержит персональные данные. Доступ к нему должен быть только у администратора и ответственного оператора.

## 13. Как управлять контентом сейчас

До полноценного production-подключения Strapi основным источником контента являются JSON-файлы в репозитории.

Где менять:

| Что меняем | Где менять |
| --- | --- |
| тарифы | `src/content/tariffs/*.json` |
| услуги | `src/content/services/*.json` |
| FAQ | `src/content/faq/*.json` |
| покрытие | `src/content/coverage/*.json` |
| акции | `src/content/promos/*.json` |
| вакансии | `src/content/careers/*.json` |
| картинки | `public/visuals/**` |
| SEO и sitemap metadata | `src/config/routes.ts`, `src/config/site.ts` |
| меню и навигация | `src/config/routes.ts`, layout/header/footer |

Правило: любое изменение JSON-контента требует новой сборки и redeploy. Это не live-CMS.

### Изменить тариф

1. Открыть нужный файл в `src/content/tariffs/*.json`.
2. Изменить цену, скорость, опции, описание, CTA.
3. Обновить `commercialReview`.
4. Не ставить `confirmed`, если цена, скорость или условия не подтверждены коммерческим отделом.
5. Запустить:

```bash
npm run test:prelaunch
npm run check
npm run build
```

### Добавить тариф

1. Скопировать существующий тарифный JSON.
2. Задать новый уникальный `slug`.
3. Заполнить поля тарифа.
4. Проверить связанные услуги, FAQ, coverage и promo.
5. Запустить проверки.
6. Сделать Pull Request.

### Изменить FAQ

1. Открыть `src/content/faq/*.json`.
2. Писать вопрос так, как его задает клиент.
3. В ответе не обещать SLA, сроки, цены или юридические условия без подтверждения.
4. Если факт не подтвержден, ставить статус `needs_verification`.

### Изменить coverage

1. Открыть `src/content/coverage/*.json`.
2. Обновить зоны покрытия только на основании подтвержденной адресной базы.
3. Для спорных зон использовать осторожный статус, который ведет к ручной проверке.
4. После deploy отправить тестовую заявку с адресом из измененной зоны.

### Изменить акцию

1. Открыть `src/content/promos/*.json`.
2. Указать сроки, условия, связанные тарифы и CTA.
3. Проверить коммерческое и юридическое подтверждение.
4. Не публиковать акцию без даты окончания или ограничений.

### Изменить изображения

1. Класть файлы в `public/visuals/**`.
2. Использовать понятные имена: `home-fiber-living.png`, `business-vip-network.png`.
3. Оптимизировать размер перед commit.
4. Проверить мобильный и desktop вид.

### Что редактору нельзя менять без разработчика

- `src/lib/**`;
- `src/pages/**`;
- `src/components/**`;
- `src/styles/**`;
- `src/design/tokens/**`;
- env-переменные и секреты;
- CRM, Telegram, analytics;
- HTML, script, iframe-вставки;
- slug опубликованной страницы без redirect-задачи.

## 14. Как управлять контентом через Strapi

Strapi workspace лежит в `cms/strapi`. Сейчас это CMS MVP scaffold: схемы, seed, governance и adapter contract уже есть, но реальный production-инстанс нужно поднять отдельно.

Основные сущности:

- `Tariff`;
- `Service`;
- `FAQ Item`;
- `Coverage Area`;
- `Promo`;
- `Business Service`;
- `Business Segment`;
- `Business Calculator`;
- `Calculator Option`;
- `Lead Form Variant`;
- `Job Vacancy`;
- `Job Application`;
- `Design Theme`.

Роли:

- `admin`;
- `developer`;
- `content_editor`;
- `commercial_reviewer`;
- `legal_reviewer`.

Workflow:

```text
draft -> ready_for_review -> commercial_approved -> legal_approved -> published -> archived
```

Strapi Draft & Publish остается технической кнопкой публикации. Поле workflow объясняет, можно ли нажимать publish по смыслу.

### Локальный запуск Strapi

```bash
cd cms/strapi
npm install
npm run develop
```

Затем создать read-only API token и указать в Astro:

```env
CMS_PROVIDER=strapi
STRAPI_URL=http://127.0.0.1:1337
STRAPI_API_TOKEN=replace-with-token
CMS_FALLBACK_TO_LOCAL=true
```

Seed:

```bash
cd cms/strapi
KUBTEL_SEED_API_TOKEN=replace-with-token npm run seed
```

### Production Strapi

Создать env для Strapi, например `/etc/kubtel-strapi.env`:

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=1337

DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=kubtel_cms
DATABASE_USERNAME=kubtel_cms
DATABASE_PASSWORD=replace-with-password
DATABASE_SSL=false

APP_KEYS=replace,with,several,keys
API_TOKEN_SALT=replace-with-secret
ADMIN_JWT_SECRET=replace-with-secret
TRANSFER_TOKEN_SALT=replace-with-secret
JWT_SECRET=replace-with-secret
```

Установка:

```bash
cd /srv/kubtel-site/cms/strapi
npm ci
npm run build
npm run start
```

Для production нужно оформить Strapi как отдельный `systemd` service и закрыть admin-доступ:

- отдельный домен `cms.kubtel.ru` или VPN-only доступ;
- HTTPS;
- сильные пароли;
- 2FA, если доступно;
- backup PostgreSQL;
- backup media uploads;
- ограниченные API tokens.

После подключения Strapi к сайту:

1. В Strapi создать роли из `cms/strapi/config/kubtel-governance.json`.
2. Импортировать seed или перенести контент вручную.
3. Создать read-only API token.
4. На Astro production поставить `CMS_PROVIDER=strapi`.
5. Оставить `CMS_FALLBACK_TO_LOCAL=true` на период миграции.
6. Настроить webhook из Strapi publish/unpublish в deploy pipeline.
7. Не запускать rebuild на каждое сохранение draft.

## 15. Preview и публикация контента

Текущий безопасный процесс:

1. Редактор меняет контент в JSON или Strapi.
2. Контент получает статус `ready_for_review`.
3. Коммерческий reviewer подтверждает цены, скорости, SLA, coverage и акции.
4. Legal reviewer подтверждает юридические тексты, согласия, условия акций.
5. Разработчик или release manager собирает preview.
6. Проверяются desktop/mobile, формы, SEO и отсутствие пустых блоков.
7. После approval выполняется deploy.

Для Strapi:

- draft используется для черновика;
- preview должен читать `CMS_PREVIEW_MODE=true`;
- published frontend должен читать только опубликованные записи;
- webhook publish/unpublish должен запускать rebuild или redeploy.

## 16. Разработка: локальный старт

Требования:

- Node.js 22 LTS или новее;
- npm;
- Git.

Команды:

```bash
git clone https://github.com/ya-yura/kubtel.2026.git
cd kubtel.2026
npm install
npm run dev
```

Локальный адрес:

```text
http://127.0.0.1:4321/
```

На Windows можно использовать:

```bat
start-kubtel-site.bat
```

## 17. Разработка: обязательные команды

Перед Pull Request:

```bash
npm run format:check
npm test
npm run test:prelaunch
npm run test:launch
npm run check
npm run build
```

Перед релизом:

```bash
npm run launch:check
```

Если менялись UI, формы или адаптивность, поднять dev server и запустить:

```bash
npm run dev
npm run test:ux
```

Форматирование:

```bash
npm run format
```

Дизайн-токены:

```bash
npm run tokens:check
npm run tokens:build
```

## 18. Разработка: Git-процесс

Рекомендуемый процесс:

1. Создать ветку от `main`.
2. Внести изменения.
3. Запустить проверки.
4. Сделать commit с понятным сообщением.
5. Открыть Pull Request.
6. В PR описать:
   - что изменилось;
   - какие страницы затронуты;
   - какие проверки запускались;
   - есть ли внешние блокеры.
7. После ревью выполнить merge.
8. Выполнить deploy по регламенту.

Пример:

```bash
git checkout main
git pull --ff-only
git checkout -b feature/update-tariffs
npm run format:check
npm test
npm run build
git add .
git commit -m "Update tariff content"
git push origin feature/update-tariffs
```

## 19. Разработка: карта кода

### Страницы

`src/pages/**`:

- `index.astro` - главная;
- `tariffs/index.astro` - тарифы;
- `connect.astro` - подключение;
- `support.astro` - поддержка;
- `contacts.astro` - контакты;
- `about.astro` - о компании;
- `careers.astro` - вакансии;
- `business/index.astro` - B2B вход;
- `business/[slug].astro` - B2B услуги;
- `business/request.astro` - B2B заявка;
- `api/health.json.ts` - health endpoint.

### Layout

`src/layouts/BaseLayout.astro` отвечает за:

- HTML shell;
- SEO metadata;
- canonical;
- Open Graph;
- JSON-LD;
- header/footer;
- sticky CTA;
- подключение global styles.

Ошибка в layout влияет на весь сайт.

### Компоненты

`src/components/layout/**`:

- header;
- footer;
- sticky CTA.

`src/components/sections/**`:

- hero;
- тарифы;
- услуги;
- FAQ;
- формы;
- B2B-секции;
- калькуляторы.

`src/components/ui/**`:

- малые переиспользуемые UI-компоненты.

### Контентный слой

Страницы не должны напрямую знать, откуда пришли данные. Использовать helpers из:

```text
src/lib/content.ts
src/lib/cms/**
```

Это позволяет переключать источник между local JSON и Strapi через env.

### Формы и заявки

Ключевые файлы:

```text
src/lib/leads/form-handlers.ts
src/lib/leads/schema.ts
src/lib/leads/submission.ts
src/lib/leads/business-schema.ts
src/lib/leads/business-submission.ts
src/lib/careers/schema.ts
src/lib/careers/submission.ts
src/lib/integrations/crm.ts
src/lib/integrations/telegram.ts
src/lib/analytics/server.ts
src/lib/leads/outbox.ts
```

После изменения форм обязательно проверять:

- валидные отправки;
- ошибки валидации;
- rate limit;
- honeypot;
- доставку CRM;
- доставку Telegram;
- fallback в outbox.

## 20. Типовые задачи разработчика

### Добавить страницу

1. Создать файл в `src/pages`.
2. Использовать `BaseLayout`.
3. Добавить metadata в `src/config/routes.ts`.
4. Если страница должна быть в меню, обновить навигацию.
5. Если нужна Schema.org разметка, использовать `src/lib/seo/schema.ts`.
6. Запустить `npm run check` и `npm run build`.
7. Проверить `sitemap.xml`.

### Изменить форму заявки

Затронутые зоны:

- UI секция формы;
- Zod-схема;
- сборка доменной заявки;
- CRM/Telegram delivery;
- outbox;
- analytics;
- тесты.

Минимальный набор проверок:

```bash
npm test
npm run test:prelaunch
npm run check
npm run build
```

И ручная проверка POST на страницах с формами.

### Добавить CMS-поле

1. Добавить поле в Strapi schema, если используется CMS.
2. Добавить поле в local JSON.
3. Обновить `src/content.config.ts`.
4. Обновить `src/lib/cms/schemas.ts`.
5. Обновить normalizer, если формат Strapi отличается от UI-домена.
6. Обновить TypeScript-типы.
7. Обновить компоненты.
8. Добавить или обновить тесты.
9. Проверить local и Strapi режимы.

### Изменить дизайн-токены

1. Править source files в `src/design/tokens/**`.
2. Запустить:

```bash
npm run tokens:build
npm run tokens:check
npm run check
npm run build
```

3. Проверить ключевые страницы на mobile и desktop.
4. Не править generated CSS вручную, если он должен собираться из токенов.

## 21. Безопасность

Нельзя:

- коммитить `.env`;
- коммитить production tokens;
- логировать персональные данные заявок;
- открывать outbox наружу;
- давать редакторам доступ к server secrets;
- публиковать неподтвержденные цены, SLA, coverage и юридические тексты;
- держать Strapi admin без HTTPS;
- использовать один общий admin-аккаунт для всех.

Нужно:

- включить 2FA в GitHub;
- ограничить SSH-доступ;
- хранить секреты вне репозитория;
- делать backup Strapi базы;
- регулярно проверять outbox;
- обновлять зависимости через PR;
- проверять `npm audit --omit=dev` перед релизом.

## 22. Production-блокеры, которые нужно закрыть перед публичным запуском

Технически сайт собирается и запускается. Но для честного production launch нужны внешние подтверждения:

- боевой `PUBLIC_SITE_URL`;
- DNS;
- SSL;
- redirects HTTP/WWW/trailing slash;
- production CRM webhook;
- Telegram bot token и chat IDs;
- analytics webhook;
- подтвержденные тарифы, скорости, цены, опции;
- подтвержденная адресная база покрытия;
- финальные юридические тексты и согласия;
- ответственный sales owner, который подтверждает получение заявок.

Если хотя бы CRM/Telegram/outbox не проверены тестовой заявкой на production, запуск нельзя считать завершенным.

Отдельно: GitHub Pages preview по адресу `https://ya-yura.github.io/kubtel.2026/` не может подтвердить реальную доставку заявок, потому что это статическая публикация без серверных env-секретов. Для proof of delivery нужен Node production runtime с заполненными `CRM_WEBHOOK_URL`, `CRM_WEBHOOK_SECRET`, `TELEGRAM_*`, `SMTP_*` или проверенным `LEAD_OUTBOX_DIR`.

## 23. Короткий release checklist

Перед deploy:

- `npm run launch:check` прошел;
- env заполнены;
- тарифы и юридика подтверждены;
- DNS и SSL готовы;
- release branch или tag выбран.

Во время deploy:

- `git pull --ff-only` или checkout release tag;
- `npm ci`;
- `npm run launch:check`;
- `systemctl restart kubtel-site`;
- `systemctl status kubtel-site`.

После deploy:

- `/api/health.json` возвращает `status: "ok"`;
- ключевые страницы отвечают 200;
- sitemap и robots открываются;
- B2C-заявка доставлена;
- B2B-заявка доставлена;
- отклик на вакансию доставлен;
- analytics получил события;
- outbox проверен;
- Nginx error log без новых критичных ошибок.
