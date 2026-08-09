import { useState, type ReactNode } from "react";
import styles from "./DocsDisclosure.module.css";

interface DocsDisclosureBase {
  /** ID of the controlled element (used for `aria-controls` and the panel). */
  controlsId: string;
  /** Button label. */
  label: string;
  /**
   * Content to show/hide inside the inline panel. Optional: when omitted the
   * component renders only the toggle button (for referencing an external
   * element via `controlsId`).
   */
  children?: ReactNode;
}

/**
 * Props for {@link DocsDisclosure}.
 *
 * Two exclusive modes:
 * - **Uncontrolled** (default): omit both `open` and `onToggle`; the component
 *   manages its own open/closed state.
 * - **Controlled**: supply both `open` (required) and `onToggle` (required);
 *   the parent owns state. TypeScript enforces that `open` cannot be provided
 *   without `onToggle`.
 */
export type DocsDisclosureProps =
  | (DocsDisclosureBase & { open?: never; onToggle?: never })
  | (DocsDisclosureBase & { open: boolean; onToggle: () => void });

/**
 * Disclosure widget: a native button with `aria-expanded` / `aria-controls`
 * that reveals its children inline. Supports both uncontrolled (internal
 * state) and controlled (`open` + `onToggle` props) modes. Hidden at the
 * desktop breakpoint via CSS.
 */
export function DocsDisclosure({
  controlsId,
  label,
  children,
  open: controlledOpen,
  onToggle,
}: DocsDisclosureProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen((o) => !o);
    }
  };

  return (
    <div className={styles.disclosure}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={controlsId}
        className={styles.toggle}
        onClick={handleToggle}
      >
        {label}
        <span className={styles.chevron} aria-hidden="true">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {children !== undefined && (
        <div id={controlsId} hidden={!open} className={styles.panel}>
          {children}
        </div>
      )}
    </div>
  );
}
