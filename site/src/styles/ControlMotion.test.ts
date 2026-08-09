import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function stylesheet(path: string) {
  return readFileSync(resolve(__dirname, path), "utf8");
}

describe("site action control motion", () => {
  it("applies the motion profile to the remaining hand-rolled actions", () => {
    const css = stylesheet("../docs/DocsSearch.module.css");

    expect(css).toContain("var(--motion-control-duration)");
    expect(css).toContain("var(--motion-control-ease)");
  });

  it("leaves action motion to the kit Button where actions were migrated", () => {
    for (const path of [
      "../about/AboutPage.module.css",
      "../not-found/NotFoundPage.module.css",
    ]) {
      expect(stylesheet(path)).not.toContain("--motion-control-");
    }
  });
});
