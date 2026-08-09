import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const shellCss = readFileSync(
  resolve(__dirname, "DocsShell.module.css"),
  "utf8",
);
const navCss = readFileSync(resolve(__dirname, "DocsNav.module.css"), "utf8");
const bodyCss = readFileSync(
  resolve(__dirname, "MarkdownBody.module.css"),
  "utf8",
);
const pageCss = readFileSync(resolve(__dirname, "DocsPage.module.css"), "utf8");
const searchCss = readFileSync(resolve(__dirname, "DocsSearch.module.css"), "utf8");

it("covers the site-wide grid with an opaque documentation surface", () => {
  expect(shellCss).toMatch(
    /\.page\s*\{(?=[^}]*min-height:\s*100vh)(?=[^}]*background:\s*var\(--bg\))[^}]*\}/s,
  );
});

it("uses quiet navigation rails around an open reading column", () => {
  expect(shellCss).toMatch(
    /\.main\s*\{(?=[^}]*display:\s*flex)(?=[^}]*justify-content:\s*center)(?=[^}]*padding:\s*3rem\s+2\.5rem)[^}]*\}/s,
  );
  expect(shellCss).toMatch(
    /@media\s*\(max-width:\s*900px\)[\s\S]*?\.main\s*\{[^}]*padding:\s*2rem\s+1rem/s,
  );
  expect(navCss).toMatch(
    /\.nav\s*\{(?=[^}]*border-right:\s*1px solid var\(--chrome-border\))(?=[^}]*background:\s*var\(--surface\))[^}]*\}/s,
  );
  expect(navCss).toMatch(
    /\.link\s*\{(?=[^}]*margin:\s*0\s+0\.5rem\s+0\s+1rem)(?=[^}]*border-left:\s*2px solid transparent)[^}]*\}/s,
  );
  expect(navCss).toMatch(
    /\.link\[aria-current="page"\]\s*\{(?=[^}]*border-left-color:\s*var\(--accent\))(?=[^}]*background:\s*transparent)[^}]*\}/s,
  );
});

it("pins fixed rails to the viewport edges around broader centered prose", () => {
  expect(shellCss).toMatch(
    /\.layout\s*\{(?=[^}]*grid-template-columns:\s*var\(--sidebar-w\)\s+minmax\(0,\s*1fr\)\s+var\(--sidebar-w\))(?=[^}]*width:\s*100%)(?=[^}]*max-width:\s*none)[^}]*\}/s,
  );
  expect(shellCss).toMatch(
    /\.article\s*\{(?=[^}]*width:\s*100%)(?=[^}]*max-width:\s*82ch)[^}]*\}/s,
  );
  // The markdown column's own measure is the kit `Prose` default
  // (`--prose-measure: 82ch`), matched by `.article` above.
  expect(navCss).toMatch(/@media\s*\(max-width:\s*900px\)/);
  expect(shellCss).toMatch(
    /@media\s*\(max-width:\s*900px\)[\s\S]*?\.layout > \.toc\s*\{(?=[^}]*position:\s*static)(?=[^}]*grid-column:\s*auto)[^}]*\}/s,
  );
});

it("uses comfortable documentation and rail text sizes", () => {
  expect(shellCss).toMatch(
    /\.article\s*\{(?=[^}]*font-size:\s*1\.0625rem)[^}]*\}/s,
  );
  expect(navCss).toMatch(
    /\.nav\s*\{(?=[^}]*font-size:\s*0\.9375rem)[^}]*\}/s,
  );
});

it("separates sidebar section headings from their menu items", () => {
  expect(navCss).toMatch(
    /\.groupLabel\s*\{(?=[^}]*font-size:\s*0\.875rem)(?=[^}]*text-transform:\s*none)(?=[^}]*margin-bottom:\s*0\.25rem)(?=[^}]*padding:\s*0\.45rem\s+0\.5rem)[^}]*\}/s,
  );
  expect(navCss).toMatch(
    /\.link\s*\{(?=[^}]*padding:\s*0\.2rem\s+0\.5rem)[^}]*\}/s,
  );
});

it("leaves markdown typography and table styling to the kit", () => {
  // `Prose` owns typography and `TableScroll` owns every table rule, so the
  // old `.body` container and `.tableScroll` region keep no local rules.
  expect(bodyCss).not.toMatch(/\.body\b/);
  expect(bodyCss).not.toMatch(/\.tableScroll\b/);
  expect(bodyCss).not.toMatch(
    /:global\((?:p|h2|h3|ul|ol|li|a|hr|blockquote|table|th|td|tbody)\b/,
  );
});

it("stretches local documentation images to the full content width", () => {
  // `Prose` supplies display/max-width/height for every image; the stretch to
  // the full measure is the only declaration that is still ours.
  expect(bodyCss).toMatch(/\.localImage\s*\{(?=[^}]*width:\s*100%)[^}]*\}/s);
});

it("keeps breadcrumb wayfinding quiet and leaves pagination to the kit", () => {
  expect(pageCss).toMatch(
    /\.breadcrumbs\s*\{(?=[^}]*font-family:\s*var\(--font-mono\))(?=[^}]*color:\s*var\(--text-muted\))[^}]*\}/s,
  );
  // The docs pager is `@openwdl/ui`'s `Pagination`; no local rules survive.
  expect(pageCss).not.toMatch(/\.pagination/);
});

it("keeps the section bar and desktop rails visible while reading", () => {
  expect(shellCss).toMatch(
    /\.page\s*\{[^}]*--docs-section-nav-h:\s*3\.5rem[^}]*\}/s,
  );
  expect(shellCss).toMatch(
    /\.sectionNav\s*\{(?=[^}]*position:\s*sticky)(?=[^}]*top:\s*var\(--nav-h\))[^}]*\}/s,
  );
  expect(navCss).toMatch(
    /\.nav\s*\{(?=[^}]*position:\s*sticky)(?=[^}]*top:\s*calc\(var\(--nav-h\) \+ var\(--docs-section-nav-h\)\))(?=[^}]*height:\s*calc\(100vh - var\(--nav-h\) - var\(--docs-section-nav-h\)\))[^}]*\}/s,
  );
  // Anchored headings clear nav + section bar through the kit's
  // `--prose-scroll-offset`, which `Prose` adds to `--nav-h`. It has to be
  // declared on the `Prose` element (element-qualified so it outranks the
  // kit's own `--prose-scroll-offset: 0px` on that same element).
  expect(bodyCss).toMatch(
    /div\.markdown\s*\{[^}]*--prose-scroll-offset:\s*calc\(var\(--docs-section-nav-h\) \+ 1rem\)[^}]*\}/s,
  );
  expect(shellCss).toMatch(
    /\.page > :global\(footer\)\s*\{[^}]*margin-top:\s*0[^}]*\}/s,
  );
});

it("places the kit page outline in the third documentation column", () => {
  expect(shellCss).toMatch(
    /\.layout > \.toc\s*\{(?=[^}]*grid-column:\s*3)(?=[^}]*grid-row:\s*1)[^}]*\}/s,
  );
  expect(shellCss).toMatch(
    /@media\s*\(max-width:\s*900px\)[\s\S]*?\.layout > \.toc\s*\{(?=[^}]*max-height:\s*min\(60vh, 30rem\))(?=[^}]*border:\s*1px solid var\(--chrome-border\))[^}]*\}/s,
  );
});

it("presents search as a substantial input with a composed empty state", () => {
  expect(searchCss).toMatch(
    /\.trigger\s*\{(?=[^}]*min-width:\s*14rem)(?=[^}]*justify-content:\s*flex-start)[^}]*\}/s,
  );
  expect(searchCss).toMatch(
    /\.kbd\s*\{(?=[^}]*display:\s*inline-flex)(?=[^}]*gap:\s*0\.25rem)(?=[^}]*margin-left:\s*auto)[^}]*\}/s,
  );
  expect(searchCss).toMatch(
    /\.emptyState\s*\{(?=[^}]*min-height:\s*12rem)(?=[^}]*text-align:\s*center)[^}]*\}/s,
  );
});

it("gives mobile documentation search a full-width labeled row", () => {
  expect(shellCss).toMatch(
    /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.sectionSearch\s*\{(?=[^}]*width:\s*100%)[^}]*\}/s,
  );
  expect(searchCss).toMatch(
    /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.trigger\s*\{(?=[^}]*width:\s*100%)[^}]*\}/s,
  );
  expect(searchCss).not.toMatch(
    /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.trigger > span\s*\{[^}]*display:\s*none/s,
  );
});

it("confines the mobile disclosure controls to the collapsed layout", () => {
  // The kit `Disclosure` renders at every viewport width, so the whole
  // breakpoint policy has to live on this wrapper: hidden by default, shown
  // exactly where the three-column layout collapses to one column.
  expect(shellCss).toMatch(
    /\.mobileControls\s*\{(?=[^}]*display:\s*none)[^}]*\}/s,
  );
  expect(shellCss).toMatch(
    /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.mobileControls\s*\{(?=[^}]*display:\s*flex)[^}]*\}/s,
  );
  expect(shellCss).toMatch(
    /@media\s*\(max-width:\s*900px\)\s*\{[\s\S]*?\.layout\s*\{(?=[^}]*grid-template-columns:\s*1fr)[^}]*\}/s,
  );
});
