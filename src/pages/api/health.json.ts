import { SITE } from "@config/site";
import { getCoverageAreas, getFaqItems, getServices, getTariffs } from "@lib/content";

export const prerender = false;

export async function GET(): Promise<Response> {
  const generatedAt = new Date().toISOString();

  try {
    const [tariffs, services, faqItems, coverageAreas] = await Promise.all([
      getTariffs(),
      getServices(),
      getFaqItems(),
      getCoverageAreas()
    ]);
    const checks = [
      { id: "tariffs", ok: tariffs.length > 0, count: tariffs.length },
      { id: "services", ok: services.length > 0, count: services.length },
      { id: "faq", ok: faqItems.length > 0, count: faqItems.length },
      { id: "coverage", ok: coverageAreas.length > 0, count: coverageAreas.length }
    ];
    const healthy = checks.every((check) => check.ok);

    return jsonResponse(
      {
        status: healthy ? "ok" : "degraded",
        site: SITE.name,
        origin: SITE.origin,
        generatedAt,
        checks
      },
      healthy ? 200 : 503
    );
  } catch (error) {
    return jsonResponse(
      {
        status: "error",
        site: SITE.name,
        origin: SITE.origin,
        generatedAt,
        message: error instanceof Error ? error.message : "Unknown health check error"
      },
      503
    );
  }
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
