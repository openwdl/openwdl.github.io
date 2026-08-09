/** Discriminated union of every page the site can render. */
export type SiteRoute =
  | { id: "home"; kind: "home"; path: "/" }
  | {
      id:
        | "about-redirect"
        | "docs:index"
        | `blog-legacy:${string}`
        | `docs-legacy:${string}`;
      kind: "redirect";
      path: string;
      target: string;
    }
  | { id: "blog:index"; kind: "blog-index"; path: "/blog/" }
  | {
      id: `blog:${string}`;
      kind: "blog-post";
      path: string;
      blogSlug: string;
    }
  | { id: `docs:${string}`; kind: "docs-page"; path: string; docSlug: string }
  | { id: "not-found"; kind: "not-found"; path: "/404/" };
