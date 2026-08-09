import { DOC_PAGES } from "../generated/docs.generated";
import { BLOG_ROUTE_DATA } from "../generated/blog-routes.generated";
import type { SiteRoute } from "./types";

export type { SiteRoute };

const homeRoute: SiteRoute = { id: "home", kind: "home", path: "/" };
const brandRoute: SiteRoute = { id: "brand", kind: "brand", path: "/brand/" };
const aboutRedirectRoute: SiteRoute = {
  id: "about-redirect",
  kind: "redirect",
  path: "/about/",
  target: "/",
};
const communityRoute: SiteRoute = {
  id: "community",
  kind: "community",
  path: "/community/",
};
const blogIndexRoute: SiteRoute = {
  id: "blog:index",
  kind: "blog-index",
  path: "/blog/",
};
const docsIndexRoute: SiteRoute = {
  id: "docs:index",
  kind: "redirect",
  path: "/docs/",
  target: "/docs/start/overview/",
};
const getStartedRoute: SiteRoute = { id: "get-started", kind: "get-started", path: "/get-started/" };
const notFoundRoute: SiteRoute = { id: "not-found", kind: "not-found", path: "/404/" };

const docPageRoutes: SiteRoute[] = DOC_PAGES
  .filter((p) => !p.hidden)
  .map((p) => ({
    id: `docs:${p.slug}` as `docs:${string}`,
    kind: "docs-page" as const,
    path: p.slug,
    docSlug: p.slug,
  }));

const docLegacyRoutes: SiteRoute[] = DOC_PAGES.flatMap((page) =>
  page.legacy
    .filter((path) => path.startsWith("/docs/"))
    .map((path) => ({
      id: `docs-legacy:${path}`,
      kind: "redirect" as const,
      path,
      target: page.slug,
    })),
);

const blogPostRoutes: SiteRoute[] = BLOG_ROUTE_DATA.map((post) => ({
  id: `blog:${post.slug}`,
  kind: "blog-post",
  path: `/blog/${post.slug}/`,
  blogSlug: post.slug,
}));

const blogLegacyRoutes: SiteRoute[] = BLOG_ROUTE_DATA.map((post) => ({
  id: `blog-legacy:${post.slug}`,
  kind: "redirect",
  path: post.legacyPath,
  target: `/blog/${post.slug}/`,
}));

/** All renderable pages, ordered: primary pages, content routes, redirects, then not-found. */
export const SITE_ROUTES: readonly SiteRoute[] = [
  homeRoute,
  brandRoute,
  aboutRedirectRoute,
  communityRoute,
  blogIndexRoute,
  ...blogPostRoutes,
  ...blogLegacyRoutes,
  docsIndexRoute,
  ...docPageRoutes,
  ...docLegacyRoutes,
  getStartedRoute,
  notFoundRoute,
];

function normalizeBase(base: string): string {
  return base.endsWith("/") ? base : `${base}/`;
}

/**
 * Strip the configured base from a full pathname and match against the route
 * table. Returns undefined for unknown paths — callers should render a 404.
 */
export function resolveSiteRoute(pathname: string, base: string): SiteRoute | undefined {
  const nb = normalizeBase(base);
  let localPath: string;

  if (pathname === nb || `${pathname}/` === nb) {
    localPath = "/";
  } else if (pathname.startsWith(nb)) {
    localPath = `/${pathname.slice(nb.length)}`;
  } else {
    return undefined;
  }

  if (!localPath.endsWith("/")) localPath = `${localPath}/`;

  return SITE_ROUTES.find((route) => route.path === localPath);
}
