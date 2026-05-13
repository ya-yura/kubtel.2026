import { trackServerEvent } from "@lib/analytics/server";
import { getCoverageAreas, getTariffs } from "@lib/content";
import { sendLeadToCrm } from "@lib/integrations/crm";
import { sendLeadToTelegram } from "@lib/integrations/telegram";
import type { DeliveryResult } from "@lib/integrations/types";
import {
  businessLeadFormSchema,
  hasHoneypotValue as hasBusinessHoneypotValue,
  isSuspiciousSubmitSpeed as isSuspiciousBusinessSubmitSpeed
} from "@lib/leads/business-schema";
import {
  buildBusinessLeadSubmission,
  type BusinessLeadActionResult
} from "@lib/leads/business-submission";
import { saveLeadToOutbox } from "@lib/leads/outbox";
import { hasHoneypotValue, isSuspiciousSubmitSpeed, leadFormSchema } from "@lib/leads/schema";
import {
  buildLeadSubmission,
  LeadSubmissionError,
  type LeadActionResult
} from "@lib/leads/submission";
import { checkRateLimit, getClientIp, hashRateLimitKey } from "@lib/spam/rate-limit";

type FormHandlerError = {
  message: string;
};

export type LeadFormState<TData> =
  | {
      data: TData;
      error?: never;
      status: 200;
    }
  | {
      data?: never;
      error: FormHandlerError;
      status: 400 | 429 | 500;
    };

export async function handleLeadFormPost(
  formData: FormData,
  request: Request
): Promise<LeadFormState<LeadActionResult>> {
  const parsed = leadFormSchema.safeParse(formDataToLeadInput(formData));

  if (!parsed.success) {
    return createFormError(parsed.error.issues[0]?.message ?? "Проверьте поля формы.", 400);
  }

  const input = parsed.data;

  if (hasHoneypotValue(input) || isSuspiciousSubmitSpeed(input)) {
    await trackServerEvent({
      name: "lead_spam_blocked",
      sourcePath: input.sourcePath
    });

    return createFormError(
      "Заявку не удалось отправить. Обновите страницу и попробуйте еще раз.",
      400
    );
  }

  const clientKey = hashRateLimitKey(`${getClientIp(request.headers)}:${input.phone}`);
  const rateLimit = checkRateLimit(clientKey);

  if (!rateLimit.allowed) {
    return createFormError(
      `Слишком много отправок подряд. Попробуйте еще раз примерно через ${Math.ceil(
        rateLimit.retryAfterSeconds / 60
      )} мин.`,
      429
    );
  }

  const [tariffs, coverageAreas] = await Promise.all([getTariffs(), getCoverageAreas()]);

  try {
    const lead = buildLeadSubmission({
      input,
      tariffs,
      coverageAreas,
      userAgent: request.headers.get("user-agent")
    });
    const delivery = await Promise.all([sendLeadToCrm(lead), sendLeadToTelegram(lead)]);
    const shouldSaveToOutbox =
      delivery.some((result) => result.status === "failed") ||
      delivery.every((result) => result.status === "skipped");
    const outboxResult = shouldSaveToOutbox
      ? await saveLeadToOutbox(lead, delivery)
      : createSkippedOutboxResult();
    const allDelivery = [...delivery, outboxResult];

    if (!allDelivery.some((result) => result.status === "sent")) {
      await trackServerEvent({
        name: "lead_delivery_failed",
        leadId: lead.id,
        tariff: lead.tariff.slug,
        addressStatus: lead.coverage.status,
        optionsCount: lead.options.length,
        sourcePath: lead.sourcePath,
        delivery: summarizeDelivery(allDelivery)
      });

      return createFormError(
        "Заявку не удалось надежно сохранить или отправить. Пожалуйста, попробуйте еще раз.",
        500
      );
    }

    await trackServerEvent({
      name: "lead_submitted",
      leadId: lead.id,
      tariff: lead.tariff.slug,
      addressStatus: lead.coverage.status,
      optionsCount: lead.options.length,
      sourcePath: lead.sourcePath,
      delivery: summarizeDelivery(allDelivery)
    });

    const deliveryMode = delivery.some((result) => result.status === "sent") ? "sent" : "reserved";

    return {
      status: 200,
      data: {
        success: true,
        leadId: lead.id,
        message:
          deliveryMode === "sent"
            ? "Заявка принята и отправлена в отдел продаж."
            : "Заявка принята и сохранена в серверный резерв до настройки CRM или Telegram.",
        addressStatus: lead.coverage.status,
        addressStatusLabel: lead.coverage.statusLabel,
        tariffTitle: lead.tariff.title,
        monthlyTotal: lead.pricing.total,
        deliveryMode
      }
    };
  } catch (error) {
    if (error instanceof LeadSubmissionError) {
      return createFormError(error.message, 400);
    }

    throw error;
  }
}

export async function handleBusinessLeadFormPost(
  formData: FormData,
  request: Request
): Promise<LeadFormState<BusinessLeadActionResult>> {
  const parsed = businessLeadFormSchema.safeParse(formDataToBusinessLeadInput(formData));

  if (!parsed.success) {
    return createFormError(parsed.error.issues[0]?.message ?? "Проверьте поля формы.", 400);
  }

  const input = parsed.data;

  if (hasBusinessHoneypotValue(input) || isSuspiciousBusinessSubmitSpeed(input)) {
    await trackServerEvent({
      name: "b2b_lead_spam_blocked",
      sourcePath: input.sourcePath
    });

    return createFormError(
      "Заявку не удалось отправить. Обновите страницу и попробуйте еще раз.",
      400
    );
  }

  const clientKey = hashRateLimitKey(`${getClientIp(request.headers)}:${input.phone}`);
  const rateLimit = checkRateLimit(clientKey);

  if (!rateLimit.allowed) {
    return createFormError(
      `Слишком много отправок подряд. Попробуйте еще раз примерно через ${Math.ceil(
        rateLimit.retryAfterSeconds / 60
      )} мин.`,
      429
    );
  }

  const lead = buildBusinessLeadSubmission({
    input,
    userAgent: request.headers.get("user-agent")
  });
  const delivery = await Promise.all([sendLeadToCrm(lead), sendLeadToTelegram(lead)]);
  const shouldSaveToOutbox =
    delivery.some((result) => result.status === "failed") ||
    delivery.every((result) => result.status === "skipped");
  const outboxResult = shouldSaveToOutbox
    ? await saveLeadToOutbox(lead, delivery)
    : createSkippedOutboxResult();
  const allDelivery = [...delivery, outboxResult];

  if (!allDelivery.some((result) => result.status === "sent")) {
    await trackServerEvent({
      name: "b2b_lead_delivery_failed",
      leadId: lead.id,
      serviceInterest: lead.qualification.serviceInterest,
      leadScore: lead.qualification.leadScore,
      qualification: lead.qualification.qualification,
      priority: lead.qualification.priority,
      sourcePath: lead.sourcePath,
      delivery: summarizeDelivery(allDelivery)
    });

    return createFormError(
      "Заявку не удалось надежно сохранить или отправить. Пожалуйста, попробуйте еще раз.",
      500
    );
  }

  await trackServerEvent({
    name: "b2b_lead_submitted",
    leadId: lead.id,
    serviceInterest: lead.qualification.serviceInterest,
    leadScore: lead.qualification.leadScore,
    qualification: lead.qualification.qualification,
    priority: lead.qualification.priority,
    routingPipeline: lead.routing.pipeline,
    sourcePath: lead.sourcePath,
    delivery: summarizeDelivery(allDelivery)
  });

  await trackServerEvent({
    name: "b2b_lead_success",
    leadId: lead.id,
    serviceInterest: lead.qualification.serviceInterest,
    leadScore: lead.qualification.leadScore,
    qualification: lead.qualification.qualification,
    priority: lead.qualification.priority,
    routingPipeline: lead.routing.pipeline,
    sourcePath: lead.sourcePath,
    delivery: summarizeDelivery(allDelivery)
  });

  return {
    status: 200,
    data: {
      success: true,
      leadId: lead.id,
      message: delivery.some((result) => result.status === "sent")
        ? "B2B-заявка принята и отправлена в отдел продаж."
        : "B2B-заявка принята и сохранена в серверный резерв до настройки CRM или Telegram.",
      serviceInterest: lead.qualification.serviceInterest,
      deliveryMode: delivery.some((result) => result.status === "sent") ? "sent" : "reserved"
    }
  };
}

function formDataToLeadInput(formData: FormData): Record<string, unknown> {
  return {
    ...formDataToRecord(formData),
    options: formData.getAll("options").map(formValueToString).filter(Boolean)
  };
}

function formDataToBusinessLeadInput(formData: FormData): Record<string, unknown> {
  return formDataToRecord(formData);
}

function formDataToRecord(formData: FormData): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    values[key] = formValueToString(value);
  });

  return values;
}

function formValueToString(value: FormDataEntryValue): string {
  return typeof value === "string" ? value : value.name;
}

function createFormError(message: string, status: 400 | 429 | 500): LeadFormState<never> {
  return {
    status,
    error: {
      message
    }
  };
}

function summarizeDelivery(
  delivery: DeliveryResult[]
): Array<Pick<DeliveryResult, "channel" | "status">> {
  return delivery.map(({ channel, status }) => ({ channel, status }));
}

function createSkippedOutboxResult(): DeliveryResult {
  return {
    channel: "outbox",
    status: "skipped",
    message: "Резерв не нужен: внешняя доставка прошла без ошибок"
  };
}
