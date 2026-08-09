import { useEffect, useState } from "react";
import { SiteApp } from "./SiteApp";
import { resolveSiteRoute } from "./routes/manifest";

interface ClientAppProps {
  initialRouteId: string;
  base: string;
}

function scrollToNavigationTarget(hash: string): void {
  if (hash) {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView();
      return;
    }
  }
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Hydrated site shell with same-origin client-side navigation. */
export function ClientApp({ initialRouteId, base }: ClientAppProps) {
  const [routeId, setRouteId] = useState(initialRouteId);

  useEffect(() => {
    function updateFromLocation(): void {
      const route = resolveSiteRoute(window.location.pathname, base);
      setRouteId(route?.id ?? "not-found");
      scrollToNavigationTarget(window.location.hash);
    }

    function handleClick(event: MouseEvent): void {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        (url.pathname === window.location.pathname &&
          url.search === window.location.search)
      ) {
        return;
      }

      const route = resolveSiteRoute(url.pathname, base);
      if (!route) return;

      event.preventDefault();
      window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
      setRouteId(route.id);
      scrollToNavigationTarget(url.hash);
    }

    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", updateFromLocation);
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", updateFromLocation);
    };
  }, [base]);

  return <SiteApp routeId={routeId} />;
}
