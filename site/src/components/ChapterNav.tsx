import { useState } from "react";
import { Disclosure, useActiveHeading } from "@openwdl/ui";
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

const chapterIds = chapters.map(({ id }) => id);

/** Id of the chapter list, revealed by the small-screen disclosure. */
const LINKS_ID = "brand-chapter-links";

/**
 * Page-local chapter navigation. The list is a sticky rail on wide screens
 * and collapses behind a disclosure below 1100px; the wrapper owns that
 * breakpoint policy because the kit `Disclosure` renders unconditionally.
 *
 * The current chapter comes from the shared `useActiveHeading` scroll-spy at
 * its default activation line.
 */
export function ChapterNav() {
  const [open, setOpen] = useState(false);
  const active = useActiveHeading(chapterIds);

  return (
    <nav className={styles.nav} aria-label="On this page">
      <div className={styles.disclosure}>
        <Disclosure
          controlsId={LINKS_ID}
          label="On this page"
          open={open}
          onToggle={() => setOpen((value) => !value)}
        />
      </div>
      <strong className={styles.title}>On this page</strong>
      <ol id={LINKS_ID} className={styles.links} data-open={open}>
        {chapters.map(({ id, label }, index) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
              onClick={() => setOpen(false)}
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
