import nodemailer from "nodemailer";
import type { DeliveryResult } from "@lib/integrations/types";
import type { BusinessLeadSubmission } from "@lib/leads/business-submission";

export async function sendBusinessLeadToEmail(
  lead: BusinessLeadSubmission,
  env = process.env
): Promise<DeliveryResult> {
  const host = env.SMTP_HOST;
  const from = env.SMTP_FROM ?? env.SMTP_USER;

  if (!host || !from) {
    return {
      channel: "email",
      status: "skipped",
      message: "SMTP host или адрес отправителя не настроены"
    };
  }

  const port = parseSmtpPort(env.SMTP_PORT);
  const secure = env.SMTP_SECURE ? env.SMTP_SECURE === "true" : port === 465;
  const auth = env.SMTP_USER
    ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD ?? ""
      }
    : undefined;

  try {
    const transport = nodemailer.createTransport({ host, port, secure, auth });
    await transport.sendMail({
      from,
      to: lead.routing.recipientEmail,
      replyTo: lead.contact.email ?? undefined,
      subject: buildBusinessLeadEmailSubject(lead),
      text: buildBusinessLeadEmailText(lead)
    });

    return {
      channel: "email",
      status: "sent",
      message: `Заявка отправлена на ${lead.routing.recipientEmail}`
    };
  } catch (error) {
    return {
      channel: "email",
      status: "failed",
      message: error instanceof Error ? error.message : "Не удалось отправить заявку по email"
    };
  }
}

export function buildBusinessLeadEmailSubject(lead: BusinessLeadSubmission): string {
  const audience = lead.routing.pipeline === "b2g" ? "Бюджетная организация" : "Юридическое лицо";
  return `[${lead.id}] ${audience}: ${lead.qualification.serviceInterest}`;
}

export function buildBusinessLeadEmailText(lead: BusinessLeadSubmission): string {
  return [
    `Новая заявка с сайта Kubtel`,
    `Номер: ${lead.id}`,
    `Тип обращения: ${lead.routing.pipeline === "b2g" ? "бюджетная организация" : "юридическое лицо"}`,
    `Получатель: ${lead.routing.recipientEmail}`,
    `Компания / учреждение: ${lead.contact.companyName}`,
    `Контактное лицо: ${lead.contact.contactPerson}`,
    `Телефон: ${lead.contact.phone}`,
    lead.contact.email ? `Email: ${lead.contact.email}` : null,
    lead.contact.address ? `Город или адрес: ${lead.contact.address}` : null,
    `Тема: ${lead.qualification.serviceInterest}`,
    `Комментарий: ${lead.configuration.summary}`,
    `Источник: ${lead.sourcePath}`
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}

function parseSmtpPort(value: string | undefined): number {
  const port = Number(value ?? 465);
  return Number.isInteger(port) && port > 0 ? port : 465;
}
