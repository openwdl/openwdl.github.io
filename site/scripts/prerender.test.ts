// @vitest-environment node
import { vi } from "vitest";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

vi.mock("../src/routes/manifest", () => ({
  SITE_ROUTES: [
    { id: "home", kind: "home", path: "/" },
    { id: "brand", kind: "brand", path: "/brand/" },
    { id: "about-redirect", kind: "redirect", path: "/about/", target: "/" },
    { id: "community", kind: "community", path: "/community/" },
    { id: "blog:index", kind: "blog-index", path: "/blog/" },
    {
      id: "blog:announcing-wdl-1-3-0",
      kind: "blog-post",
      path: "/blog/announcing-wdl-1-3-0/",
      blogSlug: "announcing-wdl-1-3-0",
    },
    {
      id: "blog-legacy:announcing-wdl-1-3-0",
      kind: "redirect",
      path: "/wdl/bioinformatics/workflows/announcing-wdl-1-3-0/",
      target: "/blog/announcing-wdl-1-3-0/",
    },
    {
      id: "docs:index",
      kind: "redirect",
      path: "/docs/",
      target: "/docs/start/overview/",
    },
    { id: "not-found", kind: "not-found", path: "/404/" },
    {
      id: "docs:/docs/start/language/tasks/",
      kind: "docs-page",
      path: "/docs/start/language/tasks/",
      docSlug: "/docs/start/language/tasks/",
    },
    {
      id: "docs:/docs/dollar-test/",
      kind: "docs-page",
      path: "/docs/dollar-test/",
      docSlug: "/docs/dollar-test/",
    },
  ],
}));

vi.mock("../src/generated/docs.generated", () => ({
  DOC_PAGES: [
    {
      title: "Price $& quote",
      description: "Text with $' suffix, $` prefix, and $$ sign.",
      slug: "/docs/dollar-test/",
      section: "learn",
      group: "Guide",
      order: 1,
      kind: "guide",
      legacy: [],
      sourcePath: "dollar-test.md",
      body: "<h1>Dollar</h1>",
      headings: [],
    },
  ],
}));

vi.mock("../src/generated/blog-routes.generated", () => ({
  BLOG_ROUTE_DATA: [
    {
      slug: "announcing-wdl-1-3-0",
      title: "Announcing WDL 1.3.0",
      standfirst: "The WDL 1.3 release.",
      legacyPath: "/wdl/bioinformatics/workflows/announcing-wdl-1-3-0/",
    },
  ],
}));

import { prerender } from "./prerender";

const siteRoot = join(fileURLToPath(import.meta.url), "..", "..");

const template = `<!doctype html>
<html lang="en">
<head>
<title><!--page-title--></title>
<meta name="description" content="<!--page-description-->" />
<link rel="canonical" href="<!--page-canonical-->" />
<!--page-robots-->
<!--page-redirect-->
</head>
<body>
<div id="root"><!--app-html--></div>
<script>window.__OPENWDL_PAGE_ID__=<!--page-id--></script>
</body>
</html>`;

const render = (routeId: string): string => {
  if (routeId === "docs:/docs/start/language/tasks/") return "<h1>Tasks</h1>";
  if (routeId === "home") return "<main>WDL home</main>";
  if (routeId === "brand") return "<main>Brand Guidelines</main>";
  if (routeId === "not-found") return "<h1>Page not found</h1>";
  if (routeId === "blog:index") return "<main>OpenWDL blog</main>";
  if (routeId === "blog:announcing-wdl-1-3-0") {
    return "<article><h1>Announcing WDL 1.3.0</h1></article>";
  }
  return "<div>page</div>";
};

let outDir: string;

beforeEach(async () => {
  outDir = await mkdtemp(join(siteRoot, ".prerender-test-"));
});

afterEach(async () => {
  await rm(outDir, { recursive: true, force: true });
});

it("writes direct-loadable directory entries", async () => {
  await prerender({ base: "/", outDir, template, render });
  const html = await readFile(
    join(outDir, "docs/start/language/tasks/index.html"),
    "utf8",
  );
  expect(html).toContain("<h1>Tasks</h1>");
  expect(html).toContain('data-page-id="docs:/docs/start/language/tasks/"');
  expect(html).not.toContain("<!--app-html-->");
});

it("replaces the page-id marker with a JSON-escaped route id", async () => {
  await prerender({ base: "/", outDir, template, render });
  const html = await readFile(join(outDir, "index.html"), "utf8");
  expect(html).toContain('window.__OPENWDL_PAGE_ID__="home"');
  expect(html).not.toContain("<!--page-id-->");
});

it("writes all SITE_ROUTES as index.html files", async () => {
  await prerender({ base: "/", outDir, template, render });
  const home = await readFile(join(outDir, "index.html"), "utf8");
  const brand = await readFile(join(outDir, "brand/index.html"), "utf8");
  const docsIndex = await readFile(join(outDir, "docs/index.html"), "utf8");
  const tasks = await readFile(
    join(outDir, "docs/start/language/tasks/index.html"),
    "utf8",
  );
  expect(home).toContain("WDL home");
  expect(brand).toBeTruthy();
  expect(docsIndex).toBeTruthy();
  expect(tasks).toBeTruthy();
});

it("strips base prefix from output paths", async () => {
  await prerender({ base: "/brand/", outDir, template, render });
  const html = await readFile(
    join(outDir, "docs/start/language/tasks/index.html"),
    "utf8",
  );
  expect(html).toContain("<h1>Tasks</h1>");
});

it("redirects the docs root to the base-aware Overview route", async () => {
  await prerender({ base: "/brand/", outDir, template, render });
  const html = await readFile(join(outDir, "docs/index.html"), "utf8");
  expect(html).toContain(
    '<meta http-equiv="refresh" content="0; url=/brand/docs/start/overview/">',
  );
  expect(html).toContain(
    'href="https://openwdl.org/brand/docs/start/overview/"',
  );
  expect(html).toContain('<meta name="robots" content="noindex">');
});

it("adds noindex robots meta to the not-found page and omits it for normal routes", async () => {
  await prerender({ base: "/", outDir, template, render });
  const notFoundHtml = await readFile(join(outDir, "404/index.html"), "utf8");
  const brandHtml = await readFile(join(outDir, "index.html"), "utf8");
  expect(notFoundHtml).toContain('<meta name="robots" content="noindex">');
  expect(notFoundHtml).not.toContain("<!--page-robots-->");
  expect(brandHtml).not.toContain('<meta name="robots" content="noindex">');
  expect(brandHtml).not.toContain("<!--page-robots-->");
});

it("writes the not-found document to both route and host fallback paths", async () => {
  await prerender({ base: "/", outDir, template, render });
  const routeHtml = await readFile(join(outDir, "404/index.html"), "utf8");
  const fallbackHtml = await readFile(join(outDir, "404.html"), "utf8");

  expect(fallbackHtml).toBe(routeHtml);
  expect(fallbackHtml).toContain('data-page-id="not-found"');
  expect(fallbackHtml).toContain("<title>Page Not Found | OpenWDL</title>");
  expect(fallbackHtml).toContain('<meta name="robots" content="noindex">');
});

it("throws if the template is missing a required marker", async () => {
  const badTemplate = `<!doctype html><html><body><!--app-html--></body></html>`;
  await expect(
    prerender({ base: "/", outDir, template: badTemplate, render }),
  ).rejects.toThrow(/missing required marker/i);
});

it("does not corrupt rendered content containing $& or other $ replacement patterns", async () => {
  // Simulates WDL code that contains regex-like dollar sequences (e.g. "^a.+3$")
  // which, after HTML-entity escaping, produce `$&` in the replacement string.
  const renderWithDollar = (routeId: string): string => {
    if (routeId === "home") return `<code>&quot;^a.+3$&amp;quot;</code>`;
    return "<div>page</div>";
  };
  await prerender({ base: "/", outDir, template, render: renderWithDollar });
  const html = await readFile(join(outDir, "index.html"), "utf8");
  expect(html).toContain(`<code>&quot;^a.+3$&amp;quot;</code>`);
  expect(html).not.toContain("<!--app-html-->");
});

it("does not corrupt title or description containing $& $' $` $$ replacement patterns", async () => {
  // The dollar-test page has title "Price $& quote" and description with all four
  // JS String.prototype.replace special patterns.  Without function replacers:
  //   $&  → inserts the matched marker text  (e.g. "<!--page-title-->")
  //   $'  → inserts the substring after the match (rest of template)
  //   $`  → inserts the substring before the match
  //   $$  → inserts a single "$", silently stripping one dollar sign
  await prerender({ base: "/", outDir, template, render });
  const html = await readFile(join(outDir, "docs/dollar-test/index.html"), "utf8");
  // title: escapeHtml("Price $& quote") → "Price $&amp; quote"
  // $& without function replacer would insert "<!--page-title-->" — corrupted
  expect(html).toContain("<title>Price $&amp; quote | OpenWDL</title>");
  expect(html).not.toContain("<title>Price <!--page-title-->");
  // description: no HTML-escapable chars in $' / $` / $$ patterns
  expect(html).toContain("content=\"Text with $' suffix, $` prefix, and $$ sign.\"");
});

it("writes home and Community pages with page-specific metadata", async () => {
  await prerender({ base: "/brand/", outDir, template, render });
  const home = await readFile(join(outDir, "index.html"), "utf8");
  const community = await readFile(join(outDir, "community/index.html"), "utf8");

  expect(home).toContain("<title>OpenWDL | Workflow Description Language</title>");
  expect(home).toContain(
    'content="Learn why WDL exists, how it separates workflow logic from execution, and how it became an open community standard."',
  );
  expect(home).toContain(
    'href="https://openwdl.org/brand/"',
  );
  expect(home).not.toContain('name="robots" content="noindex"');

  expect(community).toContain("<title>Community | OpenWDL</title>");
  expect(community).toContain(
    'content="Find ways to learn, get help, share workflows, contribute tools, test engines, and shape the WDL specification."',
  );
  expect(community).toContain(
    'href="https://openwdl.org/brand/community/"',
  );
  expect(community).not.toContain('name="robots" content="noindex"');
});

it("writes a noindex base-aware redirect from /about/ to home", async () => {
  await prerender({ base: "/brand/", outDir, template, render });
  const about = await readFile(join(outDir, "about/index.html"), "utf8");

  expect(about).toContain('<meta http-equiv="refresh" content="0; url=/brand/">');
  expect(about).toContain('<meta name="robots" content="noindex">');
  expect(about).toContain('href="https://openwdl.org/brand/"');
});

it("prerenders the blog index, article metadata, and legacy redirect", async () => {
  await prerender({ base: "/brand/", outDir, template, render });

  const index = await readFile(join(outDir, "blog/index.html"), "utf8");
  expect(index).toContain("<title>The OpenWDL Blog</title>");
  expect(index).toContain("OpenWDL blog");

  const article = await readFile(
    join(outDir, "blog/announcing-wdl-1-3-0/index.html"),
    "utf8",
  );
  expect(article).toContain("<title>Announcing WDL 1.3.0 | OpenWDL</title>");
  expect(article).toContain('content="The WDL 1.3 release."');
  expect(article).toContain(
    'href="https://openwdl.org/brand/blog/announcing-wdl-1-3-0/"',
  );

  const legacy = await readFile(
    join(outDir, "wdl/bioinformatics/workflows/announcing-wdl-1-3-0/index.html"),
    "utf8",
  );
  expect(legacy).toContain(
    '<meta http-equiv="refresh" content="0; url=/brand/blog/announcing-wdl-1-3-0/">',
  );
  expect(legacy).toContain('<meta name="robots" content="noindex">');
});
