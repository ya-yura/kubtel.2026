import { createHmac } from "node:crypto";
import type { DeliveryResult } from "@lib/integrations/types";

export type ServerAnalyticsEvent = {
  name:
    | "lead_submitted"
    | "lead_delivery_failed"
    | "lead_spam_blocked"
    | "b2b_lead_submitted"
    | "b2b_lead_delivery_failed"
    | "b2b_lead_spam_blocked";
  leadId?: string;
  tariff?: string;
  serviceInterest?: string;
  addressStatus?: string;
  optionsCount?: number;
  sourcePath?: string;
  delivery?: Array<Pick<DeliveryResult, "channel" | "status">>;
};

export async function trackServerEvent(
  event: ServerAnalyticsEvent,
  env = process.env
): Promise<DeliveryResult> {
  const webhookUrl = env.ANALYTICS_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      channel: "analytics",
      status: "skipped",
      message: "Analytics webhook не настроен"
    };
  }

  const body = JSON.stringify({
    ...event,
    occurredAt: new Date().toISOString()
  });

  const headers: Record<string, string> = {
    "content-type": "application/json"
  };

  if (env.ANALYTICS_WEBHOOK_SECRET) {
    headers["x-kubtel-analytics-signature"] = createHmac("sha256", env.ANALYTICS_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body
    });

    return {
      channel: "analytics",
      status: response.ok ? "sent" : "failed",
      statusCode: response.status,
      message: response.ok
        ? "Событие аналитики отправлено"
        : `Analytics webhook вернул ${response.status}`
    };
  } catch (error) {
    return {
      channel: "analytics",
      status: "failed",
      message: error instanceof Error ? error.message : "Analytics webhook недоступен"
    };
  }
}
