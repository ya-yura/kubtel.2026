# Kubtel: краткая инструкция развёртывания и эксплуатации

Инструкция рассчитана на Linux-сервер с Docker Engine, Compose и Nginx. Production запускается как immutable Astro-контейнер за reverse proxy. GitHub Pages подходит только для статического preview: формы там не работают как production.

## 1. Подготовить сервер

```bash
sudo mkdir -p /opt/kubtel-site /var/lib/kubtel-site/lead-outbox
sudo chown -R root:root /opt/kubtel-site
sudo chmod 750 /var/lib/kubtel-site/lead-outbox
```

Установить Docker Engine 27+, Docker Compose Plugin 2.30+, Nginx и curl. Node.js на host не нужен. Порт контейнера публиковать только на `127.0.0.1:4321`.

## 2. Установить Compose и reverse proxy

```bash
sudo install -o root -g root -m 0644 compose.production.yml /opt/kubtel-site/compose.production.yml
sudo install -o root -g root -m 0750 ops/kubtel-container-release.sh /usr/local/sbin/kubtel-container-release
```

В `ops/nginx-kubtel.conf` заменить `<canonical-domain>` и `<alternate-domain>`, установить конфигурацию в Nginx, получить TLS-сертификат и включить redirect HTTP/www на canonical host.

Проверить конфигурацию:

```bash
sudo nginx -t
sudo systemctl enable --now docker
```

## 3. Создать production env

Создать файл только на сервере:

```bash
sudo install -o root -g kubtel -m 0640 /dev/null /etc/kubtel-site.env
sudoedit /etc/kubtel-site.env
```

Минимум:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=4321
PUBLIC_SITE_URL=https://<canonical-domain>
PUBLIC_BASE_PATH=/
CMS_PROVIDER=local
CMS_PREVIEW_MODE=false
CMS_FALLBACK_TO_LOCAL=true
CMS_CACHE_TTL_SECONDS=60
LEAD_OUTBOX_DIR=/var/lib/kubtel-site/lead-outbox
```

Добавить CRM/Telegram/SMTP/analytics variables из задания ИТ. Значения брать из vault, не из чата и не из Git.

## 4. Первый deploy

Предпочтительный способ — GitHub Actions:

1. Открыть workflow `Deploy production`.
2. Передать согласованный commit SHA или release tag.
3. Дождаться CI: `format`, tests, tokens, Astro check, build.
4. Получить approval защищённого Environment `production`.
5. Workflow загрузит container image archive на deploy-user.
6. `kubtel-container-release` выполнит `docker load`, запустит image через Compose и проверит health.

Ручной bootstrap допустим только до настройки CI. На рабочей машине проекта:

```bash
npm ci --no-audit --no-fund --legacy-peer-deps
docker build --pull --tag kubtel:<commit-sha> .
docker save kubtel:<commit-sha> | gzip > kubtel-<commit-sha>.image.tar.gz
scp kubtel-<commit-sha>.image.tar.gz <deploy-user>@<server>:/home/<deploy-user>/
ssh <deploy-user>@<server> \
  "sudo -n /usr/local/sbin/kubtel-container-release --sha <commit-sha> --image kubtel:<commit-sha> --archive /home/<deploy-user>/kubtel-<commit-sha>.image.tar.gz"
```

Активировать и проверить:

```bash
sudo docker ps --filter name=kubtel-site
sudo docker inspect --format '{{.State.Health.Status}}' kubtel-site
curl -fsS http://127.0.0.1:4321/api/health.json
curl -I https://<canonical-domain>/
```

## 5. Настроить CMS

Открывать CMS только так:

```text
https://<canonical-domain>/admin/
```

Настроить approved GitHub OAuth/Gateway с callback на этот origin. Проверить вход, открытие коллекций и создание тестового draft/PR. Не открывать `public/admin/index.html` двойным кликом через `file://`: браузер заблокирует загрузку `config.yml`.

## 6. Проверить после deploy

```bash
curl -fsS https://<canonical-domain>/api/health.json
curl -fsS https://<canonical-domain>/sitemap.xml >/dev/null
curl -fsS https://<canonical-domain>/robots.txt >/dev/null
```

Проверить в браузере:

- `/`, `/individual/configurator/`, `/business/`, `/business/request/`;
- `/payment/`, `/support/`, `/contacts/`, `/news/`, `/documents/`;
- `/admin/` после OAuth;
- mobile menu, формы, success/error states и отсутствие горизонтального overflow.

Тестовые заявки отправлять только в согласованное change window. Подтвердить доставку B2C, B2B и HR. Проверить, что outbox недоступен из Internet.

## 7. Регулярный deploy

```text
изменение -> branch -> PR -> CI -> review -> merge/tag -> Deploy production -> health/smoke
```

Контент из Decap CMS проходит тот же PR/CI/deploy flow. В production не выполнять `git pull` и не менять запущенный контейнер вручную.

## 8. Rollback

Для штатного rollback повторно запустить сохранённый предыдущий image archive:

```bash
sudo -n /usr/local/sbin/kubtel-container-release \
  --sha <previous-good-sha> \
  --image kubtel:<previous-good-sha> \
  --archive /home/<deploy-user>/kubtel-<previous-good-sha>.image.tar.gz
curl -fsS http://127.0.0.1:4321/api/health.json
```

После rollback проверить главную, формы, canonical, sitemap, robots и доставку заявок. Предыдущий image archive и текущий backup не удалять.

## 9. Минимальный мониторинг

- HTTPS/health check каждые 1–5 минут;
- alert на 5xx, downtime, restart loop и заполнение диска;
- alert на рост outbox и ошибки CRM/Telegram/SMTP;
- контроль срока TLS-сертификата;
- ежедневный зашифрованный backup outbox, retention минимум 30 дней;
- для Strapi — отдельно backup PostgreSQL и media.

Секреты, персональные данные и полный payload заявок не отправлять в общие логи и APM.
