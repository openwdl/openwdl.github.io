import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("brand chapter motion", () => {
  const css = readFileSync(resolve(__dirname, "App.module.css"), "utf8");

  it("uses a one-way revealed state and removes transitions for reduced motion", () => {
    expect(css).toMatch(/\.chapters\s*>\s*section[\s\S]*transition:/);
    expect(css).toMatch(/\[data-revealed="true"\]/);
    expect(css).toMatch(/translateY\(8px\)/);
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    expect(css).toMatch(/transition:\s*none/);
  });

  it("collapses the chapter rail before tablet specimen grids overflow", () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*1100px\)/);
    expect(css).toMatch(/grid-template-columns:\s*1fr/);
  });
});
