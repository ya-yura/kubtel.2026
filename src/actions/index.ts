import { ActionError, defineAction } from "astro:actions";
import { trackServerEvent } from "@lib/analytics/server";
import { sendLeadToCrm } from "@lib/integrations/crm";
import { sendLeadToTelegram } from "@lib/integrations/telegram";
import type { DeliveryResult } from "@lib/integrations/types";
import { getCoverageAreas, getTariffs } from "@lib/content";
import { saveLeadToOutbox } from "@lib/leads/outbox";
import { hasHoneypotValue, isSuspiciousSubmitSpeed, leadFormSchema } from "@lib/leads/schema";
import {
  buildLeadSubmission,
  LeadSubmissionError,
  type LeadActionResult
} from "@lib/leads/submission";
import { checkRateLimit, getClientIp, hashRateLimitKey } from "@lib/spam/rate-limit";

export const server = {
  submitLead: defineAction({
    accept: "form",
    input: leadFormSchema,
    handler: async (input, context): Promise<LeadActionResult> => {
      if (hasHoneypotValue(input) || isSuspiciousSubmitSpeed(input)) {
        await trackServerEvent({
          name: "lead_spam_blocked",
          sourcePath: input.sourcePath
        });

        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Заявку не удалось отправить. Обновите страницу и попробуйте еще раз."
        });
      }

      const clientKey = hashRateLimitKey(`${getClientIp(context.request.headers)}:${input.phone}`);
      const rateLimit = checkRateLimit(clientKey);

      if (!rateLimit.allowed) {
        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message: `Слишком много отправок подряд. Попробуйте еще раз примерно через ${Math.ceil(
            rateLimit.retryAfterSeconds / 60
          )} мин.`
        });
      }

      const [tariffs, coverageAreas] = await Promise.all([getTariffs(), getCoverageAreas()]);

      const lead = (() => {
        try {
          return buildLeadSubmission({
            input,
            tariffs,
            coverageAreas,
            userAgent: context.request.headers.get("user-agent")
          });
        } catch (error) {
          if (error instanceof LeadSubmissionError) {
            throw new ActionError({
              code: "BAD_REQUEST",
              message: error.message
            });
          }

          throw error;
        }
      })();

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

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Заявку не удалось надежно сохранить или отправить. Пожалуйста, попробуйте еще раз."
        });
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

      const deliveryMode = delivery.some((result) => result.status === "sent")
        ? "sent"
        : "reserved";

      return {
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
      };
    }
  })
};

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
