// @vitest-environment node
/**
 * Static-output tests for the prerendered site build.
 *
 * These tests read from site/dist, which is produced by:
 *
 *   OPENWDL_BASE=/brand/ npm run build -w @openwdl/brand
 *     OR
 *   OPENWDL_BASE=/ npm run build -w @openwdl/brand
 *
 * Run AFTER the build — before the build all tests fail with ENOENT (RED).
 * Run AGAIN after the build to verify the full corpus and base-aware output (GREEN).
 *
 * The base is read from OPENWDL_BASE (default "/") so the same test
 * file verifies both the preview (/brand/) and production-root (/) builds.
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { DOC_PAGES } from "../src/generated/docs.generated";

const siteRoot = join(fileURLToPath(import.meta.url), "..", "..");
const dist = join(siteRoot, "dist");

/** Normalised base (always ends with "/"). Defaults to "/". */
const base = (() => {
  const raw = process.env.OPENWDL_BASE ?? "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
})();

async function readBuiltRoute(root: string, slug: string): Promise<string> {
  const relative = slug.replace(/^\/|\/$/g, "");
  return readFile(join(root, relative, "index.html"), "utf8");
}

// ── Every DOC_PAGES slug emits a fully-rendered HTML file ────────────────────

it.each(DOC_PAGES.map((page) => page.slug))("emits %s", async (slug) => {
  const html = await readBuiltRoute(dist, slug);
  expect(html).toContain("<article");
  expect(html).toContain('href="#main-content"');
  expect(html).not.toContain("<!--app-html-->");
});

// ── Configured base is applied to assets and internal navigation links ────────

it("uses the configured base for assets and links", async () => {
  const html = await readBuiltRoute(dist, "/docs/start/language/tasks/");
  expect(html).toContain(`src="${base}assets/`);
  expect(html).toContain(`href="${base}docs/start/language/workflows/"`);
});

it("uses the configured base for documentation images", async () => {
  const html = await readBuiltRoute(dist, "/docs/start/patterns/linear-chaining/");
  expect(html).toContain(
    `src="${base}docs/patterns/linear-chaining/header.png"`,
  );
});

it("includes the shared navigation and footer styles", async () => {
  const assetNames = await readdir(join(dist, "assets"));
  const styles = await Promise.all(
    assetNames
      .filter((name) => name.endsWith(".css"))
      .map((name) => readFile(join(dist, "assets", name), "utf8")),
  );
  const css = styles.join("\n");

  expect(css).toContain(".NavBar_nav");
  expect(css).toContain(".Footer_footer");
});

// ── Search index stays within the 500 KB gzip budget ────────────────────────

it("search manifest is within the 500 KiB gzip budget", async () => {
  const manifestText = await readFile(join(dist, "search", "manifest.json"), "utf8");
  const manifest = JSON.parse(manifestText) as { gzipBytes: number };
  expect(manifest.gzipBytes).toBeLessThan(500 * 1024);
});

// ── Brand page is also present at the root ───────────────────────────────────

it("emits home root index.html without app-html marker", async () => {
  const html = await readFile(join(dist, "index.html"), "utf8");
  expect(html).not.toContain("<!--app-html-->");
  expect(html).toContain('window.__OPENWDL_PAGE_ID__="home"');
});

it("emits the brand field guide at /brand/", async () => {
  const html = await readBuiltRoute(dist, "/brand/");
  expect(html).toContain('data-page-id="brand"');
  expect(html).toContain("<title>OpenWDL Brand Guidelines</title>");
  expect(html).toContain("OpenWDL brand system");
});

it("emits identical noindex not-found route and host fallback documents", async () => {
  const routeHtml = await readBuiltRoute(dist, "/404/");
  const fallbackHtml = await readFile(join(dist, "404.html"), "utf8");
  const basePath = base.slice(0, -1); // strip trailing slash: "/brand" or ""

  expect(fallbackHtml).toBe(routeHtml);
  expect(fallbackHtml).toContain('data-page-id="not-found"');
  expect(fallbackHtml).toContain("Workflow route failed");
  expect(fallbackHtml).toContain('<meta name="robots" content="noindex">');
  expect(fallbackHtml).toContain(`src="${base}assets/`);
  expect(fallbackHtml).toContain(`href="https://openwdl.org${basePath}/404/"`);
});

// ── get-started page ──────────────────────────────────────────────────────────

it("emits /get-started/index.html without app-html marker", async () => {
  const html = await readBuiltRoute(dist, "/get-started/");
  expect(html).not.toContain("<!--app-html-->");
  expect(html).toContain('window.__OPENWDL_PAGE_ID__="get-started"');
});

it("includes catalog fallbacks in static HTML", async () => {
  const html = await readBuiltRoute(dist, "/get-started/");
  expect(html).toContain("<noscript>");
  expect(html).toContain("/docs/start/ecosystem/");
  expect(html).toContain("/docs/start/your-first-workflow/");
  // no-JS nav selectors must also be present for mobile usability
  expect(html).toContain("[data-nav-toggle]");
  expect(html).toContain("[data-nav-panel]");
});

it("/get-started/ carries data-page-id get-started", async () => {
  const html = await readBuiltRoute(dist, "/get-started/");
  expect(html).toContain('data-page-id="get-started"');
});

it("/get-started/ has correct meta title", async () => {
  const html = await readBuiltRoute(dist, "/get-started/");
  expect(html).toContain("Get Started | OpenWDL");
});

it("/get-started/ canonical URL is base-specific", async () => {
  const html = await readBuiltRoute(dist, "/get-started/");
  // base="/brand/" → https://openwdl.org/brand/get-started/
  // base="/"       → https://openwdl.org/get-started/
  const basePath = base.slice(0, -1); // strip trailing slash: "/brand" or ""
  expect(html).toContain(`href="https://openwdl.org${basePath}/get-started/"`);
});

// ── docs:index redirects to the first documentation page ─────────────────────

it("removes the standalone /docs/ content page", () => {
  expect(DOC_PAGES.some((page) => page.slug === "/docs/")).toBe(false);
});

it("/docs/ redirects to the base-aware Overview route", async () => {
  const html = await readBuiltRoute(dist, "/docs/");
  expect(html).toContain('data-page-id="docs:index"');
  expect(html).toContain(
    `<meta http-equiv="refresh" content="0; url=${base}docs/start/overview/">`,
  );
  expect(html).toContain('<meta name="robots" content="noindex">');
});

// ── Home, About redirect, and Community pages ─────────────────────────────────

it.each([
  ["/", "home", "OpenWDL | Workflow Description Language"],
  ["/community/", "community", "Community | OpenWDL"],
])("prerenders %s with metadata and canonical URL", async (path, id, title) => {
  const html = await readBuiltRoute(dist, path);
  const basePath = base.slice(0, -1);

  expect(html).not.toContain("<!--app-html-->");
  expect(html).toContain(`data-page-id="${id}"`);
  expect(html).toContain(`window.__OPENWDL_PAGE_ID__="${id}"`);
  expect(html).toContain(`<title>${title}</title>`);
  expect(html).toContain(`href="https://openwdl.org${basePath}${path}"`);
  expect(html).not.toContain('<meta name="robots" content="noindex">');
});

it("/about/ redirects to the base-aware home route", async () => {
  const html = await readBuiltRoute(dist, "/about/");
  expect(html).toContain('<meta name="robots" content="noindex">');
  expect(html).toContain(`<meta http-equiv="refresh" content="0; url=${base}">`);
  expect(html).toContain(`href="https://openwdl.org${base.slice(0, -1)}/"`);
});

it("prerenders all six Community participation paths", async () => {
  const html = await readBuiltRoute(dist, "/community/");

  for (const label of [
    "Join the conversation",
    "Attend a meeting",
    "Share workflows",
    "Improve docs and code",
    "Build and test engines",
    "Shape the specification",
  ]) {
    expect(html).toContain(label);
  }
});

it("prerenders the blog index and featured article", async () => {
  const index = await readBuiltRoute(dist, "/blog/");
  expect(index).toContain('data-page-id="blog:index"');
  expect(index).toContain("The OpenWDL blog");

  const article = await readBuiltRoute(dist, "/blog/announcing-wdl-1-3-0/");
  expect(article).toContain('data-page-id="blog:announcing-wdl-1-3-0"');
  expect(article).toContain("Announcing WDL 1.3.0");
  expect(article).toContain(`${base}blog/`);
});

it("prerenders base-aware legacy blog redirects", async () => {
  const legacy = await readBuiltRoute(
    dist,
    "/wdl/bioinformatics/workflows/announcing-wdl-1-3-0/",
  );
  expect(legacy).toContain('<meta name="robots" content="noindex">');
  expect(legacy).toContain(
    `<meta http-equiv="refresh" content="0; url=${base}blog/announcing-wdl-1-3-0/">`,
  );
});
