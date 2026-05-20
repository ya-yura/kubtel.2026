import type { DeliveryResult } from "@lib/integrations/types";
import type { CareerApplicationSubmission } from "@lib/careers/submission";

export async function saveCareerApplicationToCms(
  application: CareerApplicationSubmission,
  env = process.env
): Promise<DeliveryResult> {
  const baseUrl = env.STRAPI_URL;
  const token = env.STRAPI_WRITE_API_TOKEN || env.STRAPI_API_TOKEN;

  if (!baseUrl || !token) {
    return {
      channel: "cms",
      status: "skipped",
      message: "Strapi URL или write token не настроены"
    };
  }

  const apiId = env.STRAPI_CAREER_APPLICATIONS_API_ID ?? "job-applications";
  const body = JSON.stringify({
    data: {
      submissionId: application.id,
      applicantName: application.applicant.name,
      phone: application.applicant.phone,
      email: application.applicant.email,
      vacancySlug: application.vacancy.slug,
      vacancyTitle: application.vacancy.title,
      message: application.message,
      sourcePath: application.sourcePath,
      consentAccepted: application.consentAccepted,
      submittedAt: application.createdAt,
      applicationStatus: "new",
      reaction: "not_contacted",
      payload: application
    }
  });

  try {
    const response = await postWithTimeout(new URL(`/api/${apiId}`, ensureTrailingSlash(baseUrl)), {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body
    });

    if (!response.ok) {
      return {
        channel: "cms",
        status: "failed",
        statusCode: response.status,
        message: `Strapi applications API вернул ${response.status}`
      };
    }

    return {
      channel: "cms",
      status: "sent",
      statusCode: response.status,
      message: "Отклик сохранён в Strapi"
    };
  } catch (error) {
    return {
      channel: "cms",
      status: "failed",
      message: error instanceof Error ? error.message : "Strapi applications API недоступен"
    };
  }
}

async function postWithTimeout(url: URL, init: RequestInit): Promise<Response> {
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

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}
