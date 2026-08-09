import { readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import { tokens } from "@openwdl/ui";

const SRC = resolve(__dirname, "..");
const KIT_THEME = resolve(SRC, "../node_modules/@openwdl/ui/dist/theme.css");

function stylesheet(path: string) {
  return readFileSync(resolve(__dirname, path), "utf8");
}

/** Every stylesheet the site owns, recursively under `src/`. */
function siteStylesheets(dir = SRC): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) return siteStylesheets(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });
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

describe("site token ownership", () => {
  it("takes the page width from the kit theme, in rem units", () => {
    expect(tokens.layout.maxw).toBe("75rem");
  });

  it("re-declares no kit-owned custom property in an unscoped :root block", () => {
    const kitOwned = new Set(
      [...readFileSync(KIT_THEME, "utf8").matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
    );
    // The dot grid is the sharp edge: site CSS loads after theme.css, so a bare
    // `:root { --dot-color }` wins on source order at equal specificity and
    // silently clobbers the light theme's dot color with the dark one.
    expect([...kitOwned]).toContain("--dot-color");

    const clobbered: string[] = [];
    for (const file of siteStylesheets()) {
      const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      for (const [, body] of css.matchAll(/:root\s*\{([^}]*)\}/g)) {
        for (const [, prop] of body.matchAll(/(--[a-z0-9-]+)\s*:/g)) {
          if (kitOwned.has(prop)) clobbered.push(`${relative(SRC, file)} ${prop}`);
        }
      }
    }

    expect(clobbered).toEqual([]);
  });
});
