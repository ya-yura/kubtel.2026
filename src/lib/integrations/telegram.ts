import type { DeliveryResult } from "@lib/integrations/types";
import type { BusinessLeadSubmission } from "@lib/leads/business-submission";
import type { LeadSubmission } from "@lib/leads/submission";

export async function sendLeadToTelegram(
  lead: LeadSubmission | BusinessLeadSubmission,
  env = process.env
): Promise<DeliveryResult> {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_SALES_CHAT_ID;

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

function formatTelegramLead(lead: LeadSubmission | BusinessLeadSubmission): string {
  if (isBusinessLead(lead)) {
    return formatTelegramBusinessLead(lead);
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
  lead: LeadSubmission | BusinessLeadSubmission
): lead is BusinessLeadSubmission {
  return "leadType" in lead && lead.leadType === "b2b";
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
    `Конфигурация: ${escapeHtml(lead.configuration.summary)}`,
    `Неизвестные позиции: ${escapeHtml(lead.configuration.unknownItems.join(", "))}`
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
