import { Code } from "@openwdl/ui";
import type { TocItem } from "../../content/tableOfContents";

/** Props for {@link ArticleToc}. */
export interface ArticleTocProps {
  /** Headings to link to, in document order. */
  items: readonly TocItem[];
  /** Additional class name applied to the root `<ol>`. */
  className?: string;
}

/**
 * Renders an article's table of contents as a flat, ordered list of links
 * to each heading's `id`. Depth-three items get a `data-depth="3"` marker
 * so the caller can indent them without needing a second component. Renders
 * nothing when there are no headings to link to.
 *
 * Deliberately *not* the kit `Toc`. A blog post renders its outline twice
 * from one heading list — collapsed inside the mobile `Disclosure` and again
 * as the desktop rail — and the kit component is a self-labelling `<nav>`
 * landmark with scroll-spy, so two of them would mean two landmarks sharing
 * one accessible name and two scroll-spies over the same headings. This is a
 * body fragment instead: no landmark, no label, no active-heading state,
 * which is also why the collapsed mobile copy costs nothing. The editorial
 * rail is styled by `BlogPostPage.module.css`, not by the docs chrome (no
 * surface, no border rail, no full-viewport scroll region) that `Toc` bakes
 * in.
 */
export function ArticleToc({ items, className }: ArticleTocProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ol className={className}>
      {items.map((item) => (
        <li key={item.id} data-depth={item.depth}>
          <a href={`#${item.id}`}>
            {item.labelParts?.map((part, index) => (
              part.code
                ? <Code key={index}>{part.value}</Code>
                : part.value
            )) ?? item.label}
          </a>
        </li>
      ))}
    </ol>
  );
}
