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
- GitHub Pages workflow собирает честный static preview: формы на Pages не показывают демо-успех и вместо этого дают прямые контакты.

## Подтвержденные публичные факты, использованные в текущей версии

Дата сверки: 2026-07-10.

| Факт | Источник |
| --- | --- |
| Онлайн-оплата для физлиц и ИП, квитанция, реквизиты и условия возврата | `https://kubtel.ru/individual/pay/` |
| Личный кабинет абонента | `https://my.kubtel.ru/` |
| Телефония Kubtel, доступные собственные опции и детализация по e-mail 0 ₽ | `https://kubtel.ru/legal/smallbusiness/tel/` |
| Внутризоновая, междугородная и международная телефония вынесены в официальный PDF оператора дальней связи | `https://kubtel.ru/files/file/tariffs-megafon.pdf` |
| Hot-spot: публичный состав тарифов без публикации актуальных цен | `https://kubtel.ru/legal/smallbusiness/wifi/` |
| VDI: публичный базовый пакет 2 ядра / 4 ГБ ОЗУ / 50 ГБ HDD без публикации актуальной цены | `https://kubtel.ru/legal/smallbusiness/datac/vdi` |
| Лицензии | `https://kubtel.ru/about/licencies/` |
| Политика обработки персональных данных | `https://kubtel.ru/about/personsdata/` |
| Официальные контакты и адрес офиса | `https://kubtel.ru/about/contactus/` |
| Условия оказания услуг физическим лицам | `https://kubtel.ru/individual/termsofuse` |
| Официальные документы/формы договора | `https://kubtel.ru/docs/` |
| Официальная новостная лента и архив уведомлений | `https://kubtel.ru/about/news/` |

## Что намеренно не опубликовано без подтверждения Kubtel

- Публичные числовые цены B2B-калькуляторов, кроме подтвержденной нулевой стоимости детализации телефонии по e-mail.
- Калькуляторы для интернета в офис, Hot-spot и VDI: для них нет утвержденной публичной матрицы расчета.
- Модели и цены клиентского оборудования, ссылки на ТВ-приложения/APK и список ТВ-каналов.
- MAX/VK chat URLs: кнопки показываются только при наличии валидных `PUBLIC_MAX_CHAT_URL` / `PUBLIC_VK_CHAT_URL`.
- Production CRM/Redmine routing, project/tracker IDs и ответственные.
- Подтверждение доставки B2C/B2B/B2G/HR заявок на production.
- DNS, SSL, canonical redirects и production Node hosting для `kubtel.ru`.

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
| Redmine/B2G routing            | проект, трекер, ответственный, payload rules | CRM/Redmine integration contract                    | B2G owner / CRM owner    |
| Telegram продажи               | bot token + chat id                          | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_SALES_CHAT_ID`      | sales ops                |
| Analytics                      | endpoint + secret + event schema             | `ANALYTICS_WEBHOOK_URL`, `ANALYTICS_WEBHOOK_SECRET` | аналитик                 |
| ТВ-каналы и приложения         | список каналов, архив, Smart TV links, APK   | `services/tv`, `tariffs/family-tv`, devices         | коммерческий отдел       |
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
- Тестовая B2G-заявка дошла в нужный Redmine/CRM-маршрут и назначилась на B2G.
- Analytics получил `lead_submitted`, `b2b_lead_submitted` и `b2b_lead_success`.
- DNS, SSL, canonical redirects и legacy B2B redirects проверены на production origin.
- Отдел продаж подтвердил, что видит routing pipeline, приоритет, конфигурацию и обратную связь по заявкам.
