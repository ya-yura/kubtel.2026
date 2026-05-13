export type PriceStatus = "confirmed" | "needs_verification" | "unknown";

export type PriceValue = {
  monthly?: number | null;
  oneTime?: number | null;
  status?: PriceStatus;
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

export type InternetOfficeInput = {
  speedMbps: number;
  staticIpCount?: number;
  backupChannel?: boolean;
  routerSetup?: boolean;
  slaNeed?: boolean;
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
  archiveDays: 3 | 7 | 14 | 30;
  hardwareCount?: number;
  installNeed?: boolean;
  annualPayment?: boolean;
};

export type VpsInput = {
  vCpu: number;
  ramGb: number;
  ssdGb?: number;
  hddGb?: number;
  ipCount?: number;
  backup?: boolean;
  ddosProtection?: boolean;
};

export type VdiInput = {
  seats: number;
  preset: "basic" | "standard" | "power";
  backup?: boolean;
};

export type ColocationInput = {
  rackUnits: number;
  powerWatts: number;
  ipv4Count?: number;
  internetPort: "100m" | "1g" | "10g";
  ipmi?: boolean;
  remoteHands?: boolean;
};

export type WifiAuthInput = {
  plan: "basic" | "standard" | "premium";
  sitesCount: number;
  smsNeed?: boolean;
  brandedPage?: boolean;
};

export function calculateInternetOffice(
  input: InternetOfficeInput,
  pricing: BusinessPricingCatalog
): BusinessCalculationResult<InternetOfficeInput> {
  const accumulator = createAccumulator();

  addLine(
    accumulator,
    pricing[`internet.speed.${input.speedMbps}`],
    `internet.speed.${input.speedMbps}`
  );
  addRepeatedLine(
    accumulator,
    pricing["internet.static_ip"],
    input.staticIpCount ?? 0,
    "internet.static_ip"
  );
  addOptionalLine(
    accumulator,
    pricing["internet.backup_channel"],
    Boolean(input.backupChannel),
    "internet.backup_channel"
  );
  addOptionalLine(
    accumulator,
    pricing["internet.router_setup"],
    Boolean(input.routerSetup),
    "internet.router_setup"
  );

  if (input.slaNeed) {
    accumulator.unknownItems.add("internet.sla");
  }

  return finalizeCalculation(accumulator, input, `Интернет ${input.speedMbps} Мбит/с`);
}

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

  addRepeatedLine(
    accumulator,
    pricing[`cctv.archive.${input.archiveDays}`],
    input.camerasCount,
    `cctv.archive.${input.archiveDays}`
  );
  addRepeatedLine(accumulator, pricing["cctv.camera"], input.hardwareCount ?? 0, "cctv.camera");
  addOptionalLine(accumulator, pricing["cctv.install"], Boolean(input.installNeed), "cctv.install");

  return finalizeCalculation(
    accumulator,
    input,
    `Видеонаблюдение: ${input.camerasCount} камер, архив ${input.archiveDays} дней`
  );
}

export function calculateVps(
  input: VpsInput,
  pricing: BusinessPricingCatalog
): BusinessCalculationResult<VpsInput> {
  const accumulator = createAccumulator();

  addRepeatedLine(accumulator, pricing["vps.cpu"], input.vCpu, "vps.cpu");
  addRepeatedLine(accumulator, pricing["vps.ram_gb"], input.ramGb, "vps.ram_gb");
  addRepeatedLine(accumulator, pricing["vps.ssd_gb"], input.ssdGb ?? 0, "vps.ssd_gb");
  addRepeatedLine(accumulator, pricing["vps.hdd_gb"], input.hddGb ?? 0, "vps.hdd_gb");
  addRepeatedLine(accumulator, pricing["vps.ip"], input.ipCount ?? 0, "vps.ip");
  addOptionalLine(accumulator, pricing["vps.backup"], Boolean(input.backup), "vps.backup");
  addOptionalLine(accumulator, pricing["vps.ddos"], Boolean(input.ddosProtection), "vps.ddos");

  return finalizeCalculation(accumulator, input, `VPS: ${input.vCpu} CPU, ${input.ramGb} ГБ RAM`);
}

export function calculateVdi(
  input: VdiInput,
  pricing: BusinessPricingCatalog
): BusinessCalculationResult<VdiInput> {
  const accumulator = createAccumulator();

  addRepeatedLine(accumulator, pricing[`vdi.${input.preset}`], input.seats, `vdi.${input.preset}`);
  addOptionalLine(accumulator, pricing["vdi.backup"], Boolean(input.backup), "vdi.backup");

  return finalizeCalculation(
    accumulator,
    input,
    `VDI: ${input.seats} рабочих мест, preset ${input.preset}`
  );
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
    pricing[`colocation.port.${input.internetPort}`],
    `colocation.port.${input.internetPort}`
  );
  addOptionalLine(accumulator, pricing["colocation.ipmi"], Boolean(input.ipmi), "colocation.ipmi");
  addOptionalLine(
    accumulator,
    pricing["colocation.remote_hands"],
    Boolean(input.remoteHands),
    "colocation.remote_hands"
  );

  if (input.powerWatts > 1000 || input.internetPort === "10g") {
    accumulator.requiredConsultation = true;
  }

  return finalizeCalculation(
    accumulator,
    input,
    `Colocation: ${input.rackUnits}U, ${input.powerWatts} Вт, порт ${input.internetPort}`
  );
}

export function calculateWifiAuth(
  input: WifiAuthInput,
  pricing: BusinessPricingCatalog
): BusinessCalculationResult<WifiAuthInput> {
  const accumulator = createAccumulator();

  addRepeatedLine(
    accumulator,
    pricing[`wifi_auth.${input.plan}`],
    input.sitesCount,
    `wifi_auth.${input.plan}`
  );
  addOptionalLine(accumulator, pricing["wifi_auth.sms"], Boolean(input.smsNeed), "wifi_auth.sms");
  addOptionalLine(
    accumulator,
    pricing["wifi_auth.branded_page"],
    Boolean(input.brandedPage),
    "wifi_auth.branded_page"
  );

  return finalizeCalculation(
    accumulator,
    input,
    `Wi-Fi авторизация: ${input.plan}, ${input.sitesCount} площадок`
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
  if (!price || price.status === "unknown") {
    accumulator.unknownItems.add(key);
    accumulator.requiredConsultation = true;
    return;
  }

  if (price.status === "needs_verification") {
    accumulator.unknownItems.add(key);
    accumulator.requiredConsultation = true;
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
