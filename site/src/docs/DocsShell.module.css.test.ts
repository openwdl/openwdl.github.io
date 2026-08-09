import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const shellCss = readFileSync(
  resolve(__dirname, "DocsShell.module.css"),
  "utf8",
);
const navCss = readFileSync(resolve(__dirname, "DocsNav.module.css"), "utf8");
const tocCss = readFileSync(resolve(__dirname, "DocsToc.module.css"), "utf8");
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
  expect(tocCss).toMatch(
    /\.toc\s*\{(?=[^}]*border-left:\s*1px solid var\(--chrome-border\))(?=[^}]*background:\s*var\(--surface\))[^}]*\}/s,
  );
});

it("pins fixed rails to the viewport edges around broader centered prose", () => {
  expect(shellCss).toMatch(
    /\.layout\s*\{(?=[^}]*grid-template-columns:\s*var\(--sidebar-w\)\s+minmax\(0,\s*1fr\)\s+var\(--sidebar-w\))(?=[^}]*width:\s*100%)(?=[^}]*max-width:\s*none)[^}]*\}/s,
  );
  expect(shellCss).toMatch(
    /\.article\s*\{(?=[^}]*width:\s*100%)(?=[^}]*max-width:\s*82ch)[^}]*\}/s,
  );
  expect(bodyCss).toMatch(
    /\.body\s*\{(?=[^}]*max-width:\s*82ch)[^}]*\}/s,
  );
  expect(navCss).toMatch(/@media\s*\(max-width:\s*900px\)/);
  expect(tocCss).toMatch(/@media\s*\(max-width:\s*900px\)/);
});

it("uses comfortable documentation and rail text sizes", () => {
  expect(shellCss).toMatch(
    /\.article\s*\{(?=[^}]*font-size:\s*1\.0625rem)[^}]*\}/s,
  );
  expect(navCss).toMatch(
    /\.nav\s*\{(?=[^}]*font-size:\s*0\.9375rem)[^}]*\}/s,
  );
  expect(tocCss).toMatch(
    /\.toc\s*\{(?=[^}]*font-size:\s*0\.875rem)[^}]*\}/s,
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

it("gives multi-line list items the same readable rhythm as paragraphs", () => {
  expect(bodyCss).toMatch(
    /\.body :global\(li\)\s*\{(?=[^}]*margin:\s*0\.5rem\s+0)(?=[^}]*line-height:\s*1\.7)[^}]*\}/s,
  );
});

it("makes local documentation images fill the content width without distortion", () => {
  expect(bodyCss).toMatch(
    /\.localImage\s*\{(?=[^}]*display:\s*block)(?=[^}]*width:\s*100%)(?=[^}]*height:\s*auto)[^}]*\}/s,
  );
});

it("presents documentation tables as responsive bordered surfaces", () => {
  expect(bodyCss).toMatch(
    /\.tableScroll\s*\{(?=[^}]*overflow-x:\s*auto)(?=[^}]*border:\s*1px solid var\(--border\))(?=[^}]*border-radius:\s*var\(--radius\))[^}]*\}/s,
  );
  expect(bodyCss).toMatch(
    /\.body :global\(th\)\s*\{(?=[^}]*background:\s*var\(--surface\))(?=[^}]*font-weight:\s*600)[^}]*\}/s,
  );
  expect(bodyCss).toMatch(
    /\.body :global\(th\),\s*\.body :global\(td\)\s*\{(?=[^}]*padding:\s*0\.75rem\s+0\.875rem)(?=[^}]*border-bottom:\s*1px solid var\(--border\))[^}]*\}/s,
  );
});

it("uses quiet wayfinding with left-aligned pagination content", () => {
  expect(pageCss).toMatch(
    /\.breadcrumbs\s*\{(?=[^}]*font-family:\s*var\(--font-mono\))(?=[^}]*color:\s*var\(--text-muted\))[^}]*\}/s,
  );
  expect(pageCss).toMatch(
    /\.pagination\s*\{(?=[^}]*display:\s*grid)(?=[^}]*border-top:\s*1px solid var\(--border\))[^}]*\}/s,
  );
  expect(pageCss).toMatch(
    /\.paginationLink\s*\{(?=[^}]*text-align:\s*left)(?=[^}]*text-decoration:\s*none)[^}]*\}/s,
  );
  expect(pageCss).toMatch(
    /\.next\s*\{(?=[^}]*grid-column:\s*2)(?=[^}]*text-align:\s*right)[^}]*\}/s,
  );
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
  expect(tocCss).toMatch(
    /\.toc\s*\{(?=[^}]*top:\s*calc\(var\(--nav-h\) \+ var\(--docs-section-nav-h\)\))(?=[^}]*height:\s*calc\(100vh - var\(--nav-h\) - var\(--docs-section-nav-h\)\))[^}]*\}/s,
  );
  expect(bodyCss).toMatch(
    /\.body :global\(h2\),\s*\.body :global\(h3\)\s*\{[^}]*scroll-margin-top:\s*calc\(var\(--nav-h\) \+ var\(--docs-section-nav-h\) \+ 1rem\)[^}]*\}/s,
  );
  expect(shellCss).toMatch(
    /\.page > :global\(footer\)\s*\{[^}]*margin-top:\s*0[^}]*\}/s,
  );
});

it("highlights the active page-outline heading", () => {
  expect(tocCss).toMatch(
    /\.link\[aria-current="location"\]\s*\{(?=[^}]*border-left-color:\s*var\(--accent\))(?=[^}]*color:\s*var\(--accent\))[^}]*\}/s,
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
