# Внешние входы Kubtel для production

Этот документ отделяет реализованный технический контур от данных, которые может подтвердить только Kubtel. Эти пункты нельзя "закрыть кодом": они требуют выгрузок, секретов, юридического согласования и проверки на боевом домене.

## Что уже готово в проекте

- Контентные модели умеют хранить статус достоверности: `draft`, `needs_verification`, `confirmed`.
- B2C и B2B заявки разделены в payload, аналитике, outbox и routing.
- CRM, Telegram и analytics подключаются через server-only env.
- CMS adapter умеет работать с local content, Strapi и fallback.
- B2B legacy redirects `/legal/** -> /business/**` реализованы в middleware.
- `npm run launch:check` проверяет зависимости, tokens, prelaunch, launch audit, типы и сборку.
- `npm run test:ux` проверяет B2C и B2B маршруты, формы и redirects на локальном сервере.

## Нужные входы от Kubtel

| Вход                           | Формат                                       | Куда ложится                                        | Кто подтверждает         |
| ------------------------------ | -------------------------------------------- | --------------------------------------------------- | ------------------------ |
| B2C тарифы, цены, опции, акции | таблица XLSX/CSV или CMS import              | `tariffs`, `promos`                                 | коммерческий отдел       |
| B2B цены и правила расчетов    | таблица услуг и option keys                  | `business-calculators`, `calculator-options`        | B2B продажи              |
| Адресная база покрытия         | CSV/API: город, район, улица, дом, статус    | `coverage-areas` или внешний API                    | техслужба/coverage owner |
| SLA и регламенты поддержки     | документ с уровнями сервиса                  | service facts, FAQ, legal copy                      | операционная команда     |
| Юридические тексты             | согласие, политика, реквизиты, условия акций | CMS legal records / страницы                        | юрист                    |
| Контакты и режим работы        | телефоны, email, адреса, часы                | `src/config/site.ts` или CMS                        | операционная команда     |
| Брендовые материалы            | логотипы, фото, иконки, правила              | media library / assets                              | маркетинг                |
| CRM webhook                    | URL + secret + payload rules                 | `CRM_WEBHOOK_URL`, `CRM_WEBHOOK_SECRET`             | CRM owner                |
| Telegram продажи               | bot token + chat id                          | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_SALES_CHAT_ID`      | sales ops                |
| Analytics                      | endpoint + secret + event schema             | `ANALYTICS_WEBHOOK_URL`, `ANALYTICS_WEBHOOK_SECRET` | аналитик                 |
| Домен/DNS/SSL                  | production host + cert + redirects           | hosting/DNS panel                                   | release manager          |

## Production env checklist

```env
PUBLIC_SITE_URL=https://kubtel.ru
CMS_PROVIDER=strapi
CMS_PREVIEW_MODE=false
CMS_FALLBACK_TO_LOCAL=true
STRAPI_URL=https://cms.kubtel.ru
STRAPI_API_TOKEN=...
STRAPI_PREVIEW_SECRET=...
CRM_WEBHOOK_URL=...
CRM_WEBHOOK_SECRET=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_SALES_CHAT_ID=...
ANALYTICS_WEBHOOK_URL=...
ANALYTICS_WEBHOOK_SECRET=...
LEAD_OUTBOX_DIR=/var/kubtel/lead-outbox
```

## Definition of Done для внешних входов

- Все публичные цены и SLA имеют статус `confirmed`.
- Адресная база содержит не только город, но районы/улицы/дома или внешний проверяемый API.
- Тестовая B2C и B2B заявки дошли в CRM и Telegram на production.
- Analytics получил `lead_submitted`, `b2b_lead_submitted` и `b2b_lead_success`.
- DNS, SSL, canonical redirects и legacy B2B redirects проверены на production origin.
- Отдел продаж подтвердил, что видит routing pipeline, приоритет, конфигурацию и обратную связь по заявкам.
