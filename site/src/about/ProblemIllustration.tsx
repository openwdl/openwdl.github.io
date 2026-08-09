import styles from "./AboutPage.module.css";

/** Homepage problem represented by a technical diagram. */
export type ProblemIllustrationKind =
  | "understand"
  | "hand-off"
  | "scale"
  | "move";

interface ProblemIllustrationProps {
  kind: ProblemIllustrationKind;
}

/** Decorative diagram for one way an analysis outgrows its scripts. */
export function ProblemIllustration({ kind }: ProblemIllustrationProps) {
  return (
    <svg
      className={styles.problemIllustration}
      data-problem-illustration={kind}
      viewBox="0 0 64 44"
      aria-hidden="true"
      focusable="false"
    >
      {kind === "understand" && (
        <>
          <rect x="1" y="1" width="14" height="11" rx="2" />
          <rect x="49" y="1" width="14" height="11" rx="2" />
          <rect x="1" y="32" width="14" height="11" rx="2" />
          <rect x="49" y="32" width="14" height="11" rx="2" />
          <path
            d="m15 6.5 34 31M15 37.5l34-31"
            strokeDasharray="3 3"
          />
        </>
      )}
      {kind === "hand-off" && (
        <>
          <rect x="1" y="1" width="24" height="42" rx="2" />
          <path d="M6 12h14M6 20h10M6 28h13" />
          <path
            data-transfer-arrow
            d="M29 22h6m-2.5-2.5L35 22l-2.5 2.5"
          />
          <rect
            x="39"
            y="1"
            width="24"
            height="42"
            rx="2"
            strokeDasharray="3 3"
          />
          <path d="M44 12h9" />
        </>
      )}
      {kind === "scale" && (
        <>
          <rect x="1" y="15" width="16" height="14" rx="2" />
          <path
            data-scale-branches
            d="M17 22h8M25 5v33M25 5h14M25 16h14M25 27h14M25 38h14"
          />
          <rect x="39" y="1" width="24" height="8" rx="2" />
          <rect x="39" y="12" width="24" height="8" rx="2" />
          <rect x="39" y="23" width="24" height="8" rx="2" />
          <rect
            x="39"
            y="34"
            width="24"
            height="8"
            rx="2"
            strokeDasharray="3 3"
          />
        </>
      )}
      {kind === "move" && (
        <>
          <rect x="1" y="1" width="24" height="42" rx="2" />
          <path d="M1 11h24" />
          <rect x="6" y="17" width="14" height="8" rx="1.5" />
          <rect x="6" y="32" width="14" height="8" rx="1.5" />
          <path d="M13 25v7" />
          <path
            data-transfer-arrow
            d="M29 22h6m-2.5-2.5L35 22l-2.5 2.5"
          />
          <rect
            x="39"
            y="1"
            width="24"
            height="42"
            rx="2"
            strokeDasharray="3 3"
          />
          <path d="M39 11h24" strokeDasharray="3 3" />
        </>
      )}
    </svg>
  );
}
