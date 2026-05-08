import { createHmac } from "node:crypto";
import type { DeliveryResult } from "@lib/integrations/types";
import type { LeadSubmission } from "@lib/leads/submission";

export async function sendLeadToCrm(
  lead: LeadSubmission,
  env = process.env
): Promise<DeliveryResult> {
  const webhookUrl = env.CRM_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      channel: "crm",
      status: "skipped",
      message: "CRM webhook не настроен"
    };
  }

  const body = JSON.stringify({
    type: "lead.created",
    lead
  });

  const headers: Record<string, string> = {
    "content-type": "application/json"
  };

  if (env.CRM_WEBHOOK_SECRET) {
    headers["x-kubtel-signature"] = createHmac("sha256", env.CRM_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");
  }

  try {
    const response = await postWithTimeout(webhookUrl, {
      method: "POST",
      headers,
      body
    });

    if (!response.ok) {
      return {
        channel: "crm",
        status: "failed",
        statusCode: response.status,
        message: `CRM webhook вернул ${response.status}`
      };
    }

    return {
      channel: "crm",
      status: "sent",
      statusCode: response.status,
      message: "Заявка передана в CRM webhook"
    };
  } catch (error) {
    return {
      channel: "crm",
      status: "failed",
      message: error instanceof Error ? error.message : "CRM webhook недоступен"
    };
  }
}

async function postWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}
