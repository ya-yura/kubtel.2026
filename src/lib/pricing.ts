import type { PriceBreakdown, Tariff, TariffOption } from "@models/domain";

const optionLabels: Record<TariffOption, string> = {
  routerRent: "Аренда роутера",
  staticIp: "Статический IP",
  tvPack: "ТВ-пакет"
};

const fallbackOptionPrices: Record<TariffOption, number> = {
  routerRent: 150,
  staticIp: 150,
  tvPack: 200
};

export function calculateMonthlyPrice(
  tariff: Tariff,
  selectedOptions: TariffOption[] = []
): PriceBreakdown {
  const base = tariff.promoPrice ?? tariff.priceMonth;
  const options = selectedOptions
    .filter((option) => tariff.availableOptions.includes(option))
    .map((option) => ({
      id: option,
      label: optionLabels[option],
      amount: getOptionPrice(tariff, option)
    }));

  const total = options.reduce((sum, option) => sum + option.amount, base);

  return {
    base,
    options,
    total
  };
}

function getOptionPrice(tariff: Tariff, option: TariffOption): number {
  if (option === "routerRent" && tariff.routerRentPrice !== null) {
    return tariff.routerRentPrice;
  }

  if (option === "staticIp" && tariff.staticIpPrice !== null) {
    return tariff.staticIpPrice;
  }

  return fallbackOptionPrices[option];
}
