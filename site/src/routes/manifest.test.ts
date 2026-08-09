import { vi } from "vitest";

vi.mock("../generated/docs.generated", () => ({
  DOC_PAGES: [
    {
      title: "Overview",
      description: "The OpenWDL documentation overview.",
      slug: "/docs/start/overview/",
      section: "learn",
      group: "Overview",
      order: 10,
      kind: "guide",
      legacy: ["/docs/learn/overview/"],
      sourcePath: "learn/overview.md",
      body: "# Overview\n",
      headings: [],
    },
    {
      title: "Tasks",
      description: "Define a portable unit of computation.",
      slug: "/docs/start/language/tasks/",
      section: "learn",
      group: "Language guide",
      order: 10,
      kind: "guide",
      legacy: ["/docs/write/tasks/"],
      sourcePath: "write/tasks.md",
      body: "# Tasks\n",
      headings: [{ depth: 1, id: "tasks", text: "Tasks" }],
    },
  ],
}));

import { resolveSiteRoute, SITE_ROUTES } from "./manifest";

describe("resolveSiteRoute", () => {
  it.each([
    ["/brand/docs/start/language/tasks/", "/brand/", "docs:/docs/start/language/tasks/"],
    ["/docs/start/language/tasks/", "/", "docs:/docs/start/language/tasks/"],
    ["/docs/write/tasks/", "/", "docs-legacy:/docs/write/tasks/"],
    ["/brand/about/", "/brand/", "about-redirect"],
    ["/about/", "/", "about-redirect"],
    ["/brand/brand/", "/brand/", "brand"],
    ["/brand/", "/", "brand"],
    ["/brand/community/", "/brand/", "community"],
    ["/community/", "/", "community"],
    ["/brand/blog/", "/brand/", "blog:index"],
    ["/blog/", "/", "blog:index"],
    [
      "/blog/announcing-wdl-1-3-0/",
      "/",
      "blog:announcing-wdl-1-3-0",
    ],
    [
      "/wdl/bioinformatics/workflows/announcing-wdl-1-3-0/",
      "/",
      "blog-legacy:announcing-wdl-1-3-0",
    ],
  ])("resolves %s under %s", (pathname, base, expected) => {
    expect(resolveSiteRoute(pathname, base)?.id).toBe(expected);
  });

  it("resolves root under /brand/ base", () => {
    expect(resolveSiteRoute("/brand/", "/brand/")?.id).toBe("home");
  });

  it("resolves root under / base", () => {
    expect(resolveSiteRoute("/", "/")?.id).toBe("home");
  });

  it("resolves docs index under /brand/ base", () => {
    expect(resolveSiteRoute("/brand/docs/", "/brand/")?.id).toBe("docs:index");
  });

  it("renders the canonical wizard route under / base", () => {
    expect(resolveSiteRoute("/get-started/", "/")?.id).toBe("get-started");
  });

  it("renders the canonical wizard route under /brand/ base", () => {
    expect(resolveSiteRoute("/brand/get-started/", "/brand/")?.id).toBe("get-started");
  });

  it("returns undefined for unknown paths", () => {
    expect(resolveSiteRoute("/brand/unknown/page/", "/brand/")).toBeUndefined();
  });
});

describe("SITE_ROUTES", () => {
  it("includes home, brand, redirect, docs, and get-started routes", () => {
    const ids = SITE_ROUTES.map((r) => r.id);
    expect(ids).toContain("home");
    expect(ids).toContain("brand");
    expect(ids).toContain("docs:index");
    expect(ids).toContain("docs:/docs/start/language/tasks/");
    expect(ids).toContain("docs-legacy:/docs/write/tasks/");
    expect(ids).toContain("get-started");
    expect(ids).toContain("about-redirect");
    expect(ids).toContain("community");
    expect(ids).toContain("blog:index");
    expect(ids).toContain("blog:announcing-wdl-1-3-0");
    expect(ids).toContain("blog-legacy:announcing-wdl-1-3-0");
  });

  it("doc page route carries docSlug", () => {
    const tasksRoute = SITE_ROUTES.find((r) => r.id === "docs:/docs/start/language/tasks/");
    expect(tasksRoute?.kind).toBe("docs-page");
    if (tasksRoute?.kind === "docs-page") {
      expect(tasksRoute.docSlug).toBe("/docs/start/language/tasks/");
    }
  });

  it("redirects the docs root to Overview", () => {
    expect(resolveSiteRoute("/docs/", "/")).toEqual({
      id: "docs:index",
      kind: "redirect",
      path: "/docs/",
      target: "/docs/start/overview/",
    });
  });

  it("redirects old section URLs to their new canonical locations", () => {
    expect(resolveSiteRoute("/docs/learn/overview/", "/")).toEqual({
      id: "docs-legacy:/docs/learn/overview/",
      kind: "redirect",
      path: "/docs/learn/overview/",
      target: "/docs/start/overview/",
    });
    expect(resolveSiteRoute("/docs/write/tasks/", "/")).toEqual({
      id: "docs-legacy:/docs/write/tasks/",
      kind: "redirect",
      path: "/docs/write/tasks/",
      target: "/docs/start/language/tasks/",
    });
  });

  it("does not include a docs-page route for the /docs/ index page", () => {
    const duplicate = SITE_ROUTES.find(
      (r) => r.kind === "docs-page" && r.path === "/docs/",
    );
    expect(duplicate).toBeUndefined();
  });

  it("has no duplicate output paths", () => {
    const paths = SITE_ROUTES.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
