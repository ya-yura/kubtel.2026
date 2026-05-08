import type { APIRoute } from "astro";
import { getAbsoluteUrl } from "@config/site";

export const GET: APIRoute = () => {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /.lead-outbox/",
    "Disallow: /_actions/",
    "",
    `Sitemap: ${getAbsoluteUrl("/sitemap.xml")}`,
    ""
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
};
