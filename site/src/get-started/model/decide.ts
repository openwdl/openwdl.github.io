import type { SetupState, WizardScreen } from "./types";
import type { SetupCatalog } from "../catalog/types";
import { buildInstallChecklist } from "./checklist";
import { deriveEngineRecommendation } from "./recommend";

/**
 * Returns the current wizard screen for the given partial setup state and catalog.
 *
 * The decision tree follows these stages in order:
 *
 * 1. **environment** – asks the user where workflows will run; dispatches to
 *    sub-questions (scheduler for HPC, service/selfHost for cloud) until the
 *    engine can be derived.
 * 2. **engine** – delegates to {@link deriveEngineRecommendation} to emit a
 *    `"recommendation"` once the engine is determined and no editor has been
 *    selected yet, or `"unsupported"` for configurations that have no wizard
 *    path.
 * 3. **install/os** – asks for the operating system once an editor is chosen.
 * 4. **install/checklist** – emits the five-step checklist once environment,
 *    editor, and OS are all present.
 *
 * Binding decisions (see {@link deriveEngineRecommendation} for the full table):
 * - Local → Sprocket
 * - HPC Slurm / LSF → Sprocket
 * - HPC other scheduler → unsupported
 * - Terra → Cromwell (via Terra service)
 * - AWS Batch → miniwdl (via aws-batch service)
 * - Cloud other + self-host → Sprocket + Planetary (only when Planetary is eligible)
 * - Cloud other + managed / native Windows → unsupported
 */
export function getWizardScreen(state: SetupState, catalog: SetupCatalog): WizardScreen {
  // ── Environment sub-questions ────────────────────────────────────────────
  if (!state.environment) {
    return {
      kind: "question",
      stage: "environment",
      key: "environment",
      heading: "Where will you run your workflows?",
    };
  }

  if (state.environment === "hpc" && !state.scheduler) {
    return {
      kind: "question",
      stage: "environment",
      key: "scheduler",
      heading: "What job scheduler does your cluster use?",
    };
  }

  if (state.environment === "cloud") {
    if (!state.service) {
      return {
        kind: "question",
        stage: "environment",
        key: "service",
        heading: "Which cloud service or execution backend will you use?",
      };
    }
    if (state.service === "other" && state.selfHost === undefined) {
      return {
        kind: "question",
        stage: "environment",
        key: "selfHost",
        heading: "Will you self-host a WDL engine on your cloud infrastructure?",
      };
    }
  }

  // ── Engine recommendation ────────────────────────────────────────────────
  const rec = deriveEngineRecommendation(state, catalog);
  if (rec.kind === "unsupported") {
    return { kind: "unsupported", stage: "engine", reason: rec.reason };
  }
  const { engine: engineId, service: serviceId } = rec;

  // Engine resolved — show the recommendation until an editor is chosen.
  if (!state.editor) {
    return { kind: "recommendation", stage: "engine", engine: engineId, service: serviceId };
  }

  // Editor chosen — ask for the OS before building the checklist.
  if (!state.os) {
    return {
      kind: "question",
      stage: "install",
      key: "os",
      heading: "What operating system are you using?",
    };
  }

  // All required fields present — emit the five-step checklist.
  const fullState = state as Required<Pick<SetupState, "environment" | "editor" | "os">> &
    SetupState;
  return {
    kind: "checklist",
    stage: "install",
    engine: engineId,
    steps: buildInstallChecklist(fullState, engineId, catalog),
  };
}

/**
 * Returns a pruned copy of `state` after applying a single field change.
 *
 * Downstream fields that are no longer consistent with the new value are
 * cleared automatically:
 *
 * - Changing `environment` away from `"hpc"` clears `scheduler`.
 * - Changing `environment` away from `"cloud"` clears `service` and `selfHost`.
 * - Changing `service` away from `"other"` clears `selfHost`.
 * - After any change, `editor` is cleared if it is ineligible in the catalog.
 * - After any change, `os` is cleared if the current editor does not support it.
 *
 * The original `state` object is never mutated.
 */
export function pruneSetupState(
  state: SetupState,
  changedKey: keyof SetupState,
  value: SetupState[keyof SetupState],
  catalog: SetupCatalog,
): SetupState {
  const next: SetupState = { ...state };
  // Apply the change. Using Object.assign avoids TypeScript's inability to
  // narrow a dynamic keyof assignment to the correct value type.
  Object.assign(next, { [changedKey]: value });

  // Clear sub-questions that belong to a different environment branch.
  if (changedKey === "environment") {
    if (next.environment !== "hpc") delete next.scheduler;
    if (next.environment !== "cloud") {
      delete next.service;
      delete next.selfHost;
    }
  }

  // selfHost is only meaningful when service === "other".
  if (changedKey === "service" && value !== "other") {
    delete next.selfHost;
  }

  // Retain editor only when it remains eligible.
  if (next.editor !== undefined) {
    const catalogEditor = catalog.editors[next.editor];
    if (!catalogEditor?.eligible) {
      delete next.editor;
      delete next.os;
      return next;
    }
  }

  // Retain os only when the editor still supports it.
  if (next.editor !== undefined && next.os !== undefined) {
    const catalogEditor = catalog.editors[next.editor];
    if (catalogEditor && !catalogEditor.supportedOs.includes(next.os)) {
      delete next.os;
    }
  }

  return next;
}
