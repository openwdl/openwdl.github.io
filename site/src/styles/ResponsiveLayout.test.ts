import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function stylesheet(path: string) {
  return readFileSync(resolve(__dirname, path), "utf8");
}

describe("responsive specimen grids", () => {
  it("allows logo and asset cards to shrink without widening the page", () => {
    expect(stylesheet("../sections/LogoConstruction.module.css"))
      .toMatch(/grid-template-columns:\s*minmax\(0,\s*0\.75fr\)\s+minmax\(0,\s*1\.25fr\)/);
    expect(stylesheet("../sections/LogoColor.module.css"))
      .toMatch(/repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
    expect(stylesheet("../sections/Downloads.module.css"))
      .toMatch(/repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  });

  it("gives logo treatments breathing room and keeps large type labels intact", () => {
    expect(stylesheet("../sections/LogoColor.module.css"))
      .toMatch(/\.swatch\s*\{[^}]*padding-inline:\s*1rem/s);
    expect(stylesheet("../components/TypeRow.module.css"))
      .toMatch(/grid-template-columns:\s*minmax\(18rem,\s*2\.5fr\)/);
    expect(stylesheet("../components/TypeRow.module.css"))
      .toMatch(/\.sample\s*\{[^}]*white-space:\s*nowrap/s);
  });

  it("aligns asset previews, names, and actions with room around full logos", () => {
    const downloads = stylesheet("../sections/Downloads.module.css");

    expect(downloads)
      .toMatch(/\.card\s*\{[^}]*grid-template-rows:\s*6\.5rem\s+minmax\(2\.5rem,\s*auto\)\s+auto/s);
    expect(downloads)
      .toMatch(/\.preview\s*\{[^}]*padding-inline:\s*1rem/s);
  });
});

describe("site layout tokens", () => {
  it("keeps the site max width in rem units", () => {
    const siteTokens = stylesheet("./tokens.css");

    expect(siteTokens).toMatch(/--maxw:\s*75rem/);
    expect(siteTokens).not.toMatch(/--maxw:\s*1200px/);
  });
});
