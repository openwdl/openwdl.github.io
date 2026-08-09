import type { WizardStage } from "../model/types";
import styles from "./Wizard.module.css";

/** Props for {@link WizardProgress}. */
export interface WizardProgressProps {
  /** The stage currently being viewed. */
  current: WizardStage;
  /** Stages that have been completed; used to apply completion styling. */
  completed: WizardStage[];
}

const STAGES: readonly { id: WizardStage; label: string }[] = [
  { id: "environment", label: "Environment" },
  { id: "engine", label: "Engine" },
  { id: "editor", label: "Editor" },
  { id: "install", label: "Install" },
];

/**
 * Stable four-segment progress indicator for the setup wizard.
 *
 * Renders as an accessible navigation landmark (`<nav>`) containing an
 * ordered list of the four wizard stages. The current stage is annotated
 * with `aria-current="step"`.
 */
export function WizardProgress({ current, completed }: WizardProgressProps) {
  return (
    <nav aria-label="Setup progress" className={styles.progress}>
      <ol className={styles.progressList}>
        {STAGES.map(({ id, label }, index) => {
          const isCurrent = id === current;
          const isDone = completed.includes(id);
          const cls = [
            styles.progressStep,
            isCurrent && styles.progressCurrent,
            isDone && styles.progressDone,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li
              key={id}
              className={cls}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className={styles.srOnly}>Stage {index + 1} of {STAGES.length}: </span>
              {label}
              {isDone && <span className={styles.srOnly}> (completed)</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
