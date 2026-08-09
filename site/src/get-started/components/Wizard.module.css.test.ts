import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(__dirname, "Wizard.module.css"), "utf8");

describe("wizard options", () => {
  it("keeps the option boxes tightly stacked", () => {
    expect(css).toMatch(/\.options\s*\{[^}]*gap:\s*0\.375rem/s);
  });

  it("draws the box on the label so the description sits inside it", () => {
    expect(css).toMatch(/\.optionLabel\s*\{[^}]*border:\s*1px solid var\(--border\)/s);
    expect(css).not.toMatch(/\.optionDescription\s*\{[^}]*padding-inline-start/s);
  });

  it("marks the selected option's box", () => {
    expect(css).toMatch(
      /\.optionLabel:has\(\.optionRadio:checked\)\s*\{[^}]*border-color:\s*var\(--accent\)/s,
    );
  });
});
