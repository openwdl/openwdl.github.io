import { useEffect, useRef, useState } from "react";
import { Code } from "@openwdl/ui";
import type { DocHeading } from "../../scripts/docs/types";
import styles from "./DocsToc.module.css";

/** Props for {@link DocsToc}. */
export interface DocsTocProps {
  /** Headings extracted from the current page. */
  headings: DocHeading[];
  /** Optional element id, used by mobile `aria-controls` references. */
  id?: string;
  /** When provided, sets `data-open` on the nav element for CSS-driven
   *  mobile visibility wired to disclosure state. */
  open?: boolean;
}

/**
 * Sticky "On this page" table of contents rendered from the page's extracted
 * headings. Only depth-2 and depth-3 headings are included.
 */
export function DocsToc({ headings, id, open }: DocsTocProps) {
  const tocHeadings = headings.filter((h) => h.depth === 2 || h.depth === 3);
  const headingIds = tocHeadings.map((heading) => heading.id).join("\n");
  const [activeId, setActiveId] = useState(tocHeadings[0]?.id);
  const tocRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const elements = headingIds
      .split("\n")
      .filter(Boolean)
      .map((headingId) => document.getElementById(headingId))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    setActiveId(elements[0].id);
    if (!("IntersectionObserver" in window)) return;

    const stickyTop = tocRef.current
      ? Number.parseFloat(window.getComputedStyle(tocRef.current).top)
      : 0;
    const activationLine = Number.isFinite(stickyTop) ? stickyTop + 16 : 0;
    const updateActiveHeading = () => {
      let nextId = elements[0].id;
      for (const element of elements) {
        if (element.getBoundingClientRect().top > activationLine) break;
        nextId = element.id;
      }
      setActiveId(nextId);
    };

    const observer = new IntersectionObserver(updateActiveHeading, {
      rootMargin: `${-activationLine}px 0px -70% 0px`,
    });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headingIds]);

  return (
    <nav
      ref={tocRef}
      id={id}
      aria-label="On this page"
      className={styles.toc}
      data-open={open !== undefined ? String(open) : undefined}
    >
      {tocHeadings.length > 0 && (
        <>
          <div className={styles.label}>On this page</div>
          <ul className={styles.list}>
            {tocHeadings.map((h) => (
              <li
                key={h.id}
                className={[
                  styles.item,
                  h.depth === 3 ? styles.nested : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <a
                  href={`#${h.id}`}
                  className={styles.link}
                  aria-current={h.id === activeId ? "location" : undefined}
                >
                  {h.parts?.map((part, index) =>
                    part.type === "code" ? (
                      <Code key={index} className={styles.codeLiteral}>
                        {part.value}
                      </Code>
                    ) : (
                      <span key={index}>{part.value}</span>
                    ),
                  ) ?? h.text}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </nav>
  );
}
