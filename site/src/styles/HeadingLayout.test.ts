import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function stylesheet(path: string) {
  return readFileSync(resolve(__dirname, path), "utf8");
}

describe("editorial heading layout", () => {
  it("keeps the two hero lines intact and removes the chapter-title width cap", () => {
    expect(stylesheet("../sections/Hero.module.css"))
      .toMatch(/\.hero h1 span\s*\{[^}]*display:\s*block[^}]*white-space:\s*nowrap/s);
    expect(stylesheet("../components/ChapterHeader.module.css"))
      .toMatch(/\.header h2\s*\{[^}]*max-width:\s*none/s);
    expect(stylesheet("../components/ChapterHeader.module.css"))
      .toMatch(/\.header h2\s*\{[^}]*font-size:\s*clamp\(1\.75rem,\s*3\.5vw,\s*2\.125rem\)/s);
  });
});
