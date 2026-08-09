import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function stylesheet(path: string) {
  return readFileSync(resolve(__dirname, path), "utf8");
}

describe("site navigation chrome contrast", () => {
  it("uses a structural border on the desktop docs sidebar", () => {
    expect(stylesheet("../docs/DocsNav.module.css")).toMatch(
      /\.nav\s*\{[^}]*border-right:\s*1px solid var\(--chrome-border\)/s,
    );
  });
});
