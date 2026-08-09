import { useEffect, useState } from "react";
import styles from "./ChapterNav.module.css";

const chapters = [
  { id: "foundation", label: "Foundation" },
  { id: "logo-system", label: "Logo system" },
  { id: "using-the-mark", label: "Using the mark" },
  { id: "visual-language", label: "Color and typography" },
  { id: "grid-texture", label: "Grid and texture" },
  { id: "design-system", label: "Design system" },
  { id: "downloads", label: "Downloads" },
] as const;

type ChapterId = (typeof chapters)[number]["id"];

/** Page-local chapter navigation, presented as a disclosure on small screens. */
export function ChapterNav() {
  const [active, setActive] = useState<ChapterId>(chapters[0].id);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = chapters
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id as ChapterId);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className={styles.nav} aria-label="On this page">
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="brand-chapter-links"
        onClick={() => setOpen((value) => !value)}
      >
        On this page
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      <strong className={styles.title}>On this page</strong>
      <ol id="brand-chapter-links" className={styles.links} data-open={open}>
        {chapters.map(({ id, label }, index) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              onClick={() => {
                setActive(id);
                setOpen(false);
              }}
            >
              <span aria-hidden>{String(index + 1).padStart(2, "0")}</span>
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
