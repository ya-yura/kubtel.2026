import type { CoverageArea } from "@models/domain";

export type AddressCheckStatus = "available" | "manual_check" | "unavailable" | "uncertain";

export type AddressCheckResult = {
  status: AddressCheckStatus;
  statusLabel: string;
  confidence: "high" | "medium" | "low";
  areaSlug: string | null;
  areaTitle: string | null;
  availableTariffs: string[];
  message: string;
};

const statusLabels: Record<AddressCheckStatus, string> = {
  available: "Подключение доступно",
  manual_check: "Нужна ручная проверка",
  unavailable: "Пока вне зоны подключения",
  uncertain: "Адрес распознан неуверенно"
};

export function checkAddressCoverage(
  rawAddress: string,
  coverageAreas: CoverageArea[]
): AddressCheckResult {
  const address = normalizeAddress(rawAddress);

  if (address.length === 0) {
    return createFallbackResult(
      "manual_check",
      "low",
      "Адрес и возможность подключения оператор уточнит на звонке.",
      "Адрес уточнит оператор"
    );
  }

  if (!hasStreetLikeInput(address)) {
    return createFallbackResult(
      "uncertain",
      "low",
      "Добавьте улицу и дом, чтобы команда Kubtel могла проверить подключение точнее."
    );
  }

  const streetMatch = coverageAreas.find((area) =>
    area.streets.some((street) => address.includes(normalizeAddress(street)))
  );

  if (streetMatch) {
    return createAreaResult(streetMatch, "high");
  }

  const cityMatch = coverageAreas.find((area) => {
    const city = normalizeAddress(area.city);
    return area.type === "city" && city.length > 0 && address.includes(city);
  });

  if (cityMatch) {
    return createAreaResult(cityMatch, "medium");
  }

  const draftCity = coverageAreas.find((area) => area.type === "city");

  if (draftCity) {
    return createAreaResult(draftCity, "low");
  }

  return createFallbackResult(
    "manual_check",
    "low",
    "Адрес отправлен на ручную проверку: подтвержденная база покрытия пока не подключена."
  );
}

export function normalizeAddress(value: string): string {
  return value
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createAreaResult(area: CoverageArea, confidence: AddressCheckResult["confidence"]) {
  const status = mapCoverageStatus(area.connectionStatus);

  return {
    status,
    statusLabel: statusLabels[status],
    confidence,
    areaSlug: area.slug,
    areaTitle: area.title,
    availableTariffs: area.availableTariffs,
    message: area.contactHint
  };
}

function createFallbackResult(
  status: AddressCheckStatus,
  confidence: AddressCheckResult["confidence"],
  message: string,
  statusLabel = statusLabels[status]
): AddressCheckResult {
  return {
    status,
    statusLabel,
    confidence,
    areaSlug: null,
    areaTitle: null,
    availableTariffs: [],
    message
  };
}

function hasStreetLikeInput(address: string): boolean {
  return /\d/.test(address) && address.replace(/\d/g, "").trim().length >= 3;
}

function mapCoverageStatus(status: CoverageArea["connectionStatus"]): AddressCheckStatus {
  if (status === "available") {
    return "available";
  }

  if (status === "unavailable") {
    return "unavailable";
  }

  return "manual_check";
}
