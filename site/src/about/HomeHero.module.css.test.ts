import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(__dirname, "HomeHero.module.css"), "utf8");

describe("homepage hero specimen layout", () => {
  it("centers the opening group in the viewport below the navbar", () => {
    expect(css).toMatch(
      /\.hero\s*\{(?=[^}]*display:\s*flex)(?=[^}]*flex-direction:\s*column)(?=[^}]*justify-content:\s*center)(?=[^}]*min-height:\s*calc\(100svh\s*-\s*var\(--nav-h\)\))[^}]*\}/s,
    );
  });

  it("provides legacy viewport and WebKit mask fallbacks", () => {
    expect(css).toMatch(
      /\.hero\s*\{(?=[^}]*min-height:\s*calc\(100vh\s*-\s*var\(--nav-h\)\))(?=[^}]*min-height:\s*calc\(100svh\s*-\s*var\(--nav-h\)\))[^}]*\}/s,
    );
    expect(css).toMatch(/-webkit-mask-image:\s*linear-gradient/s);
  });

  it("centers the introduction at a generous display measure", () => {
    expect(css).toMatch(
      /\.hero\s*\{(?=[^}]*max-width:\s*var\(--maxw\))(?=[^}]*margin-inline:\s*auto)[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.copy\s*\{(?=[^}]*max-width:\s*64rem)(?=[^}]*margin-inline:\s*auto)(?=[^}]*margin-bottom:\s*3rem)(?=[^}]*text-align:\s*center)[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.lede\s*\{(?=[^}]*max-width:\s*36\.25rem)(?=[^}]*margin:\s*0 auto 1\.25rem)[^}]*\}/s,
    );
    expect(css).toMatch(/\.links\s*\{[^}]*justify-content:\s*center/s);
    expect(css).not.toMatch(/\.specimen\s*\{[^}]*max-width:\s*42\.5rem/s);
  });

  it("hero does not use CSS composes", () => {
    expect(css).not.toMatch(/composes/);
  });

  it("keeps intentional title lines on wide screens and restores readable wrapping on mobile", () => {
    expect(css).toMatch(
      /\.titleLine\s*\{(?=[^}]*display:\s*block)(?=[^}]*white-space:\s*nowrap)[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.copy h1\s*\{[^}]*font-size:\s*clamp\(2\.5rem,\s*4\.4vw,\s*3\.5rem\)/s,
    );
    expect(css).toMatch(
      /@media\s*\(max-width:\s*768px\)[\s\S]*?\.titleLine\s*\{[^}]*white-space:\s*normal/s,
    );
  });

  it("leaves action chrome to the kit Button and guarantees touch targets", () => {
    expect(css).toMatch(
      /\.links\s*\{(?=[^}]*display:\s*flex)(?=[^}]*flex-wrap:\s*wrap)(?=[^}]*justify-content:\s*center)(?=[^}]*gap:\s*0\.75rem)[^}]*\}/s,
    );
    expect(css).toMatch(/\.links > \*\s*\{[^}]*min-height:\s*44px/s);
    expect(css).not.toMatch(/\.(?:primaryAction|secondaryAction)\b/);
  });

  it("lays out the specimen as two equal columns on desktop", () => {
    expect(css).toMatch(
      /\.specimen\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
    );
  });

  it("reserves a muted gutter for source line numbers", () => {
    expect(css).toMatch(
      /\.sourceCode\s*\{(?=[^}]*display:\s*grid)(?=[^}]*grid-template-columns:\s*auto minmax\(0,\s*1fr\))[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.lineNumbers\s*\{(?=[^}]*padding-right:\s*0\.75rem)(?=[^}]*border-right:\s*1px solid)(?=[^}]*color:\s*var\(--text-muted\))[^}]*\}/s,
    );
  });

  it("keeps the scrollable WDL source left-to-right", () => {
    expect(css).toMatch(
      /\.sourceCode\s*\{(?=[^}]*direction:\s*ltr)(?=[^}]*text-align:\s*left)[^}]*\}/s,
    );
  });

  it("shows keyboard focus on the scrollable source", () => {
    expect(css).toMatch(
      /\.sourceCode:focus-visible\s*\{(?=[^}]*outline:\s*2px solid var\(--accent\))(?=[^}]*outline-offset:\s*-2px)[^}]*\}/s,
    );
  });

  it("gives .specimen an outer border", () => {
    expect(css).toMatch(/\.specimen\s*\{[^}]*border:/s);
  });

  it("stacks the specimen to one column at 768 px", () => {
    expect(css).toMatch(
      /@media\s*\(max-width:\s*768px\)[\s\S]*?\.specimen\s*\{[^}]*grid-template-columns:\s*1fr/s,
    );
  });

  it("contains no marketing-era perspective, tilt, filter, or pulse", () => {
    expect(css).not.toMatch(/perspective|rotateY|rotateX|backdrop-filter|status-pulse/);
  });

  it("keeps the graph visible at all breakpoints", () => {
    expect(css).not.toMatch(/\.graph\s*\{[^}]*display:\s*none/s);
  });

  it("gives .graphPane a left-border divider on desktop", () => {
    expect(css).toMatch(/\.graphPane\s*\{[^}]*border-left/s);
  });

  it("gives .graphPane a top-border divider when stacked at 768 px", () => {
    expect(css).toMatch(
      /@media\s*\(max-width:\s*768px\)[\s\S]*?\.graphPane\s*\{[^}]*border-top/s,
    );
  });

  it("animates .traceEdge", () => {
    expect(css).toMatch(/\.traceEdge\s*\{[^}]*animation:/s);
  });

  it("stops the traceEdge animation under reduced-motion preference", () => {
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.traceEdge\s*\{[^}]*animation:\s*none/s,
    );
  });

  it("gives .specimen align-items: stretch so grid items share equal height", () => {
    expect(css).toMatch(/\.specimen\s*\{[^}]*align-items:\s*stretch/s);
  });

  it("gives .graphBody flex-grow and centered content (flex: 1, place-items: center)", () => {
    expect(css).toMatch(/\.graphBody\s*\{[^}]*flex:\s*1/s);
    expect(css).toMatch(/\.graphBody\s*\{[^}]*place-items:\s*center/s);
  });

  it("centers the graph and keeps execution targets inside its pane", () => {
    expect(css).toMatch(
      /\.graph\s*\{(?=[^}]*max-width:\s*22\.5rem)(?=[^}]*margin-inline:\s*auto)[^}]*\}/s,
    );
    expect(css).toMatch(
      /\.graphTargets\s*\{(?=[^}]*display:\s*flex)(?=[^}]*justify-content:\s*center)(?=[^}]*border-top:)[^}]*\}/s,
    );
    expect(css).not.toMatch(/\.metadata\s*\{/s);
  });
});
