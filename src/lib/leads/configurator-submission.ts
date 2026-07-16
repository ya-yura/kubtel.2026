import { createHash } from "node:crypto";
import type {
  ConfiguratorCatalog,
  ConfiguratorPriceLine,
  ConfiguratorServiceId
} from "@models/configurator";
import {
  calculateConfiguratorPrice,
  ConfiguratorValidationError
} from "@lib/configurator/calculator";
import type { ConfiguratorFormInput } from "@lib/leads/configurator-schema";

export { ConfiguratorValidationError } from "@lib/configurator/calculator";

export type ConfiguratorLeadSubmission = {
  leadType: "b2c-configurator";
  id: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    email: string | null;
  };
  address: string;
  service: {
    id: ConfiguratorServiceId;
    title: string;
  };
  configuration: {
    lines: ConfiguratorPriceLine[];
    monthlyTotal: number;
    oneTimeTotal: number;
  };
  consentAccepted: true;
  sourcePath: string;
  userAgent: string | null;
};

export type ConfiguratorLeadActionResult = {
  success: true;
  leadId: string;
  message: string;
  serviceTitle: string;
  monthlyTotal: number;
  oneTimeTotal: number;
  deliveryMode: "sent" | "reserved";
};

export function buildConfiguratorSubmission({
  input,
  catalog,
  now = new Date(),
  userAgent = null
}: {
  input: ConfiguratorFormInput;
  catalog: ConfiguratorCatalog;
  now?: Date;
  userAgent?: string | null;
}): ConfiguratorLeadSubmission {
  const configuration = parseConfiguration(input.configuration);

  if (configuration.serviceId !== input.service) {
    throw new ConfiguratorValidationError("Услуга в заявке не совпадает с конфигурацией");
  }

  const pricing = calculateConfiguratorPrice(catalog, input.service, configuration.fields);

  return {
    leadType: "b2c-configurator",
    id: createConfiguratorLeadId(input, now),
    createdAt: now.toISOString(),
    customer: {
      name: input.name,
      phone: input.phone,
      email: input.email
    },
    address: input.address,
    service: {
      id: input.service,
      title: pricing.service.title
    },
    configuration: {
      lines: pricing.lines,
      monthlyTotal: pricing.monthlyTotal,
      oneTimeTotal: pricing.oneTimeTotal
    },
    consentAccepted: true,
    sourcePath: input.sourcePath,
    userAgent
  };
}

function parseConfiguration(value: string): {
  serviceId: string;
  fields: Record<string, unknown>;
} {
  try {
    const parsed: unknown = JSON.parse(value);

    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      typeof (parsed as { serviceId?: unknown }).serviceId !== "string" ||
      (parsed as { fields?: unknown }).fields === null ||
      typeof (parsed as { fields?: unknown }).fields !== "object" ||
      Array.isArray((parsed as { fields?: unknown }).fields)
    ) {
      throw new Error("invalid shape");
    }

    return parsed as { serviceId: string; fields: Record<string, unknown> };
  } catch {
    throw new ConfiguratorValidationError("Не удалось прочитать выбранные услуги");
  }
}

function createConfiguratorLeadId(input: ConfiguratorFormInput, now: Date): string {
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const hash = createHash("sha256")
    .update(`${now.toISOString()}:${input.phone}:${input.service}:${input.configuration}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();

  return `KBC-${datePart}-${hash}`;
}
