import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CareerApplicationSubmission } from "@lib/careers/submission";
import type { DeliveryResult } from "@lib/integrations/types";
import type { LeadSubmission } from "@lib/leads/submission";
import type { BusinessLeadSubmission } from "@lib/leads/business-submission";
import type { ConfiguratorLeadSubmission } from "@lib/leads/configurator-submission";
import type { CareerResumeAttachment } from "@lib/careers/resume";

type OutboxLead =
  | LeadSubmission
  | ConfiguratorLeadSubmission
  | BusinessLeadSubmission
  | CareerApplicationSubmission;

type LeadOutboxRecord = {
  lead: OutboxLead;
  delivery: DeliveryResult[];
  attachment?: Omit<CareerResumeAttachment, "bytes">;
};

export async function saveLeadToOutbox(
  lead: OutboxLead,
  delivery: DeliveryResult[],
  attachment?: CareerResumeAttachment | null,
  env = process.env
): Promise<DeliveryResult> {
  const outboxDir = env.LEAD_OUTBOX_DIR ?? ".lead-outbox";

  if (outboxDir === "disabled") {
    return {
      channel: "outbox",
      status: "skipped",
      message: "Локальный резерв заявок отключен"
    };
  }

  try {
    const absoluteOutboxDir = path.resolve(process.cwd(), outboxDir);
    const fileName = `${lead.id}-${randomUUID().slice(0, 8)}.json`;
    const record: LeadOutboxRecord = {
      lead,
      delivery,
      ...(attachment
        ? {
            attachment: {
              originalName: attachment.originalName,
              safeName: attachment.safeName,
              mimeType: attachment.mimeType,
              size: attachment.size
            }
          }
        : {})
    };

    await mkdir(absoluteOutboxDir, { recursive: true });
    if (attachment) {
      await writeFile(path.join(absoluteOutboxDir, attachment.safeName), attachment.bytes, {
        flag: "wx",
        mode: 0o600
      });
    }
    await writeFile(
      path.join(absoluteOutboxDir, fileName),
      `${JSON.stringify(record, null, 2)}\n`,
      {
        flag: "wx",
        mode: 0o600
      }
    );

    return {
      channel: "outbox",
      status: "sent",
      message: "Заявка сохранена в серверный резерв"
    };
  } catch (error) {
    return {
      channel: "outbox",
      status: "failed",
      message: error instanceof Error ? error.message : "Не удалось сохранить заявку в резерв"
    };
  }
}
