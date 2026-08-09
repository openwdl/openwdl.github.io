import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(__dirname, "AboutPage.module.css"), "utf8");

describe("homepage workflow problem section", () => {
  it("reveals a high-contrast skip link on keyboard focus", () => {
    expect(css).toMatch(
      /\.skip:focus\s*\{(?=[^}]*position:\s*fixed)(?=[^}]*background:\s*var\(--accent\))(?=[^}]*color:\s*var\(--accent-contrast\))[^}]*\}/s,
    );
  });


  it("keeps concise timeline entries on one desktop line", () => {
    expect(css).toMatch(
      /\.timeline p\s*\{(?=[^}]*white-space:\s*nowrap)[^}]*\}/s,
    );
    expect(css).toMatch(
      /@media\s*\(max-width:\s*900px\)[\s\S]*?\.timeline p\s*\{[^}]*white-space:\s*normal/s,
    );
  });

  it("groups the WDL today actions inside the surface section", () => {
    expect(css).toMatch(
      /\.actions\s*\{(?=[^}]*margin-top:\s*2rem)(?=[^}]*padding:\s*0)[^}]*\}/s,
    );
  });

  it("gives below-hero sections more vertical breathing room", () => {
    expect(css).toMatch(
      /\.section,\s*\.approach,\s*\.timelineSection,\s*\.today\s*\{[^}]*padding-block:\s*clamp\(4rem,\s*8vw,\s*6rem\)/s,
    );
    expect(css).toMatch(
      /\.today\s*\{[^}]*padding:\s*clamp\(3rem,\s*6vw,\s*4rem\)/s,
    );
  });

  it("keeps homepage actions touch-sized and removes artificial mobile height", () => {
    expect(css).toMatch(/\.actions > \*\s*\{[^}]*min-height:\s*44px/s);
    expect(css).toMatch(
      /@media\s*\(max-width:\s*640px\)[\s\S]*?\.section,\s*\.approach,\s*\.timelineSection\s*\{[^}]*min-height:\s*auto/s,
    );
  });

  it("centers the main below-hero sections without including today or actions", () => {
    expect(css).toMatch(
      /\.section,\s*\.approach,\s*\.timelineSection\s*\{[^}]*min-height:\s*82svh[^}]*box-sizing:\s*border-box[^}]*display:\s*flex[^}]*flex-direction:\s*column[^}]*justify-content:\s*center/s,
    );
    expect(css).not.toMatch(/\.today\s*\{[^}]*min-height:\s*82svh/s);
    expect(css).not.toMatch(/\.actions\s*\{[^}]*min-height:\s*82svh/s);
  });

  it("uses quiet four-column cards with a thin accent edge", () => {
    expect(css).toMatch(
      /\.problemGrid\s*\{(?=[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\))(?=[^}]*gap:\s*1\.5rem)(?=[^}]*margin-top:\s*4rem)[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.problem\s*\{(?=[^}]*padding:\s*3rem\s+1\.5rem)(?=[^}]*border:\s*1px solid var\(--border\))(?=[^}]*background:\s*var\(--surface\))[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.problem\s*\{[^}]*border-top:\s*2px solid var\(--accent\)/s,
    );
  });

  it("centers technical diagrams above left-aligned problem copy", () => {
    expect(css).toMatch(
      /\.problemVisual\s*\{(?=[^}]*display:\s*grid)(?=[^}]*height:\s*3rem)(?=[^}]*place-items:\s*center)(?=[^}]*margin-bottom:\s*1\.5rem)[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.problemIllustration\s*\{(?=[^}]*display:\s*block)(?=[^}]*width:\s*4rem)(?=[^}]*height:\s*2\.75rem)(?=[^}]*color:\s*var\(--accent\))(?=[^}]*stroke-width:\s*1\.75)[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.problemIllustration \[stroke-dasharray\]\s*\{[^}]*stroke-linecap:\s*butt/s,
    );
    expect(css).toMatch(
      /\.problem h3\s*\{(?=[^}]*margin:\s*0\s+0\s+0\.5rem)(?=[^}]*text-align:\s*left)[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.problem p\s*\{(?=[^}]*margin:\s*0)(?=[^}]*text-align:\s*left)[^}]*\}/s,
    );
  });

  it("reduces the problem grid to two columns and then one", () => {
    expect(css).toMatch(
      /@media\s*\(max-width:\s*900px\)[\s\S]*?\.problemGrid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
    );
    expect(css).toMatch(
      /@media\s*\(max-width:\s*640px\)[\s\S]*?\.problemGrid\s*\{(?=[^}]*grid-template-columns:\s*1fr)(?=[^}]*row-gap:\s*1\.25rem)[^}]*\}/s,
    );
    expect(css).toMatch(
      /@media\s*\(max-width:\s*640px\)[\s\S]*?\.problem\s*\{[^}]*padding-block:\s*2\.25rem/s,
    );
  });

  it("uses an open page with an anchored lead beside equal principle rows", () => {
    expect(css).toMatch(
      /\.section,\s*\.approach,\s*\.timelineSection,\s*\.today\s*\{(?=[^}]*width:\s*min\(100%\s*-\s*2rem,\s*70rem\))(?=[^}]*margin-inline:\s*auto)[^}]*\}/s,
    );
    expect(css).not.toMatch(
      /\.approach\s*\{[^}]*(?:width:\s*auto|padding-inline:|background:\s*color-mix\()/s,
    );
    expect(css).toMatch(
      /\.approachLayout\s*\{(?=[^}]*display:\s*grid)(?=[^}]*grid-template-columns:\s*minmax\(0,\s*2fr\)\s+minmax\(0,\s*3fr\))(?=[^}]*gap:\s*clamp\(2rem,\s*5vw,\s*4rem\))[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.principles\s*\{(?=[^}]*display:\s*grid)(?=[^}]*align-content:\s*center)[^}]*\}/s,
    );
    expect(css).not.toMatch(/\.approachLead\s*\{[^}]*order:/s);
    expect(css).not.toMatch(/\.principles\s*\{[^}]*order:/s);
    expect(css).toMatch(
      /\.principleItem\s*\{(?=[^}]*padding-block:\s*1\.5rem)(?=[^}]*border-top:\s*1px solid var\(--border\))[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.principleItem::before\s*\{(?=[^}]*content:\s*attr\(data-principle\))(?=[^}]*border:\s*1px solid var\(--accent\))(?=[^}]*border-radius:\s*50%)[^}]*\}/s,
    );
    expect(css).not.toMatch(
      /\.principleItem h3\s*\{[^}]*border-left:/s,
    );
    expect(css).toMatch(
      /@media\s*\(max-width:\s*860px\)[\s\S]*?\.approachLayout\s*\{[^}]*grid-template-columns:\s*1fr/s,
    );
    expect(css).not.toMatch(/\.approachFlow\s*\{/);
    expect(css).not.toMatch(/\.principle\s*\{/);
  });
});
