import { describe, it, expect } from "vitest";
import { deriveEngineRecommendation } from "./recommend";
import { eligibleCatalog, catalogWithEligiblePlanetary } from "../test/fixtures";
import { SETUP_CATALOG } from "../catalog/catalog";
import type { SetupState } from "./types";

// ── Decision table — recommendations ─────────────────────────────────────────

describe("deriveEngineRecommendation — decision table", () => {
  it.each<[SetupState, string]>([
    [{ environment: "local" }, "sprocket"],
    [{ environment: "hpc", scheduler: "slurm" }, "sprocket"],
    [{ environment: "hpc", scheduler: "lsf" }, "sprocket"],
    [{ environment: "cloud", service: "terra" }, "cromwell"],
    [{ environment: "cloud", service: "aws-batch" }, "miniwdl"],
  ])("recommends the expected engine for %j", (state, engine) => {
    expect(deriveEngineRecommendation(state, eligibleCatalog)).toMatchObject({
      kind: "recommendation",
      engine,
    });
  });

  it("attaches terra service to the cromwell recommendation", () => {
    expect(
      deriveEngineRecommendation({ environment: "cloud", service: "terra" }, eligibleCatalog),
    ).toMatchObject({ kind: "recommendation", engine: "cromwell", service: "terra" });
  });

  it("attaches aws-batch service to the miniwdl recommendation", () => {
    expect(
      deriveEngineRecommendation(
        { environment: "cloud", service: "aws-batch" },
        eligibleCatalog,
      ),
    ).toMatchObject({ kind: "recommendation", engine: "miniwdl", service: "aws-batch" });
  });

  it("local recommendation carries no service", () => {
    const rec = deriveEngineRecommendation({ environment: "local" }, eligibleCatalog);
    if (rec.kind !== "recommendation") throw new Error("expected recommendation");
    expect(rec.service).toBeUndefined();
  });
});

// ── Decision table — unsupported ──────────────────────────────────────────────

describe("deriveEngineRecommendation — unsupported", () => {
  it.each<SetupState>([
    { environment: "hpc", scheduler: "other" },
    { environment: "cloud", service: "other", selfHost: false },
  ])("returns unsupported for %j", (state) => {
    expect(deriveEngineRecommendation(state, eligibleCatalog).kind).toBe("unsupported");
  });

  it("unsupported reason is non-empty for HPC other scheduler", () => {
    const rec = deriveEngineRecommendation(
      { environment: "hpc", scheduler: "other" },
      eligibleCatalog,
    );
    if (rec.kind !== "unsupported") throw new Error("expected unsupported");
    expect(rec.reason.length).toBeGreaterThan(0);
  });

  it("unsupported reason is non-empty for cloud/other/!selfHost", () => {
    const rec = deriveEngineRecommendation(
      { environment: "cloud", service: "other", selfHost: false },
      eligibleCatalog,
    );
    if (rec.kind !== "unsupported") throw new Error("expected unsupported");
    expect(rec.reason.length).toBeGreaterThan(0);
  });
});

// ── Planetary eligibility ─────────────────────────────────────────────────────

describe("deriveEngineRecommendation — Planetary eligibility", () => {
  it("recommends sprocket + planetary when Planetary is eligible and selfHost is true", () => {
    expect(
      deriveEngineRecommendation(
        { environment: "cloud", service: "other", selfHost: true },
        catalogWithEligiblePlanetary(),
      ),
    ).toMatchObject({ kind: "recommendation", engine: "sprocket", service: "planetary" });
  });

  it("returns unsupported when Planetary is ineligible (SETUP_CATALOG)", () => {
    expect(
      deriveEngineRecommendation(
        { environment: "cloud", service: "other", selfHost: true },
        SETUP_CATALOG,
      ).kind,
    ).toBe("unsupported");
  });

  it("returns unsupported when cloud/other/selfHost is false even if Planetary were eligible", () => {
    expect(
      deriveEngineRecommendation(
        { environment: "cloud", service: "other", selfHost: false },
        catalogWithEligiblePlanetary(),
      ).kind,
    ).toBe("unsupported");
  });
});
