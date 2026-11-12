# Customization

## За 5-10 минут

1. Замените логотип:
   - `assets/logo-wordmark.svg` для demo/core;
   - `logo-wordmark.svg` внутри нужного адаптера.
2. В начале `portal.css` поменяйте:
   - `--cp-brand`;
   - `--cp-brand-hover`;
   - `--cp-brand-active`;
   - `--cp-info`;
   - `--cp-page-soft`;
   - `--cp-page-warm`;
   - `--cp-logo-width`.
3. В HTML поменяйте:
   - `Гостевой Wi-Fi`;
   - название заведения;
   - телефон поддержки;
   - ссылку на agreement/policy;
   - промо-блок `.cp-side-slot`.
4. Для отключения рекламы поставьте:

```html
<aside class="cp-side-slot" data-enabled="false"></aside>
```

5. Для темной темы добавьте `data-theme="dark"` на `html` или `body`.

## Что не менять без необходимости

- `min-height` кнопок и полей: 48px нужен для мобильных captive browser.
- `name` полей в vendor-адаптерах, пока не сверите контракт оборудования.
- RouterOS-переменные `$(...)`.
- pfSense placeholders `$PORTAL_ACTION$`, `$PORTAL_REDIRURL$`.
- Относительные пути в Omada ZIP.

## Рекламный модуль

Промо-блок специально сделан вторичным:

- справа на desktop;
- ниже формы на mobile;
- без перекрытия формы;
- с обычной ссылкой, чтобы работал без JS.

Если промо ведет на внешний сайт до авторизации, добавьте этот домен в walled garden. Иначе ссылка может не открыться.

## SMS/callback endpoint

Кнопка `data-code-request` сейчас запускает только валидацию телефона и таймер. Для промышленной отправки кода есть два варианта:

1. Заменить кнопку на submit отдельной формы, которую понимает Hotspot-сервис.
2. Добавить короткий `fetch()` к локальному или walled garden endpoint. Перед этим убедитесь, что captive browser разрешает запрос и CORS настроен правильно.

Для максимальной совместимости первый вариант надежнее.
