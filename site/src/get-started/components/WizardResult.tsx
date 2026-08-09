import { Button } from "@openwdl/ui";
import type { RefObject } from "react";
import type { SetupState, WizardScreen } from "../model/types";
import { buildSetupIssueUrl } from "../model/issue";
import styles from "./Wizard.module.css";

/** Props for a recommendation result screen. */
export interface WizardResultRecommendationProps {
  screen: Extract<WizardScreen, { kind: "recommendation" }>;
  /** Human-readable engine name (e.g. "Sprocket"). */
  engineLabel: string;
  /** Human-readable service name (e.g. "Terra"). Present only when a service is included. */
  serviceLabel?: string;
  /** Why this engine is recommended. */
  rationale: string;
  /** Prerequisites to satisfy before installation. */
  prerequisites: string[];
  /** Upstream URL for the engine documentation or repository. */
  engineUrl: string;
  /** URL for the cloud service. Present only when a service is included. */
  serviceUrl?: string;
  /** Called when Continue is pressed. */
  onContinue: () => void;
  /** Called when Back is pressed. */
  onBack(): void;
  /**
   * Ref attached to the engine-name heading for programmatic focus management.
   * The orchestrating component provides this to move focus on screen transitions.
   */
  headingRef?: RefObject<HTMLHeadingElement>;
}

/** Props for an unsupported result screen. */
export interface WizardResultUnsupportedProps {
  screen: Extract<WizardScreen, { kind: "unsupported" }>;
  /** Wizard state used to build the "File a setup request" issue URL. */
  state: SetupState;
  /** Human-readable summary of the answers the user provided. */
  acceptedAnswers?: Array<{ label: string; value: string }>;
  /** Called when Back or Change answers is pressed. */
  onBack(): void;
  /**
   * Ref attached to the heading for programmatic focus management.
   * The orchestrating component provides this to move focus on screen transitions.
   */
  headingRef?: RefObject<HTMLHeadingElement>;
}

/**
 * Discriminated union of props for {@link WizardResult}.
 *
 * Using the `screen.kind` discriminant ensures recommendation-only props
 * (engineLabel, rationale, …) and unsupported-only props (state, acceptedAnswers)
 * cannot be mixed incorrectly at the type level.
 */
export type WizardResultProps =
  | WizardResultRecommendationProps
  | WizardResultUnsupportedProps;

/** Narrows props to a recommendation result screen. */
function isRecommendationProps(
  props: WizardResultProps,
): props is WizardResultRecommendationProps {
  return props.screen.kind === "recommendation";
}

/**
 * Stateless result screen for the setup wizard.
 *
 * - **recommendation** — shows the engine (and optional service), rationale,
 *   prerequisites, upstream links, and a Continue button.
 * - **unsupported** — shows the fixed headline
 *   "We don't have a supported setup for this yet.", the user's accepted
 *   answers, a Change answers button, and an external "File a setup request"
 *   anchor whose `href` is built by {@link buildSetupIssueUrl}.
 */
export function WizardResult(props: WizardResultProps) {
  if (isRecommendationProps(props)) {
    const {
      engineLabel,
      serviceLabel,
      rationale,
      prerequisites,
      engineUrl,
      serviceUrl,
      onContinue,
      onBack,
      headingRef,
    } = props;

    return (
      <div className={styles.result}>
        <div className={styles.engineMeta}>
          <h2 ref={headingRef} tabIndex={-1} className={styles.resultHeading}>{engineLabel}</h2>
          {serviceLabel && (
            <p className={styles.serviceLabel}>{serviceLabel}</p>
          )}
        </div>

        <p className={styles.rationale}>{rationale}</p>

        {prerequisites.length > 0 && (
          <ul className={styles.prerequisites}>
            {prerequisites.map((prereq, i) => (
              <li key={`${prereq}-${i}`}>{prereq}</li>
            ))}
          </ul>
        )}

        <div className={styles.resultLinks}>
          <a
            href={engineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.resultLink}
          >
            Engine documentation
          </a>
          {serviceUrl && (
            <a
              href={serviceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.resultLink}
            >
              Service documentation
            </a>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            className={styles.touchTarget}
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            type="button"
            className={styles.touchTarget}
            onClick={onContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // ── Unsupported ────────────────────────────────────────────────────────────
  const { state, acceptedAnswers, onBack, headingRef } = props;
  const issueUrl = buildSetupIssueUrl(state);

  return (
    <div className={styles.result}>
      <h2 ref={headingRef} tabIndex={-1} className={styles.unsupportedHeading}>
        We don&apos;t have a supported setup for this yet.
      </h2>

      {acceptedAnswers && acceptedAnswers.length > 0 && (
        <ul className={styles.acceptedAnswers}>
          {acceptedAnswers.map(({ label, value }) => (
            <li key={label} className={styles.acceptedAnswer}>
              <span className={styles.acceptedAnswerLabel}>{label}: </span>
              {value}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.unsupportedActions}>
        <Button
          type="button"
          variant="secondary"
          className={styles.touchTarget}
          onClick={onBack}
        >
          Change answers
        </Button>
        <Button
          as="a"
          href={issueUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          className={styles.touchTarget}
        >
          File a setup request
        </Button>
      </div>
    </div>
  );
}
