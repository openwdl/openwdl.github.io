import { StrictMode } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { ClientApp } from "./ClientApp";
import { resolveClientRouteId } from "./resolveClientRouteId";
import "@openwdl/ui/fonts.css";
import "@openwdl/ui/theme.css";
import "@openwdl/ui/base.css";
import "@openwdl/ui/styles.css";
import "./styles/global.css";

declare global {
  interface Window {
    // Optional because the prerender marker may not be replaced in dev mode.
    __OPENWDL_PAGE_ID__?: string;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

const routeId = resolveClientRouteId(
  window.__OPENWDL_PAGE_ID__,
  window.location.pathname,
  import.meta.env.BASE_URL,
);

const app = (
  <StrictMode>
    <ClientApp initialRouteId={routeId} base={import.meta.env.BASE_URL} />
  </StrictMode>
);

if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
