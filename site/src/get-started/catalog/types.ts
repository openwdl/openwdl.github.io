/**
 * Identifies a supported WDL execution engine in the setup catalog.
 */
export type EngineId = "sprocket" | "cromwell" | "miniwdl";

/**
 * Identifies a managed or cloud execution service in the setup catalog.
 */
export type ServiceId = "terra" | "aws-batch" | "planetary";

/**
 * Identifies a high-performance computing job scheduler in the setup catalog.
 */
export type SchedulerId = "slurm" | "lsf" | "other";

/**
 * Identifies a supported code editor or IDE in the setup catalog.
 */
export type EditorId =
  | "vscode"
  | "neovim"
  | "generic-lsp"
  | "jetbrains"
  | "vim"
  | "emacs"
  | "sublime"
  | "cli-only";

/**
 * Identifies a supported operating system target for install methods.
 */
export type OsId = "macos" | "linux" | "windows-wsl";

/**
 * Identifies a supported shell for command instructions.
 */
export type ShellId = "bash" | "zsh" | "powershell";

/**
 * A single executable command with its shell, literal text, and human-readable
 * explanation for display in the wizard UI.
 */
export interface CommandInstruction {
  /** The shell in which this command must be run. */
  shell: ShellId;
  /** The literal command string to execute. */
  command: string;
  /** A sentence explaining what the command does. */
  explanation: string;
}

/**
 * One concrete installation path for an engine on a given operating system,
 * including prerequisites, installation commands, and verification steps.
 */
export interface InstallMethod {
  /** The operating system this installation path targets. */
  os: OsId;
  /** Human-readable prerequisites that must be satisfied before installing. */
  prerequisites: string[];
  /** Ordered commands that install the engine. */
  commands: CommandInstruction[];
  /** Commands that confirm the engine is installed and functional. */
  verification: CommandInstruction[];
  /** The canonical upstream URL for this install method (e.g. a release page or repository). */
  upstreamUrl: string;
}

/**
 * Describes a WDL execution engine that may appear in the setup wizard,
 * including eligibility, metadata, and per-OS installation instructions.
 */
export interface CatalogEngine {
  /** The stable machine-readable engine identifier. */
  id: EngineId;
  /** The human-readable engine name shown in the wizard UI. */
  label: string;
  /** Whether this engine is currently eligible to appear as a selectable option. */
  eligible: boolean;
  /** Explanation for the eligibility decision, shown in documentation. */
  rationale: string;
  /** The organisation or individual that maintains the engine. */
  owner: string;
  /** URL to the engine's official documentation. */
  docsUrl: string;
  /** URL to the engine's upstream source repository or release page. */
  upstreamUrl: string;
  /** Per-OS installation methods. Must be non-empty for eligible engines. */
  install: InstallMethod[];
}

/**
 * Describes a managed cloud service or execution backend that orchestrates
 * WDL workflows using an underlying engine.
 */
export interface CatalogService {
  /** The stable machine-readable service identifier. */
  id: ServiceId;
  /** Classifies the service as a fully managed platform or a cloud execution backend. */
  role: "managed-service" | "execution-service";
  /** The human-readable service name shown in the wizard UI. */
  label: string;
  /** Whether this service is currently eligible to appear as a selectable option. */
  eligible: boolean;
  /** The engine that powers this service. */
  engine: EngineId;
  /** The organisation or individual that maintains the service. */
  owner: string;
  /** URL to the service's official documentation. */
  docsUrl: string;
  /** URL to the service's upstream repository or landing page. */
  upstreamUrl: string;
  /** Cloud providers on which this service operates. */
  supportedClouds: string[];
  /** Security requirements the user must satisfy before using this service. */
  securityPrerequisites: string[];
  /** Commands that confirm the service is accessible and configured. */
  verification: CommandInstruction[];
  /**
   * URL to open in a browser to verify access for managed services that have
   * no CLI. Eligible managed services may satisfy the verification requirement
   * with this field instead of (or in addition to) `verification` commands.
   */
  verificationUrl?: string;
}

/**
 * Describes a code editor or IDE integration for WDL authoring, including
 * eligibility, supported platforms, and verification instructions.
 */
export interface CatalogEditor {
  /** The stable machine-readable editor identifier. */
  id: EditorId;
  /** The human-readable editor name shown in the wizard UI. */
  label: string;
  /** Whether this editor has vetted installation instructions and is selectable. */
  eligible: boolean;
  /** Operating systems on which this editor is supported. */
  supportedOs: OsId[];
  /** URL to the editor extension or plugin page. */
  installUrl: string;
  /** A description or command that confirms the WDL integration is functional. */
  verification: string;
  /** Optional CLI fallback command used when the editor integration is ineligible. */
  fallbackCommand?: string;
}

/**
 * The complete typed catalog of WDL engines, cloud services, and editor
 * integrations available to the get-started wizard.
 */
export interface SetupCatalog {
  /** All supported WDL execution engines, keyed by their stable ID. */
  engines: Record<EngineId, CatalogEngine>;
  /** All supported cloud services and execution backends, keyed by their stable ID. */
  services: Record<ServiceId, CatalogService>;
  /** All supported editor integrations, keyed by their stable ID. */
  editors: Record<EditorId, CatalogEditor>;
}

/**
 * A single validation problem found in a {@link SetupCatalog}, identified by
 * a dot-notation path to the offending field.
 */
export interface CatalogIssue {
  /** Dot-notation path to the field that failed validation (e.g. "engines.sprocket.owner"). */
  path: string;
  /** Human-readable description of the problem. */
  message: string;
}
