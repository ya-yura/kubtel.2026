import { defineConfig } from "astro/config";
import node from "@astrojs/node";

const staticPreview = process.env.STATIC_PREVIEW === "true";

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
  output: "static",
  trailingSlash: "always"
});
