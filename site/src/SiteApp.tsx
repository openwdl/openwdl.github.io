import App from "./App";
import { DOC_PAGES } from "./generated/docs.generated";
import { SITE_ROUTES } from "./routes/manifest";
import { AboutPage } from "./about/AboutPage";
import { BlogPage } from "./pages/BlogPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { CommunityPage } from "./community/CommunityPage";
import { DocsPage } from "./docs/DocsPage";
import { GetStartedPage } from "./get-started/GetStartedPage";
import { NotFoundPage } from "./not-found/NotFoundPage";
import { RedirectPage } from "./routes/RedirectPage";
import { docHref } from "./docs/docHref";

interface SiteAppProps {
  routeId: string;
  replaceLocation?: (to: string) => void;
}

/**
 * Top-level router component for the OpenWDL site. Resolves home, brand,
 * compatibility redirects, and content routes from the manifest by id, then
 * delegates to the appropriate page component based on
 * the route kind. One canonical navigation and footer are rendered per route
 * (inside each page component).
 */
export function SiteApp({ routeId, replaceLocation }: SiteAppProps) {
  const route = SITE_ROUTES.find((r) => r.id === routeId);

  if (!route) {
    return <NotFoundPage />;
  }

  switch (route.kind) {
    case "home":
      return <AboutPage />;
    case "brand":
      return <App />;
    case "redirect":
      return <RedirectPage to={docHref(route.target)} replaceLocation={replaceLocation} />;
    case "community":
      return <CommunityPage />;
    case "blog-index":
      return <BlogPage />;
    case "blog-post":
      return <BlogPostPage slug={route.blogSlug} />;
    case "docs-page": {
      const page = DOC_PAGES.find((p) => p.slug === route.docSlug);
      if (!page) return <NotFoundPage />;
      return <DocsPage page={page} pages={DOC_PAGES} />;
    }
    case "get-started":
      return <GetStartedPage />;
    case "not-found":
      return <NotFoundPage />;
    default:
      return <NotFoundPage />;
  }
}
