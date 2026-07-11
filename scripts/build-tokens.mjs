import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const tokenDir = path.join(rootDir, "src", "design", "tokens");
const outputPath = path.join(rootDir, "src", "styles", "tokens.css");

const coreTokenFiles = [
  "primitives.json",
  "semantic.json",
  "components.json",
  "compositions.json",
  "business.json"
];

const primitiveFile = "primitives.json";
const allowedTypes = new Set([
  "aspectRatio",
  "blur",
  "border",
  "borderRadius",
  "borderWidth",
  "color",
  "cubicBezier",
  "dimension",
  "duration",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "gradient",
  "gridTemplate",
  "letterSpacing",
  "lineHeight",
  "number",
  "opacity",
  "shadow",
  "string"
]);

export async function buildTokens({ check = false } = {}) {
  const { tokens, sources } = await loadCoreTokens();
  const themes = await loadThemes();
  const lightTheme = themes.find((theme) => theme.name === "light");

  validateTokenSet(tokens, sources);

  const baseTokens = lightTheme ? applyTheme(tokens, lightTheme, sources) : cloneTokenMap(tokens);
  const resolvedBase = resolveAllTokens(baseTokens);
  const resolvedThemes = themes
    .filter((theme) => theme.name !== "light")
    .map((theme) => ({ theme, tokens: resolveTheme(tokens, theme, sources) }));

  const prettierConfig = (await prettier.resolveConfig(outputPath)) ?? {};
  const css = await prettier.format(renderCss(resolvedBase, resolvedThemes), {
    ...prettierConfig,
    parser: "css"
  });

  let existing = "";
  try {
    existing = await readFile(outputPath, "utf8");
  } catch {
    if (check) {
      throw new Error(`Generated token file is missing: ${relativePath(outputPath)}`);
    }
  }

  if (check && existing !== css) {
    throw new Error("src/styles/tokens.css is out of date. Run npm run tokens:build.");
  }

  if (!check && existing !== css) {
    await writeFile(outputPath, css);
    return { changed: true, css, tokenCount: Object.keys(resolvedBase).length };
  }

  return { changed: false, css, tokenCount: Object.keys(resolvedBase).length };
}

export async function loadCoreTokens() {
  const tokens = {};
  const sources = {};

  for (const file of coreTokenFiles) {
    const filePath = path.join(tokenDir, file);
    const tree = await readJson(filePath);
    const flat = flattenTokenTree(tree, [], file);

    for (const [tokenPath, token] of Object.entries(flat)) {
      if (tokens[tokenPath]) {
        throw new Error(
          `Duplicate token ${tokenPath}: declared in ${sources[tokenPath]} and ${file}.`
        );
      }

      tokens[tokenPath] = token;
      sources[tokenPath] = file;
    }
  }

  return { tokens, sources };
}

export async function loadThemes() {
  const themeDir = path.join(tokenDir, "themes");
  const files = (await readdir(themeDir)).filter((file) => file.endsWith(".json")).sort();
  const names = new Set();
  const selectors = new Set();
  const themes = [];

  for (const file of files) {
    const source = await readJson(path.join(themeDir, file));
    const theme = source.theme;

    if (!isRecord(theme)) {
      throw new Error(`${path.join("themes", file)}: theme must be an object.`);
    }

    const { name, selector, colorScheme, transform, overrides = {} } = theme;
    if (typeof name !== "string" || !name.trim()) {
      throw new Error(`${path.join("themes", file)}: theme.name must be a non-empty string.`);
    }
    if (typeof selector !== "string" || !selector.trim()) {
      throw new Error(`${path.join("themes", file)}: theme.selector must be a non-empty string.`);
    }
    if (!new Set(["light", "dark"]).has(colorScheme)) {
      throw new Error(`${path.join("themes", file)}: theme.colorScheme must be light or dark.`);
    }
    if (transform !== undefined && transform !== "achromatic") {
      throw new Error(`${path.join("themes", file)}: unsupported transform ${transform}.`);
    }
    if (!isRecord(overrides)) {
      throw new Error(`${path.join("themes", file)}: theme.overrides must be an object.`);
    }
    if (names.has(name)) {
      throw new Error(`Duplicate theme name ${name}.`);
    }
    if (selectors.has(selector)) {
      throw new Error(`Duplicate theme selector ${selector}.`);
    }

    names.add(name);
    selectors.add(selector);
    themes.push({ name, selector, colorScheme, transform, overrides, file });
  }

  if (!names.has("light")) {
    throw new Error("A light theme is required.");
  }
  if (!names.has("business")) {
    throw new Error("A business theme is required.");
  }
  if (!names.has("readable")) {
    throw new Error("A readable theme is required.");
  }

  return themes;
}

export function flattenTokenTree(tree, prefix = [], source = "token source") {
  if (!isRecord(tree)) {
    throw new Error(`${source}: token root must be an object.`);
  }

  const tokens = {};
  for (const [key, value] of Object.entries(tree)) {
    const nextPath = [...prefix, key];
    const tokenPath = nextPath.join(".");

    if (isToken(value)) {
      tokens[tokenPath] = value;
      continue;
    }

    if (!isRecord(value)) {
      throw new Error(`${source}:${tokenPath} must be a token or token group.`);
    }

    Object.assign(tokens, flattenTokenTree(value, nextPath, source));
  }

  return tokens;
}

export function validateTokenSet(tokens, sources = {}) {
  const paths = Object.keys(tokens);
  if (paths.length === 0) {
    throw new Error("No design tokens were found.");
  }

  for (const tokenPath of paths) {
    validateToken(tokenPath, tokens[tokenPath], sources[tokenPath] ?? "token source");
  }

  validateReferences(tokens);
  validateLayerBoundaries(tokens, sources);
  resolveAllTokens(tokens);
}

function validateToken(tokenPath, token, source) {
  if (!isRecord(token) || !Object.hasOwn(token, "value") || !Object.hasOwn(token, "type")) {
    throw new Error(`${source}:${tokenPath} must define both value and type.`);
  }
  if (typeof token.type !== "string" || !allowedTypes.has(token.type)) {
    throw new Error(`${source}:${tokenPath} uses unsupported type ${String(token.type)}.`);
  }
  if (!["string", "number"].includes(typeof token.value)) {
    throw new Error(`${source}:${tokenPath}.value must be a string or number.`);
  }

  const value = String(token.value).trim();
  if (!value) {
    throw new Error(`${source}:${tokenPath}.value must not be empty.`);
  }

  const patterns = {
    color: /^(?:#[\da-f]{3,8}|rgba?\(.+\)|hsla?\(.+\)|\{[^}]+\})$/i,
    dimension:
      /^(?:0|-?(?:\d*\.)?\d+(?:px|rem|em|vw|vh|ch|%)|(?:calc|clamp|min|max)\(.+\)|\{[^}]+\})$/i,
    fontSize: /^(?:-?(?:\d*\.)?\d+(?:px|rem|em)|(?:calc|clamp|min|max)\(.+\)|\{[^}]+\})$/i,
    borderRadius: /^(?:0|(?:\d*\.)?\d+(?:px|rem|%)|\{[^}]+\})$/i,
    borderWidth: /^(?:0|(?:\d*\.)?\d+(?:px|rem)|\{[^}]+\})$/i,
    duration: /^(?:(?:\d*\.)?\d+(?:ms|s)|\{[^}]+\})$/i,
    opacity: /^(?:0|1|0?\.\d+|\{[^}]+\})$/,
    number: /^(?:-?(?:\d*\.)?\d+|\{[^}]+\})$/,
    fontWeight: /^(?:[1-9]00|[1-9]\d{2}|normal|bold|\{[^}]+\})$/i,
    lineHeight: /^(?:(?:\d*\.)?\d+(?:rem|em|%)?|\{[^}]+\})$/i,
    letterSpacing: /^(?:0|-?(?:\d*\.)?\d+(?:px|rem|em)|\{[^}]+\})$/i,
    aspectRatio: /^(?:\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?|\{[^}]+\})$/
  };

  const pattern = patterns[token.type];
  if (pattern && !pattern.test(value)) {
    throw new Error(`${source}:${tokenPath} has invalid ${token.type} value ${value}.`);
  }
}

export function validateReferences(tokens) {
  for (const [tokenPath, token] of Object.entries(tokens)) {
    for (const reference of getReferences(token.value)) {
      if (!tokens[reference]) {
        throw new Error(`${tokenPath} references missing token ${reference}.`);
      }
    }
  }
}

function validateLayerBoundaries(tokens, sources) {
  for (const [tokenPath, token] of Object.entries(tokens)) {
    const source = sources[tokenPath];
    if (!new Set(["components.json", "business.json"]).has(source)) {
      continue;
    }

    const primitiveReference = getReferences(token.value).find(
      (reference) => sources[reference] === primitiveFile
    );
    if (primitiveReference) {
      throw new Error(
        `${source}:${tokenPath} references primitive token ${primitiveReference}. Use a semantic role.`
      );
    }

    if (/#[\da-f]{3,8}\b|rgba?\(|hsla?\(/i.test(String(token.value))) {
      throw new Error(`${source}:${tokenPath} contains a raw color. Use a semantic role.`);
    }
  }
}

export function resolveAllTokens(tokens) {
  const resolved = {};
  for (const tokenPath of Object.keys(tokens).sort()) {
    resolved[tokenPath] = resolveTokenValue(tokenPath, tokens, resolved, []);
  }
  return resolved;
}

function resolveTokenValue(tokenPath, tokens, resolved, stack) {
  if (resolved[tokenPath]) {
    return resolved[tokenPath];
  }
  const token = tokens[tokenPath];
  if (!token) {
    throw new Error(`Unknown token reference: ${tokenPath}.`);
  }
  if (stack.includes(tokenPath)) {
    throw new Error(`Circular token reference: ${[...stack, tokenPath].join(" -> ")}.`);
  }

  const value = String(token.value).replace(
    /\{([^}]+)\}/g,
    (_, reference) => resolveTokenValue(reference, tokens, resolved, [...stack, tokenPath]).value
  );
  resolved[tokenPath] = { ...token, value };
  return resolved[tokenPath];
}

export function applyTheme(tokens, theme) {
  const themed = cloneTokenMap(tokens);

  for (const [tokenPath, override] of Object.entries(theme.overrides)) {
    const original = themed[tokenPath];
    if (!original) {
      throw new Error(`themes/${theme.file}:${tokenPath} overrides an unknown token.`);
    }
    validateToken(tokenPath, override, path.join("themes", theme.file));
    if (original.type !== override.type) {
      throw new Error(
        `themes/${theme.file}:${tokenPath} changes type from ${original.type} to ${override.type}.`
      );
    }
    themed[tokenPath] = { ...override };
  }

  validateReferences(themed);
  resolveAllTokens(themed);
  return themed;
}

export function resolveTheme(tokens, theme, sources = {}) {
  const themed = applyTheme(tokens, theme);
  const resolved = resolveAllTokens(themed);

  if (theme.transform !== "achromatic") {
    return resolved;
  }

  const achromatic = {};
  for (const [tokenPath, token] of Object.entries(resolved)) {
    achromatic[tokenPath] =
      sources[tokenPath] === primitiveFile
        ? token
        : { ...token, value: transformValueToAchromatic(token.value) };
  }

  validateAchromaticTheme(achromatic, sources, theme);
  return achromatic;
}

export function transformValueToAchromatic(value) {
  return String(value)
    .replace(/#[\da-f]{6}|#[\da-f]{3}\b/gi, (color) => toGrayColor(color))
    .replace(
      /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(\s*,\s*[\d.]+)?\s*\)/gi,
      (_, r, g, b, alpha = "") => {
        const gray = Math.round(0.2126 * Number(r) + 0.7152 * Number(g) + 0.0722 * Number(b));
        return alpha ? `rgba(${gray}, ${gray}, ${gray}${alpha})` : `rgb(${gray}, ${gray}, ${gray})`;
      }
    );
}

function validateAchromaticTheme(tokens, sources, theme) {
  const violations = [];
  for (const [tokenPath, token] of Object.entries(tokens)) {
    if (sources[tokenPath] === primitiveFile) {
      continue;
    }
    for (const [, r, g, b] of String(token.value).matchAll(
      /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/gi
    )) {
      if (r !== g || g !== b) {
        violations.push(tokenPath);
      }
    }
  }
  if (violations.length) {
    throw new Error(
      `themes/${theme.file} is not fully achromatic: ${[...new Set(violations)].join(", ")}.`
    );
  }
}

export function renderCss(baseTokens, resolvedThemes) {
  const lines = [
    "/* Generated by scripts/build-tokens.mjs. Do not edit manually. */",
    "@layer tokens {",
    "  :root {",
    "    color-scheme: light;"
  ];

  for (const [tokenPath, token] of sortedEntries(baseTokens)) {
    lines.push(`    --kb-${toCssName(tokenPath)}: ${token.value};`);
  }
  lines.push("  }");

  for (const { theme, tokens } of resolvedThemes) {
    lines.push("");
    lines.push(`  ${theme.selector} {`);
    lines.push(`    color-scheme: ${theme.colorScheme};`);
    for (const [tokenPath, token] of sortedEntries(tokens)) {
      const differsFromAnotherTheme = resolvedThemes.some(
        ({ tokens: otherTokens }) => otherTokens[tokenPath]?.value !== token.value
      );
      if (baseTokens[tokenPath]?.value === token.value && !differsFromAnotherTheme) {
        continue;
      }
      lines.push(`    --kb-${toCssName(tokenPath)}: ${token.value};`);
    }
    lines.push("  }");
  }

  lines.push("}");
  lines.push("");
  return lines.join("\n");
}

function toGrayColor(hex) {
  const normalized =
    hex.length === 4
      ? hex
          .slice(1)
          .split("")
          .map((part) => part + part)
          .join("")
      : hex.slice(1);
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const gray = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const channel = gray.toString(16).padStart(2, "0");
  return `#${channel}${channel}${channel}`;
}

function getReferences(value) {
  return [...String(value).matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
}

function cloneTokenMap(tokens) {
  return Object.fromEntries(Object.entries(tokens).map(([key, token]) => [key, { ...token }]));
}

function sortedEntries(value) {
  return Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
}

function toCssName(tokenPath) {
  return tokenPath
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\./g, "-")
    .toLowerCase();
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isToken(value) {
  return isRecord(value) && (Object.hasOwn(value, "value") || Object.hasOwn(value, "type"));
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${relativePath(filePath)}: ${error instanceof Error ? error.message : error}`);
  }
}

function relativePath(filePath) {
  return path.relative(rootDir, filePath).replaceAll("\\", "/");
}

async function runCli() {
  const check = process.argv.includes("--check");
  try {
    const result = await buildTokens({ check });
    if (check) {
      console.log(`Design tokens are valid and up to date (${result.tokenCount} tokens).`);
    } else if (result.changed) {
      console.log(`Generated ${relativePath(outputPath)} (${result.tokenCount} tokens).`);
    } else {
      console.log(`Design tokens unchanged (${result.tokenCount} tokens).`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await runCli();
}
