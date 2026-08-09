import { useState, useEffect } from "react";
import type { WizardStage } from "../model/types";
import styles from "./Wizard.module.css";

/** One option in a wizard question. */
export interface WizardOption<T extends string | boolean> {
  value: T;
  label: string;
  description: string;
}

/** Props for {@link WizardQuestion}. */
export interface WizardQuestionProps<T extends string | boolean> {
  /** The wizard stage this question belongs to. */
  stage: WizardStage;
  /** 1-based position in the four-stage wizard. */
  stageNumber: 1 | 2 | 3 | 4;
  /** Visible heading rendered as the fieldset legend. */
  heading: string;
  /** Supporting description shown beneath the heading. */
  description: string;
  /** HTML `name` attribute shared by all radio inputs. */
  name: string;
  /**
   * User-facing noun phrase shown in the validation error (e.g. "environment",
   * "hosting option"). When omitted the `name` prop is used with camelCase
   * converted to spaced words so internal field names never appear verbatim in
   * user-visible copy.
   */
  validationLabel?: string;
  /** Available radio options. */
  options: WizardOption<T>[];
  /** Currently selected value. `undefined` when no selection has been made. */
  value?: T;
  /** Called with the new value when the user selects a radio. */
  onChange(value: T): void;
  /** Called when the user presses Continue with a valid selection. */
  onContinue(): void;
  /** Called when the user presses Back. Omit to hide the Back button. */
  onBack?: () => void;
}

/** Human-readable label for each wizard stage, used in the stage eyebrow. */
const STAGE_LABELS: Record<WizardStage, string> = {
  environment: "Environment",
  engine: "Engine",
  editor: "Editor",
  install: "Install",
};

/** Returns the grammatically correct article ("a" or "an") for the given word. */
function choiceArticle(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

/**
 * Converts a camelCase string to spaced lowercase words so internal field
 * names (e.g. `selfHost`) never appear verbatim in user-visible copy.
 */
function toDisplayLabel(name: string): string {
  return name.replace(/([A-Z])/g, " $1").toLowerCase().trim();
}

/**
 * One-question-at-a-time wizard screen using a native `<fieldset>` with a
 * visible `<legend>`, radio inputs, and per-option descriptions.
 *
 * Continue is always rendered as a focusable `<button>` (never `disabled`).
 * When no option has been selected `aria-disabled="true"` is set and clicking
 * the button surfaces an inline `role="alert"` rather than proceeding.
 * The alert is cleared immediately when the user selects a radio or when a
 * valid controlled value arrives.
 */
export function WizardQuestion<T extends string | boolean>({
  stage,
  stageNumber,
  heading,
  description,
  name,
  validationLabel,
  options,
  value,
  onChange,
  onContinue,
  onBack,
}: WizardQuestionProps<T>) {
  const [showValidation, setShowValidation] = useState(false);

  const hasValue = value !== undefined;

  // Clear the validation alert whenever a valid controlled value arrives.
  useEffect(() => {
    if (value !== undefined) {
      setShowValidation(false);
    }
  }, [value]);

  const handleChange = (newValue: T) => {
    setShowValidation(false);
    onChange(newValue);
  };

  const handleContinue = () => {
    if (!hasValue) {
      setShowValidation(true);
      return;
    }
    onContinue();
  };

  const displayLabel = validationLabel ?? toDisplayLabel(name);

  return (
    <div
      className={styles.question}
      data-stage={stage}
      data-stage-number={stageNumber}
    >
      <p className={styles.stageEyebrow}>
        Stage {stageNumber} of 4 · {STAGE_LABELS[stage]}
      </p>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{heading}</legend>
        {description && (
          <p className={styles.questionDescription}>{description}</p>
        )}
        <ul className={styles.options} role="list">
          {options.map((option) => {
            const strVal = String(option.value);
            const labelId = `${name}-${strVal}-label`;
            const descId = `${name}-${strVal}-desc`;
            return (
              <li key={strVal} className={styles.option}>
                <label className={styles.optionLabel}>
                  <input
                    type="radio"
                    name={name}
                    value={strVal}
                    checked={value === option.value}
                    onChange={() => handleChange(option.value)}
                    aria-labelledby={labelId}
                    aria-describedby={descId}
                    className={styles.optionRadio}
                  />
                  <span className={styles.optionText}>
                    <span id={labelId} className={styles.optionTitle}>
                      {option.label}
                    </span>
                    <span id={descId} className={styles.optionDescription}>
                      {option.description}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      {showValidation && (
        <p role="alert" className={styles.validation}>
          Choose {choiceArticle(displayLabel)} {displayLabel}
        </p>
      )}

      <div className={styles.actions}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={styles.backButton}
          >
            Back
          </button>
        )}
        <button
          type="button"
          aria-disabled={!hasValue ? "true" : undefined}
          onClick={handleContinue}
          className={styles.continueButton}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
