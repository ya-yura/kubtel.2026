import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const tokenDir = path.join(rootDir, "src", "design", "tokens");
const outputPath = path.join(rootDir, "src", "styles", "tokens.css");
const checkMode = process.argv.includes("--check");

const tokenFiles = [
  "primitives.json",
  "semantic.json",
  "components.json",
  "business.json",
  path.join("themes", "light.json")
];

const legacyAliases = {
  "color-ink": "color.text.primary",
  "color-graphite": "color.surface.dark",
  "color-muted": "color.text.secondary",
  "color-subtle": "color.text.subtle",
  "color-line": "color.border.default",
  "color-line-strong": "color.border.strong",
  "color-surface": "color.surface.page",
  "color-surface-raised": "color.surface.raised",
  "color-soft": "color.surface.soft",
  "color-soft-warm": "color.surface.warm",
  "color-accent": "color.action.primary",
  "color-accent-hover": "color.action.primaryHover",
  "color-accent-active": "color.action.primaryActive",
  "color-accent-ink": "color.action.primaryText",
  "color-success": "color.status.success",
  "color-success-soft": "color.status.successSoft",
  "color-info": "color.status.info",
  "color-info-soft": "color.status.infoSoft",
  "color-danger": "color.status.danger",
  "color-danger-soft": "color.status.dangerSoft",
  "shadow-soft": "shadow.soft",
  "shadow-lift": "shadow.lift",
  "max-page": "layout.page.maxWidth",
  radius: "radius.md",
  "radius-sm": "radius.sm",
  "header-height": "layout.header.height"
};

const primitiveReferencePrefixes = [
  "color.neutral.",
  "color.orange.",
  "color.blue.",
  "color.green.",
  "color.red."
];

const rawTokenTree = {};

for (const file of tokenFiles) {
  mergeDeep(rawTokenTree, await readJson(path.join(tokenDir, file)));
}

applyThemeOverrides(rawTokenTree);
validateComponentReferences(rawTokenTree);
await validateNoRawHexStyles();

const flatTokens = flattenTokens(rawTokenTree);
const resolvedTokens = resolveAllTokens(flatTokens);
const prettierConfig = (await prettier.resolveConfig(outputPath)) ?? {};
const css = await prettier.format(renderCss(resolvedTokens), {
  ...prettierConfig,
  parser: "css"
});

if (checkMode) {
  let existing = "";

  try {
    existing = await readFile(outputPath, "utf8");
  } catch {
    fail(`Generated token file is missing: ${path.relative(rootDir, outputPath)}`);
  }

  if (existing !== css) {
    fail("src/styles/tokens.css is out of date. Run npm run tokens:build.");
  }

  console.log("Design tokens are up to date.");
} else {
  await writeFile(outputPath, css);
  console.log(`Generated ${path.relative(rootDir, outputPath)}`);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function mergeDeep(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (isRecord(value) && isRecord(target[key]) && !isToken(value)) {
      mergeDeep(target[key], value);
      continue;
    }

    target[key] = value;
  }
}

function applyThemeOverrides(tree) {
  const overrides = tree.theme?.overrides;

  if (!isRecord(overrides)) {
    return;
  }

  for (const [tokenPath, token] of Object.entries(overrides)) {
    setByPath(tree, tokenPath, token);
  }

  delete tree.theme.overrides;
}

function validateComponentReferences(tree) {
  const tokens = flattenTokens(tree);

  for (const [tokenPath, token] of Object.entries(tokens)) {
    if (!tokenPath.startsWith("component.") && !tokenPath.startsWith("business.")) {
      continue;
    }

    const references = [...String(token.value).matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
    const primitiveReference = references.find((reference) =>
      primitiveReferencePrefixes.some((prefix) => reference.startsWith(prefix))
    );

    if (primitiveReference) {
      fail(
        `${tokenPath} references primitive token ${primitiveReference}. Use semantic tokens in component/business tokens.`
      );
    }
  }
}

function flattenTokens(tree, prefix = []) {
  const tokens = {};

  for (const [key, value] of Object.entries(tree)) {
    const nextPath = [...prefix, key];

    if (isToken(value)) {
      tokens[nextPath.join(".")] = value;
      continue;
    }

    if (isRecord(value)) {
      Object.assign(tokens, flattenTokens(value, nextPath));
    }
  }

  return tokens;
}

function resolveAllTokens(tokens) {
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
    fail(`Unknown token reference: ${tokenPath}`);
  }

  if (stack.includes(tokenPath)) {
    fail(`Circular token reference: ${[...stack, tokenPath].join(" -> ")}`);
  }

  const value = String(token.value).replace(
    /\{([^}]+)\}/g,
    (_, reference) => resolveTokenValue(reference, tokens, resolved, [...stack, tokenPath]).value
  );

  resolved[tokenPath] = {
    ...token,
    value
  };

  return resolved[tokenPath];
}

function renderCss(tokens) {
  const lines = [
    "/* Generated by scripts/build-tokens.mjs. Do not edit manually. */",
    "@layer tokens {",
    "  :root {"
  ];

  for (const [tokenPath, token] of Object.entries(tokens).sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    if (tokenPath.startsWith("theme.")) {
      continue;
    }

    lines.push(`    --kb-${toCssName(tokenPath)}: ${token.value};`);
  }

  lines.push("");
  lines.push("    /* Temporary legacy aliases for incremental migration. */");

  for (const [alias, tokenPath] of Object.entries(legacyAliases)) {
    lines.push(`    --${alias}: var(--kb-${toCssName(tokenPath)});`);
  }

  lines.push("  }");
  lines.push("}");
  lines.push("");

  return `${lines.join("\n")}`;
}

async function validateNoRawHexStyles() {
  const styleFiles = await collectStyleFiles(path.join(rootDir, "src"));
  const violations = [];

  for (const filePath of styleFiles) {
    if (path.resolve(filePath) === path.resolve(outputPath)) {
      continue;
    }

    const source = await readFile(filePath, "utf8");
    const lines = source.split(/\r?\n/);

    lines.forEach((line, index) => {
      const matches = line.match(/#[0-9a-fA-F]{3,8}\b/g);

      if (matches) {
        violations.push(
          `${path.relative(rootDir, filePath)}:${index + 1} uses raw color ${matches.join(", ")}`
        );
      }
    });
  }

  if (violations.length > 0) {
    fail(
      [
        "Raw hex colors are not allowed in source styles. Use design tokens instead.",
        ...violations
      ].join("\n")
    );
  }
}

async function collectStyleFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectStyleFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && /\.(astro|css)$/.test(entry.name)) {
      const fileStat = await stat(entryPath);

      if (fileStat.size > 0) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

function setByPath(tree, tokenPath, value) {
  const parts = tokenPath.split(".");
  let target = tree;

  for (const part of parts.slice(0, -1)) {
    target[part] ??= {};
    target = target[part];
  }

  target[parts.at(-1)] = value;
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
  return isRecord(value) && Object.hasOwn(value, "value");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
