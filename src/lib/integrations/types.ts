export type DeliveryChannel = "crm" | "telegram" | "analytics" | "outbox";

export type DeliveryStatus = "sent" | "skipped" | "failed";

export type DeliveryResult = {
  channel: DeliveryChannel;
  status: DeliveryStatus;
  message: string;
  statusCode?: number;
};
