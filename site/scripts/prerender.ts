import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_ROUTES } from "../src/routes/manifest";
import { BLOG_ROUTE_DATA } from "../src/generated/blog-routes.generated";
import type { SiteRoute } from "../src/routes/types";
import type { CompiledDocPage } from "./docs/types";

export interface PrerenderOptions {
  base: string;
  outDir: string;
  template: string;
  render: (routeId: string) => string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPageMeta(
  route: SiteRoute,
  docsMap: Map<string, CompiledDocPage>,
  base: string,
): {
  title: string;
  description: string;
  canonical: string;
  image: string;
  noindex: boolean;
  redirect?: string;
} {
  const origin = "https://openwdl.org";
  const basePath = base.endsWith("/") ? base.slice(0, -1) : base;
  const canonical = `${origin}${basePath}${route.path}`;
  const imagePath =
    route.kind === "blog-index"
      ? "blog/social-card.png"
      : route.kind === "blog-post"
        ? `blog/${route.blogSlug}/social-card.png`
        : route.kind === "docs-page"
          ? `${route.path.slice(1)}social-card.png`
          : "social-card.png";
  const image = `${origin}${base}${imagePath}`;

  if (route.kind === "home") {
    return {
      title: "OpenWDL | Workflow Description Language",
      description:
        "Learn why WDL exists, how it separates workflow logic from execution, and how it became an open community standard.",
      canonical,
      image,
      noindex: false,
    };
  }

  if (route.kind === "redirect") {
    const target = `${base}${route.target.slice(1)}`;
    return {
      title: "Page Moved | OpenWDL",
      description: "",
      canonical: `${origin}${basePath}${route.target}`,
      image,
      noindex: true,
      redirect: target,
    };
  }

  if (route.kind === "blog-index") {
    return {
      title: "The OpenWDL Blog",
      description: "Releases, tooling, and reports from the open standard.",
      canonical,
      image,
      noindex: false,
    };
  }

  if (route.kind === "blog-post") {
    const post = BLOG_ROUTE_DATA.find((candidate) => candidate.slug === route.blogSlug);
    return {
      title: post ? `${post.title} | OpenWDL` : `${route.path} | OpenWDL`,
      description: post?.standfirst ?? "",
      canonical,
      image,
      noindex: false,
    };
  }

  if (route.kind === "not-found") {
    return {
      title: "Page Not Found | OpenWDL",
      description: "",
      canonical,
      image,
      noindex: true,
    };
  }

  const page = docsMap.get(route.docSlug);
  return {
    title: page ? `${page.title} | OpenWDL` : `${route.path} | OpenWDL`,
    description: page?.description ?? "",
    canonical,
    image,
    noindex: false,
  };
}

/**
 * Render every route in SITE_ROUTES to a static index.html file under outDir,
 * using the provided template and SSR render function.
 */
export async function prerender(options: PrerenderOptions): Promise<void> {
  const { base, outDir, template, render } = options;

  // Validate template markers upfront — fail explicitly rather than silently
  // emitting incomplete HTML when a required marker is absent.
  const REQUIRED_MARKERS = [
    "<!--page-title-->",
    "<!--page-description-->",
    "<!--page-canonical-->",
    "<!--page-image-->",
    "<!--page-robots-->",
    "<!--page-redirect-->",
    '<div id="root"><!--app-html--></div>',
    "<!--page-id-->",
  ] as const;

  for (const marker of REQUIRED_MARKERS) {
    if (!template.includes(marker)) {
      throw new Error(`prerender: template is missing required marker: ${marker}`);
    }
  }

  // Build a doc-slug → page lookup for title/description resolution.
  const { DOC_PAGES } = await import("../src/generated/docs.generated");
  const docsMap = new Map<string, CompiledDocPage>(
    (DOC_PAGES as readonly CompiledDocPage[]).map((p) => [p.slug, p]),
  );

  for (const route of SITE_ROUTES) {
    const appHtml = render(route.id);
    const meta = buildPageMeta(route, docsMap, base);
    const pageId = JSON.stringify(route.id).replace(/</g, "\\u003c");
    const robotsMeta = meta.noindex ? '<meta name="robots" content="noindex">' : "";
    const redirectMeta = meta.redirect
      ? `<meta http-equiv="refresh" content="0; url=${escapeHtml(meta.redirect)}">`
      : "";

    const html = template
      .replaceAll("<!--page-title-->", () => escapeHtml(meta.title))
      .replaceAll("<!--page-description-->", () => escapeHtml(meta.description))
      .replaceAll("<!--page-canonical-->", () => escapeHtml(meta.canonical))
      .replaceAll("<!--page-image-->", () => escapeHtml(meta.image))
      .replace("<!--page-robots-->", robotsMeta)
      .replace("<!--page-redirect-->", redirectMeta)
      .replace(
        '<div id="root"><!--app-html--></div>',
        // Use a replacer function so that special `$` sequences in appHtml
        // (e.g. `$&` in WDL regex examples) are not interpreted as replacement
        // patterns by String.prototype.replace.
        () =>
          `<div id="root" data-page-id=${JSON.stringify(route.id)}>${appHtml}</div>`,
      )
      .replace("<!--page-id-->", () => pageId);

    // Route path starts with "/"; strip it to get a relative directory.
    const routeRelDir = route.path.slice(1); // e.g. "" | "docs/" | "docs/write/tasks/"
    const outFile = join(outDir, routeRelDir, "index.html");
    await mkdir(dirname(outFile), { recursive: true });
    await writeFile(outFile, html, "utf8");

    if (route.kind === "not-found") {
      await writeFile(join(outDir, "404.html"), html, "utf8");
    }
  }
}

// ── Script entry point ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const siteRoot = join(fileURLToPath(import.meta.url), "..", "..");
  const base = process.env.OPENWDL_BASE ?? "/";
  const distDir = join(siteRoot, "dist");
  const serverBundle = join(siteRoot, "dist-server", "entry-server.js");

  const template = await readFile(join(distDir, "index.html"), "utf8");
  const { renderRoute } = (await import(serverBundle)) as {
    renderRoute: (routeId: string) => string;
  };

  await prerender({ base, outDir: distDir, template, render: renderRoute });
  console.log(`Prerendered ${SITE_ROUTES.length} route(s) to ${distDir}.`);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
