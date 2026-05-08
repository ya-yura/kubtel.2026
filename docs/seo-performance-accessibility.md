# Kubtel.ru: SEO, производительность и доступность этапа 7

Документ фиксирует технический контур этапа 7 после подключения серверной формы. Цель - чтобы сайт был готов к предрелизному тестированию: страницы имеют уникальные метаданные, поисковую разметку, проверяемые sitemap/robots, быстрый production-render и доступные формы.

## SEO-контур

- `src/config/routes.ts` хранит уникальные `title`, `description`, `lastModified`, `changeFrequency` и `priority` для ключевых страниц.
- `BaseLayout.astro` строит canonical URL, robots, Open Graph, Twitter summary и базовую JSON-LD разметку для Organization, WebSite, WebPage и BreadcrumbList.
- Страницы добавляют предметную Schema.org разметку через `src/lib/seo/schema.ts`:
  - главная и подключение: `Service` для домашнего интернета Kubtel;
  - тарифы: `CollectionPage`, `Service` и `OfferCatalog`;
  - поддержка: `FAQPage`;
  - контакты: `ContactPage`;
  - о компании: `AboutPage`.
- JSON-LD сериализуется через `serializeJsonLd()`, который экранирует `<` и защищает inline script от преждевременного закрытия.
- Черновые тарифные предложения в Schema.org отмечаются как `PreOrder`, пока коммерческие данные не подтверждены.

## Sitemap и robots

- `sitemap.xml` генерируется из `sitemapRoutes` и теперь содержит `lastmod`.
- `robots.txt` разрешает индексацию публичных страниц, ссылается на sitemap и закрывает служебные пути `/.lead-outbox/` и `/_actions/`.
- Query-сценарии выбора тарифа и адреса канонизируются на `/connect/`, чтобы не плодить дубль-страницы.

## Производительность

- В проект добавлен dev-инструмент `lighthouse` для повторяемого аудита Core Web Vitals и SEO.
- В production preview ключевые страницы не подключают внешние шрифты, тяжелые изображения или клиентские UI-фреймворки.
- Для отложенных секций добавлены `content-visibility: auto` и `contain-intrinsic-size`, чтобы снизить стоимость первичного рендера без layout shift.
- Для будущих изображений глобально закреплено `height: auto; max-width: 100%`; на этапе 7 bitmap-изображений в `src` и `public` нет, поэтому отдельная оптимизация изображений не требовалась.
- Анимации остаются легкими и отключаются через `prefers-reduced-motion`.

## Доступность

- Добавлен skip-link к основному содержимому.
- `main` получил стабильную точку фокуса `id="main-content"` для клавиатурной навигации.
- Mobile navigation остается native `details/summary`, получает понятную accessible-name и открывается без клиентского JavaScript.
- Форма заявки сохраняет fieldset/legend-группировку, видимые labels, native `required`, honeypot вне tab order и server-side status с `role="status"` или `role="alert"`.
- После отправки формы status-блок получает фокус, чтобы keyboard/screen-reader пользователь сразу услышал результат.
- Динамический summary выбранного тарифа получил `aria-live="polite"`.

## Lighthouse mobile

Аудит выполнен 2026-05-07 на `http://127.0.0.1:4321/` в production preview после `npm run build`.

| Страница | Performance | Accessibility | SEO | Best Practices |
| --- | ---: | ---: | ---: | ---: |
| `/` | 100 | 100 | 100 | 96 |
| `/connect/` | 100 | 100 | 100 | 96 |
| `/tariffs/` | 100 | 96 | 100 | 96 |
| `/support/` | 100 | 100 | 100 | 96 |

Отчеты сохранены в `dist/lighthouse-*-mobile-preview.json`; `dist/` не попадает в git.

## Проверки

- `npm test`: 5 test files, 11 tests passed.
- `npm run check`: 0 ошибок, 0 предупреждений, 0 hints.
- `npm run build`: production build собран, `/`, `/connect/` и `/tariffs/` являются on-demand routes, остальные страницы prerender.
- `robots.txt` и `sitemap.xml` проверены через production preview.
- Lighthouse mobile выполнен для главной, подключения, тарифов и поддержки.

## Ограничения

- Production-origin зависит от `PUBLIC_SITE_URL`; локальные отчеты используют `http://127.0.0.1:4321/`.
- Финальные контакты, юридические тексты, медиа и подтвержденные тарифы Kubtel еще не предоставлены, поэтому Schema.org не содержит непроверенных телефонов, адресов офисов или confirmed-offer статусов.
- Dependency advisory закрыт на этапе 9 обновлением до Astro 6.x и совместимого Node adapter; `npm audit --omit=dev` проходит без production-уязвимостей.
