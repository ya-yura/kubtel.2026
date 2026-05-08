import type { ZodType } from "zod";

const privateCmsFields = new Set([
  "internalNotes",
  "reviewNotes",
  "reviewedBy",
  "requiredEvidence",
  "crmWebhookUrl",
  "telegramBotToken",
  "telegramTemplate",
  "analyticsSecret",
  "antiSpamConfig",
  "leadScoringWeights",
  "createdBy",
  "updatedBy"
]);

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function unwrapStrapiEntity(value: unknown): UnknownRecord {
  if (!isRecord(value)) {
    return {};
  }

  if (isRecord(value.attributes)) {
    return {
      id: value.id,
      documentId: value.documentId,
      ...value.attributes
    };
  }

  return value;
}

export function unwrapStrapiList(response: unknown): UnknownRecord[] {
  if (Array.isArray(response)) {
    return response.map(unwrapStrapiEntity);
  }

  if (!isRecord(response)) {
    return [];
  }

  if (Array.isArray(response.data)) {
    return response.data.map(unwrapStrapiEntity);
  }

  if (isRecord(response.data)) {
    return [unwrapStrapiEntity(response.data)];
  }

  return [];
}

export function stripPrivateCmsFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripPrivateCmsFields);
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !privateCmsFields.has(key))
      .map(([key, nestedValue]) => [key, stripPrivateCmsFields(nestedValue)])
  );
}

export function normalizeCmsEntry<T>(value: unknown, schema: ZodType<T>): T {
  return schema.parse(stripPrivateCmsFields(value));
}

export function normalizeStrapiCollection<T>(response: unknown, schema: ZodType<T>): T[] {
  return unwrapStrapiList(response).map((entry) => normalizeCmsEntry(entry, schema));
}
