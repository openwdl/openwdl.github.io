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
