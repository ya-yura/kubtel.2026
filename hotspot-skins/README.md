# Hotspot Skins

Универсальный пакет статичных captive portal скинов для гостевого Wi-Fi. Пакет рассчитан на быстрый перенос на MikroTik RouterOS Hotspot, pfSense, Omada ZIP/import и внешние порталы для UniFi, Meraki, Keenetic/Coova-Chilli, Eltex, Aruba, Huawei, Ruckus, Ruijie и облачных Hotspot-сервисов.

## Структура

- `core/portal.css` - единая визуальная система, CSS-переменные бренда и адаптивная верстка.
- `core/portal.js` - минимальный JS: маска телефона, проверка формы, таймер повторной отправки кода, RU/ENG.
- `assets/logo-wordmark.svg` - локальный логотип для demo.
- `demo/` - статичные демонстрационные страницы.
- `adapters/mikrotik/` - готовый набор файлов под директорию RouterOS `/hotspot`.
- `adapters/pfsense/` - portal/error/logout шаблоны под pfSense Captive Portal.
- `adapters/generic-external/` - базовый внешний портал для Meraki/UniFi/Eltex/Aruba/Huawei/Ruckus/Ruijie/облачных систем.
- `docs/analysis.md` - ограничения оборудования и UX-концепция.
- `docs/equipment-adapters.md` - что менять и куда загружать.
- `docs/customization.md` - кастомизация за 5-10 минут.
- `docs/compatibility-checklist.md` - чек-лист запуска и тестирования.

## Быстрый старт

1. Откройте `demo/login.html` в браузере и проверьте внешний вид.
2. Поменяйте CSS-переменные в начале `core/portal.css`.
3. Замените `assets/logo-wordmark.svg`.
4. Перенесите те же правки в папку нужного адаптера или заново скопируйте `core/portal.css`, `core/portal.js` и логотип в адаптер.
5. Подставьте реальные `action`, имена полей, URL соглашения и endpoint отправки SMS/callback в HTML выбранного адаптера.

## Что уже заложено

- mobile-first раскладка с touch-targets от 48px;
- локальные ресурсы без CDN;
- один легкий CSS-файл и один легкий JS-файл;
- брендинг через CSS-переменные;
- обязательный чекбокс согласия;
- SMS/call/voucher сценарии;
- success/status, error, logout, redirect и agreement страницы;
- рекламный/служебный слот, который можно отключить через `data-enabled="false"`;
- русская основа и простой RU/ENG переключатель.

## Важное ограничение

Статичный HTML не может сам отправить SMS, выполнить callback, записать идентификационные данные или выдать доступ в сеть. Для промышленного запуска нужен backend, RADIUS/AAA или Hotspot-сервис, который:

- отправляет и проверяет код;
- хранит связку пользователь/номер/устройство/время/IP/MAC согласно принятому процессу оператора;
- возвращает grant/authorize в контроллер или роутер.
