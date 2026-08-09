import { useState } from "react";
import { ToastProvider, NavBar, Footer } from "@openwdl/ui";
import { SETUP_CATALOG } from "./catalog/catalog";
import { createWizardHistory, createStaticWizardHistory } from "./model/history";
import { parseSetupSearch } from "./model/url";
import type { WizardHistory } from "./model/history";
import { GetStartedWizard } from "./GetStartedWizard";
import { docHref } from "../docs/docHref";
import styles from "./GetStartedPage.module.css";

const noscriptHtml = [
  '<style>.wizard-interactive{display:none!important}[data-nav-toggle]{display:none!important}[data-nav-panel]{display:flex!important}</style>',
  '<section>',
  '<h2>Choose a setup from the ecosystem catalog</h2>',
  '<p>The guided setup requires JavaScript. The complete engine and editor catalogs do not.</p>',
  `<a href="${docHref("/docs/start/ecosystem/")}">Browse execution engines and editor integrations</a>`,
  `<a href="${docHref("/docs/start/your-first-workflow/")}">Read Your first workflow</a>`,
  '</section>',
].join("\n");

/**
 * Top-level page component for the `/get-started/` route.
 *
 * Renders the canonical site chrome (nav + footer) and the interactive setup
 * wizard.  A `<noscript>` fallback surfaces ecosystem catalog links and hides
 * all interactive wizard controls so the page remains usable without JavaScript.
 */
export function GetStartedPage() {
  const catalog = SETUP_CATALOG;

  // SSR-safe: use a static no-op adapter on the server, browser adapter on the client.
  const [history] = useState<WizardHistory>(() => {
    if (typeof window === "undefined") return createStaticWizardHistory();
    const parse = (params: URLSearchParams) => parseSetupSearch(params, catalog).state;
    return createWizardHistory(window, parse);
  });

  return (
    <ToastProvider>
      <NavBar baseHref={import.meta.env.BASE_URL} />
      {/* noscript: hide interactive controls and surface catalog fallback links */}
      <noscript dangerouslySetInnerHTML={{ __html: noscriptHtml }} />
      <main className={styles.page} data-page="get-started">
        <div className={`${styles.header} wizard-interactive`}>
          <h1 className={styles.title}>Get started with WDL</h1>
          <p className={styles.subtitle}>
            Answer a few questions to get a personalised installation checklist.
          </p>
        </div>
        <div className="wizard-interactive">
          <GetStartedWizard catalog={catalog} history={history} />
        </div>
      </main>
      <Footer />
    </ToastProvider>
  );
}
