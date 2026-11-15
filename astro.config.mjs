import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import { fileURLToPath } from "node:url";

const staticPreview = process.env.STATIC_PREVIEW === "true";
const isDevCommand = process.argv.includes("dev");
const projectTsconfig = fileURLToPath(new URL("./tsconfig.json", import.meta.url));

export default defineConfig({
  ...(staticPreview
    ? {}
    : {
        adapter: node({
          mode: "standalone"
        })
      }),
  base: process.env.PUBLIC_BASE_PATH ?? "/",
  site: process.env.PUBLIC_SITE_URL ?? "http://127.0.0.1:4321",
  output: staticPreview ? "static" : "server",
  trailingSlash: "always",
  vite: {
    // SALES_EMAIL is rendered into public contact links and must stay the
    // single configuration source for displayed and routed sales addresses.
    envPrefix: ["PUBLIC_", "SALES_EMAIL"],
    // The repository lives below O:/Dev, which contains another app's Vite
    // workspace config. Keep Astro's build scoped to this project.
    configFile: false,
    resolve: {
      tsconfigPaths: false
    },
    // Keep the native Vite transform from auto-discovering parent workspace
    // tsconfig references while compiling Astro's server entrypoints.
    oxc: {
      tsconfig: false,
      include: /\.(?:m?ts|[jt]sx)$/,
      ...(isDevCommand ? {} : { exclude: [/\.astro/] })
    },
    build: {
      rolldownOptions: {
        // Vite 8/Rolldown otherwise walks up into O:/Dev and picks up an
        // unrelated parent tsconfig reference that does not exist here.
        tsconfig: projectTsconfig,
        transform: {
          tsconfig: {
            compilerOptions: {
              target: "ESNext",
              module: "ESNext",
              jsx: "preserve"
            }
          }
        },
        resolve: {
          tsconfigFilename: projectTsconfig
        }
      },
      rollupOptions: {
        tsconfig: false,
        transform: {
          tsconfig: false
        },
        resolve: {
          tsconfigFilename: projectTsconfig
        }
      }
    }
  }
});
