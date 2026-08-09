import { useState, useRef, useId, type ReactNode } from "react";
import React from "react";
import styles from "./DocsTabs.module.css";

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

/** Tablist, tab, and tabpanel keyboard contract for docs tab groups. */
export function DocsTabs({ children }: { children?: ReactNode }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const tablistRef = useRef<HTMLDivElement>(null);
  // Stable per-instance prefix so IDs are unique across multiple tab groups.
  const prefix = useId();
  const tabs = extractTabs(children);

  if (tabs.length === 0) {
    return <div className={styles.tabs}>{children}</div>;
  }

  const moveFocus = (next: number) => {
    setActiveIdx(next);
    const els = tablistRef.current?.querySelectorAll<HTMLElement>("[role='tab']");
    els?.[next]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const len = tabs.length;
    if (e.key === "ArrowRight") { e.preventDefault(); moveFocus((idx + 1) % len); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); moveFocus((idx - 1 + len) % len); }
    else if (e.key === "Home") { e.preventDefault(); moveFocus(0); }
    else if (e.key === "End") { e.preventDefault(); moveFocus(len - 1); }
  };

  return (
    <div className={styles.tabs}>
      <div role="tablist" ref={tablistRef} className={styles.tablist}>
        {tabs.map(({ label }, idx) => (
          <button
            key={`${idx}-${label}`}
            type="button"
            role="tab"
            id={`${prefix}-tab-${idx}`}
            aria-selected={idx === activeIdx}
            aria-controls={`${prefix}-panel-${idx}`}
            tabIndex={idx === activeIdx ? 0 : -1}
            className={styles.tab}
            onClick={() => setActiveIdx(idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            {label}
          </button>
        ))}
      </div>
      {tabs.map(({ label, children: tabChildren }, idx) => (
        <div
          key={`${idx}-${label}`}
          role="tabpanel"
          id={`${prefix}-panel-${idx}`}
          aria-labelledby={`${prefix}-tab-${idx}`}
          tabIndex={idx === activeIdx ? 0 : -1}
          className={styles.panel}
          hidden={idx !== activeIdx}
        >
          {tabChildren}
        </div>
      ))}
    </div>
  );
}
