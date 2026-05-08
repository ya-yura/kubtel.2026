# Kubtel.ru: технический фундамент этапа 4

Документ фиксирует рабочий контракт каркаса после закрытия этапа 4. Цель - чтобы следующий интерфейсный этап мог добавлять страницы и компоненты без размывания структуры, SEO-основы и контентного слоя.

## Структура каталогов

| Каталог | Роль |
| --- | --- |
| `src/config` | Общие настройки сайта, маршруты, навигация и sitemap-карта |
| `src/content` | Локальные Astro content collections и Zod-схемы данных |
| `src/lib` | Чистые функции: выборки контента, расчет цены, форматирование, статусы проверки |
| `src/types` | Доменные TypeScript-типы, общие для данных, UI и бизнес-логики |
| `src/layouts` | Базовые layout-контракты страниц |
| `src/components` | UI и секции без прямой зависимости от источника данных |
| `src/pages` | Astro routes и технические endpoints |
| `src/styles` | Глобальная дизайн-система и responsive-слой |

## Конфигурация сайта

- `src/config/site.ts` хранит имя бренда, язык, locale, базовый origin, meta-описание и theme color.
- `PUBLIC_SITE_URL` остается единственным внешним источником production-origin. Локальное значение по умолчанию: `http://127.0.0.1:4321`.
- `astro.config.mjs` закрепляет static output и trailing slash, чтобы URL-контракт совпадал с навигацией.

## Маршруты и SEO

- `src/config/routes.ts` содержит основную навигацию, footer-навигацию и список sitemap routes.
- `BaseLayout.astro` отвечает за `title`, `description`, `canonical`, `robots`, Open Graph, Twitter summary и `theme-color`.
- `src/pages/robots.txt.ts` генерирует `robots.txt` с ссылкой на sitemap.
- `src/pages/sitemap.xml.ts` генерирует XML sitemap из общего списка маршрутов.

## Контентный слой

- Страницы получают тарифы и FAQ через `src/lib/content.ts`, а не напрямую через `getCollection`.
- Компоненты продолжают принимать данные через пропсы и не знают, пришли данные из JSON, CMS или API.
- `availableOptions` в тарифах проверяется Zod-enum на уровне content schema и TypeScript-union на уровне доменной модели.
- `responsible` в `contentSource` ограничен ролями `commercial`, `operations`, `coverage`, `content`.

## Проверки

| Скрипт | Назначение |
| --- | --- |
| `npm run check` | Astro diagnostics, TypeScript и content collections |
| `npm run lint` | Алиас на `astro check` до подключения отдельного ESLint-контура |
| `npm run format` | Prettier для исходников и корневых конфигов |
| `npm run format:check` | Проверка форматирования без записи |
| `npm run build` | `astro check` и статическая сборка |

## Готовность к этапу 5

- Новый раздел добавляется через `src/pages`, общий layout и при необходимости запись в `src/config/routes.ts`.
- Новый тариф добавляется как JSON в `src/content/tariffs`; UI получает его через `getTariffs()` после успешной content-проверки.
- Новая SEO-страница должна передавать `title`, `description` и `canonicalPath` в `BaseLayout`.
- Новые данные не должны попадать напрямую в компоненты в обход `src/lib/content.ts`, если это общая коллекция.
