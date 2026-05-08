import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

function resolvePath(path: string): string {
  return fileURLToPath(new URL(path, import.meta.url));
}

export default defineConfig({
  resolve: {
    alias: {
      "@components": resolvePath("./src/components"),
      "@config": resolvePath("./src/config"),
      "@content": resolvePath("./src/content"),
      "@layouts": resolvePath("./src/layouts"),
      "@lib": resolvePath("./src/lib"),
      "@models": resolvePath("./src/types"),
      "@styles": resolvePath("./src/styles")
    }
  },
  test: {
    environment: "node"
  }
});
