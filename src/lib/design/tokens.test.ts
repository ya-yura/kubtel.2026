import { describe, expect, it } from "vitest";

type Token = {
  value: string | number;
  type: string;
};

type TokenMap = Record<string, Token>;
type SourceMap = Record<string, string>;

type TokenTheme = {
  name: string;
  selector: string;
  colorScheme: "light" | "dark";
  transform?: "achromatic";
  overrides: TokenMap;
  file: string;
};

type TokenBuilderModule = {
  buildTokens(options?: { check?: boolean }): Promise<{
    changed: boolean;
    css: string;
    tokenCount: number;
  }>;
  loadCoreTokens(): Promise<{ tokens: TokenMap; sources: SourceMap }>;
  loadThemes(): Promise<TokenTheme[]>;
  resolveAllTokens(tokens: TokenMap): TokenMap;
  resolveTheme(tokens: TokenMap, theme: TokenTheme, sources?: SourceMap): TokenMap;
  applyTheme(tokens: TokenMap, theme: TokenTheme): TokenMap;
  validateTokenSet(tokens: TokenMap, sources?: SourceMap): void;
};

type DesignAuditReport = {
  errors: string[];
  counts: {
    staticColorViolations: number;
    legacyVariables: number;
  };
};

type DesignAuditModule = {
  runDesignAudit(): Promise<DesignAuditReport>;
};

async function loadTokenBuilder(): Promise<TokenBuilderModule> {
  return import("../../../scripts/build-tokens.mjs") as Promise<unknown> as Promise<TokenBuilderModule>;
}

async function loadDesignAudit(): Promise<DesignAuditModule> {
  return import("../../../scripts/design-audit.mjs") as Promise<unknown> as Promise<DesignAuditModule>;
}

describe("design token system", () => {
  it("resolves the full token graph and required themes", async () => {
    const { loadCoreTokens, loadThemes, resolveAllTokens, validateTokenSet } =
      await loadTokenBuilder();
    const { tokens, sources } = await loadCoreTokens();
    const themes = await loadThemes();

    expect(() => validateTokenSet(tokens, sources)).not.toThrow();
    expect(Object.keys(resolveAllTokens(tokens)).length).toBeGreaterThan(690);
    expect(themes.map((theme) => theme.name).sort()).toEqual(["business", "light", "readable"]);
  });

  it("keeps generated CSS current and free of legacy aliases", async () => {
    const { buildTokens } = await loadTokenBuilder();
    const result = await buildTokens({ check: true });

    expect(result.css).toMatch(/\.business-page,\s*\[data-theme="business"\]/);
    expect(result.css).toMatch(/body\.is-readable,\s*\[data-theme="readable"\]/);
    expect(result.css).not.toMatch(/--(?:color-ink|color-graphite|max-page|header-height):/);
  });

  it("keeps the readable theme achromatic after semantic overrides cascade", async () => {
    const { loadCoreTokens, loadThemes, resolveTheme } = await loadTokenBuilder();
    const { tokens, sources } = await loadCoreTokens();
    const readable = getTheme(await loadThemes(), "readable");
    const resolved = resolveTheme(tokens, readable, sources);
    const violations = Object.entries(resolved)
      .filter(([tokenPath]) => sources[tokenPath] !== "primitives.json")
      .filter(([, token]) => hasColoredChannels(String(token.value)))
      .map(([tokenPath]) => tokenPath);

    expect(violations).toEqual([]);
  });

  it("meets AA contrast for core text and primary actions", async () => {
    const { loadCoreTokens, loadThemes, applyTheme, resolveAllTokens } = await loadTokenBuilder();
    const { tokens } = await loadCoreTokens();
    const light = getTheme(await loadThemes(), "light");
    const resolved = resolveAllTokens(applyTheme(tokens, light));

    expect(
      contrast(resolved["color.text.primary"].value, resolved["color.surface.page"].value)
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(resolved["color.text.secondary"].value, resolved["color.surface.page"].value)
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(
        resolved["color.action.primary.text"].value,
        resolved["color.action.primary.background"].value
      )
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(
        resolved["color.action.primary.text"].value,
        resolved["color.action.primary.backgroundHover"].value
      )
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps selected states visually distinct from hover states", async () => {
    const { loadCoreTokens, loadThemes, applyTheme, resolveAllTokens } = await loadTokenBuilder();
    const { tokens } = await loadCoreTokens();
    const light = getTheme(await loadThemes(), "light");
    const resolved = resolveAllTokens(applyTheme(tokens, light));

    expect(resolved["component.tabs.hoverBackground"].value).not.toBe(
      resolved["component.tabs.selectedBackground"].value
    );
    expect(resolved["component.card.borderHover"].value).not.toBe(
      resolved["component.card.selectedBorder"].value
    );
  });

  it("passes the source-level design audit guard", async () => {
    const { runDesignAudit } = await loadDesignAudit();
    const report = await runDesignAudit();

    expect(report.errors).toEqual([]);
    expect(report.counts.staticColorViolations).toBe(0);
    expect(report.counts.legacyVariables).toBe(0);
  });
});

function hasColoredChannels(value: string) {
  for (const match of value.matchAll(/#([\da-f]{6})\b/gi)) {
    const [, hex] = match;
    if (!(hex.slice(0, 2) === hex.slice(2, 4) && hex.slice(2, 4) === hex.slice(4, 6))) {
      return true;
    }
  }

  for (const match of value.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/gi)) {
    const [, red, green, blue] = match;
    if (!(red === green && green === blue)) {
      return true;
    }
  }

  return false;
}

function getTheme(themes: TokenTheme[], name: string) {
  const theme = themes.find((item) => item.name === name);
  expect(theme).toBeDefined();

  return theme as TokenTheme;
}

function contrast(foreground: string | number, background: string | number) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function luminance(color: string | number) {
  const [red, green, blue] = hexChannels(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function hexChannels(color: string | number) {
  const normalized = String(color).trim().replace("#", "");
  if (!/^[\da-f]{6}$/i.test(normalized)) {
    throw new Error(`Expected a 6-digit hex color, got ${color}`);
  }

  return [0, 2, 4].map((start) => Number.parseInt(normalized.slice(start, start + 2), 16));
}
