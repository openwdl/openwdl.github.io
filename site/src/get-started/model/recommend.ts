import type { SetupState } from "./types";
import type { EngineId, ServiceId, SetupCatalog } from "../catalog/types";

/**
 * The result of deriving an engine recommendation from setup state and catalog.
 *
 * - `"recommendation"` – the engine (and optional service) the wizard should
 *   suggest; the caller may proceed to editor/OS/checklist screens.
 * - `"unsupported"` – the current configuration has no wizard path; a reason
 *   is provided for display.
 */
export type EngineRecommendation =
  | { kind: "recommendation"; engine: EngineId; service?: ServiceId }
  | { kind: "unsupported"; reason: string };

/**
 * Derives the engine recommendation and optional service from the current setup
 * state and the catalog's eligibility flags.
 *
 * This is the single authoritative mapping used by both {@link getWizardScreen}
 * (to emit `recommendation` and `unsupported` screens) and
 * {@link buildInstallChecklist} (to cross-validate the explicit engine
 * parameter passed by the caller).
 *
 * **Caller contract:** all environment sub-questions must be resolved before
 * calling this function. For `hpc`, `scheduler` must be set; for `cloud` with
 * `service === "other"`, `selfHost` must be set. Calling with an incomplete
 * state returns an `unsupported` result but does not throw.
 *
 * | Environment | Sub-answer                         | Engine   | Service   |
 * |-------------|-------------------------------------|----------|-----------|
 * | local       | —                                   | sprocket | —         |
 * | hpc         | slurm                               | sprocket | —         |
 * | hpc         | lsf                                 | sprocket | —         |
 * | hpc         | other                               | unsupported         |
 * | cloud       | terra                               | cromwell | terra     |
 * | cloud       | aws-batch                           | miniwdl  | aws-batch |
 * | cloud/other | selfHost: true + Planetary eligible | sprocket | planetary |
 * | cloud/other | selfHost: false / Planetary inelig. | unsupported         |
 */
export function deriveEngineRecommendation(
  state: SetupState,
  catalog: SetupCatalog,
): EngineRecommendation {
  if (state.environment === "local") {
    return { kind: "recommendation", engine: "sprocket" };
  }

  if (state.environment === "hpc") {
    if (state.scheduler === "slurm" || state.scheduler === "lsf") {
      return { kind: "recommendation", engine: "sprocket" };
    }
    return {
      kind: "unsupported",
      reason:
        "Only Slurm and LSF schedulers are currently supported. " +
        "Other schedulers are not yet covered by the setup wizard.",
    };
  }

  if (state.environment === "cloud") {
    if (state.service === "terra") {
      return { kind: "recommendation", engine: "cromwell", service: "terra" };
    }
    if (state.service === "aws-batch") {
      return { kind: "recommendation", engine: "miniwdl", service: "aws-batch" };
    }
    if (state.service === "other" && state.selfHost === true) {
      if (catalog.services.planetary.eligible) {
        return { kind: "recommendation", engine: "sprocket", service: "planetary" };
      }
      return {
        kind: "unsupported",
        reason: "Self-hosted cloud deployments are not yet covered by the setup wizard.",
      };
    }
    return {
      kind: "unsupported",
      reason:
        "Managed cloud services other than Terra and AWS Batch are not yet " +
        "covered by the setup wizard.",
    };
  }

  return {
    kind: "unsupported",
    reason: "No recognized environment was selected.",
  };
}
