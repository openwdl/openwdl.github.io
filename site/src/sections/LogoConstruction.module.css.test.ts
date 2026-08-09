import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(__dirname, "LogoConstruction.module.css"), "utf8");

describe("logo construction spacing", () => {
  it("separates usage guidance from its context pills", () => {
    expect(css).toMatch(/\.uses\s*\{[^}]*margin-top:\s*1\.25rem/s);
  });

  it("uses the signal-dot treatment for context pills", () => {
    expect(css).toMatch(/\.uses li::before\s*\{[^}]*border-radius:\s*50%/s);
    expect(css).toMatch(/\.uses li::before\s*\{[^}]*background:\s*currentColor/s);
  });
});
