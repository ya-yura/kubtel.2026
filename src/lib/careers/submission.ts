import { createHash } from "node:crypto";
import type { CareerApplicationFormInput } from "@lib/careers/schema";
import type { JobVacancy } from "@models/domain";

export class CareerApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CareerApplicationError";
  }
}

export type CareerApplicationSubmission = {
  id: string;
  applicationType: "career";
  createdAt: string;
  applicant: {
    name: string;
    phone: string;
    email: string;
  };
  vacancy: {
    slug: string;
    title: string;
    department: string;
  };
  message: string | null;
  routing: {
    pipeline: "hr";
    department: "hr";
    status: "new";
  };
  consentAccepted: true;
  sourcePath: string;
  userAgent: string | null;
};

export type CareerApplicationActionResult = {
  success: true;
  applicationId: string;
  message: string;
  vacancyTitle: string;
  deliveryMode: "sent" | "reserved";
};

export function buildCareerApplicationSubmission({
  input,
  vacancies,
  now = new Date(),
  userAgent = null
}: {
  input: CareerApplicationFormInput;
  vacancies: JobVacancy[];
  now?: Date;
  userAgent?: string | null;
}): CareerApplicationSubmission {
  const vacancy = vacancies.find(
    (item) => item.slug === input.vacancySlug && item.isActive && item.status === "open"
  );

  if (!vacancy) {
    throw new CareerApplicationError("Выберите актуальную вакансию из списка.");
  }

  return {
    id: createCareerApplicationId(input, now),
    applicationType: "career",
    createdAt: now.toISOString(),
    applicant: {
      name: input.name,
      phone: input.phone,
      email: input.email
    },
    vacancy: {
      slug: vacancy.slug,
      title: vacancy.title,
      department: vacancy.department
    },
    message: input.message || null,
    routing: {
      pipeline: "hr",
      department: "hr",
      status: "new"
    },
    consentAccepted: true,
    sourcePath: input.sourcePath,
    userAgent
  };
}

function createCareerApplicationId(input: CareerApplicationFormInput, now: Date): string {
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const hash = createHash("sha256")
    .update(`${now.toISOString()}:${input.phone}:${input.email}:${input.vacancySlug}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();

  return `KBT-HR-${datePart}-${hash}`;
}
