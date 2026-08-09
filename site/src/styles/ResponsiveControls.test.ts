import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function stylesheet(path: string) {
  return readFileSync(resolve(__dirname, path), "utf8");
}

describe("mobile brand controls", () => {
  it("keeps tester, copy, and download actions at least 44px high", () => {
    expect(stylesheet("../components/LogoPreview.module.css"))
      .toMatch(/@media\s*\(max-width:\s*768px\)[\s\S]*\.presets button[\s\S]*min-height:\s*44px/);
    expect(stylesheet("../components/TypeRow.module.css"))
      .toMatch(/@media\s*\(max-width:\s*768px\)[\s\S]*\.row button[\s\S]*min-height:\s*44px/);
    expect(stylesheet("../sections/Downloads.module.css"))
      .toMatch(/@media\s*\(max-width:\s*768px\)[\s\S]*\.actions a[\s\S]*min-height:\s*44px/);
  });
});
