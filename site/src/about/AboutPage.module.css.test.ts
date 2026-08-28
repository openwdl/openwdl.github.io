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

  it("gives the WDL today actions a clear desktop hierarchy", () => {
    expect(css).toMatch(
      /\.today\s*\{(?=[^}]*display:\s*grid)(?=[^}]*grid-template-columns:\s*minmax\(0,\s*3fr\)\s+minmax\(16rem,\s*1fr\))(?=[^}]*background:\s*var\(--surface\))[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.actions\s*\{(?=[^}]*grid-column:\s*2)(?=[^}]*grid-row:\s*1\s*\/\s*span\s*3)(?=[^}]*flex-direction:\s*column)(?=[^}]*margin-top:\s*0)[^}]*\}/s,
    );
    expect(css).toMatch(
      /@media\s*\(max-width:\s*900px\)[\s\S]*?\.actions\s*\{(?=[^}]*grid-column:\s*1)(?=[^}]*grid-row:\s*auto)(?=[^}]*margin-top:\s*2rem)[^}]*\}/s,
    );
  });

  it("gives below-hero sections more vertical breathing room", () => {
    expect(css).toMatch(
      /\.section,\s*\.approach,\s*\.timelineSection,\s*\.today\s*\{[^}]*padding-block:\s*clamp\(5rem,\s*8vw,\s*7\.5rem\)/s,
    );
    expect(css).toMatch(
      /\.today\s*\{[^}]*padding:\s*clamp\(3rem,\s*6vw,\s*4\.5rem\)/s,
    );
  });

  it("keeps homepage actions touch-sized without artificial viewport height", () => {
    expect(css).toMatch(/\.actions > \*\s*\{[^}]*min-height:\s*44px/s);
    expect(css).not.toMatch(/min-height:\s*82svh/);
  });

  it("uses a consistent wide measure and restrained intro width", () => {
    expect(css).toMatch(
      /\.section,\s*\.approach,\s*\.timelineSection,\s*\.today\s*\{(?=[^}]*width:\s*min\(100%\s*-\s*3rem,\s*var\(--maxw\)\))(?=[^}]*margin-inline:\s*auto)[^}]*\}/s,
    );
    expect(css).toMatch(/\.sectionIntro\s*\{[^}]*max-width:\s*52rem/s);
  });

  it("uses an editorial two-column problem register", () => {
    expect(css).toMatch(
      /\.problemGrid\s*\{(?=[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\))(?=[^}]*gap:\s*0)(?=[^}]*border-block:\s*1px solid var\(--border\))[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.problem\s*\{(?=[^}]*display:\s*grid)(?=[^}]*grid-template-columns:\s*4\.75rem\s+minmax\(0,\s*1fr\))(?=[^}]*column-gap:\s*1\.25rem)[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.problem:nth-child\(odd\)\s*\{[^}]*border-right:\s*1px solid var\(--border\)/s,
    );
    expect(css).not.toMatch(/\.problem\s*\{[^}]*(?:background|border-top):/s);
  });

  it("places technical diagrams beside left-aligned problem copy", () => {
    expect(css).toMatch(
      /\.problemVisual\s*\{(?=[^}]*grid-area:\s*visual)(?=[^}]*width:\s*4\.75rem)(?=[^}]*height:\s*4\.75rem)(?=[^}]*place-items:\s*center)(?=[^}]*background:\s*var\(--surface\))[^}]*\}/s,
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

  it("reduces the problem register to one column on small screens", () => {
    expect(css).toMatch(
      /@media\s*\(max-width:\s*640px\)[\s\S]*?\.problemGrid\s*\{[^}]*grid-template-columns:\s*1fr[^}]*\}/s,
    );
    expect(css).toMatch(
      /@media\s*\(max-width:\s*640px\)[\s\S]*?\.problem\s*\{[^}]*padding:\s*2rem\s+0/s,
    );
    expect(css).toMatch(
      /@media\s*\(max-width:\s*640px\)[\s\S]*?\.problem:nth-child\(odd\)\s*\{[^}]*border-right:\s*0/s,
    );
  });

  it("uses an open page with an anchored lead beside equal principle rows", () => {
    expect(css).toMatch(
      /\.approachLayout\s*\{(?=[^}]*display:\s*grid)(?=[^}]*grid-template-columns:\s*minmax\(0,\s*2fr\)\s+minmax\(0,\s*3fr\))(?=[^}]*gap:\s*clamp\(2rem,\s*5vw,\s*4rem\))(?=[^}]*align-items:\s*center)[^}]*\}/s,
    );
    expect(css).not.toMatch(
      /\.approach\s*\{[^}]*(?:width:\s*auto|padding-inline:|background:\s*color-mix\()/s,
    );
    expect(css).toMatch(
      /\.principles\s*\{(?=[^}]*display:\s*grid)(?=[^}]*align-content:\s*center)[^}]*\}/s,
    );
    expect(css).not.toMatch(/\.approachLead\s*\{[^}]*order:/s);
    expect(css).not.toMatch(/\.principles\s*\{[^}]*order:/s);
    expect(css).toMatch(
      /\.principleItem\s*\{(?=[^}]*padding-block:\s*1\.75rem)(?=[^}]*border-top:\s*1px solid var\(--border\))[^}]*\}/s,
    );
    expect(css).not.toMatch(/\.principleItem::before\s*\{/);
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
