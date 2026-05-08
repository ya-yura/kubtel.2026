import { readFile, writeFile } from "node:fs/promises";

const files = ["src/pages/index.astro", "src/pages/connect.astro", "src/pages/tariffs/index.astro"];

if (process.env.PUBLIC_STATIC_PREVIEW !== "true") {
  throw new Error("PUBLIC_STATIC_PREVIEW must be true before preparing the Pages preview build.");
}

for (const file of files) {
  const source = await readFile(file, "utf8");
  const nextSource = source.replace("export const prerender = false;", "export const prerender = true;");

  if (source === nextSource) {
    throw new Error(`Could not enable prerender in ${file}`);
  }

  await writeFile(file, nextSource);
}

console.log("Prepared static GitHub Pages preview build.");
