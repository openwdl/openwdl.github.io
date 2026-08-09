import { renderToString } from "react-dom/server";
import { SiteApp } from "./SiteApp";

/**
 * Server-side render a route by id, returning an HTML string suitable for
 * injection into the prerendered page template.
 */
export function renderRoute(routeId: string): string {
  return renderToString(<SiteApp routeId={routeId} />);
}
