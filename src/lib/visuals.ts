export type PromoVisual = {
  src: string;
  alt: string;
  label: string;
  caption: string;
};

export const promoVisuals = {
  home: {
    src: "/visuals/home-fiber-living.png",
    alt: "Современная квартира с роутером, ноутбуком и работающим домашним интернетом",
    label: "Домашний интернет",
    caption: "Домашний Wi‑Fi, понятные условия и живой разговор со специалистом."
  },
  business: {
    src: "/visuals/business-vip-network.png",
    alt: "Собственник бизнеса и инженер смотрят на сетевой мониторинг в современном офисе",
    label: "B2B-сервис",
    caption: "Персональный менеджер, инженеры и инфраструктура вокруг задач бизнеса."
  },
  connection: {
    src: "/visuals/connection-technician.png",
    alt: "Инженер аккуратно подключает оптический интернет в подъездном шкафу",
    label: "Подключение",
    caption: "Аккуратный монтаж и понятный следующий шаг после звонка."
  },
  support: {
    src: "/visuals/support-engineer.png",
    alt: "Инженер поддержки с гарнитурой следит за сетевым мониторингом",
    label: "Живая поддержка",
    caption: "Вопрос попадает к человеку, который понимает сеть и ситуацию клиента."
  },
  entertainment: {
    src: "/visuals/home-entertainment.png",
    alt: "Семья смотрит кино, играет и общается дома через стабильный Wi‑Fi",
    label: "Сценарии дома",
    caption: "Фильмы, игры, учёба и видеозвонки без борьбы за канал."
  },
  datacenter: {
    src: "/visuals/datacenter-colocation.png",
    alt: "Инженер проверяет оборудование в современном дата-центре",
    label: "Инфраструктура",
    caption: "Серверы, каналы и резервирование в управляемом контуре."
  },
  cafeWifi: {
    src: "/visuals/cafe-wifi.png",
    alt: "Современное кафе с гостевым Wi‑Fi, кассой и посетителями со смартфонами",
    label: "Гостевой Wi‑Fi",
    caption: "Публичный доступ для гостей, кассы и сервисы бизнеса на связи."
  },
  localTeam: {
    src: "/visuals/local-team-network.png",
    alt: "Локальная команда провайдера обсуждает карту городской сети",
    label: "Локальная команда",
    caption: "Люди, которые знают город, районы и реальные задачи клиентов."
  }
} satisfies Record<string, PromoVisual>;

const residentialServiceVisualKeys: Record<string, keyof typeof promoVisuals> = {
  internet: "home",
  tv: "entertainment",
  "static-ip": "datacenter"
};

const businessVisualKeys: Record<string, keyof typeof promoVisuals> = {
  internet: "business",
  "static-ip": "datacenter",
  telephony: "support",
  cctv: "business",
  "wifi-auth": "cafeWifi",
  vps: "datacenter",
  vdi: "business",
  colocation: "datacenter",
  "datacenter-access": "datacenter",
  smb: "cafeWifi",
  operators: "datacenter",
  b2g: "business",
  government: "business"
};

export function getResidentialServiceVisual(slug: string): PromoVisual {
  return promoVisuals[residentialServiceVisualKeys[slug] ?? "home"];
}

export function getBusinessVisual(slug: string): PromoVisual {
  return promoVisuals[businessVisualKeys[slug] ?? "business"];
}
