import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function source(path: string) {
  return readFileSync(resolve(__dirname, path), "utf8");
}

describe("root deployment base", () => {
  it("defaults application and static tooling to /", () => {
    expect(source("../../vite.config.ts"))
      .toMatch(/process\.env\.OPENWDL_BASE\s*\?\?\s*"\/"/);
    expect(source("../../scripts/prerender.ts"))
      .toMatch(/process\.env\.OPENWDL_BASE\s*\?\?\s*"\/"/);
    expect(source("../../scripts/static-output.test.ts"))
      .toMatch(/process\.env\.OPENWDL_BASE\s*\?\?\s*"\/"/);
    expect(source("../../index.html"))
      .toContain('href="%BASE_URL%assets/favicon/icon.ico"');
  });

  it("publishes the site at the domain root without a bundled UI Storybook", () => {
    const workflow = source("../../../.github/workflows/deploy-pages.yml");
    expect(workflow).toContain(
      "OPENWDL_BASE=/ npm run build -w @openwdl/site",
    );
    expect(workflow).not.toContain("STORYBOOK_BASE");
    expect(workflow).not.toContain("build-storybook");
    expect(workflow).not.toContain("packages/ui");
  });

  it("uses the TypeScript Vite config even when generated files are present", () => {
    const packageJson = JSON.parse(source("../../package.json")) as {
      scripts: Record<string, string>;
    };

    for (const script of ["dev", "build:client", "build:ssr", "preview"]) {
      expect(packageJson.scripts[script]).toContain("--config vite.config.ts");
    }
  });
});
