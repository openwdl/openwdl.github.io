import { resolveSiteRoute } from "./routes/manifest";

/**
 * Resolve the route id to render on the client.
 *
 * Falls back to pathname-based resolution when `rawPageId` is the unreplaced
 * prerender marker (dev mode) or is absent. Unknown paths render the
 * site-wide 404.
 */
export function resolveClientRouteId(
  rawPageId: string | undefined,
  pathname: string,
  base: string,
): string {
  if (rawPageId && !rawPageId.startsWith("<!--")) {
    return rawPageId;
  }
  return resolveSiteRoute(pathname, base)?.id ?? "not-found";
}
