# Kubtel.ru: QA визуальной системы

Дата проверки: 2026-07-10.

Проверка закрывает финальную интеграцию token-driven visual system: адаптивность, контраст, readable mode, ключевые B2C/B2B пользовательские пути, legacy redirects и визуальные сэмплы для ручного просмотра.

## Метод

Использован локальный Chrome CDP smoke test:

```bash
npm run dev

$env:UX_SMOKE_BASE_URL='http://127.0.0.1:4321'
$env:UX_SMOKE_SCREENSHOT_DIR='artifacts/design-system-qa/screenshots'
npm run test:ux
```

Последний локальный прогон выполнен на фактическом Astro fallback `http://127.0.0.1:4322`, потому что `4321` был занят в момент старта dev server. Скрипт принимает это через `UX_SMOKE_BASE_URL`.

Скрипт проверяет маршруты:

- `/`;
- `/tariffs/`;
- `/connect/`;
- `/support/`;
- `/contacts/`;
- `/about/`;
- `/devices/`;
- `/search/`;
- `/business/`;
- `/business/b2g/`;
- `/business/datacenter-access/`;
- `/business/request/`;
- `/business/?calculator=telephony#business-calculators`;
- `/api/health.json`;
- legacy redirects для small business, B2G и ЦОД.

Скриншоты сняты для viewport:

- `320x720`;
- `390x844`;
- `768x1024`;
- `1440x1000`.

## Результат

| Проверка                            | Результат                                                            |
| ----------------------------------- | -------------------------------------------------------------------- |
| HTTP-статус основных страниц        | пройдено                                                             |
| Health endpoint                     | пройдено                                                             |
| Legacy redirects                    | пройдено                                                             |
| Горизонтальный overflow             | не обнаружен на проверенных viewport                                 |
| Home audience switch                | пройдено                                                             |
| Payment routes для физлиц/юрлиц/B2G | пройдено                                                             |
| Tariff CTA path                     | пройдено                                                             |
| Mobile navigation и sticky CTA      | пройдено                                                             |
| Mobile B2G request path             | пройдено                                                             |
| Business internet office profiles   | пройдено                                                             |
| Business calculator path            | пройдено                                                             |
| Lead form submit path               | пройдено                                                             |
| Business lead form submit path      | пройдено                                                             |
| Readable mode                       | token-driven, без `filter: grayscale`, ссылки остаются видимыми      |
| Visual screenshots                  | сохранены в `artifacts/design-system-qa/screenshots`                 |
| Design token audit                  | `0` static raw color violations, `0` legacy vars, `0` unknown tokens |
| Token/component contract tests      | пройдено                                                             |
| Launch gate                         | `npm run launch:check` пройден                                       |

## Visual artifacts

| Страница          | Файлы                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Home              | `artifacts/design-system-qa/screenshots/home-320.png`, `home-390.png`, `home-768.png`, `home-1440.png`                                                 |
| Business          | `artifacts/design-system-qa/screenshots/business-320.png`, `business-390.png`, `business-768.png`, `business-1440.png`                                 |
| Business request  | `artifacts/design-system-qa/screenshots/business-request-320.png`, `business-request-390.png`, `business-request-768.png`, `business-request-1440.png` |
| Design system     | `artifacts/design-system-qa/screenshots/design-system-320.png`, `design-system-390.png`, `design-system-768.png`, `design-system-1440.png`             |
| Readable showcase | `artifacts/design-system-qa/screenshots/design-system-readable-390.png`                                                                                |

## Known warnings and limitations

- `npm run build` завершается успешно, но Astro выводит предупреждение: `getStaticPaths() ignored in dynamic page /src/pages/business/[slug].astro`. Это существующее предупреждение роутинга, не runtime regression.
- `npm audit --omit=dev --audit-level=moderate` проходит. В отчете остаются `2 low severity` advisories для Astro/esbuild Windows dev-server path; они ниже configured gate threshold и требуют breaking upgrade до Astro 7 для автоисправления.
- Headless Chrome может писать `google_apis ... PHONE_REGISTRATION_ERROR` в stderr. Это служебный шум Chrome в локальном headless окружении, не ошибка приложения.
- Скриншоты снимаются как viewport captures (`captureBeyondViewport: false`). Full-page capture не используется, потому что `content-visibility` может давать пустые offscreen-секции в артефактах, хотя интерфейс в viewport отрисован корректно.
