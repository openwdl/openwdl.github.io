import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function stylesheet(path: string) {
  return readFileSync(resolve(__dirname, path), "utf8");
}

describe("site navigation chrome contrast", () => {
  it("uses structural borders on the desktop sidebars", () => {
    const docsNav = stylesheet("../docs/DocsNav.module.css");
    const chapterNav = stylesheet("../components/ChapterNav.module.css");

    expect(docsNav).toMatch(
      /\.nav\s*\{[^}]*border-right:\s*1px solid var\(--chrome-border\)/s,
    );
    expect(chapterNav).toMatch(
      /\.nav\s*\{[^}]*border-right:\s*1px solid var\(--chrome-border\)/s,
    );
  });
});
