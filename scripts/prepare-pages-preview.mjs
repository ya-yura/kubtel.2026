import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const prerenderFiles = [
  "src/pages/index.astro",
  "src/pages/connect.astro",
  "src/pages/tariffs/index.astro",
  "src/pages/business/request.astro",
  "src/pages/api/health.json.ts"
];

if (process.env.PUBLIC_STATIC_PREVIEW !== "true") {
  throw new Error("PUBLIC_STATIC_PREVIEW must be true before preparing the Pages preview build.");
}

const originals = new Map();

try {
  for (const file of prerenderFiles) {
    const source = await readFile(file, "utf8");
    const nextSource = source.replace(
      "export const prerender = false;",
      "export const prerender = true;"
    );

    if (source === nextSource) {
      throw new Error(`Could not enable prerender in ${file}`);
    }

    originals.set(file, source);
    await writeFile(file, nextSource);
  }

  console.log("Static GitHub Pages preview mode enabled.");
  await run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"]);
} finally {
  await Promise.all([...originals.entries()].map(([file, source]) => writeFile(file, source)));
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}
