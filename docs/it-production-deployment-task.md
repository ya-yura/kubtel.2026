# Задача ИТ: площадка и production-развёртывание Kubtel

## Цель

Предоставить безопасную площадку для запуска сайта Kubtel и дальнейшего управления изменениями по схеме:

```text
GitHub PR/commit
  -> CI: tests + build
  -> approval production
  -> immutable Docker image
  -> SSH deploy-user
  -> docker load + compose up
  -> container Astro на 127.0.0.1:4321
  -> Nginx/TLS на 443
```

Контент редактируется через Decap CMS `/admin/` и попадает в GitHub как commit/PR. Strapi для первого запуска не требуется.

## Что нужно предоставить

### 1. Сервер

- Linux LTS: Ubuntu 22.04/24.04 или корпоративный эквивалент.
- 2 vCPU, 4 GB RAM, 30 GB SSD с резервом под releases, логи и outbox.
- Docker Engine 27+ и Docker Compose Plugin 2.30+.
- Nginx или корпоративный reverse proxy.
- Часовой пояс и синхронизация времени через NTP.
- Отдельный service user `kubtel` без shell-доступа.

Открытые входящие порты:

- `443/tcp` — сайт;
- `80/tcp` — только HTTP→HTTPS и ACME challenge;
- SSH — только через VPN/bastion или allowlist.

Порт `4321` наружу не открывать: приложение слушает только `127.0.0.1`.

### 2. Сеть и DNS

Исходящий HTTPS разрешить к GitHub, CRM, Telegram Bot API, SMTP relay, analytics endpoint и ACME/OCSP.

Нужно настроить:

- production URL и canonical host;
- DNS A/AAAA/CNAME на сервер;
- единый redirect `http` и `www` → canonical HTTPS;
- TLS с автоматическим продлением.

### 3. Директории и права

```text
/opt/kubtel-site/compose.production.yml
/opt/kubtel-site/current-image
/var/lib/kubtel-site/lead-outbox/
/etc/kubtel-site.env
```

Права:

- `/opt/kubtel-site` — `root:root`, `0750`;
- outbox — `kubtel:kubtel`, `0750`;
- env — `root:kubtel`, `0640`;
- Docker socket не выдавать приложению;
- secrets не хранить в Git, release artifact и логах.

### 4. Доступы

Предоставить через корпоративный vault/approved secret store:

| Доступ                          | Требование                                      |
| ------------------------------- | ----------------------------------------------- |
| GitHub repository               | branch protection, PR review, 2FA               |
| GitHub Environment `production` | required reviewer; secrets ниже                 |
| SSH deploy                      | отдельный ключ, VPN/bastion, audit log          |
| `sudo` deploy-user              | только `/usr/local/sbin/kubtel-container-release` |
| DNS                             | named account, 2FA, без лишних billing-прав     |
| Decap OAuth                     | callback только на production/staging `/admin/` |

Codex не получает root-пароль, личные пароли GitHub, database password, private keys или production `.env`. Для PR достаточно GitHub App/fine-grained identity с минимальными правами на один repository.

### 5. Production-переменные

Создать в `/etc/kubtel-site.env` или GitHub Environment:

```text
NODE_ENV HOST PORT PUBLIC_SITE_URL PUBLIC_BASE_PATH
PUBLIC_YANDEX_METRIKA_ID
CMS_PROVIDER CMS_PREVIEW_MODE CMS_FALLBACK_TO_LOCAL CMS_CACHE_TTL_SECONDS
CRM_WEBHOOK_URL CRM_WEBHOOK_SECRET
TELEGRAM_BOT_TOKEN TELEGRAM_SALES_CHAT_ID TELEGRAM_HR_CHAT_ID
SMTP_HOST SMTP_PORT SMTP_SECURE SMTP_USER SMTP_PASSWORD SMTP_FROM
SALES_EMAIL HR_EMAIL
ANALYTICS_WEBHOOK_URL ANALYTICS_WEBHOOK_SECRET
LEAD_OUTBOX_DIR
```

Для первого запуска: `CMS_PROVIDER=local`, `CMS_FALLBACK_TO_LOCAL=true`. Strapi-переменные нужны только при отдельном согласовании миграции.

## Что установить из репозитория

- `Dockerfile` и `.dockerignore` — для сборки immutable image;
- `compose.production.yml` → `/opt/kubtel-site/compose.production.yml`;
- `ops/kubtel-container-release.sh` → `/usr/local/sbin/kubtel-container-release`;
- `ops/nginx-kubtel.conf` → Nginx sites-enabled с заменой placeholders;
- `.github/workflows/production.yml` оставить включённым только после настройки Environment и SSH;
- `ops/kubtel-site.service` и `ops/kubtel-release.sh` — резервный native systemd-вариант.

## Приёмка

ИТ возвращает владельцу сайта:

- production URL, canonical host, staging URL;
- hostname/IP без секретов;
- версии ОС, Docker/Compose и Nginx;
- имя deploy-user, Compose file и deployment path;
- путь secret store и список ответственных;
- backup policy и дату проверочного восстановления;
- подтверждение OAuth CMS, DNS/TLS и firewall.

Совместно проверить:

```text
GET /                         200
GET /individual/configurator/ 200
GET /business/                200
GET /business/request/        200
GET /payment/                 200
GET /support/                 200
GET /contacts/                200
GET /sitemap.xml              200
GET /robots.txt               200
GET /api/health.json          200 и status=ok
GET /admin/                   auth/Decap, без ошибки config.yml
```

Также проверить 301 для legacy URL, HTTPS/www redirects, отсутствие доступа к `4321`, outbox и env, тестовые заявки B2C/B2B/HR, deploy контейнера по commit SHA и rollback на предыдущий image.

## Definition of Done

Сайт доступен по HTTPS, CMS авторизована, CI проходит, container deploy выполняется approved commit/tag, rollback проверен, backup настроен, а секреты не передаются в чат и не попадают в Git.
