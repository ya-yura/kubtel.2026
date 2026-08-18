import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const pages = [["src/pages/connect.astro", "/connect/"]] as const;

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

describe("legacy tariffs route contract", () => {
  it("keeps old tariff links pointed at the shared residential configurator", () => {
    const source = readProjectFile("src/pages/tariffs/index.astro");

    expect(source).toContain("export const prerender = false");
    expect(source).toContain("Astro.redirect");
    expect(source).toContain("/individual/configurator/");
  });
});

describe("homepage shell contract", () => {
  it("keeps the homepage focused on navigation and first-screen actions", () => {
    const source = readProjectFile("src/pages/index.astro");

    expect(source).toContain("<Hero />");
    expect(source).not.toContain("<ServiceConfigurator");
    expect(source).not.toContain("handleConfiguratorFormPost");
  });
});
