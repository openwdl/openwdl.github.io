import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(__dirname, "Grid.module.css"), "utf8");

describe("grid specimen alignment", () => {
  it("uses equal preview and metadata rows across all density cards", () => {
    expect(css).toMatch(/\.card\s*\{[^}]*grid-template-rows:\s*12rem\s+1fr/s);
    expect(css).toMatch(/\.preview\s*\{[^}]*width:\s*100%[^}]*height:\s*100%/s);
  });
});
