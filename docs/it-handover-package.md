# Пакет передачи в ИТ: что приложить к задаче на запуск Kubtel

Этот документ дополняет [задание ИТ на production-развёртывание](./it-production-deployment-task.md). Его задача — объяснить владельцу сайта, что именно передать ИТ и какие данные заранее заполнить.

## 1. Что передать ИТ одним пакетом

### Обязательно

1. Ссылку на GitHub repository проекта.
2. Commit SHA или release tag, который нужно развернуть.
3. Ссылку на этот каталог документации.
4. Файлы инфраструктуры из корня проекта:
   - `Dockerfile`;
   - `compose.production.yml`;
   - `.dockerignore`;
   - `ops/kubtel-container-release.sh`;
   - `ops/nginx-kubtel.conf`;
   - `.github/workflows/production.yml`.
5. Заполненную карточку параметров из раздела 2.
6. Контакты владельца сайта, технического ответственного и согласующего production-релиз.

### Не передавать

- папку `node_modules`;
- папку `dist` как основной способ установки;
- реальные `.env`-файлы;
- пароли, приватные SSH-ключи, токены Telegram/CRM/SMTP;
- production-данные клиентов и тестовые заявки с персональными данными.

`node_modules` и `dist` собираются в Docker image из указанного commit SHA. Секреты передаются ИТ только через корпоративный vault или другой утверждённый secret store.

## 2. Что заполнить владельцу сайта

Скопируйте таблицу в заявку и замените значения в правой колонке.

| Параметр                  | Что указать                                         |
| ------------------------- | --------------------------------------------------- |
| Название системы          | Kubtel website                                      |
| GitHub repository         | `https://github.com/<organization>/<repository>`    |
| Commit/tag к запуску      | `<40-character-commit-sha-or-tag>`                  |
| Боевой URL                | `https://<canonical-domain>`                        |
| Альтернативный домен      | `https://<alternate-domain>` или «нет»              |
| Staging URL               | `https://<staging-domain>` или «создать»            |
| Canonical host            | `<canonical-domain>`                                |
| Владелец сайта            | ФИО, подразделение, e-mail, телефон                 |
| Технический ответственный | ФИО, подразделение, e-mail, телефон                 |
| Согласующий production    | ФИО/роль и e-mail                                   |
| Окно запуска              | дата, время, часовой пояс, длительность             |
| DNS-провайдер             | название площадки и ответственный                   |
| CRM                       | endpoint, владелец интеграции, способ выдачи secret |
| Telegram sales            | владелец бота и способ выдачи token/chat ID         |
| Telegram HR               | владелец бота и способ выдачи token/chat ID         |
| SMTP                      | relay, порт, владелец учётной записи                |
| Analytics                 | идентификатор счётчика и ответственный              |
| OAuth CMS                 | GitHub OAuth/Gateway app и ответственный            |
| Мониторинг                | система мониторинга, канал аварийных уведомлений    |
| Backup                    | политика хранения и ответственный за восстановление |

Если интеграция пока не готова, явно написать `не подключать на первом запуске`. В этом случае сайт должен сохранить заявки в server outbox, а не показывать пользователю ложный успешный результат.

## 3. Какую инфраструктуру попросить

В заявке нужно попросить ИТ предоставить:

- Linux LTS-сервер или корпоративную эквивалентную площадку;
- Docker Engine 27+ и Docker Compose Plugin 2.30+;
- Nginx или утверждённый reverse proxy;
- 2 vCPU, 4 GB RAM, минимум 30 GB SSD;
- входящие `443/tcp` и `80/tcp` только для HTTPS, redirect и ACME;
- SSH только через VPN, bastion или IP allowlist;
- закрытый наружу порт приложения `4321`;
- автоматическое продление TLS;
- синхронизацию времени через NTP;
- зашифрованный backup outbox минимум на 30 дней;
- health monitoring `/api/health.json` каждые 1–5 минут.

На host не требуется устанавливать Node.js для production-запуска: Node.js находится внутри Docker image.

## 4. Какие доступы попросить

Доступы должны быть именными, с 2FA и минимально необходимыми правами.

### GitHub

- ИТ получает доступ к repository на уровне, достаточном для просмотра workflow и настройки production Environment.
- Включаются branch protection и обязательный review.
- В GitHub Environment `production` назначается required reviewer.
- В Environment secrets добавляются значения:
  `DEPLOY_HOST`, `DEPLOY_PORT`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, `PRODUCTION_URL`.
- GitHub Actions получает только `contents: read`.

### Сервер

- Создаётся отдельный `deploy-user`.
- Его SSH-ключ используется только для deployment.
- `sudo` разрешается только на `/usr/local/sbin/kubtel-container-release`.
- Root-пароль, интерактивный root SSH и доступ приложения к Docker socket не требуются.

### DNS и TLS

- DNS A/AAAA/CNAME указывает на production host.
- `http` и альтернативный домен перенаправляются на canonical HTTPS.
- Сертификат выпущен на canonical и необходимые alternate names.
- Срок TLS и DNS контролируется мониторингом.

### CMS

- Для `/admin/` создаётся approved GitHub OAuth/Gateway configuration.
- Callback URL указывает на production или staging origin:
  `https://<domain>/admin/`.
- Право редактирования получают только именные редакторы.
- CMS не получает root-доступ и не получает серверные секреты интеграций.

## 5. Какие переменные подготовить через vault

ИТ создаёт `/etc/kubtel-site.env` с правами `root:kubtel`, `0640`, либо эквивалентную защищённую конфигурацию Compose.

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

При наличии интеграций добавляются значения из `.env.example`:

```text
PUBLIC_YANDEX_METRIKA_ID
PUBLIC_MAX_CHAT_URL PUBLIC_VK_CHAT_URL
CRM_WEBHOOK_URL CRM_WEBHOOK_SECRET
TELEGRAM_BOT_TOKEN TELEGRAM_SALES_CHAT_ID TELEGRAM_HR_CHAT_ID
SMTP_HOST SMTP_PORT SMTP_SECURE SMTP_USER SMTP_PASSWORD SMTP_FROM
SALES_EMAIL HR_EMAIL
ANALYTICS_WEBHOOK_URL ANALYTICS_WEBHOOK_SECRET
```

Для Strapi переменные не нужны, пока отдельно не принято решение использовать Strapi вместо локального контента.

## 6. Готовый текст задачи для Service Desk

Скопируйте этот текст и замените поля в угловых скобках.

```text
Тема: Развёртывание production-сайта Kubtel в Docker

Прошу подготовить и выполнить production-развёртывание сайта Kubtel.

Репозиторий: <GitHub repository URL>
Версия к развёртыванию: <commit SHA или release tag>
Боевой URL: https://<canonical-domain>
Альтернативный домен: <alternate-domain или нет>
Staging URL: <staging URL или создать>
Окно запуска: <дата, время, часовой пояс>
Владелец системы: <ФИО, e-mail, телефон>
Согласующий релиз: <ФИО/роль, e-mail>

Требуется:
1. Linux LTS, 2 vCPU, 4 GB RAM, 30 GB SSD.
2. Docker Engine 27+ и Docker Compose Plugin 2.30+.
3. Nginx/reverse proxy и TLS с автоматическим продлением.
4. DNS canonical host и redirects HTTP/www/alternate → canonical HTTPS.
5. Закрытый наружу порт 4321; приложение должно быть доступно локально как 127.0.0.1:4321.
6. Именной deploy-user, SSH через VPN/bastion/allowlist и sudo только на:
   /usr/local/sbin/kubtel-container-release
7. Установка файлов Dockerfile, compose.production.yml,
   ops/kubtel-container-release.sh и ops/nginx-kubtel.conf.
8. Настройка /etc/kubtel-site.env через корпоративный vault.
9. Настройка GitHub Environment production с required reviewer и secrets:
   DEPLOY_HOST, DEPLOY_PORT, DEPLOY_USER, DEPLOY_SSH_KEY,
   DEPLOY_KNOWN_HOSTS, PRODUCTION_URL.
10. Настройка approved OAuth/Gateway для https://<domain>/admin/.
11. Мониторинг HTTPS и /api/health.json каждые 1–5 минут.
12. Зашифрованный backup server outbox с retention не менее 30 дней.

Способ релиза: GitHub Actions собирает immutable Docker image из согласованного
commit SHA, передаёт image archive на сервер, выполняет docker load и запускает
его через Compose. Ручной git pull на production не используется.

Критерии приёмки:
- HTTPS и canonical redirects работают;
- контейнер kubtel-site имеет статус healthy;
- /api/health.json возвращает HTTP 200 и status=ok;
- основные страницы и /admin/ открываются;
- config.yml CMS загружается без ошибки;
- legacy URL возвращают согласованные 301;
- порт 4321, env и outbox не доступны из Internet;
- проверены B2C/B2B/HR заявки в согласованном change window;
- проверен deploy по SHA и rollback на предыдущий image;
- предоставлены monitoring, backup и restore contacts.

Секреты прошу передавать только через корпоративный vault, не в заявке,
почте или общем чате.
```

## 7. Что получить от ИТ после выполнения

Попросите вернуть в заявку:

- production URL и canonical host;
- staging URL;
- hostname/IP без секретов;
- версии ОС, Docker, Compose и Nginx;
- имя deploy-user;
- путь Compose-файла и release-скрипта;
- подтверждение DNS, TLS, firewall и OAuth CMS;
- адрес мониторинга и канал аварийных уведомлений;
- backup policy и дату тестового восстановления;
- список ответственных за сервер, DNS, секреты и интеграции;
- результат smoke-проверки и SHA реально запущенного image.

## 8. Как дальше работать с Codex безопасно

Для регулярной работы достаточно предоставить Codex:

- локальную копию репозитория или GitHub branch/PR;
- задачу на изменение;
- staging URL;
- обезличенный `.env.example`;
- результаты CI, health checks и логи без секретов.

Рабочий процесс:

```text
задача -> branch -> изменение -> тесты -> PR -> review -> merge
       -> GitHub Actions -> approval production -> deploy по SHA -> smoke
```

Codex не должен получать root-пароль, production `.env`, приватный SSH-ключ,
токены CRM/Telegram/SMTP или полный payload заявок. Для изменения внешнего вида,
контента и функционала достаточно PR и staging-доступа. Production-доступ остаётся
у ИТ и владельца релиза.
