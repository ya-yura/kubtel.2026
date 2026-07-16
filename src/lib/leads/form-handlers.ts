import { trackServerEvent } from "@lib/analytics/server";
import { saveCareerApplicationToCms } from "@lib/careers/cms-delivery";
import {
  CareerResumeError,
  validateCareerResumeFile,
  type CareerResumeAttachment
} from "@lib/careers/resume";
import {
  careerApplicationFormSchema,
  hasHoneypotValue as hasCareerHoneypotValue,
  isSuspiciousSubmitSpeed as isSuspiciousCareerSubmitSpeed
} from "@lib/careers/schema";
import {
  buildCareerApplicationSubmission,
  CareerApplicationError,
  type CareerApplicationActionResult
} from "@lib/careers/submission";
import {
  getConfiguratorCatalog,
  getCoverageAreas,
  getJobVacancies,
  getTariffs
} from "@lib/content";
import { sendLeadToCrm } from "@lib/integrations/crm";
import {
  sendBusinessLeadToEmail,
  sendCareerApplicationToEmail,
  sendLeadToEmail
} from "@lib/integrations/email";
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
import {
  hasHoneypotValue as hasConfiguratorHoneypotValue,
  isSuspiciousSubmitSpeed as isSuspiciousConfiguratorSubmitSpeed,
  configuratorFormSchema
} from "@lib/leads/configurator-schema";
import {
  buildConfiguratorSubmission,
  ConfiguratorValidationError,
  type ConfiguratorLeadActionResult
} from "@lib/leads/configurator-submission";
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
      "Заявку не удалось отправить. Обновите страницу и попробуйте ещё раз.",
      400
    );
  }

  const clientKey = hashRateLimitKey(`${getClientIp(request.headers)}:${input.phone}`);
  const rateLimit = checkRateLimit(clientKey);

  if (!rateLimit.allowed) {
    return createFormError(
      `Слишком много отправок подряд. Попробуйте ещё раз примерно через ${Math.ceil(
        rateLimit.retryAfterSeconds / 60
      )}\u00a0мин.`,
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
    const delivery = await Promise.all([
      sendLeadToCrm(lead),
      sendLeadToTelegram(lead),
      sendLeadToEmail(lead)
    ]);
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
        "Заявку не удалось надёжно сохранить или отправить. Пожалуйста, попробуйте ещё раз.",
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

export async function handleConfiguratorFormPost(
  formData: FormData,
  request: Request
): Promise<LeadFormState<ConfiguratorLeadActionResult>> {
  const parsed = configuratorFormSchema.safeParse(formDataToConfiguratorInput(formData));

  if (!parsed.success) {
    return createFormError(parsed.error.issues[0]?.message ?? "Проверьте поля формы.", 400);
  }

  const input = parsed.data;

  if (hasConfiguratorHoneypotValue(input) || isSuspiciousConfiguratorSubmitSpeed(input)) {
    await trackServerEvent({
      name: "configurator_lead_spam_blocked",
      sourcePath: input.sourcePath
    });

    return createFormError(
      "Заявку не удалось отправить. Обновите страницу и попробуйте ещё раз.",
      400
    );
  }

  const clientKey = hashRateLimitKey(`${getClientIp(request.headers)}:${input.phone}:configurator`);
  const rateLimit = checkRateLimit(clientKey);

  if (!rateLimit.allowed) {
    return createFormError(
      `Слишком много отправок подряд. Попробуйте ещё раз примерно через ${Math.ceil(
        rateLimit.retryAfterSeconds / 60
      )}\u00a0мин.`,
      429
    );
  }

  try {
    const catalog = await getConfiguratorCatalog();
    const lead = buildConfiguratorSubmission({
      input,
      catalog,
      userAgent: request.headers.get("user-agent")
    });
    const delivery = await Promise.all([
      sendLeadToCrm(lead),
      sendLeadToTelegram(lead),
      sendLeadToEmail(lead)
    ]);
    const shouldSaveToOutbox =
      delivery.some((result) => result.status === "failed") ||
      delivery.every((result) => result.status === "skipped");
    const outboxResult = shouldSaveToOutbox
      ? await saveLeadToOutbox(lead, delivery)
      : createSkippedOutboxResult();
    const allDelivery = [...delivery, outboxResult];

    if (!allDelivery.some((result) => result.status === "sent")) {
      await trackServerEvent({
        name: "configurator_lead_delivery_failed",
        leadId: lead.id,
        serviceInterest: lead.service.id,
        sourcePath: lead.sourcePath,
        delivery: summarizeDelivery(allDelivery)
      });

      return createFormError(
        "Заявку не удалось надёжно сохранить или отправить. Пожалуйста, попробуйте ещё раз.",
        500
      );
    }

    await trackServerEvent({
      name: "configurator_lead_submitted",
      leadId: lead.id,
      serviceInterest: lead.service.id,
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
        serviceTitle: lead.service.title,
        monthlyTotal: lead.configuration.monthlyTotal,
        oneTimeTotal: lead.configuration.oneTimeTotal,
        deliveryMode
      }
    };
  } catch (error) {
    if (error instanceof ConfiguratorValidationError) {
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
      "Заявку не удалось отправить. Обновите страницу и попробуйте ещё раз.",
      400
    );
  }

  const clientKey = hashRateLimitKey(`${getClientIp(request.headers)}:${input.phone}`);
  const rateLimit = checkRateLimit(clientKey);

  if (!rateLimit.allowed) {
    return createFormError(
      `Слишком много отправок подряд. Попробуйте ещё раз примерно через ${Math.ceil(
        rateLimit.retryAfterSeconds / 60
      )}\u00a0мин.`,
      429
    );
  }

  const lead = buildBusinessLeadSubmission({
    input,
    userAgent: request.headers.get("user-agent")
  });
  const delivery = await Promise.all([
    sendLeadToCrm(lead),
    sendLeadToTelegram(lead),
    sendBusinessLeadToEmail(lead)
  ]);
  const emailDelivery = delivery.find((result) => result.channel === "email");
  const shouldSaveToOutbox =
    delivery.some((result) => result.status === "failed") ||
    delivery.every((result) => result.status === "skipped") ||
    emailDelivery?.status !== "sent";
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
      "Заявку не удалось надёжно сохранить или отправить. Пожалуйста, попробуйте ещё раз.",
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

export async function handleCareerApplicationFormPost(
  formData: FormData,
  request: Request
): Promise<LeadFormState<CareerApplicationActionResult>> {
  const parsed = careerApplicationFormSchema.safeParse(formDataToRecord(formData));

  if (!parsed.success) {
    return createFormError(parsed.error.issues[0]?.message ?? "Проверьте поля формы.", 400);
  }

  const input = parsed.data;

  if (hasCareerHoneypotValue(input) || isSuspiciousCareerSubmitSpeed(input)) {
    await trackServerEvent({
      name: "career_application_spam_blocked",
      sourcePath: input.sourcePath
    });

    return createFormError(
      "Отклик не удалось отправить. Обновите страницу и попробуйте ещё раз.",
      400
    );
  }

  const clientKey = hashRateLimitKey(`${getClientIp(request.headers)}:${input.phone}:careers`);
  const rateLimit = checkRateLimit(clientKey);

  if (!rateLimit.allowed) {
    return createFormError(
      `Слишком много отправок подряд. Попробуйте ещё раз примерно через ${Math.ceil(
        rateLimit.retryAfterSeconds / 60
      )}\u00a0мин.`,
      429
    );
  }

  const vacancies = await getJobVacancies();

  try {
    const application = buildCareerApplicationSubmission({
      input,
      vacancies,
      userAgent: request.headers.get("user-agent")
    });
    let resumeAttachment: CareerResumeAttachment | null;

    try {
      resumeAttachment = await validateCareerResumeFile(formData.get("resumeFile"), application.id);
    } catch (error) {
      if (error instanceof CareerResumeError) {
        return createFormError(error.message, 400);
      }

      throw error;
    }

    application.resume.fileName = resumeAttachment?.originalName ?? null;

    const delivery = await Promise.all([
      saveCareerApplicationToCms(application),
      sendLeadToCrm(application),
      sendLeadToTelegram(application),
      sendCareerApplicationToEmail(application, resumeAttachment)
    ]);
    const resumeEmailDelivery = delivery.find((result) => result.channel === "email");
    const shouldSaveToOutbox =
      delivery.some((result) => result.status === "failed") ||
      delivery.every((result) => result.status === "skipped") ||
      (resumeAttachment !== null && resumeEmailDelivery?.status !== "sent");
    const outboxResult = shouldSaveToOutbox
      ? await saveLeadToOutbox(application, delivery, resumeAttachment)
      : createSkippedOutboxResult();
    const allDelivery = [...delivery, outboxResult];

    if (!allDelivery.some((result) => result.status === "sent")) {
      await trackServerEvent({
        name: "career_application_delivery_failed",
        applicationId: application.id,
        vacancy: application.vacancy.slug,
        sourcePath: application.sourcePath,
        delivery: summarizeDelivery(allDelivery)
      });

      return createFormError(
        "Отклик не удалось надёжно сохранить или отправить. Пожалуйста, попробуйте ещё раз.",
        500
      );
    }

    await trackServerEvent({
      name: "career_application_submitted",
      applicationId: application.id,
      vacancy: application.vacancy.slug,
      sourcePath: application.sourcePath,
      delivery: summarizeDelivery(allDelivery)
    });

    const deliveryMode = delivery.some((result) => result.status === "sent") ? "sent" : "reserved";

    return {
      status: 200,
      data: {
        success: true,
        applicationId: application.id,
        message:
          deliveryMode === "sent"
            ? "Отклик принят и передан команде Kubtel."
            : "Отклик принят и сохранён в серверный резерв до настройки HR-доставки.",
        vacancyTitle: application.vacancy.title,
        deliveryMode
      }
    };
  } catch (error) {
    if (error instanceof CareerApplicationError) {
      return createFormError(error.message, 400);
    }

    throw error;
  }
}

function formDataToLeadInput(formData: FormData): Record<string, unknown> {
  const values = formDataToRecord(formData);
  const city = typeof values.addressCity === "string" ? values.addressCity.trim() : "";
  const address = typeof values.address === "string" ? values.address.trim() : "";

  return {
    ...values,
    address: [city && city !== "manual" ? city : "", address].filter(Boolean).join(", "),
    options: formData.getAll("options").map(formValueToString).filter(Boolean)
  };
}

function formDataToConfiguratorInput(formData: FormData): Record<string, unknown> {
  return formDataToRecord(formData);
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
