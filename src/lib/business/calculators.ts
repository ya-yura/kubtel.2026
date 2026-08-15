import {
  telephonyPricing,
  type TelephonyConnectionType,
  type TelephonyTariff,
  type TelephonyPricing
} from "@lib/business/telephony-pricing";

export type PriceStatus = "confirmed" | "needs_verification" | "unknown";

export type PriceValue = {
  monthly?: number | null;
  oneTime?: number | null;
  status?: PriceStatus;
  unitLabel?: string;
};

export type BusinessPricingCatalog = Record<string, PriceValue | undefined>;

export type BusinessCalculationResult<TDetails extends Record<string, unknown>> = {
  monthly: number | null;
  oneTime: number | null;
  unknownItems: string[];
  requiredConsultation: boolean;
  summary: string;
  details: TDetails;
};

export type TelephonyInput = {
  ports: number;
  phoneNumbers: number;
  externalLines?: number;
  virtualPbx?: boolean;
  autoAttendant?: boolean;
};

export type OrdinaryTelephonyInput = {
  connectionType: TelephonyConnectionType;
  tariff: TelephonyTariff;
};

export type MultichannelTelephonyInput = {
  connectionType: TelephonyConnectionType;
  tariff: TelephonyTariff;
  ports: number;
};

export type ProTelephonyInput = {
  tariff: TelephonyTariff;
  phoneNumbers: number;
  externalLines: number;
};

export type VirtualPbxTelephonyInput = {
  connectionType: TelephonyConnectionType;
  tariff: TelephonyTariff;
  ports: number;
  phoneNumbers: number;
  externalLines: number;
};

export type CctvInput = {
  camerasCount: number;
  archiveDays: 7 | 14 | 30;
  hardwareCount?: number;
  installNeed?: boolean;
  annualPayment?: boolean;
};

export type VpsInput = {
  vCpu: number;
  ramGb: number;
  ssdGb?: number;
  ipCount?: number;
  backup?: boolean;
};

export type ColocationInput = {
  rackUnits: number;
  powerWatts: number;
  ipv4Count?: number;
  internetPlan: "100m" | "1g-50tb" | "1g-unlimited";
  ipmi?: boolean;
};

export function calculateTelephony(
  input: TelephonyInput,
  pricing: BusinessPricingCatalog
): BusinessCalculationResult<TelephonyInput> {
  const accumulator = createAccumulator();

  addRepeatedLine(accumulator, pricing["telephony.port"], input.ports, "telephony.port");
  addRepeatedLine(
    accumulator,
    pricing["telephony.phone_number"],
    input.phoneNumbers,
    "telephony.phone_number"
  );
  addRepeatedLine(
    accumulator,
    pricing["telephony.external_line"],
    input.externalLines ?? 0,
    "telephony.external_line"
  );
  addOptionalLine(
    accumulator,
    pricing["telephony.virtual_pbx"],
    Boolean(input.virtualPbx),
    "telephony.virtual_pbx"
  );
  addOptionalLine(
    accumulator,
    pricing["telephony.auto_attendant"],
    Boolean(input.autoAttendant),
    "telephony.auto_attendant"
  );

  return finalizeCalculation(
    accumulator,
    input,
    `Телефония: ${input.ports} портов, ${input.phoneNumbers} номеров`
  );
}

export function calculateOrdinaryTelephony(
  input: OrdinaryTelephonyInput,
  pricing: TelephonyPricing = telephonyPricing
): BusinessCalculationResult<OrdinaryTelephonyInput> {
  return completeTelephonyCalculation(
    input,
    pricing.ordinary.monthly[input.tariff],
    pricing.ordinary.connectionOneTime[input.connectionType],
    `Обычное подключение: ${getConnectionLabel(input.connectionType)}, ${getTariffLabel(input.tariff)}`
  );
}

export function calculateMultichannelTelephony(
  input: MultichannelTelephonyInput,
  pricing: TelephonyPricing = telephonyPricing
): BusinessCalculationResult<MultichannelTelephonyInput> {
  const monthly =
    input.ports * pricing.multichannel.portMonthly[input.connectionType][input.tariff];
  const oneTime = calculateSetupCost(pricing.multichannel.setup[input.connectionType], input.ports);

  return completeTelephonyCalculation(
    input,
    monthly,
    oneTime,
    `Многоканальный телефон: ${input.ports} портов, ${getConnectionLabel(input.connectionType)}, ${getTariffLabel(input.tariff)}`
  );
}

export function calculateProTelephony(
  input: ProTelephonyInput,
  pricing: TelephonyPricing = telephonyPricing
): BusinessCalculationResult<ProTelephonyInput> {
  const extraNumbers = Math.max(input.phoneNumbers - input.externalLines, 0);
  const monthly =
    input.externalLines * pricing.pro.lineMonthly[input.tariff] +
    extraNumbers * pricing.pro.extraNumberMonthly;
  const oneTime =
    pricing.pro.installation +
    Math.max(input.phoneNumbers, input.externalLines) * pricing.pro.portOneTime;

  return completeTelephonyCalculation(
    input,
    monthly,
    oneTime,
    `Серия ПРО: ${input.phoneNumbers} номеров ТФОП, ${input.externalLines} соединительных линий, ${getTariffLabel(input.tariff)}`
  );
}

export function calculateVirtualPbxTelephony(
  input: VirtualPbxTelephonyInput,
  pricing: TelephonyPricing = telephonyPricing
): BusinessCalculationResult<VirtualPbxTelephonyInput> {
  const extraNumbers = Math.max(input.phoneNumbers - input.externalLines, 0);
  const monthly =
    input.ports * pricing.virtualPbx.portMonthly[input.connectionType] +
    input.externalLines *
      pricing.virtualPbx.externalLineMonthly[input.connectionType][input.tariff] +
    (input.connectionType === "digital" ? extraNumbers * pricing.virtualPbx.extraNumberMonthly : 0);
  const oneTime =
    calculateSetupCost(pricing.virtualPbx.setup[input.connectionType], input.ports) +
    Math.max(input.phoneNumbers - 1, 0) * pricing.virtualPbx.extraNumberOneTime +
    Math.max(input.externalLines - 1, 0) * pricing.virtualPbx.extraExternalLineOneTime;

  return completeTelephonyCalculation(
    input,
    monthly,
    oneTime,
    `Виртуальная АТС: ${input.ports} портов, ${input.phoneNumbers} номеров ТФОП, ${input.externalLines} внешних линий, ${getConnectionLabel(input.connectionType)}, ${getTariffLabel(input.tariff)}`
  );
}

export function calculateCctv(
  input: CctvInput,
  pricing: BusinessPricingCatalog
): BusinessCalculationResult<CctvInput> {
  const accumulator = createAccumulator();

  if (input.camerasCount <= 30) {
    addRepeatedLine(
      accumulator,
      pricing[`cctv.archive.${input.archiveDays}`],
      input.camerasCount,
      `cctv.archive.${input.archiveDays}`
    );
  } else {
    accumulator.unknownItems.add("cctv.more_than_30");
    accumulator.requiredConsultation = true;
  }
  addRepeatedLine(accumulator, pricing["cctv.camera"], input.hardwareCount ?? 0, "cctv.camera");
  addOptionalLine(accumulator, pricing["cctv.install"], Boolean(input.installNeed), "cctv.install");

  const summaryParts = [
    `${input.camerasCount} камер`,
    `архив ${input.archiveDays} дней`,
    (input.hardwareCount ?? 0) > 0 ? `камер к поставке: ${input.hardwareCount}` : "",
    input.installNeed ? "нужен монтаж" : ""
  ].filter(Boolean);

  return finalizeCalculation(accumulator, input, `Видеонаблюдение: ${summaryParts.join(", ")}`);
}

export function calculateVps(
  input: VpsInput,
  pricing: BusinessPricingCatalog
): BusinessCalculationResult<VpsInput> {
  const accumulator = createAccumulator();

  addRepeatedLine(accumulator, pricing["vps.cpu"], input.vCpu, "vps.cpu");
  addRepeatedLine(accumulator, pricing["vps.ram_gb"], input.ramGb, "vps.ram_gb");
  addRepeatedLine(accumulator, pricing["vps.ssd_gb"], input.ssdGb ?? 0, "vps.ssd_gb");
  addRepeatedLine(accumulator, pricing["vps.ip"], input.ipCount ?? 0, "vps.ip");
  addOptionalLine(accumulator, pricing["vps.backup"], Boolean(input.backup), "vps.backup");

  return finalizeCalculation(accumulator, input, `VPS: ${input.vCpu} CPU, ${input.ramGb} ГБ RAM`);
}

export function calculateColocation(
  input: ColocationInput,
  pricing: BusinessPricingCatalog
): BusinessCalculationResult<ColocationInput> {
  const accumulator = createAccumulator();

  addRepeatedLine(accumulator, pricing["colocation.unit"], input.rackUnits, "colocation.unit");
  addRepeatedLine(
    accumulator,
    pricing["colocation.power_100w"],
    Math.ceil(input.powerWatts / 100),
    "colocation.power_100w"
  );
  addRepeatedLine(accumulator, pricing["colocation.ipv4"], input.ipv4Count ?? 0, "colocation.ipv4");
  addLine(
    accumulator,
    pricing[`colocation.internet.${input.internetPlan}`],
    `colocation.internet.${input.internetPlan}`
  );
  addOptionalLine(accumulator, pricing["colocation.ipmi"], Boolean(input.ipmi), "colocation.ipmi");
  addLine(accumulator, pricing["colocation.initial_placement"], "colocation.initial_placement");

  return finalizeCalculation(
    accumulator,
    input,
    `Colocation: ${input.rackUnits}U, ${input.powerWatts} Вт, интернет ${input.internetPlan}`
  );
}

function completeTelephonyCalculation<TDetails extends Record<string, unknown>>(
  details: TDetails,
  monthly: number,
  oneTime: number,
  summary: string
): BusinessCalculationResult<TDetails> {
  return {
    monthly,
    oneTime,
    unknownItems: [],
    requiredConsultation: false,
    summary,
    details
  };
}

function calculateSetupCost(
  setup: {
    base: readonly { ports: number; price: number }[];
    additional: readonly { ports: number; price: number }[];
  },
  ports: number
): number {
  const additionalCosts = Array.from({ length: ports + 1 }, () => Number.POSITIVE_INFINITY);
  additionalCosts[0] = 0;

  for (let count = 1; count <= ports; count += 1) {
    for (const option of setup.additional) {
      if (count >= option.ports) {
        additionalCosts[count] = Math.min(
          additionalCosts[count],
          additionalCosts[count - option.ports] + option.price
        );
      }
    }
  }

  return Math.min(
    ...setup.base.map((base) => {
      if (ports <= base.ports) {
        return base.price;
      }

      const extraPorts = ports - base.ports;
      return base.price + additionalCosts[extraPorts];
    })
  );
}

function getConnectionLabel(connectionType: TelephonyConnectionType): string {
  return connectionType === "analog" ? "аналоговое подключение" : "цифровое подключение";
}

function getTariffLabel(tariff: TelephonyTariff): string {
  return tariff === "unlimited" ? "безлимитный тариф" : "повременный тариф";
}

function createAccumulator(): {
  monthly: number;
  oneTime: number;
  hasMonthly: boolean;
  hasOneTime: boolean;
  unknownItems: Set<string>;
  requiredConsultation: boolean;
} {
  return {
    monthly: 0,
    oneTime: 0,
    hasMonthly: false,
    hasOneTime: false,
    unknownItems: new Set<string>(),
    requiredConsultation: false
  };
}

function addOptionalLine(
  accumulator: ReturnType<typeof createAccumulator>,
  price: PriceValue | undefined,
  enabled: boolean,
  key: string
): void {
  if (!enabled) {
    return;
  }

  addLine(accumulator, price, key);
}

function addRepeatedLine(
  accumulator: ReturnType<typeof createAccumulator>,
  price: PriceValue | undefined,
  quantity: number,
  key: string
): void {
  if (quantity <= 0) {
    return;
  }

  addLine(accumulator, price, key, quantity);
}

function addLine(
  accumulator: ReturnType<typeof createAccumulator>,
  price: PriceValue | undefined,
  key: string,
  quantity = 1
): void {
  if (!price || price.status !== "confirmed") {
    accumulator.unknownItems.add(key);
    accumulator.requiredConsultation = true;
    return;
  }

  if (typeof price.monthly === "number") {
    accumulator.monthly += price.monthly * quantity;
    accumulator.hasMonthly = true;
  }

  if (typeof price.oneTime === "number") {
    accumulator.oneTime += price.oneTime * quantity;
    accumulator.hasOneTime = true;
  }
}

function finalizeCalculation<TDetails extends Record<string, unknown>>(
  accumulator: ReturnType<typeof createAccumulator>,
  details: TDetails,
  summary: string
): BusinessCalculationResult<TDetails> {
  return {
    monthly: accumulator.hasMonthly ? accumulator.monthly : null,
    oneTime: accumulator.hasOneTime ? accumulator.oneTime : null,
    unknownItems: [...accumulator.unknownItems],
    requiredConsultation: accumulator.requiredConsultation || accumulator.unknownItems.size > 0,
    summary,
    details
  };
}
