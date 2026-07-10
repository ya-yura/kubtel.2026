# Security and publication decision

Дата: 2026-07-10.

## Решение

Репозиторий можно публиковать как публичный только при соблюдении двух условий:

- в Git не попадают `.env`, production secrets, outbox с персональными данными, приватные выгрузки Kubtel и локальные QA-артефакты;
- GitHub Pages используется как static preview, а не как production-канал приема заявок.

Текущая реализация поддерживает это разделение:

- `.env`, `.env.local`, `.lead-outbox/`, `dist/`, `.astro/` и `artifacts/` исключены через `.gitignore`;
- `.env.example` содержит только имена переменных и пустые/примерные значения;
- публичные chat URLs берутся только из валидных `https` env-переменных;
- server-only интеграции CRM, Telegram, SMTP и analytics читаются только на сервере;
- static preview не имитирует успешную доставку заявок.

## Что нельзя коммитить

- реальные `CRM_WEBHOOK_SECRET`, `TELEGRAM_BOT_TOKEN`, `SMTP_PASSWORD`, `STRAPI_API_TOKEN`, `ANALYTICS_WEBHOOK_SECRET`;
- production `.env`;
- заявки из outbox и любые файлы с телефонами, e-mail, адресами клиентов;
- закрытые коммерческие матрицы B2B/B2C до разрешения Kubtel;
- скриншоты/логи, содержащие персональные данные.

## Проверка перед публикацией

Перед push/release выполнить:

```bash
git status --short
npm run format:check
npm test
npm run tokens:check
npm run check
npm run build
npm run test:ux
npm run launch:check
```

И выполнить secret scan текущего дерева и истории. Если найден секрет, нельзя просто удалить его последним коммитом: нужно считать секрет скомпрометированным, отозвать его, очистить историю или перевести репозиторий в private до завершения ротации.

## Production-блокер

Реальный production launch нельзя считать завершенным до тестовой заявки на production Node runtime и подтверждения доставки в целевой канал: CRM/Redmine, Telegram, SMTP или защищенный outbox.
