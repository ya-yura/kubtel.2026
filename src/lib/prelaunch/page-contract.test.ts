import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const pages = [
  ["src/pages/index.astro", "/"],
  ["src/pages/connect.astro", "/connect/"],
  ["src/pages/tariffs/index.astro", "/tariffs/"]
] as const;

function readProjectFile(path: string): string {
  return readFileSync(fileURLToPath(new URL(`../../../${path}`, import.meta.url)), "utf8");
}

describe("lead form page contract", () => {
  it.each(pages)("%s renders the action result on demand", (filePath, routePath) => {
    const source = readProjectFile(filePath);

    expect(source, `${routePath} must render the lead form`).toContain("<ServiceConfigurator");
    expect(source, `${routePath} must be server-rendered by default`).toContain(
      "export const prerender = false"
    );
    expect(source, `${routePath} must handle POST submissions on demand`).toContain(
      "handleConfiguratorFormPost(await Astro.request.formData(), Astro.request)"
    );
    expect(source, `${routePath} must pass actionResult into ServiceConfigurator`).toContain(
      "actionResult={leadActionResult}"
    );
  });
});
