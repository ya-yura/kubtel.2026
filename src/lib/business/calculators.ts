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
