import type { CareerApplicationSubmission } from "@lib/careers/submission";
import type { DeliveryResult } from "@lib/integrations/types";
import type { BusinessLeadSubmission } from "@lib/leads/business-submission";
import type { ConfiguratorLeadSubmission } from "@lib/leads/configurator-submission";
import type { LeadSubmission } from "@lib/leads/submission";

export async function sendLeadToTelegram(
  lead:
    | LeadSubmission
    | ConfiguratorLeadSubmission
    | BusinessLeadSubmission
    | CareerApplicationSubmission,
  env = process.env
): Promise<DeliveryResult> {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = isCareerApplication(lead)
    ? env.TELEGRAM_HR_CHAT_ID || env.TELEGRAM_SALES_CHAT_ID
    : env.TELEGRAM_SALES_CHAT_ID;

  if (!token || !chatId) {
    return {
      channel: "telegram",
      status: "skipped",
      message: "Telegram bot token или sales chat id не настроены"
    };
  }

  try {
    const response = await postTelegramMessage(token, {
      chat_id: chatId,
      text: formatTelegramLead(lead),
      parse_mode: "HTML",
      disable_web_page_preview: true
    });

    if (!response.ok) {
      return {
        channel: "telegram",
        status: "failed",
        statusCode: response.status,
        message: `Telegram API вернул ${response.status}`
      };
    }

    return {
      channel: "telegram",
      status: "sent",
      statusCode: response.status,
      message: "Уведомление отправлено в Telegram"
    };
  } catch (error) {
    return {
      channel: "telegram",
      status: "failed",
      message: error instanceof Error ? error.message : "Telegram API недоступен"
    };
  }
}

function formatTelegramLead(
  lead:
    | LeadSubmission
    | ConfiguratorLeadSubmission
    | BusinessLeadSubmission
    | CareerApplicationSubmission
): string {
  if (isCareerApplication(lead)) {
    return formatTelegramCareerApplication(lead);
  }

  if (isBusinessLead(lead)) {
    return formatTelegramBusinessLead(lead);
  }

  if (isConfiguratorLead(lead)) {
    return formatTelegramConfiguratorLead(lead);
  }

  const optionList = lead.options.length > 0 ? lead.options.join(", ") : "без доп. опций";

  return [
    `<b>Новая заявка Kubtel</b>`,
    `ID: <code>${escapeHtml(lead.id)}</code>`,
    `Имя: ${escapeHtml(lead.customer.name)}`,
    `Телефон: ${escapeHtml(lead.customer.phone)}`,
    `Адрес: ${lead.address ? escapeHtml(lead.address) : "уточнить на звонке"}`,
    `Тариф: ${escapeHtml(lead.tariff.title)}`,
    `Опции: ${escapeHtml(optionList)}`,
    `Стоимость: ${lead.pricing.total} руб./мес.`,
    `Следующий шаг: ${escapeHtml(lead.coverage.message)}`
  ].join("\n");
}

function isBusinessLead(
  lead:
    | LeadSubmission
    | ConfiguratorLeadSubmission
    | BusinessLeadSubmission
    | CareerApplicationSubmission
): lead is BusinessLeadSubmission {
  return "leadType" in lead && lead.leadType === "b2b";
}

function isCareerApplication(
  lead:
    | LeadSubmission
    | ConfiguratorLeadSubmission
    | BusinessLeadSubmission
    | CareerApplicationSubmission
): lead is CareerApplicationSubmission {
  return "applicationType" in lead && lead.applicationType === "career";
}

function isConfiguratorLead(
  lead:
    | LeadSubmission
    | ConfiguratorLeadSubmission
    | BusinessLeadSubmission
    | CareerApplicationSubmission
): lead is ConfiguratorLeadSubmission {
  return "leadType" in lead && lead.leadType === "b2c-configurator";
}

function formatTelegramConfiguratorLead(lead: ConfiguratorLeadSubmission): string {
  return [
    `<b>Новая заявка из конфигуратора Kubtel</b>`,
    `ID: <code>${escapeHtml(lead.id)}</code>`,
    `Имя: ${escapeHtml(lead.customer.name)}`,
    `Телефон: ${escapeHtml(lead.customer.phone)}`,
    lead.customer.email ? `Email: ${escapeHtml(lead.customer.email)}` : null,
    `Адрес: ${lead.address ? escapeHtml(lead.address) : "уточнить на звонке"}`,
    `Услуга: ${escapeHtml(lead.service.title)}`,
    `Конфигурация: ${escapeHtml(
      lead.configuration.lines.map((line) => `${line.label}: ${line.valueLabel}`).join("; ")
    )}`,
    `Стоимость: ${lead.configuration.monthlyTotal} руб./мес. + ${lead.configuration.oneTimeTotal} руб. разово`
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

function formatTelegramBusinessLead(lead: BusinessLeadSubmission): string {
  return [
    `<b>Новая B2B-заявка Kubtel</b>`,
    `ID: <code>${escapeHtml(lead.id)}</code>`,
    `Компания: ${escapeHtml(lead.contact.companyName)}`,
    lead.contact.inn ? `ИНН: ${escapeHtml(lead.contact.inn)}` : null,
    `Контакт: ${escapeHtml(lead.contact.contactPerson)}`,
    `Телефон: ${escapeHtml(lead.contact.phone)}`,
    lead.contact.email ? `Email: ${escapeHtml(lead.contact.email)}` : null,
    lead.contact.address ? `Адрес: ${escapeHtml(lead.contact.address)}` : null,
    `Услуга: ${escapeHtml(lead.qualification.serviceInterest)}`,
    lead.qualification.businessSegment
      ? `Сегмент: ${escapeHtml(lead.qualification.businessSegment)}`
      : null,
    `Срочность: ${escapeHtml(lead.qualification.urgency)}`,
    `Квалификация: ${escapeHtml(lead.qualification.qualification)} / ${lead.qualification.leadScore}`,
    `Приоритет: ${escapeHtml(lead.routing.priority)}`,
    `Pipeline: ${escapeHtml(lead.routing.pipeline)}`,
    `Получатель: ${escapeHtml(lead.routing.recipientEmail)}`,
    `Конфигурация: ${escapeHtml(lead.configuration.summary)}`,
    `Неизвестные позиции: ${escapeHtml(lead.configuration.unknownItems.join(", "))}`
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

function formatTelegramCareerApplication(lead: CareerApplicationSubmission): string {
  return [
    `<b>Новый отклик Kubtel</b>`,
    `ID: <code>${escapeHtml(lead.id)}</code>`,
    `Вакансия: ${escapeHtml(lead.vacancy.title)}`,
    `Отдел: ${escapeHtml(lead.vacancy.department)}`,
    `Имя: ${escapeHtml(lead.applicant.name)}`,
    `Телефон: ${escapeHtml(lead.applicant.phone)}`,
    `Email: ${escapeHtml(lead.applicant.email)}`,
    lead.resume.url ? `Резюме: ${escapeHtml(lead.resume.url)}` : null,
    lead.resume.fileName ? `Файл резюме: ${escapeHtml(lead.resume.fileName)}` : null,
    lead.message ? `Комментарий: ${escapeHtml(lead.message)}` : null,
    `Источник: ${escapeHtml(lead.sourcePath)}`
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

async function postTelegramMessage(
  token: string,
  body: Record<string, unknown>
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    return await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
