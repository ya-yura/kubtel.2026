import { createHash } from "node:crypto";
import {
  scoreBusinessLead,
  type BusinessLeadPriority,
  type BusinessLeadQualification
} from "@lib/business/lead-scoring";
import type { BusinessLeadFormInput } from "@lib/leads/business-schema";

type BusinessLeadEstimate = {
  amount: number | null;
  currency: "RUB";
  status: "confirmed" | "needs_verification" | "unknown";
};

export type BusinessLeadSubmission = {
  id: string;
  leadType: "b2b";
  createdAt: string;
  contact: {
    companyName: string;
    contactPerson: string;
    phone: string;
    email: string | null;
    inn: string | null;
    city: string | null;
    address: string | null;
  };
  qualification: {
    businessSegment: string | null;
    serviceInterest: string;
    urgency: BusinessLeadFormInput["urgency"];
    employeesOrSites: number | null;
    leadScore: number;
    qualification: BusinessLeadQualification;
    priority: BusinessLeadPriority;
    scoreReasons: string[];
  };
  configuration: {
    summary: string;
    monthlyEstimate: BusinessLeadEstimate;
    oneTimeEstimate: BusinessLeadEstimate;
    unknownItems: string[];
    requiredConsultation: true;
    details: Record<string, unknown>;
  };
  routing: {
    pipeline: "b2b" | "b2g" | "operators" | "datacenter";
    department: "business_sales" | "b2g" | "partner_sales" | "noc";
    recipientEmail: "kubtel@kubtel.ru" | "tender@kubtel.ru";
    priority: BusinessLeadPriority;
    slaResponseMinutes: number;
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
  const configurationSummary = buildConfigurationSummary(input);
  const unknownItems = getUnknownItems(input);
  const score = scoreBusinessLead({
    leadType: "b2b",
    companyName: input.companyName,
    phone: input.phone,
    email: input.email,
    consentAccepted: true,
    serviceInterest: input.service,
    urgency: input.urgency,
    businessSegment: input.segment || null,
    inn: input.inn,
    address: input.address ?? input.city,
    employeesOrSites: input.employeesOrSites,
    configurationSummary,
    unknownItems,
    requiredConsultation: true
  });
  const routing = getRouting(input.service, input.segment || null, score.priority);

  return {
    id: createBusinessLeadId(input, now),
    leadType: "b2b",
    createdAt: now.toISOString(),
    contact: {
      companyName: input.companyName,
      contactPerson: input.contactPerson,
      phone: input.phone,
      email: input.email,
      inn: input.inn,
      city: input.city || null,
      address: input.address
    },
    qualification: {
      businessSegment: input.segment || null,
      serviceInterest: input.service,
      urgency: input.urgency,
      employeesOrSites: input.employeesOrSites,
      leadScore: score.score,
      qualification: score.qualification,
      priority: score.priority,
      scoreReasons: score.reasons
    },
    configuration: {
      summary: configurationSummary,
      monthlyEstimate: buildEstimate(input.monthlyEstimate),
      oneTimeEstimate: buildEstimate(input.oneTimeEstimate),
      unknownItems,
      requiredConsultation: true,
      details: {
        address: input.address,
        employeesOrSites: input.employeesOrSites,
        mobilePhone: input.mobilePhone,
        preferredContact: input.preferredContact || null,
        officeProfile: input.officeProfile || null
      }
    },
    routing,
    consentAccepted: true,
    sourcePath: input.sourcePath,
    userAgent
  };
}

function buildEstimate(amount: number | null): BusinessLeadEstimate {
  return {
    amount,
    currency: "RUB",
    status: amount === null ? "unknown" : "needs_verification"
  };
}

function getUnknownItems(input: BusinessLeadFormInput): string[] {
  const unknownItems = new Set(["price", "sla", "coverage"]);

  if (!input.monthlyEstimate) {
    unknownItems.add("monthlyEstimate");
  }

  if (!input.oneTimeEstimate) {
    unknownItems.add("oneTimeEstimate");
  }

  return [...unknownItems];
}

function buildConfigurationSummary(input: BusinessLeadFormInput): string {
  const baseSummary =
    input.configurationSummary || input.message || "Индивидуальный расчёт по B2B-заявке";
  const contactDetails = [
    input.preferredContact ? `предпочтительный канал связи: ${input.preferredContact}` : "",
    input.mobilePhone ? `мобильный телефон: ${input.mobilePhone}` : ""
  ].filter(Boolean);

  if (contactDetails.length === 0) {
    return baseSummary;
  }

  return `${baseSummary}. ${contactDetails.join("; ")}.`;
}

function getRouting(
  serviceInterest: string,
  segment: string | null,
  priority: BusinessLeadPriority
): BusinessLeadSubmission["routing"] {
  if (segment === "b2g" || serviceInterest === "b2g-consultation") {
    return {
      pipeline: "b2g",
      department: "b2g",
      recipientEmail: "tender@kubtel.ru",
      priority: "urgent",
      slaResponseMinutes: 30
    };
  }

  if (serviceInterest === "operators") {
    return {
      pipeline: "operators",
      department: "partner_sales",
      recipientEmail: "kubtel@kubtel.ru",
      priority,
      slaResponseMinutes: priority === "urgent" ? 30 : 120
    };
  }

  if (serviceInterest === "colocation" || serviceInterest === "datacenter-access") {
    return {
      pipeline: "datacenter",
      department: "business_sales",
      recipientEmail: "kubtel@kubtel.ru",
      priority,
      slaResponseMinutes: priority === "urgent" ? 30 : 120
    };
  }

  return {
    pipeline: "b2b",
    department: "business_sales",
    recipientEmail: "kubtel@kubtel.ru",
    priority,
    slaResponseMinutes: priority === "urgent" ? 30 : 180
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
