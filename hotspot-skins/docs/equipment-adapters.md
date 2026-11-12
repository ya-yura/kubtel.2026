# Equipment Adapters

## MikroTik RouterOS Hotspot

Используйте `adapters/mikrotik/` как базовый upload-пакет.

Файлы для `/hotspot`:

- `login.html`
- `alogin.html`
- `status.html`
- `logout.html`
- `error.html`
- `redirect.html`
- `agreement.html`
- `portal.css`
- `portal.js`
- `logo-wordmark.svg`
- `md5.js` из стандартного MikroTik Hotspot, если включен `http-chap`

Что менять:

- `logo-wordmark.svg` - логотип.
- Текст `Гостевой Wi-Fi`, support-телефон и agreement.
- Если используется SMS/callback сервис, привяжите кнопку `data-code-request` к его endpoint.
- Если RADIUS ожидает другой формат, поменяйте `name="username"` и `name="password"`.

Особенности:

- Для CHAP оставлен стандартный hook `hexMD5("$(chap-id)" + password + "$(chap-challenge)")`.
- Не удаляйте RouterOS-переменные `$(link-login-only)`, `$(link-orig)`, `$(error)`, `$(link-status)`, `$(link-logout)`.
- MikroTik рекомендует править шаблоны вручную, потому что HTML-редакторы могут удалить служебные переменные.

Официальная документация: https://help.mikrotik.com/docs/spaces/ROS/pages/87162881/Hotspot%2Bcustomisation

## pfSense Captive Portal

Используйте `adapters/pfsense/`.

Файлы:

- `portal.html` - Portal page contents.
- `error.html` - Auth error page contents.
- `logout.html` - Logout page contents.
- `portal.css`, `portal.js`, `logo-wordmark.svg` - загрузить через File Manager зоны или встроить в HTML.

Что менять:

- Оставьте `method="post"` и `action="$PORTAL_ACTION$"`.
- Для backend auth используются `auth_user`, `auth_pass`, `redirurl`, submit `accept`.
- Для click-through можно заменить phone/code на скрытые технические credentials или кнопку acceptance-only, если это соответствует политике.

Справка по шаблонам и зонам: https://opennix.org/en/docs/pfsense/captive-portal/pfsense-captive-portal-setup/

## TP-Link Omada / EAP

База: `adapters/generic-external/` или `demo/login.html`.

Варианты:

- Для External Portal Server: разместить `generic-external` на сервере и реализовать `/authorize`.
- Для Import Customized Page: собрать ZIP с `index.html`, `portal.css`, `portal.js`, `logo-wordmark.svg`; все пути должны быть относительными.

Особенности:

- Главная страница ZIP должна называться `index.html`.
- При одиночном HTML нельзя ссылаться на внешние статические ресурсы.
- Лучше держать JS необязательным: нативная форма должна отправляться даже без скрипта.

Официальная документация Omada: https://support.omadanetworks.com/en/document/13086/

## Cisco Meraki EXCAP

База: `adapters/generic-external/`.

Что обязательно:

- Хостить страницу на внешнем сервере.
- Добавить домен/IP портала в walled garden.
- На backend прочитать query params Meraki, сохранить `base_grant_url` и `user_continue_url`.
- После успешной идентификации перенаправить пользователя на grant URL, не хардкодить его.

Официальная документация Meraki EXCAP: https://documentation.meraki.com/Wireless/Operate_and_Maintain/User_Guides/MR_Splash_Page/Configuring_a_Custom-Hosted_Splash_Page_to_Work_with_the_Meraki_Cloud

## Ubiquiti UniFi

База: `adapters/generic-external/`.

Варианты:

- Встроенный Hotspot Portal: использовать брендовые настройки UniFi, если достаточно логотипа, цвета и текста.
- External Portal: разместить шаблон на сервере, принять параметры контроллера и выполнить authorize через выбранный механизм/контроллер API.

Официальная справка UniFi: https://help.ui.com/hc/en-us/articles/115000166827-UniFi-Hotspots-and-Captive-Portals

## Keenetic

База: внешний portal backend по модели UAM/Coova-Chilli, UI можно взять из `adapters/generic-external/`.

Особенности:

- Keenetic описывает Captive Portal как клиент стороннего UAM/RADIUS сервиса.
- Обычно настраивается профиль провайдера или ручные UAM/RADIUS параметры.
- Скин должен жить на стороне сервиса, а роутер передает клиента на него.

Официальная справка Keenetic: https://support.keenetic.com/hero/kn-1012/en/15226-captive-portal.html

## Eltex SoftWLC / NAICE

База: `adapters/generic-external/` или встроенный designer, если нужен только бренд.

Особенности:

- Поддерживаются разные сценарии идентификации: SMS, внутренняя база, LDAP/AD.
- Внешний вид может настраиваться встроенным дизайнером, но для полного скина обычно нужен внешний портал или сервисный модуль.
- Авторизация и выдача доступа должны быть связаны с HTTPS/RADIUS CoA/AAA процессом.

Справка Eltex NAICE: https://eltex-co.com/news/new-version-of-naice-now-supports-captive-portal/

## Aruba

База: `adapters/generic-external/` или внутренний Custom HTML для Login/Welcome.

Что менять:

- Для внутреннего портала загрузить Login/Welcome HTML и поддерживающие файлы.
- Для ClearPass/External Captive Portal реализовать backend flow и RADIUS.

Официальная документация Aruba Custom HTML: https://arubanetworking.hpe.com/techdocs/Archived/AOS-8/ArubaOS_83_Web_Help/Content/ArubaFrameStyles/Captive_Portal/person_capt_prtl_page.htm

## Huawei

База: `adapters/generic-external/`.

Что менять:

- Настроить External Portal Authentication на AC/контроллере.
- Backend должен принимать параметры клиента и возвращать authorization/grant согласно версии контроллера.
- Проверить pre-auth ACL/walled garden для домена портала.

Официальный пример Huawei External Portal Authentication: https://support.huawei.com/enterprise/en/doc/EDOC1100064360/17ea2635/example-for-configuring-external-portal-authentication

## Ruckus

База: `adapters/generic-external/`.

Рекомендации:

- Использовать внешний портал для SmartZone/ZoneDirector/Unleashed, если нужен полный дизайн и SMS/callback.
- Backend должен выполнить logon/authorize через поддерживаемый northbound/API или RADIUS workflow.
- В walled garden добавить домен портала, SMS API, agreement URL и логотипы, если они не локальные.

## Ruijie / Reyee

База: `adapters/generic-external/` или встроенный редактор portal.

Особенности:

- Во встроенном сценарии доступны One-click Login, Voucher, Account, многоязычность, логотип, фон, тексты и цвета.
- Для более полного дизайна используйте External Portal, если конкретная модель/контроллер это поддерживает.

Официальная справка Ruijie JaCS: https://jacs.ruijienetworks.com/wiki2/article/190

## OpenWRT + CoovaChilli / Wifidog

База: `adapters/generic-external/`.

Что менять:

- Указать action/login URL UAM-сервера.
- Сохранить challenge/session/query параметры, которые передает Chilli/Wifidog.
- Проверить `uamallowed` для локальных ресурсов или разместить все inline.

OpenWRT указывает использовать документацию CoovaChilli для актуальных параметров: https://openwrt.org/docs/guide-user/services/captive-portal/wireless.hotspot.coova-chilli

## Облачные Hotspot-сервисы

База: `core/portal.css` и HTML из `demo/login.html`.

Что обычно менять:

- Перенести HTML в редактор шаблона сервиса.
- Заменить field names на плейсхолдеры сервиса.
- Оставить локальные стили или вставить CSS inline, если сервис не принимает отдельные файлы.
- Проверить, не экранирует ли сервис `data-*` атрибуты и inline SVG.
