# Kubtel.ru: предрелизное тестирование этапа 8

Документ фиксирует предрелизный QA-контур первой версии. Цель этапа - поймать критичные технические дефекты перед запуском и явно отделить их от внешних launch-блокеров: тарифов, адресной базы, юридики и production-интеграций.

## Область проверки

- формы заявки на `/`, `/connect/` и `/tariffs/`;
- success/error state после Astro Action `submitLead`;
- сценарии ошибок: валидация телефона, согласия, тарифа, опций, honeypot, слишком быстрая отправка и rate limit;
- CRM, Telegram, analytics и outbox failover;
- route metadata, sitemap/SEO-контракт и страницы с формами;
- связи локального контента: услуги, тарифы, FAQ, coverage и промо;
- "детектор лжи" для цен, условий, SLA, coverage, акций и юридических текстов.

## Исправленные дефекты

- `/tariffs/` содержал форму заявки, но оставался статической страницей. Страница переведена в on-demand rendering и теперь читает `Astro.getActionResult(actions.submitLead)`, чтобы показывать результат отправки.
- Опции формы были общими для всех тарифов. При переключении тарифа несовместимая опция теперь отключается и снимается, поэтому пользователь не может собрать заявку, которую сервер отклонит из-за недоступной опции.

## Повторяемый QA-контракт

- `src/lib/prelaunch/audit.ts` собирает prelaunch-отчет по техническим дефектам и внешним launch-блокерам.
- `src/lib/prelaunch/audit.test.ts` проверяет текущий контентный слой: технические дефекты равны нулю, но launch readiness остается `false`, пока не закрыты внешние подтверждения.
- `src/lib/prelaunch/page-contract.test.ts` проверяет, что все страницы с `AddressCheckPanel` являются server-rendered и передают `actionResult`.
- `npm run test:prelaunch` запускает только предрелизный контракт.

## Матрица форм

| Страница    | Контракт                                                             | Статус           |
| ----------- | -------------------------------------------------------------------- | ---------------- |
| `/`         | on-demand, `submitLead`, success/error state                         | passed           |
| `/connect/` | on-demand, query `tariff/address`, `submitLead`, success/error state | passed           |
| `/tariffs/` | on-demand, `submitLead`, success/error state                         | fixed and passed |

## Интеграции и аналитика

- CRM, Telegram и analytics остаются изолированными server-side adapter-ами.
- Если CRM/Telegram не настроены или падают, заявка сохраняется в `.lead-outbox/`.
- Предрелизный аудит помечает отсутствие `CRM_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_SALES_CHAT_ID` и `ANALYTICS_WEBHOOK_URL` как external blockers, потому что чек "все заявки доходят" нельзя закрыть только локальным outbox.

## Контентный "детектор лжи"

Технические дефекты связей не найдены: тарифы существуют, slug-и уникальны, featured-тариф есть, связанные услуги/FAQ/coverage/promos ссылаются на существующие сущности.

Внешние launch-блокеры остаются:

- тарифы, цены, скорости, опции и условия подключения не подтверждены коммерческой матрицей Kubtel;
- адресная база покрытия находится в draft-состоянии;
- FAQ про SLA, цены и частный сектор требует операционного и коммерческого подтверждения;
- промо-механика не имеет финальных условий и юридической формулировки;
- согласие на обработку персональных данных, политика и реквизиты оператора не согласованы.

## Адаптивность и браузеры

Этап 8 не менял сетку страниц, но изменил поведение формы. Контракт формы остается на native controls, `fieldset/legend`, visible labels, disabled state для несовместимых опций и server-side status с `role="status"`/`role="alert"`.

Перед production-запуском в этапе 9 нужен финальный ручной browser pass на реальном production origin после подстановки подтвержденных текстов, тарифов, юридики и env.

## Проверки

- `npm run test:prelaunch`: 2 test files, 5 tests passed.
- `npm test`: 7 test files, 16 tests passed.
- `npm run check`: 0 ошибок, 0 предупреждений, 0 hints.
- `npm run build`: 0 ошибок; `/`, `/connect/` и `/tariffs/` являются on-demand routes, `/about/`, `/contacts/`, `/support/`, `robots.txt` и `sitemap.xml` prerender.
- Dev server smoke: `/`, `/connect/`, `/tariffs/`, `/support/`, `/contacts/`, `/about/` отвечают `200 OK` на `http://127.0.0.1:4321/`.

## Итог

Критичных технических ошибок в предрелизном QA-контуре не осталось. Публикация пока заблокирована внешними входами: production-интеграциями, подтвержденными тарифами, адресной базой, юридическими текстами, DNS, SSL и redirects. Dependency advisory закрыт на этапе 9 обновлением Astro и Node adapter.
