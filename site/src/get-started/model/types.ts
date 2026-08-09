import type {
  EngineId,
  ServiceId,
  SchedulerId,
  EditorId,
  OsId,
  CommandInstruction,
} from "../catalog/types";

/**
 * The complete set of user-supplied answers that drive the setup wizard.
 *
 * All fields are optional so that the wizard can accept a partially completed
 * state on every render and compute the next screen to display.
 */
export interface SetupState {
  /** Whether workflows run locally, on an HPC cluster, or in the cloud. */
  environment?: "local" | "hpc" | "cloud";
  /** The HPC job scheduler in use; only relevant when environment is "hpc". */
  scheduler?: SchedulerId;
  /** The cloud service or execution backend; only relevant when environment is "cloud". */
  service?: "terra" | "aws-batch" | "other";
  /** Whether the user will self-host a WDL engine on their cloud infrastructure. */
  selfHost?: boolean;
  /** The code editor or IDE the user wants to use for WDL authoring. */
  editor?: EditorId;
  /** The operating system on which the engine and editor will be installed. */
  os?: OsId;
}

/**
 * The four ordered phases of the setup wizard.
 *
 * - `"environment"` – questions about where and how workflows will run.
 * - `"engine"` – the computed engine recommendation (or unsupported verdict).
 * - `"editor"` – editor and IDE selection. This stage is present to support
 *   stable four-step UI progress tracking. The pure state machine
 *   (`getWizardScreen`) does not emit screens with `stage: "editor"` directly;
 *   after the user acknowledges the engine recommendation, the orchestrating
 *   UI advances to editor selection using UI-local progression before
 *   re-entering the state machine with `editor` set.
 * - `"install"` – OS selection and the five-step install checklist.
 */
export type WizardStage = "environment" | "engine" | "editor" | "install";

/**
 * The discriminated union of every screen the setup wizard can display.
 *
 * - `"question"` – prompts the user to supply or change one `SetupState` field.
 * - `"recommendation"` – presents the computed engine (and optional service).
 * - `"unsupported"` – explains why the current configuration has no wizard path;
 *   always carries `stage: "engine"` because unsupported verdicts are only
 *   produced at engine-derivation time. No pure state produces an unsupported
 *   verdict at install time.
 * - `"checklist"` – the five-step install checklist for a completed state.
 */
export type WizardScreen =
  | { kind: "question"; stage: WizardStage; key: keyof SetupState; heading: string }
  | { kind: "recommendation"; stage: "engine"; engine: EngineId; service?: ServiceId }
  | { kind: "unsupported"; stage: "engine"; reason: string }
  | { kind: "checklist"; stage: "install"; engine: EngineId; steps: ChecklistStep[] };

/**
 * One concrete installation option within the engine checklist step.
 *
 * When multiple install methods exist for an OS (e.g. Homebrew and Cargo on
 * macOS), each is surfaced as a separate `InstallOption` so the user can
 * choose the approach that fits their environment. Single-method cases omit
 * the parent `installOptions` field entirely.
 */
export interface InstallOption {
  /** Short human-readable label distinguishing this option (e.g. "Homebrew", "Cargo"). */
  label: string;
  /** Prerequisites that must be satisfied before using this install method. */
  prerequisites: string[];
  /** Ordered commands that install the engine using this method. */
  commands: CommandInstruction[];
  /** Commands that confirm the engine is installed and functional. */
  verification: CommandInstruction[];
  /** Canonical upstream URL for this install method. */
  upstreamUrl: string;
}

/**
 * One step in the five-step install checklist shown at the end of the wizard.
 *
 * Steps are always emitted in the order:
 * `prerequisites` → `engine` → `editor` → `verify` → `first-workflow`.
 */
export interface ChecklistStep {
  /** Stable identifier for this step. */
  id: "prerequisites" | "engine" | "editor" | "verify" | "first-workflow";
  /** Short human-readable title for the step. */
  title: string;
  /** Ordered prose instructions for this step. */
  instructions: string[];
  /** Shell commands the user must run to complete this step. */
  commands: CommandInstruction[];
  /** Reference links relevant to this step. */
  links: { label: string; href: string }[];
  /**
   * Available installation options for the engine step when multiple install
   * methods exist for the current OS (e.g. Homebrew and Cargo on macOS).
   * Absent when only one method applies. Only populated on the `"engine"` step.
   */
  installOptions?: InstallOption[];
}
