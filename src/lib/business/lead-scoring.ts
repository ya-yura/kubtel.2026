export type BusinessLeadQualification = "mql" | "sql" | "needs_enrichment" | "disqualified";

export type BusinessLeadPriority = "low" | "normal" | "high" | "urgent";

export type BusinessLeadScoringInput = {
  leadType: "b2b";
  companyName: string;
  phone: string;
  email: string | null;
  consentAccepted: boolean;
  serviceInterest: string;
  urgency: "planning" | "30_days" | "7_days" | "asap";
  businessSegment?: string | null;
  inn?: string | null;
  address?: string | null;
  employeesOrSites?: number | null;
  configurationSummary?: string;
  unknownItems?: string[];
  requiredConsultation?: boolean;
  spamBlocked?: boolean;
};

export type BusinessLeadScore = {
  score: number;
  qualification: BusinessLeadQualification;
  priority: BusinessLeadPriority;
  reasons: string[];
};

const highIntentServices = new Set(["internet", "vps", "vdi", "colocation", "operators"]);

export function scoreBusinessLead(input: BusinessLeadScoringInput): BusinessLeadScore {
  const reasons: string[] = [];
  let score = 0;

  score += addReason(reasons, 20, "leadType=b2b");

  if (input.companyName.trim()) {
    score += addReason(reasons, 10, "companyName");
  }

  if (input.phone.trim()) {
    score += addReason(reasons, 10, "validPhone");
  }

  if (input.email) {
    score += addReason(reasons, 10, "emailWithPhone");
  }

  if (input.serviceInterest) {
    score += addReason(reasons, 10, "serviceInterest");
  }

  if (input.configurationSummary?.trim()) {
    score += addReason(reasons, 10, "configurationSummary");
  }

  if (input.urgency === "asap" || input.urgency === "7_days") {
    score += addReason(reasons, 15, "urgentLaunch");
  } else if (input.urgency === "30_days") {
    score += addReason(reasons, 10, "launch30Days");
  }

  if (input.address?.trim()) {
    score += addReason(reasons, 10, "addressOrLocation");
  }

  if (input.inn?.trim()) {
    score += addReason(reasons, 15, "companyIdentifier");
  }

  if (highIntentServices.has(input.serviceInterest)) {
    score += addReason(reasons, 15, "highIntentService");
  }

  if ((input.employeesOrSites ?? 0) >= 2) {
    score += addReason(reasons, 10, "multiSiteOrTeam");
  }

  if (input.requiredConsultation || (input.unknownItems?.length ?? 0) > 0) {
    score += addReason(reasons, 5, "consultationRequired");
  }

  if (!input.consentAccepted) {
    score -= addReason(reasons, 100, "noConsent");
  }

  if (!input.serviceInterest) {
    score -= addReason(reasons, 20, "missingService");
  }

  if (input.spamBlocked) {
    score -= addReason(reasons, 100, "spamSignal");
  }

  const qualification = getQualification(score, input);
  const priority = getPriority(qualification, input);

  return {
    score: Math.max(0, score),
    qualification,
    priority,
    reasons
  };
}

function addReason(reasons: string[], points: number, reason: string): number {
  reasons.push(`${points > 0 ? "+" : "-"}${Math.abs(points)}:${reason}`);
  return points;
}

function getQualification(
  score: number,
  input: BusinessLeadScoringInput
): BusinessLeadQualification {
  if (!input.consentAccepted || input.spamBlocked || !input.phone || !input.serviceInterest) {
    return "disqualified";
  }

  if (
    score >= 80 ||
    input.serviceInterest === "operators" ||
    input.serviceInterest === "colocation" ||
    input.urgency === "asap"
  ) {
    return "sql";
  }

  if (score >= 50) {
    return "mql";
  }

  return "needs_enrichment";
}

function getPriority(
  qualification: BusinessLeadQualification,
  input: BusinessLeadScoringInput
): BusinessLeadPriority {
  if (qualification === "disqualified" || qualification === "needs_enrichment") {
    return "low";
  }

  if (input.urgency === "asap" || input.urgency === "7_days") {
    return "urgent";
  }

  if (qualification === "sql" || ["operators", "colocation"].includes(input.serviceInterest)) {
    return "high";
  }

  return "normal";
}
