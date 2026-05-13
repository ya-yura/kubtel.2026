# Этап 9: запуск и пострелизный контроль

## Что реализовано технически

- Добавлен runtime health endpoint: `/api/health.json`.
- Добавлен launch-readiness audit: `src/lib/launch/readiness.ts`.
- Добавлены тесты launch-аудита: `src/lib/launch/readiness.test.ts`.
- Добавлен фактический Chrome UX smoke: `scripts/ux-smoke.mjs`.
- Добавлен единый pre-release/launch скрипт: `npm run launch:check`.
- Добавлен ручной/локальный UX-скрипт: `npm run test:ux`.
- `npm run launch:check` теперь включает `npm run tokens:check`.
- UX smoke расширен на B2B-маршруты, B2B-заявку и legacy redirects `/legal/** -> /business/**`.
- Production dependency advisory закрыт обновлением до `astro@^6.3.0` и `@astrojs/node@^10.1.0`.
- Добавлен простой Windows launcher: `start-kubtel-site.bat`.
- Описана текущая система управления сайтом и доступы: `docs/site-management-access.md`.

## Как читать статус этапа

Этап 9 разделен на две части:

- технический launch-control контур реализован в проекте;
- фактический production launch остается заблокирован внешними подтверждениями.

Такой статус не маскирует отсутствие боевых входов: сайт можно собрать, проверить и запустить локально, но нельзя честно считать опубликованным production-сайтом без DNS/SSL/CRM/Telegram/analytics/юридики/контента.

## Проверки перед production

Команда:

```bash
npm run launch:check
```

Она выполняет:

- `npm audit --omit=dev`;
- `npm run test:prelaunch`;
- `npm run test:launch`;
- `npm run check`;
- `npm run build`.

Фактический UX smoke запускается отдельно при поднятом локальном сервере:

```bash
npm run dev
npm run test:ux
```

Проверяется:

- ключевые B2C и B2B маршруты на desktop;
- отсутствие горизонтального overflow;
- `/api/health.json`;
- legacy B2B redirect `/legal/smallbusiness/inet/ -> /business/internet/`;
- переход из тарифной CTA в форму подключения;
- mobile sticky CTA и mobile menu;
- отправка тестовой заявки и success-состояние формы.
- отправка тестовой B2B-заявки и success-состояние формы.

## Production checklist

- `PUBLIC_SITE_URL` указывает на боевой HTTPS-домен.
- DNS домена резолвится на production-хостинг.
- SSL валиден.
- HTTP/WWW/слеши ведут на единый canonical.
- `/`, `/tariffs/`, `/connect/`, `/support/`, `/contacts/`, `/about/` отвечают без 404.
- `/api/health.json` отвечает `status: "ok"`.
- Форма заявки отправляется с production и доходит в CRM, Telegram или серверный outbox.
- Analytics получает событие `lead_submitted`.
- Analytics получает события `b2b_lead_submitted` и `b2b_lead_success`.
- Ошибки runtime и деградация скорости видны в мониторинге.
- Отдел продаж подтвердил, где видит B2C и B2B заявки, как различает pipeline и куда передает обратную связь.

## Остаточные production-блокеры

- Production CRM webhook не предоставлен.
- Telegram bot token и sales chat id не предоставлены.
- Production analytics webhook не предоставлен.
- Актуальные цены, скорости, опции, условия подключения и акции Kubtel не подтверждены.
- Адресная база покрытия не подтверждена.
- Финальная политика обработки персональных данных, согласие и реквизиты оператора не подтверждены.
- Production DNS, SSL и redirects нельзя проверить без доступа к боевому домену.
- Feedback loop отдела продаж нельзя подтвердить без участия sales owner и тестовой production-заявки.

## План первых дней после запуска

День 0:

- проверить health endpoint;
- отправить тестовую заявку;
- подтвердить доставку заявки;
- проверить sitemap и robots на production origin.

День 1:

- снять первые события analytics;
- проверить серверные ошибки;
- проверить скорость ключевых страниц;
- собрать обратную связь отдела продаж по тестовым и реальным заявкам.

День 3-7:

- сравнить конверсию с базовой точкой;
- выделить проблемные адреса и тарифные вопросы;
- обновить FAQ, coverage и промо на основе фактических обращений.
