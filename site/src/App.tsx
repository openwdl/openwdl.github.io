import { useEffect, useRef } from "react";
import { ToastProvider, NavBar, Container, Footer } from "@openwdl/ui";
import { Hero } from "./sections/Hero";
import { Foundation } from "./sections/Foundation";
import { LogoConstruction } from "./sections/LogoConstruction";
import { LogoColor } from "./sections/LogoColor";
import { Grid } from "./sections/Grid";
import { VisualLanguage } from "./sections/VisualLanguage";
import { DesignSystem } from "./sections/DesignSystem";
import { Downloads } from "./sections/Downloads";
import { ChapterNav } from "./components/ChapterNav";
import styles from "./App.module.css";

/**
 * OpenWDL brand field-guide page.
 *
 * Composes every page section inside the shared library NavBar, Container, and
 * Footer, wrapped by ToastProvider so copy confirmations surface anywhere in
 * the tree without prop-drilling.
 */
export default function App() {
  const fieldGuideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = Array.from(
      fieldGuideRef.current?.querySelectorAll("section") ?? [],
    ) as HTMLElement[];
    const reducedMotion = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      sections.forEach((section) => section.dataset.revealed = "true");
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.revealed = "true";
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <ToastProvider>
      <NavBar
        baseHref={import.meta.env.BASE_URL}
      />
      <Container>
        <main>
          <Hero />
          <div ref={fieldGuideRef} className={styles.fieldGuide}>
            <ChapterNav />
            <div className={styles.chapters}>
              <Foundation />
              <LogoConstruction />
              <LogoColor />
              <VisualLanguage />
              <Grid />
              <DesignSystem />
              <Downloads />
            </div>
          </div>
        </main>
      </Container>
      <Footer
        legal={(
          <>
            Brand guidelines and assets licensed under{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
          </>
        )}
      />
    </ToastProvider>
  );
}
