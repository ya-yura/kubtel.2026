import { readFile } from "node:fs/promises";

const [, , seedPath] = process.argv;
const baseUrl = process.env.STRAPI_URL ?? "http://127.0.0.1:1337";
const token = process.env.KUBTEL_SEED_API_TOKEN ?? process.env.STRAPI_API_TOKEN;

if (!seedPath) {
  fail("Usage: node scripts/seed-from-file.mjs ./seed/kubtel-seed.json");
}

if (!token) {
  fail("KUBTEL_SEED_API_TOKEN or STRAPI_API_TOKEN is required.");
}

const seed = JSON.parse(await readFile(seedPath, "utf8"));

for (const [apiId, records] of Object.entries(seed.collections)) {
  for (const record of records) {
    await createIfMissing(apiId, record);
  }
}

console.log("Seed completed.");

async function createIfMissing(apiId, record) {
  const slug = record.slug ?? record.route ?? record.formKey;
  const existing = slug
    ? await findBySlug(apiId, slug, record.slug ? "slug" : record.route ? "route" : "formKey")
    : [];

  if (existing.length > 0) {
    console.log(`skip ${apiId}:${slug}`);
    return;
  }

  const response = await fetch(new URL(`/api/${apiId}`, baseUrl), {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({ data: record })
  });

  if (!response.ok) {
    const body = await response.text();
    fail(`Failed to create ${apiId}:${slug ?? "record"} - ${response.status}\n${body}`);
  }

  console.log(`created ${apiId}:${slug ?? "record"}`);
}

async function findBySlug(apiId, value, field) {
  const url = new URL(`/api/${apiId}`, baseUrl);
  url.searchParams.set(`filters[${field}][$eq]`, value);
  url.searchParams.set("pagination[pageSize]", "1");

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json"
    }
  });

  if (!response.ok) {
    return [];
  }

  const body = await response.json();
  return Array.isArray(body.data) ? body.data : [];
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
