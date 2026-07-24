import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const catalogPath = "src/content/configurator/individual.json";
const assetsDirectory = "public/assets/tv/channels";
const endpoint = "https://kubtel.ru/individual/tv_getchannels";

const categoryMap = new Map([
  ["1", { id: "information", title: "Информационные" }],
  ["2", { id: "entertainment", title: "Развлекательные" }],
  ["3", { id: "kids", title: "Детские" }],
  ["4", { id: "movies", title: "Кино и сериалы" }],
  ["5", { id: "educational", title: "Познавательные" }],
  ["6", { id: "sport", title: "Спорт" }],
  ["7", { id: "music", title: "Музыка" }],
  ["12", { id: "adult", title: "Для взрослых" }]
]);

const response = await fetch(endpoint, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ name: "", category: "" })
});

if (!response.ok) {
  throw new Error(`TV channel endpoint returned ${response.status}`);
}

const sourceChannels = await response.json();
if (!Array.isArray(sourceChannels) || sourceChannels.length === 0) {
  throw new Error("TV channel endpoint returned no channels");
}

await mkdir(assetsDirectory, { recursive: true });

const channels = await mapWithConcurrency(sourceChannels, 8, async (item) => {
  const fileName = getFileName(item.url);
  const logo = fileName ? await downloadLogo(fileName) : null;

  return {
    id: String(item.id ?? item.ch_id ?? item.name),
    name: normalizeText(item.name),
    logo,
    description: normalizeText(item.info || item.description || "")
  };
});

const groups = [...categoryMap.values()].map((category) => ({
  ...category,
  channels: sourceChannels
    .map((item, index) => ({ item, channel: channels[index] }))
    .filter(({ item }) => String(item.parent) === getParentId(category.id))
    .map(({ channel }) => channel)
}));

const uncategorized = sourceChannels.filter((item) => !categoryMap.has(String(item.parent)));
if (uncategorized.length > 0) {
  throw new Error(
    `Unmapped TV channel categories: ${uncategorized.map((item) => item.parent).join(", ")}`
  );
}

const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
catalog.updatedAt = new Date().toISOString().slice(0, 10);
catalog.sourceNote =
  "Цены и юридические материалы перенесены с действующих страниц Kubtel. Список каналов, описания и логотипы синхронизируются с kubtel.ru/individual/tv_getchannels. Новые поля добавляются в массив fields без изменений компонента.";
catalog.tv.channelCount = channels.length;
catalog.tv.channelGroups = groups;

await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

const logoCount = channels.filter((channel) => channel.logo).length;
console.log(
  `Synced ${channels.length} TV channels, ${logoCount} logos and ${channels.length - logoCount} fallbacks.`
);

function getParentId(categoryId) {
  return [...categoryMap.entries()].find(([, category]) => category.id === categoryId)?.[0];
}

function getFileName(url) {
  try {
    const value = basename(new URL(url).pathname);
    return value && value !== "." ? value : null;
  } catch {
    return null;
  }
}

async function downloadLogo(fileName) {
  const targetPath = join(assetsDirectory, fileName);
  const sourceUrls = [
    `http://tv.kubtel.ru/tv_icon/${encodeURIComponent(fileName)}`,
    `http://kubtel.ru/files/image/tv/logos/${encodeURIComponent(fileName)}`
  ];

  for (const sourceUrl of sourceUrls) {
    try {
      const imageResponse = await fetch(sourceUrl);
      if (!imageResponse.ok || !imageResponse.headers.get("content-type")?.startsWith("image/")) {
        continue;
      }

      await writeFile(targetPath, Buffer.from(await imageResponse.arrayBuffer()));
      return `/assets/tv/channels/${fileName}`;
    } catch {
      // Try the next source URL, then render a text fallback if neither works.
    }
  }

  return null;
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
