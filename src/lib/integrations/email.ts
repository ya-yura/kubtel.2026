import nodemailer from "nodemailer";
import type { CareerResumeAttachment } from "@lib/careers/resume";
import type { CareerApplicationSubmission } from "@lib/careers/submission";
import type { DeliveryResult } from "@lib/integrations/types";
import type { BusinessLeadSubmission } from "@lib/leads/business-submission";
import type { ConfiguratorLeadSubmission } from "@lib/leads/configurator-submission";
import type { LeadSubmission } from "@lib/leads/submission";

export async function sendLeadToEmail(
  lead: LeadSubmission | ConfiguratorLeadSubmission,
  env = process.env
): Promise<DeliveryResult> {
  if (isConfiguratorLead(lead)) {
    return sendEmail(
      {
        to: env.SALES_EMAIL ?? "kubtel@kubtel.ru",
        replyTo: lead.customer.email ?? undefined,
        subject: `[${lead.id}] Конфигуратор: ${lead.service.title}`,
        text: [
          "Новая заявка из конфигуратора Kubtel",
          `Номер: ${lead.id}`,
          `Имя: ${lead.customer.name}`,
          `Телефон: ${lead.customer.phone}`,
          lead.customer.email ? `Email: ${lead.customer.email}` : null,
          `Адрес: ${lead.address || "уточнить на звонке"}`,
          `Услуга: ${lead.service.title}`,
          ...lead.configuration.lines.map(
            (line) =>
              `${line.label}: ${line.valueLabel} — ${line.monthlyPrice} руб./мес., ${line.oneTimePrice} руб. разово`
          ),
          `Итого в месяц: ${lead.configuration.monthlyTotal} руб.`,
          `Разовый платёж: ${lead.configuration.oneTimeTotal} руб.`,
          `Источник: ${lead.sourcePath}`
        ]
          .filter((line): line is string => Boolean(line))
          .join("\n")
      },
      env
    );
  }

  return sendEmail(
    {
      to: env.SALES_EMAIL ?? "kubtel@kubtel.ru",
      subject: `[${lead.id}] Домашнее подключение: ${lead.tariff.title}`,
      text: [
        "Новая заявка с сайта Kubtel",
        `Номер: ${lead.id}`,
        `Имя: ${lead.customer.name}`,
        `Телефон: ${lead.customer.phone}`,
        `Адрес: ${lead.address}`,
        `Тариф: ${lead.tariff.title}`,
        `Опции: ${lead.options.join(", ") || "без дополнительных опций"}`,
        `Источник: ${lead.sourcePath}`
      ].join("\n")
    },
    env
  );
}

function isConfiguratorLead(
  lead: LeadSubmission | ConfiguratorLeadSubmission
): lead is ConfiguratorLeadSubmission {
  return "leadType" in lead && lead.leadType === "b2c-configurator";
}

export async function sendCareerApplicationToEmail(
  application: CareerApplicationSubmission,
  attachment: CareerResumeAttachment | null,
  env = process.env
): Promise<DeliveryResult> {
  return sendEmail(
    {
      to: env.HR_EMAIL ?? "kubtel@kubtel.ru",
      replyTo: application.applicant.email,
      subject: `[${application.id}] Отклик: ${application.vacancy.title}`,
      text: [
        "Новый отклик с сайта Kubtel",
        `Номер: ${application.id}`,
        `Вакансия: ${application.vacancy.title}`,
        `Имя: ${application.applicant.name}`,
        `Телефон: ${application.applicant.phone}`,
        `Email: ${application.applicant.email}`,
        application.resume.url ? `Ссылка на резюме: ${application.resume.url}` : null,
        application.message ? `Комментарий: ${application.message}` : null,
        `Источник: ${application.sourcePath}`
      ]
        .filter((line): line is string => Boolean(line))
        .join("\n"),
      attachments: attachment
        ? [
            {
              filename: attachment.safeName,
              content: Buffer.from(attachment.bytes),
              contentType: attachment.mimeType
            }
          ]
        : undefined
    },
    env
  );
}

export async function sendBusinessLeadToEmail(
  lead: BusinessLeadSubmission,
  env = process.env
): Promise<DeliveryResult> {
  return sendEmail(
    {
      to: lead.routing.recipientEmail,
      replyTo: lead.contact.email ?? undefined,
      subject: buildBusinessLeadEmailSubject(lead),
      text: buildBusinessLeadEmailText(lead)
    },
    env
  );
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

type EmailMessage = {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
};

async function sendEmail(message: EmailMessage, env: NodeJS.ProcessEnv): Promise<DeliveryResult> {
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
  const auth = env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD ?? "" } : undefined;

  try {
    const transport = nodemailer.createTransport({ host, port, secure, auth });
    await transport.sendMail({ from, ...message });

    return {
      channel: "email",
      status: "sent",
      message: `Сообщение отправлено на ${message.to}`
    };
  } catch (error) {
    return {
      channel: "email",
      status: "failed",
      message: error instanceof Error ? error.message : "Не удалось отправить сообщение по email"
    };
  }
}
