export type DeliveryChannel = "crm" | "telegram" | "analytics" | "cms" | "outbox";

export type DeliveryStatus = "sent" | "skipped" | "failed";

export type DeliveryResult = {
  channel: DeliveryChannel;
  status: DeliveryStatus;
  message: string;
  statusCode?: number;
};
