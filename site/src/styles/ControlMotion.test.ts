import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function stylesheet(path: string) {
  return readFileSync(resolve(__dirname, path), "utf8");
}

describe("site action control motion", () => {
  it("applies the motion profile to site actions", () => {
    for (const path of [
      "../sections/Hero.module.css",
      "../sections/Downloads.module.css",
      "../sections/DesignSystem.module.css",
      "../components/LogoPreview.module.css",
      "../components/ChapterNav.module.css",
      "../docs/DocsDisclosure.module.css",
      "../docs/DocsSearch.module.css",
      "../about/AboutPage.module.css",
      "../not-found/NotFoundPage.module.css",
      "../get-started/components/Wizard.module.css",
    ]) {
      expect(stylesheet(path)).toContain("var(--motion-control-duration)");
      expect(stylesheet(path)).toContain("var(--motion-control-ease)");
    }
  });
});
