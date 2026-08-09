import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";

const base = process.env.OPENWDL_BASE ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    exclude: [...configDefaults.exclude, "scripts/static-output.test.ts"],
  },
});
