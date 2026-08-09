import type { RefObject } from "react";
import type { OsId } from "./catalog/types";
import type { SetupState, WizardScreen, WizardStage } from "./model/types";
import type { WizardOption } from "./components/WizardQuestion";
import { WizardQuestion } from "./components/WizardQuestion";
import styles from "./components/Wizard.module.css";

// ── Stage metadata ────────────────────────────────────────────────────────────

const STAGE_NUMBERS: Record<WizardStage, 1 | 2 | 3 | 4> = {
  environment: 1,
  engine: 2,
  editor: 3,
  install: 4,
};

// ── Question metadata ─────────────────────────────────────────────────────────

const QUESTION_DESCRIPTIONS: Record<string, string> = {
  environment: "Your answer determines which WDL engine we recommend.",
  scheduler: "Different schedulers have different levels of WDL engine support.",
  service: "The cloud service you use determines the engine and setup steps.",
  selfHost: "Self-hosting gives more control but requires additional setup.",
  os: "Choose the OS where you will install the engine and editor.",
};

const QUESTION_VALIDATION_LABELS: Record<string, string> = {
  os: "operating system",
  selfHost: "hosting option",
};

// ── Props ─────────────────────────────────────────────────────────────────────

/** Props for {@link WizardQuestionScreen}. */
export interface WizardQuestionScreenProps {
  /** The question screen to render. Must not have key === "editor" (handled inline in the orchestrator). */
  screen: Extract<WizardScreen, { kind: "question" }>;
  /** Current committed + uncommitted wizard answers. */
  state: SetupState;
  /** OS options filtered by the currently selected editor. */
  osOptions: WizardOption<OsId>[];
  /** Ref attached to the h2 heading for programmatic focus management. */
  headingRef: RefObject<HTMLHeadingElement>;
  /** Called when the user selects an option. */
  onAnswer(key: keyof SetupState, value: SetupState[keyof SetupState]): void;
  /** Called when the user clicks Continue. */
  onContinue(): void;
  /** Called when the user clicks Back. */
  onBack(): void;
}

/**
 * Renders the appropriate question form for the given question screen key.
 *
 * Handles all question keys except `"editor"`, which is rendered inline by the
 * orchestrating component (`GetStartedWizard`).  Contains only static option
 * data and rendering logic — no state, history, or side-effect logic.
 */
export function WizardQuestionScreen({
  screen,
  state,
  osOptions,
  headingRef,
  onAnswer,
  onContinue,
  onBack,
}: WizardQuestionScreenProps) {
  const { key, stage, heading } = screen;
  const stageNumber = STAGE_NUMBERS[stage];
  const description = QUESTION_DESCRIPTIONS[key] ?? "";
  const validationLabel = QUESTION_VALIDATION_LABELS[key];

  // The h2 is focusable for programmatic focus management on screen transitions
  // but is sr-only so the WizardQuestion fieldset legend is the single visible prompt.
  const headingEl = (
    <h2 ref={headingRef} tabIndex={-1} className={styles.srOnly}>
      {heading}
    </h2>
  );

  if (key === "environment") {
    const options: WizardOption<"local" | "hpc" | "cloud">[] = [
      {
        value: "local",
        label: "My computer",
        description: "Run workflows on your own hardware.",
      },
      {
        value: "hpc",
        label: "HPC cluster",
        description: "Submit jobs through a Slurm or LSF scheduler.",
      },
      {
        value: "cloud",
        label: "Cloud",
        description: "Use a managed cloud service or self-hosted backend.",
      },
    ];
    return (
      <>
        {headingEl}
        <WizardQuestion
          stage={stage}
          stageNumber={stageNumber}
          heading={heading}
          description={description}
          name="environment"
          options={options}
          value={state.environment}
          onChange={(v) => onAnswer("environment", v)}
          onContinue={onContinue}
          onBack={onBack}
        />
      </>
    );
  }

  if (key === "scheduler") {
    const options: WizardOption<"slurm" | "lsf" | "other">[] = [
      {
        value: "slurm",
        label: "Slurm",
        description: "Open-source cluster management and job scheduling.",
      },
      {
        value: "lsf",
        label: "LSF",
        description: "IBM Platform Load Sharing Facility.",
      },
      {
        value: "other",
        label: "Other scheduler",
        description: "Any other HPC job scheduling system.",
      },
    ];
    return (
      <>
        {headingEl}
        <WizardQuestion
          stage={stage}
          stageNumber={stageNumber}
          heading={heading}
          description={description}
          name="scheduler"
          options={options}
          value={state.scheduler}
          onChange={(v) => onAnswer("scheduler", v)}
          onContinue={onContinue}
          onBack={onBack}
        />
      </>
    );
  }

  if (key === "service") {
    const options: WizardOption<"terra" | "aws-batch" | "other">[] = [
      {
        value: "terra",
        label: "Terra",
        description: "Broad Institute's cloud data analysis platform.",
      },
      {
        value: "aws-batch",
        label: "AWS Batch",
        description: "Amazon's managed cloud batch computing service.",
      },
      {
        value: "other",
        label: "Other / Self-managed",
        description: "Any other cloud service or custom deployment.",
      },
    ];
    return (
      <>
        {headingEl}
        <WizardQuestion
          stage={stage}
          stageNumber={stageNumber}
          heading={heading}
          description={description}
          name="service"
          options={options}
          value={state.service}
          onChange={(v) => onAnswer("service", v)}
          onContinue={onContinue}
          onBack={onBack}
        />
      </>
    );
  }

  if (key === "selfHost") {
    const options: WizardOption<boolean>[] = [
      {
        value: true,
        label: "Yes, I will self-host",
        description:
          "Deploy and manage a WDL engine on your own cloud infrastructure.",
      },
      {
        value: false,
        label: "No, use a managed service",
        description: "Rely on a fully managed cloud service to run your workflows.",
      },
    ];
    return (
      <>
        {headingEl}
        <WizardQuestion
          stage={stage}
          stageNumber={stageNumber}
          heading={heading}
          description={description}
          name="selfHost"
          validationLabel={validationLabel}
          options={options}
          value={state.selfHost}
          onChange={(v) => onAnswer("selfHost", v)}
          onContinue={onContinue}
          onBack={onBack}
        />
      </>
    );
  }

  if (key === "os") {
    return (
      <>
        {headingEl}
        <WizardQuestion
          stage={stage}
          stageNumber={stageNumber}
          heading={heading}
          description={description}
          name="os"
          validationLabel={validationLabel}
          options={osOptions}
          value={state.os}
          onChange={(v) => onAnswer("os", v as OsId)}
          onContinue={onContinue}
          onBack={onBack}
        />
      </>
    );
  }

  return null;
}
