import { createHash } from "node:crypto";
import type { BusinessLeadFormInput } from "@lib/leads/business-schema";

export type BusinessLeadSubmission = {
  id: string;
  leadType: "b2b";
  createdAt: string;
  contact: {
    companyName: string;
    contactPerson: string;
    phone: string;
    email: string | null;
    city: string | null;
  };
  qualification: {
    businessSegment: string | null;
    serviceInterest: string;
    urgency: BusinessLeadFormInput["urgency"];
  };
  configuration: {
    summary: string;
    monthlyEstimate: null;
    oneTimeEstimate: null;
    unknownItems: string[];
    requiredConsultation: true;
  };
  consentAccepted: true;
  sourcePath: string;
  userAgent: string | null;
};

export type BusinessLeadActionResult = {
  success: true;
  leadId: string;
  message: string;
  serviceInterest: string;
  deliveryMode: "sent" | "reserved";
};

export function buildBusinessLeadSubmission({
  input,
  now = new Date(),
  userAgent = null
}: {
  input: BusinessLeadFormInput;
  now?: Date;
  userAgent?: string | null;
}): BusinessLeadSubmission {
  return {
    id: createBusinessLeadId(input, now),
    leadType: "b2b",
    createdAt: now.toISOString(),
    contact: {
      companyName: input.companyName,
      contactPerson: input.contactPerson,
      phone: input.phone,
      email: input.email,
      city: input.city || null
    },
    qualification: {
      businessSegment: input.segment || null,
      serviceInterest: input.service,
      urgency: input.urgency
    },
    configuration: {
      summary: input.message || "Индивидуальный расчет по B2B-заявке",
      monthlyEstimate: null,
      oneTimeEstimate: null,
      unknownItems: ["price", "sla", "coverage"],
      requiredConsultation: true
    },
    consentAccepted: true,
    sourcePath: input.sourcePath,
    userAgent
  };
}

function createBusinessLeadId(input: BusinessLeadFormInput, now: Date): string {
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const hash = createHash("sha256")
    .update(`${now.toISOString()}:${input.phone}:${input.companyName}:${input.service}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();

  return `KBT-B2B-${datePart}-${hash}`;
}
