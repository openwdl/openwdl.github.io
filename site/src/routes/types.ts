/** Discriminated union of every page the site can render. */
export type SiteRoute =
  | { id: "home"; kind: "home"; path: "/" }
  | { id: "brand"; kind: "brand"; path: "/brand/" }
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
  | { id: "community"; kind: "community"; path: "/community/" }
  | { id: "blog:index"; kind: "blog-index"; path: "/blog/" }
  | {
      id: `blog:${string}`;
      kind: "blog-post";
      path: string;
      blogSlug: string;
    }
  | { id: `docs:${string}`; kind: "docs-page"; path: string; docSlug: string }
  | { id: "get-started"; kind: "get-started"; path: "/get-started/" }
  | { id: "not-found"; kind: "not-found"; path: "/404/" };
