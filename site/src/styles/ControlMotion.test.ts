import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function stylesheet(path: string) {
  return readFileSync(resolve(__dirname, path), "utf8");
}

describe("site action control motion", () => {
  it("applies the motion profile to the remaining hand-rolled actions", () => {
    for (const path of [
      "../sections/Downloads.module.css",
      "../sections/DesignSystem.module.css",
      "../components/LogoPreview.module.css",
      "../docs/DocsSearch.module.css",
    ]) {
      expect(stylesheet(path)).toContain("var(--motion-control-duration)");
      expect(stylesheet(path)).toContain("var(--motion-control-ease)");
    }
  });

  it("leaves action motion to the kit Button where actions were migrated", () => {
    for (const path of [
      "../sections/Hero.module.css",
      "../about/AboutPage.module.css",
      "../not-found/NotFoundPage.module.css",
      "../get-started/components/Wizard.module.css",
    ]) {
      expect(stylesheet(path)).not.toContain("--motion-control-");
    }
  });
});
