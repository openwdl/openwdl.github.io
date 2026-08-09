import type { SetupState, ChecklistStep, InstallOption } from "./types";
import type {
  EngineId,
  InstallMethod,
  CommandInstruction,
  CatalogService,
  SetupCatalog,
} from "../catalog/types";
import { deriveEngineRecommendation } from "./recommend";
import { FIRST_WORKFLOW_SLUG } from "./constants";

/**
 * Derives a short human-readable label for an install method from the first
 * command in that method.  Falls back to `"Option <n>"` for unrecognised tools.
 */
function methodLabel(method: InstallMethod, index: number): string {
  const cmd = method.commands[0]?.command ?? "";
  if (cmd.startsWith("brew ")) return "Homebrew";
  if (cmd.startsWith("cargo ")) return "Cargo";
  if (cmd.startsWith("pip3 ") || cmd.startsWith("pip ")) return "pip";
  if (cmd.startsWith("apt-get ") || cmd.startsWith("apt ")) return "apt";
  return `Option ${index + 1}`;
}

/**
 * Builds the five-step install checklist for a wizard state that has
 * `environment`, `editor`, and `os` fully resolved, plus the computed engine.
 *
 * Steps are returned in canonical order:
 * `prerequisites` → `engine` → `editor` → `verify` → `first-workflow`.
 *
 * Content for each step is drawn exclusively from the {@link SetupCatalog}; the
 * only string not sourced from the catalog is the first-workflow tutorial link,
 * which is read from {@link FIRST_WORKFLOW_SLUG}.
 *
 * When multiple install methods exist for the given OS (e.g. Homebrew and Cargo
 * on macOS for Sprocket), the engine step exposes every option via
 * `installOptions`, preserving each method's commands, verification,
 * prerequisites, and upstream link with a labelled entry.
 *
 * @throws {Error} if `engine` does not match the recommendation derived from
 * `state` and `catalog`.  This prevents silently generating a checklist for the
 * wrong engine.
 */
export function buildInstallChecklist(
  state: Required<Pick<SetupState, "environment" | "editor" | "os">> & SetupState,
  engine: EngineId,
  catalog: SetupCatalog,
): ChecklistStep[] {
  // ── Cross-validate explicit engine against state derivation ──────────────
  const rec = deriveEngineRecommendation(state, catalog);
  if (rec.kind !== "recommendation") {
    throw new Error(
      `Cannot build checklist: state ${JSON.stringify(state)} produces no engine recommendation.`,
    );
  }
  if (rec.engine !== engine) {
    throw new Error(
      `Engine mismatch: state implies "${rec.engine}" but received "${engine}". ` +
        `Pass the correct engine to buildInstallChecklist.`,
    );
  }
  const serviceId = rec.service;

  const { editor, os } = state;
  const catalogEngine = catalog.engines[engine];
  const catalogEditor = catalog.editors[editor];
  const catalogService: CatalogService | undefined = serviceId
    ? catalog.services[serviceId]
    : undefined;

  // All install methods for this engine on the selected OS.
  const installMethods = catalogEngine.install.filter((m) => m.os === os);
  const isManagedService = catalogService?.role === "managed-service";

  // ── prerequisites ──────────────────────────────────────────────────────────
  const prerequisiteInstructions: string[] = [];
  if (!isManagedService) {
    // Deduplicate prerequisites across all applicable install methods.
    const allPrereqs = installMethods.flatMap((m) => m.prerequisites);
    prerequisiteInstructions.push(...[...new Set(allPrereqs)]);
  }
  if (catalogService) {
    prerequisiteInstructions.push(...catalogService.securityPrerequisites);
  }

  // ── engine ─────────────────────────────────────────────────────────────────
  const engineTitle =
    isManagedService && catalogService
      ? `Access ${catalogService.label}`
      : `Install ${catalogEngine.label}`;
  const engineInstructions: string[] = [];

  // Flatten commands from all install methods so existing single-command tests
  // still pass; structured per-method options are exposed via installOptions.
  const engineCommands: CommandInstruction[] =
    !isManagedService ? installMethods.flatMap((m) => m.commands) : [];

  const engineLinks: { label: string; href: string }[] = [];

  if (isManagedService && catalogService) {
    engineInstructions.push(
      `Sign into ${catalogService.label} to access workflow execution.`,
    );
    if (catalogService.verificationUrl) {
      engineLinks.push({
        label: `Open ${catalogService.label}`,
        href: catalogService.verificationUrl,
      });
    }
    if (catalogService.docsUrl) {
      engineLinks.push({ label: "Documentation", href: catalogService.docsUrl });
    }
  } else if (catalogEngine.docsUrl) {
    engineLinks.push({ label: "Documentation", href: catalogEngine.docsUrl });
  }

  // Surface all install options when multiple methods exist for this OS.
  const installOptions: InstallOption[] | undefined =
    !isManagedService && installMethods.length > 1
      ? installMethods.map((m, i) => ({
          label: methodLabel(m, i),
          prerequisites: m.prerequisites,
          commands: m.commands,
          verification: m.verification,
          upstreamUrl: m.upstreamUrl,
        }))
      : undefined;

  // ── editor ─────────────────────────────────────────────────────────────────
  const editorLinks: { label: string; href: string }[] = [];
  if (catalogEditor.installUrl) {
    editorLinks.push({ label: `Install ${catalogEditor.label}`, href: catalogEditor.installUrl });
  }

  // ── verify ─────────────────────────────────────────────────────────────────
  const verifyInstructions: string[] = [catalogEditor.verification];
  const verifyCommands: CommandInstruction[] = [];
  const verifyLinks: { label: string; href: string }[] = [];

  if (isManagedService && catalogService) {
    if (catalogService.verificationUrl) {
      verifyInstructions.unshift(
        `Sign in at ${catalogService.verificationUrl} to confirm your account and billing project are active.`,
      );
      verifyLinks.push({
        label: `Open ${catalogService.label}`,
        href: catalogService.verificationUrl,
      });
    }
  } else if (catalogService && catalogService.verification.length > 0) {
    verifyCommands.push(...catalogService.verification);
  } else {
    // Deduplicate verification commands across all install methods.
    const seen = new Set<string>();
    for (const m of installMethods) {
      for (const cmd of m.verification) {
        if (!seen.has(cmd.command)) {
          seen.add(cmd.command);
          verifyCommands.push(cmd);
        }
      }
    }
  }

  // ── first-workflow ─────────────────────────────────────────────────────────

  return [
    {
      id: "prerequisites",
      title: "Prerequisites",
      instructions: prerequisiteInstructions,
      commands: [],
      links: [],
    },
    {
      id: "engine",
      title: engineTitle,
      instructions: engineInstructions,
      commands: engineCommands,
      links: engineLinks,
      ...(installOptions !== undefined && { installOptions }),
    },
    {
      id: "editor",
      title: `Configure ${catalogEditor.label}`,
      instructions: [catalogEditor.verification],
      commands: [],
      links: editorLinks,
    },
    {
      id: "verify",
      title: "Verify your setup",
      instructions: verifyInstructions,
      commands: verifyCommands,
      links: verifyLinks,
    },
    {
      id: "first-workflow",
      title: "Run your first WDL workflow",
      instructions: ["Follow the tutorial to write and run your first WDL workflow."],
      commands: [],
      links: [{ label: "Your First WDL Workflow", href: FIRST_WORKFLOW_SLUG }],
    },
  ];
}
