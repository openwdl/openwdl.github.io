/**
 * Vitest configuration for the static-output tests.
 *
 * These tests read from site/dist and must be run AFTER a build.  They are
 * excluded from the default `vitest run` suite (see vite.config.ts) so the
 * default suite stays fast and clean with no dist.  Use the `test:static`
 * npm script (or a direct `vitest run --config vitest.static.config.ts`)
 * to invoke them explicitly after a build.
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["scripts/static-output.test.ts"],
  },
});
