export type DeviceProduct = {
  id: string;
  category: string;
  title: string;
  summary: string;
  image?: string;
  alt?: string;
  price?: number;
  specs: string[];
  detailHref?: string;
};

const officialDevicesPath = "https://kubtel.ru/files/image/devices/thumb";

export const residentialDeviceProducts: DeviceProduct[] = [
  {
    id: "router-ac22",
    category: "Wi‑Fi-роутер",
    title: "SNR ADVANCE AC22",
    summary: "Двухдиапазонный роутер для домашнего интернета и нескольких устройств.",
    image: `${officialDevicesPath}/SNR-Advance-AC22_s.png`,
    alt: "Wi‑Fi роутер SNR ADVANCE AC22",
    price: 4000,
    specs: [
      "Wi‑Fi: 2,4 и 5 ГГц",
      "Порты: LAN 4, WAN 1",
      "Скорость LAN/WAN: 100–1000 Мбит/с",
      "Размеры: 210 × 144 × 31 мм",
      "Питание: 12 В DC, 1 А"
    ],
    detailHref: "https://kubtel.ru/individual/devices/"
  },
  {
    id: "tv-vermax-uhd300x",
    category: "ТВ-приставка",
    title: "4K IPTV Vermax UHD300X",
    summary: "Приставка для Кубтел ТВ с 4K, IPTV и подключением по HDMI.",
    image: "https://kubtel.ru/files/image/tv/Vermax_UHD_300_4K_IPTV_s.png",
    alt: "ТВ-приставка 4K IPTV Vermax UHD300X",
    price: 4000,
    specs: [
      "Максимальное разрешение: 4K UHD",
      "Процессор: Amlogic S905X",
      "Оперативная память: 1 ГБ",
      "Интерфейсы: HDMI 2.0, USB 2.0, Ethernet 10/100",
      "Размеры: 85 × 16 × 85 мм"
    ],
    detailHref: "https://kubtel.ru/individual/tv/"
  }
];

export const businessDeviceProducts: DeviceProduct[] = [
  {
    id: "ip-phone-htek-uc902s",
    category: "IP-телефон",
    title: "Htek UC902S RU",
    summary: "Рабочий IP-телефон для сотрудника, ресепшена или небольшого отдела.",
    image: `${officialDevicesPath}/IPTelHtekUC902SP_s.png`,
    alt: "IP-телефон Htek UC902S RU",
    price: 4955,
    specs: [
      "2 SIP-аккаунта",
      "5-сторонняя конференция",
      "Ethernet 10/100",
      "1 разъём RJ9 для трубки и 1 для гарнитуры",
      "HD-аудио, телефонная книга до 1000 записей"
    ],
    detailHref: "https://kubtel.ru/individual/devices/73/"
  },
  {
    id: "sip-dect-kx-tgp600",
    category: "IP-телефон",
    title: "KX-TGP600 — SIP-DECT",
    summary: "Беспроводная телефония для офиса: одна база и несколько трубок.",
    image: `${officialDevicesPath}/KX-TGP600_s.png`,
    alt: "SIP-DECT телефон KX-TGP600",
    price: 11900,
    specs: [
      "До 8 трубок на одной базе",
      "До 8 одновременных разговоров",
      "HD VoIP",
      "SIP-DECT для офиса и рабочих групп"
    ],
    detailHref: "https://kubtel.ru/individual/devices/"
  },
  {
    id: "sip-adapter-selection",
    category: "SIP-адаптер",
    title: "Адаптер для аналогового телефона",
    summary:
      "Подключает аналоговый телефон к SIP-схеме. Конкретная модель и число FXS-портов подбираются под вашу ВАТС.",
    specs: [
      "Подключение аналогового телефона к SIP",
      "Количество FXS-портов — по задаче",
      "Совместимость с городской телефонией и ВАТС",
      "Модель подтверждает менеджер в расчёте"
    ],
    detailHref: "/business/telephony/#business-telephony-equipment"
  }
];
