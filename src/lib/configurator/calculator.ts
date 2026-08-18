import type {
  ConfiguratorCatalog,
  ConfiguratorField,
  ConfiguratorFieldValue,
  ConfiguratorPrice,
  ConfiguratorPriceLine,
  ConfiguratorService
} from "@models/configurator";

export class ConfiguratorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfiguratorValidationError";
  }
}

export function getConfiguratorService(
  catalog: ConfiguratorCatalog,
  serviceId: string
): ConfiguratorService {
  const service = catalog.services.find((item) => item.id === serviceId);

  if (!service) {
    throw new ConfiguratorValidationError("Выберите услугу для расчёта");
  }

  return service;
}

export function calculateConfiguratorPrice(
  catalog: ConfiguratorCatalog,
  serviceId: string,
  rawValues: unknown
): ConfiguratorPrice {
  const service = getConfiguratorService(catalog, serviceId);
  const values = asValueRecord(rawValues);
  const calculatedLines = service.fields
    .filter((field) => isConfiguratorFieldVisible(field, values))
    .map((field) => calculateFieldLine(field, values[field.id], values))
    .filter((line): line is ConfiguratorPriceLine => line !== null);
  const lines = mergePrivateHouseIntoInternetPlan(service, calculatedLines);

  return {
    service,
    lines,
    monthlyTotal: lines
      .filter((line) => line.includeInTotal)
      .reduce((total, line) => total + line.monthlyPrice, 0),
    oneTimeTotal: lines
      .filter((line) => line.includeInTotal)
      .reduce((total, line) => total + line.oneTimePrice, 0)
  };
}

function mergePrivateHouseIntoInternetPlan(
  service: ConfiguratorService,
  lines: ConfiguratorPriceLine[]
): ConfiguratorPriceLine[] {
  if (service.id !== "internet") {
    return lines;
  }

  const planLine = lines.find((line) => line.fieldId === "internet-plan");
  const houseLine = lines.find((line) => line.fieldId === "house-connection");

  if (!planLine || !houseLine) {
    return lines;
  }

  return lines
    .filter((line) => line.fieldId !== "house-connection")
    .map((line) =>
      line.fieldId === "internet-plan"
        ? {
            ...line,
            monthlyPrice: line.monthlyPrice + houseLine.monthlyPrice,
            oneTimePrice: line.oneTimePrice + houseLine.oneTimePrice
          }
        : line
    );
}

export function isConfiguratorFieldVisible(
  field: ConfiguratorField,
  rawValues: Record<string, ConfiguratorFieldValue | undefined>
): boolean {
  const rule = field.showWhen;

  if (!rule) {
    return true;
  }

  const value = rawValues[rule.fieldId];

  if (rule.equals !== undefined && value !== rule.equals) {
    return false;
  }

  if (rule.in?.length) {
    if (Array.isArray(value)) {
      return value.some((item) => rule.in?.includes(item));
    }

    return rule.in.includes(value as string | number | boolean);
  }

  return true;
}

function calculateFieldLine(
  field: ConfiguratorField,
  rawValue: ConfiguratorFieldValue | undefined,
  values: Record<string, ConfiguratorFieldValue | undefined>
): ConfiguratorPriceLine | null {
  const value = rawValue ?? field.defaultValue;

  if (field.type === "counter") {
    const count = parseCount(field, value);

    if (count === 0 && !field.required) {
      return null;
    }

    return {
      fieldId: field.id,
      label: field.label,
      value: count,
      valueLabel: `${count}${field.unit ? ` ${field.unit}` : ""}`,
      monthlyPrice: count * (field.monthlyPrice ?? 0),
      oneTimePrice: count * (field.oneTimePrice ?? 0),
      includeInTotal: field.includeInTotal !== false,
      priceNote: field.priceNote
    };
  }

  if (field.type === "checkbox" && !field.choices?.length) {
    const checked = value === true || value === "true" || value === "on";

    if (!checked) {
      if (field.required) {
        throw new ConfiguratorValidationError(`Заполните поле «${field.label}»`);
      }

      return null;
    }

    return {
      fieldId: field.id,
      label: field.label,
      value: true,
      valueLabel: "Да",
      monthlyPrice: getFieldPrice(field, "monthlyPrice", values),
      oneTimePrice: getFieldPrice(field, "oneTimePrice", values),
      includeInTotal: field.includeInTotal !== false,
      priceNote: field.priceNote
    };
  }

  const choices = field.choices ?? [];
  const selectedIds = getSelectedChoiceIds(field, value, choices);

  if (selectedIds.length === 0) {
    if (field.required) {
      throw new ConfiguratorValidationError(`Заполните поле «${field.label}»`);
    }

    return null;
  }

  const selectedChoices = selectedIds.map((id) => {
    const choice = choices.find((item) => item.id === id);

    if (!choice) {
      throw new ConfiguratorValidationError(`Недопустимое значение поля «${field.label}»`);
    }

    return choice;
  });

  return {
    fieldId: field.id,
    label: field.label,
    value: field.multiple ? selectedIds : selectedIds[0],
    valueLabel: selectedChoices.map((choice) => choice.label).join(", "),
    monthlyPrice: selectedChoices.reduce((total, choice) => total + choice.monthlyPrice, 0),
    oneTimePrice: selectedChoices.reduce((total, choice) => total + choice.oneTimePrice, 0),
    includeInTotal: field.includeInTotal !== false,
    priceNote: field.priceNote
  };
}

function getFieldPrice(
  field: ConfiguratorField,
  priceType: "monthlyPrice" | "oneTimePrice",
  values: Record<string, ConfiguratorFieldValue | undefined>
): number {
  const byValue = priceType === "monthlyPrice" ? field.monthlyPriceBy : field.oneTimePriceBy;
  const dependencyFieldIds = field.priceByFieldIds ?? [field.priceByFieldId ?? "internet-plan"];
  const dependencyKey = dependencyFieldIds
    .map((fieldId) => {
      const dependencyValue = values[fieldId];

      if (dependencyValue === undefined && dependencyFieldIds.length > 1) {
        return "false";
      }

      return typeof dependencyValue === "string" ||
        typeof dependencyValue === "number" ||
        typeof dependencyValue === "boolean"
        ? String(dependencyValue)
        : "";
    })
    .join("|");

  return byValue?.[dependencyKey] ?? field[priceType] ?? 0;
}

function parseCount(field: ConfiguratorField, value: ConfiguratorFieldValue | undefined): number {
  const count = Number(value ?? field.defaultValue ?? 0);

  if (!Number.isInteger(count) || count < 0) {
    throw new ConfiguratorValidationError(`Укажите целое количество в поле «${field.label}»`);
  }

  if (typeof field.min === "number" && count < field.min) {
    throw new ConfiguratorValidationError(`Минимум для поля «${field.label}» — ${field.min}`);
  }

  if (typeof field.max === "number" && count > field.max) {
    throw new ConfiguratorValidationError(`Максимум для поля «${field.label}» — ${field.max}`);
  }

  return count;
}

function getSelectedChoiceIds(
  field: ConfiguratorField,
  value: ConfiguratorFieldValue | undefined,
  choices: ConfiguratorField["choices"]
): string[] {
  const choiceIds = new Set((choices ?? []).map((choice) => choice.id));

  if (field.multiple) {
    const values = Array.isArray(value) ? value : value ? [String(value)] : [];

    return values.filter((item) => choiceIds.has(item));
  }

  if (value === true || value === "true" || value === "on") {
    const defaultChoice = choices?.find((choice) => choice.default) ?? choices?.[0];
    return defaultChoice ? [defaultChoice.id] : [];
  }

  const selected = typeof value === "string" ? value : String(value ?? "");
  return choiceIds.has(selected) ? [selected] : [];
}

function asValueRecord(value: unknown): Record<string, ConfiguratorFieldValue | undefined> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ConfiguratorValidationError("Конфигурация услуги повреждена");
  }

  return value as Record<string, ConfiguratorFieldValue | undefined>;
}
