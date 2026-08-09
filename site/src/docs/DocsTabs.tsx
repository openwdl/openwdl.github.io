import React, { type ReactNode } from "react";
import { Tabs, type TabItem } from "@openwdl/ui";

/** Hast element properties shape — a subset of the `hast` Element type. */
interface HastProperties {
  label?: string;
  [key: string]: unknown;
}

/** The subset of props we read from react-markdown children. */
interface MarkdownChildProps {
  /** Tab label set by the data-attribute directive mapping. */
  "data-label"?: string;
  node?: { properties?: HastProperties };
  children?: ReactNode;
}

/**
 * Extracts tab entries from react-markdown component children.
 * Each child element carries its hast node in `props.node`; the label is
 * read from `node.properties.label` set by the markdownDirectives plugin.
 */
function extractTabs(children: ReactNode): Array<{ label: string; children: ReactNode }> {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child)) return [];
    const props = child.props as MarkdownChildProps;
    // Prefer data-label (data-attribute directive approach); fall back to
    // node.properties.label for any legacy custom-element usage.
    const label = String(
      props["data-label"] ?? props.node?.properties?.["label"] ?? "",
    );
    if (!label) return [];
    return [{ label, children: props.children }];
  });
}

/** Slugifies a label into an id fragment; labels with no usable characters fall back to the index. */
function slugify(label: string, idx: number): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || String(idx);
}

/**
 * Adapts `:::tabs` / `:::tab{label=...}` markdown directives onto the kit's
 * `Tabs` widget. Children that carry no label are not tabs, so a group with
 * none of them degrades to a plain wrapper instead of an empty tablist.
 */
export function DocsTabs({ children }: { children?: ReactNode }) {
  const tabs = extractTabs(children);

  if (tabs.length === 0) {
    return <div>{children}</div>;
  }

  // Label-derived ids keep panel ids stable across renders; repeated labels
  // within one group get a numeric suffix so ids stay unique.
  const used = new Set<string>();
  const items: TabItem[] = tabs.map(({ label, children: content }, idx) => {
    const base = slugify(label, idx);
    let id = base;
    for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
    used.add(id);
    return { id, label, content };
  });

  return <Tabs items={items} />;
}
