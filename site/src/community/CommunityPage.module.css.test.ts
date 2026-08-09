import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(__dirname, "CommunityPage.module.css"), "utf8");

describe("community hero", () => {
  it("evens out the headline instead of orphaning its last word", () => {
    expect(css).toMatch(
      /\.hero h1\s*\{[^}]*text-wrap:\s*balance/s,
    );
  });
});
