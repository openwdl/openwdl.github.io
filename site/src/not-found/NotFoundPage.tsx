import { useEffect, useState } from "react";
import { Button, Footer, NavBar, ToastProvider } from "@openwdl/ui";
import { FiArrowRight, FiBookOpen, FiHome } from "react-icons/fi";
import { docHref } from "../docs/docHref";
import styles from "./NotFoundPage.module.css";

const routeSource = (route: string) => (
  <>
    <span className={styles.keyword}>version</span>
    {" "}
    <span>1.3</span>
    {"\n\n"}
    <span className={styles.keyword}>workflow</span>
    {" website {\n  "}
    <span className={styles.keyword}>input</span>
    {" {\n    "}
    <span className={styles.type}>String</span>
    {' route = "'}
    {route}
    {'"\n  }\n\n  '}
    <span className={styles.muted}># Resolve a known destination.</span>
    {"\n  "}
    <span className={styles.keyword}>call</span>
    {" display {\n    route\n  }\n}\n\n"}
    <span className={styles.error}>error: route not found</span>
  </>
);

/** Renders the branded site-wide 404 recovery page. */
export function NotFoundPage() {
  const [attemptedRoute, setAttemptedRoute] = useState("/404/");

  useEffect(() => {
    setAttemptedRoute(window.location.pathname);
  }, []);

  return (
    <ToastProvider>
      <div data-route="not-found">
        <NavBar baseHref={import.meta.env.BASE_URL} />
        <main className={styles.main}>
          <div className={styles.grid}>
            <section className={styles.message}>
              <p className={styles.status} aria-label="Error 404">404</p>
              <h1>Workflow route failed</h1>
              <p className={styles.explanation}>
                The page at this address does not exist or may have moved.
                Choose a known entry point to continue.
              </p>
              <div className={styles.actions}>
                <Button as="a" href={docHref("/")} leadingIcon={<FiHome />}>
                  OpenWDL home
                </Button>
                <Button
                  as="a"
                  href={docHref("/docs/")}
                  variant="secondary"
                  leadingIcon={<FiBookOpen />}
                >
                  Browse docs
                </Button>
                <Button
                  as="a"
                  href={docHref("/get-started/")}
                  variant="secondary"
                  leadingIcon={<FiArrowRight />}
                >
                  Get started
                </Button>
              </div>
            </section>

            <section className={styles.codePanel} aria-label="Route error">
              <div className={styles.codeHeader}>
                <span>route.wdl</span>
                <span>not found</span>
              </div>
              <pre>
                <code>{routeSource(attemptedRoute)}</code>
              </pre>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
