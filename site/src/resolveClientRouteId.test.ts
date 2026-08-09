import { vi } from "vitest";

vi.mock("./routes/manifest", () => ({
  resolveSiteRoute: (pathname: string, base: string) => {
    if (base === "/brand/" && pathname === "/brand/docs/") return { id: "docs:index" };
    if (base === "/brand/" && pathname === "/brand/") return { id: "home" };
    if (base === "/" && pathname === "/") return { id: "home" };
    if (base === "/" && pathname === "/brand/") return { id: "brand" };
    if (base === "/" && pathname === "/docs/") return { id: "docs:index" };
    if (base === "/" && pathname === "/get-started/") return { id: "get-started" };
    if (base === "/brand/" && pathname === "/brand/get-started/") return { id: "get-started" };
    if (base === "/" && pathname === "/blog/") return { id: "blog:index" };
    if (base === "/brand/" && pathname === "/brand/blog/") return { id: "blog:index" };
    return undefined;
  },
}));

import { resolveClientRouteId } from "./resolveClientRouteId";

it("returns the pageId when it is a valid prerendered string", () => {
  expect(resolveClientRouteId("home", "/brand/", "/brand/")).toBe("home");
  expect(resolveClientRouteId("brand", "/brand/", "/")).toBe("brand");
  expect(resolveClientRouteId("docs:index", "/brand/docs/", "/brand/")).toBe("docs:index");
  expect(resolveClientRouteId("docs:/docs/start/language/tasks/", "/brand/docs/start/language/tasks/", "/brand/")).toBe(
    "docs:/docs/start/language/tasks/",
  );
});

it("falls back to pathname resolution when pageId is the raw prerender marker", () => {
  expect(resolveClientRouteId("<!--page-id-->", "/brand/docs/", "/brand/")).toBe("docs:index");
  expect(resolveClientRouteId("<!--page-id-->", "/brand/", "/brand/")).toBe("home");
});

it("falls back to pathname resolution when pageId is undefined", () => {
  expect(resolveClientRouteId(undefined, "/brand/", "/brand/")).toBe("home");
  expect(resolveClientRouteId(undefined, "/docs/", "/")).toBe("docs:index");
});

it("returns 'not-found' when pathname is unrecognized", () => {
  expect(resolveClientRouteId(undefined, "/brand/unknown/", "/brand/")).toBe("not-found");
  expect(resolveClientRouteId("<!--page-id-->", "/brand/no-such-route/", "/brand/")).toBe("not-found");
  expect(resolveClientRouteId(undefined, "/missing/", "/")).toBe("not-found");
});

it("resolves docs routes from pathname under root base (dev mode at /)", () => {
  expect(resolveClientRouteId("<!--page-id-->", "/docs/", "/")).toBe("docs:index");
  expect(resolveClientRouteId(undefined, "/", "/")).toBe("home");
});

it("resolves get-started route from pathname under both bases", () => {
  expect(resolveClientRouteId(undefined, "/get-started/", "/")).toBe("get-started");
  expect(resolveClientRouteId(undefined, "/brand/get-started/", "/brand/")).toBe("get-started");
  expect(resolveClientRouteId("get-started", "/brand/get-started/", "/brand/")).toBe("get-started");
});

it("resolves the blog index from pathname under both bases", () => {
  expect(resolveClientRouteId(undefined, "/blog/", "/")).toBe("blog:index");
  expect(resolveClientRouteId(undefined, "/brand/blog/", "/brand/")).toBe("blog:index");
});
