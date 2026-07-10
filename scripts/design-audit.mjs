import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const sourceExtensions = new Set([".astro", ".css", ".ts"]);
const generatedFiles = new Set([normalizePath(path.join(rootDir, "src", "styles", "tokens.css"))]);
const skippedDirectories = new Set([".astro", "dist", "node_modules"]);

const legacyVariablePattern =
  /--(?:color-(?:ink|graphite|muted|subtle|line|line-strong|surface|surface-raised|soft|soft-warm|accent|success|info|danger)|max-page|radius\b|radius-sm\b|header-height|business-(?:neon|blue|panel|panel-strong|line|muted|text|accent))/;
const rawColorPattern = /#[\da-f]{3,8}\b|(?:rgba?|hsla?)\([^)]*\)/gi;
const rawDurationPattern = /\b\d*\.?\d+(?:ms|s)\b/i;
const rawEasingPattern = /\b(?:ease|ease-in|ease-out|ease-in-out|linear)\b|cubic-bezier\(/i;
const primitiveUsagePattern =
  /var\(--kb-(?:color-(?:neutral|pink|blue|green|red|alpha|business)|spacing|radius|shadow|font-size|font-family|font-weight|line-height|letter-spacing|z-)/;

export async function runDesignAudit() {
  const files = await collectSourceFiles(path.join(rootDir, "src"));
  const tokensCss = await readFile(path.join(rootDir, "src", "styles", "tokens.css"), "utf8");
  const definedKbVariables = new Set(
    [...tokensCss.matchAll(/(--kb-[\w-]+)\s*:/g)].map((match) => match[1])
  );
  const allowedMediaValues = await getAllowedMediaValues();

  const report = {
    errors: [],
    warnings: [],
    counts: {
      scannedFiles: files.length,
      approvedColorExceptions: 0,
      staticColorViolations: 0,
      legacyVariables: 0,
      unknownKbVariables: 0,
      rawMotion: 0,
      rawRadius: 0,
      rawShadow: 0,
      rawZIndex: 0,
      mediaBreakpointViolations: 0,
      primitiveUsageWarnings: 0
    }
  };

  for (const filePath of files) {
    const source = await readFile(filePath, "utf8");
    const relPath = relativePath(filePath);
    scanLines(source, relPath, report);
    scanDeclarations(source, relPath, report);
    scanVariables(source, relPath, definedKbVariables, report);
    scanMedia(source, relPath, allowedMediaValues, report);
  }

  return report;
}

export function formatAuditReport(report) {
  const lines = [
    report.errors.length ? "Design audit failed" : "Design audit passed",
    `Scanned files: ${report.counts.scannedFiles}`,
    `Static raw color violations: ${report.counts.staticColorViolations}`,
    `Approved color exceptions: ${report.counts.approvedColorExceptions}`,
    `Legacy variable hits: ${report.counts.legacyVariables}`,
    `Unknown --kb-* variables: ${report.counts.unknownKbVariables}`,
    `Raw motion declarations: ${report.counts.rawMotion}`,
    `Raw radius declarations: ${report.counts.rawRadius}`,
    `Raw shadow declarations: ${report.counts.rawShadow}`,
    `Raw z-index declarations: ${report.counts.rawZIndex}`,
    `Media breakpoint violations: ${report.counts.mediaBreakpointViolations}`,
    `Primitive usage warnings: ${report.counts.primitiveUsageWarnings}`
  ];

  if (report.errors.length) {
    lines.push("", "Errors:");
    lines.push(...report.errors.slice(0, 60).map((item) => `- ${item}`));
    if (report.errors.length > 60) {
      lines.push(`- ...and ${report.errors.length - 60} more`);
    }
  }

  if (report.warnings.length) {
    lines.push("", "Warnings:");
    lines.push(...report.warnings.slice(0, 30).map((item) => `- ${item}`));
    if (report.warnings.length > 30) {
      lines.push(`- ...and ${report.warnings.length - 30} more`);
    }
  }

  return lines.join("\n");
}

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!skippedDirectories.has(entry.name)) {
        files.push(...(await collectSourceFiles(entryPath)));
      }
      continue;
    }

    if (!sourceExtensions.has(path.extname(entry.name))) {
      continue;
    }
    if (generatedFiles.has(normalizePath(entryPath))) {
      continue;
    }

    files.push(entryPath);
  }

  return files;
}

function scanLines(source, relPath, report) {
  const lines = source.split(/\r?\n/);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (legacyVariablePattern.test(line)) {
      report.counts.legacyVariables += 1;
      report.errors.push(`${relPath}:${lineNumber} legacy variable: ${line.trim()}`);
    }

    const colorMatches = [...line.matchAll(rawColorPattern)];
    for (const match of colorMatches) {
      if (isApprovedColorException(relPath, line, match[0])) {
        report.counts.approvedColorExceptions += 1;
        continue;
      }

      report.counts.staticColorViolations += 1;
      report.errors.push(`${relPath}:${lineNumber} raw color ${match[0]}: ${line.trim()}`);
    }

    if (
      isStyleSource(relPath) &&
      primitiveUsagePattern.test(line) &&
      relPath !== "src/pages/design-system.astro"
    ) {
      report.counts.primitiveUsageWarnings += 1;
      report.warnings.push(`${relPath}:${lineNumber} direct primitive token: ${line.trim()}`);
    }

    if (
      isStyleSource(relPath) &&
      /(transition|animation)(?:-[\w-]+)?\s*:/.test(line) &&
      (rawDurationPattern.test(line) || rawEasingPattern.test(line))
    ) {
      report.counts.rawMotion += 1;
      report.errors.push(`${relPath}:${lineNumber} raw motion value: ${line.trim()}`);
    }
  });
}

function scanDeclarations(source, relPath, report) {
  if (!isStyleSource(relPath)) {
    return;
  }

  for (const declaration of collectDeclarations(source, "box-shadow")) {
    if (!isTokenizedShadow(declaration.value)) {
      report.counts.rawShadow += 1;
      report.errors.push(`${relPath}:${declaration.line} raw box-shadow: ${declaration.value}`);
    }
  }

  for (const declaration of collectDeclarations(source, "border-radius")) {
    if (!isTokenizedRadius(declaration.value)) {
      report.counts.rawRadius += 1;
      report.errors.push(`${relPath}:${declaration.line} raw border-radius: ${declaration.value}`);
    }
  }

  for (const declaration of collectDeclarations(source, "z-index")) {
    if (!/^(?:var\(--kb-[\w-]+\)|auto|0)$/.test(cleanCssValue(declaration.value))) {
      report.counts.rawZIndex += 1;
      report.errors.push(`${relPath}:${declaration.line} raw z-index: ${declaration.value}`);
    }
  }
}

function scanVariables(source, relPath, definedKbVariables, report) {
  for (const match of source.matchAll(/var\((--kb-[\w-]+)/g)) {
    if (!definedKbVariables.has(match[1])) {
      const line = getLineNumber(source, match.index ?? 0);
      report.counts.unknownKbVariables += 1;
      report.errors.push(`${relPath}:${line} unknown token variable ${match[1]}`);
    }
  }
}

function scanMedia(source, relPath, allowedMediaValues, report) {
  if (!isStyleSource(relPath)) {
    return;
  }

  for (const match of source.matchAll(/@media[^{]+/g)) {
    const media = match[0];
    for (const valueMatch of media.matchAll(/\b\d+px\b/g)) {
      const value = valueMatch[0];
      if (!allowedMediaValues.has(value)) {
        const line = getLineNumber(source, match.index ?? 0);
        report.counts.mediaBreakpointViolations += 1;
        report.errors.push(`${relPath}:${line} media breakpoint ${value} is not in tokens`);
      }
    }
  }
}

function collectDeclarations(source, property) {
  const declarations = [];
  const pattern = new RegExp(`${property}\\s*:\\s*([^;]+);`, "gi");

  for (const match of source.matchAll(pattern)) {
    declarations.push({
      value: match[1].replace(/\s+/g, " ").trim(),
      line: getLineNumber(source, match.index ?? 0)
    });
  }

  return declarations;
}

async function getAllowedMediaValues() {
  const primitives = JSON.parse(
    await readFile(path.join(rootDir, "src", "design", "tokens", "primitives.json"), "utf8")
  );
  const values = new Set();

  for (const token of Object.values(primitives.breakpoint ?? {})) {
    if (typeof token?.value !== "string" || !token.value.endsWith("px")) {
      continue;
    }

    values.add(token.value);
    const numericValue = Number.parseInt(token.value, 10);
    if (Number.isFinite(numericValue) && numericValue > 1) {
      values.add(`${numericValue - 1}px`);
    }
  }

  return values;
}

function isApprovedColorException(relPath, line, color) {
  if (/rgb\(\s*var\(--route-accent\)/i.test(line)) {
    return true;
  }

  if (
    relPath === "src/config/site.ts" &&
    /themeColor:\s*"/.test(line) &&
    /^#[\da-f]{6}$/i.test(color)
  ) {
    return true;
  }

  return false;
}

function isStyleSource(relPath) {
  return relPath.endsWith(".css") || relPath.endsWith(".astro");
}

function isTokenizedShadow(value) {
  const clean = cleanCssValue(value);
  return clean === "none" || clean.split(",").every((part) => part.trim().startsWith("var(--kb-"));
}

function isTokenizedRadius(value) {
  return cleanCssValue(value)
    .split(/\s+/)
    .every((part) => part === "0" || part === "50%" || /^var\(--kb-[\w-]+\)$/.test(part));
}

function cleanCssValue(value) {
  return value.replace(/\s*!important\s*/g, "").trim();
}

function getLineNumber(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function relativePath(filePath) {
  return path.relative(rootDir, filePath).replaceAll("\\", "/");
}

function normalizePath(filePath) {
  return path.resolve(filePath).replaceAll("\\", "/").toLowerCase();
}

async function runCli() {
  const report = await runDesignAudit();
  console.log(formatAuditReport(report));
  if (report.errors.length) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await runCli();
}
