import { createHash } from "node:crypto";
import { checkAddressCoverage, type AddressCheckResult } from "@lib/leads/address";
import type { LeadFormInput } from "@lib/leads/schema";
import { calculateMonthlyPrice } from "@lib/pricing";
import type { CoverageArea, PriceBreakdown, Tariff, TariffOption } from "@models/domain";

export type LeadSubmission = {
  id: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
  };
  address: string;
  tariff: {
    slug: string;
    title: string;
  };
  options: TariffOption[];
  pricing: PriceBreakdown;
  coverage: AddressCheckResult;
  consentAccepted: true;
  sourcePath: string;
  userAgent: string | null;
};

export type LeadActionResult = {
  success: true;
  leadId: string;
  message: string;
  addressStatus: AddressCheckResult["status"];
  addressStatusLabel: string;
  tariffTitle: string;
  monthlyTotal: number;
  deliveryMode: "sent" | "reserved";
};

export class LeadSubmissionError extends Error {
  constructor(
    readonly field: "tariff" | "options",
    message: string
  ) {
    super(message);
    this.name = "LeadSubmissionError";
  }
}

export function buildLeadSubmission({
  input,
  tariffs,
  coverageAreas,
  now = new Date(),
  userAgent = null
}: {
  input: LeadFormInput;
  tariffs: Tariff[];
  coverageAreas: CoverageArea[];
  now?: Date;
  userAgent?: string | null;
}): LeadSubmission {
  const tariff = tariffs.find((item) => item.slug === input.tariff);

  if (!tariff) {
    throw new LeadSubmissionError("tariff", "Выбранный тариф не найден");
  }

  const invalidOptions = input.options.filter(
    (option) => !tariff.availableOptions.includes(option)
  );

  if (invalidOptions.length > 0) {
    throw new LeadSubmissionError("options", "Одна из выбранных опций недоступна для тарифа");
  }

  const coverage = checkAddressCoverage(input.address, coverageAreas);
  const pricing = calculateMonthlyPrice(tariff, input.options);

  return {
    id: createLeadId(input, now),
    createdAt: now.toISOString(),
    customer: {
      name: input.name,
      phone: input.phone
    },
    address: input.address,
    tariff: {
      slug: tariff.slug,
      title: tariff.title
    },
    options: input.options,
    pricing,
    coverage,
    consentAccepted: true,
    sourcePath: input.sourcePath,
    userAgent
  };
}

function createLeadId(input: LeadFormInput, now: Date): string {
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const hash = createHash("sha256")
    .update(`${now.toISOString()}:${input.phone}:${input.address}:${input.tariff}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();

  return `KBT-${datePart}-${hash}`;
}
