// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  external: [
    "@playwright/test",
    "playwright",
    "playwright-core",
    "chromium-bidi",
  ],
});
