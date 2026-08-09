import { describe, it, expect } from "vitest";
import { getWizardScreen, pruneSetupState } from "./decide";
import { eligibleCatalog, catalogWithEligiblePlanetary } from "../test/fixtures";
import { SETUP_CATALOG } from "../catalog/catalog";
import type { SetupState } from "./types";

// ── Question screens ──────────────────────────────────────────────────────────

describe("getWizardScreen — question screens", () => {
  it("asks about environment when no environment is set", () => {
    expect(getWizardScreen({}, eligibleCatalog)).toMatchObject({
      kind: "question",
      stage: "environment",
      key: "environment",
    });
  });

  it("asks about scheduler when environment is hpc but scheduler is missing", () => {
    expect(getWizardScreen({ environment: "hpc" }, eligibleCatalog)).toMatchObject({
      kind: "question",
      stage: "environment",
      key: "scheduler",
    });
  });

  it("asks about service when environment is cloud but service is missing", () => {
    expect(getWizardScreen({ environment: "cloud" }, eligibleCatalog)).toMatchObject({
      kind: "question",
      stage: "environment",
      key: "service",
    });
  });

  it("asks about selfHost when cloud service is other but selfHost is missing", () => {
    expect(
      getWizardScreen({ environment: "cloud", service: "other" }, eligibleCatalog),
    ).toMatchObject({ kind: "question", stage: "environment", key: "selfHost" });
  });

  it("asks about os when engine is determined and editor is set but os is missing", () => {
    expect(
      getWizardScreen({ environment: "local", editor: "vscode" }, eligibleCatalog),
    ).toMatchObject({ kind: "question", stage: "install", key: "os" });
  });

  it("question screens carry a non-empty heading", () => {
    const screen = getWizardScreen({}, eligibleCatalog);
    if (screen.kind !== "question") throw new Error("expected question");
    expect(screen.heading.length).toBeGreaterThan(0);
  });
});

// ── Decision table — recommendations ─────────────────────────────────────────

describe("getWizardScreen — recommendations", () => {
  it.each<[SetupState, string]>([
    [{ environment: "local" }, "sprocket"],
    [{ environment: "hpc", scheduler: "slurm" }, "sprocket"],
    [{ environment: "hpc", scheduler: "lsf" }, "sprocket"],
    [{ environment: "cloud", service: "terra" }, "cromwell"],
    [{ environment: "cloud", service: "aws-batch" }, "miniwdl"],
  ])("recommends the expected engine for %j", (state, engine) => {
    expect(getWizardScreen(state, eligibleCatalog)).toMatchObject({
      kind: "recommendation",
      engine,
    });
  });

  it("attaches terra service to the cromwell recommendation", () => {
    expect(
      getWizardScreen({ environment: "cloud", service: "terra" }, eligibleCatalog),
    ).toMatchObject({ kind: "recommendation", engine: "cromwell", service: "terra" });
  });

  it("attaches aws-batch service to the miniwdl recommendation", () => {
    expect(
      getWizardScreen({ environment: "cloud", service: "aws-batch" }, eligibleCatalog),
    ).toMatchObject({ kind: "recommendation", engine: "miniwdl", service: "aws-batch" });
  });

  it("local recommendation carries no service", () => {
    const screen = getWizardScreen({ environment: "local" }, eligibleCatalog);
    if (screen.kind !== "recommendation") throw new Error("expected recommendation");
    expect(screen.service).toBeUndefined();
  });

  it("recommendation has stage 'engine'", () => {
    const screen = getWizardScreen({ environment: "local" }, eligibleCatalog);
    expect(screen).toMatchObject({ kind: "recommendation", stage: "engine" });
  });
});

// ── Decision table — unsupported ──────────────────────────────────────────────

describe("getWizardScreen — unsupported", () => {
  it.each<SetupState>([
    { environment: "hpc", scheduler: "other" },
    { environment: "cloud", service: "other", selfHost: false },
  ])("returns unsupported for %j", (state) => {
    expect(getWizardScreen(state, eligibleCatalog).kind).toBe("unsupported");
  });

  it("unsupported screens carry a non-empty reason", () => {
    const screen = getWizardScreen(
      { environment: "hpc", scheduler: "other" },
      eligibleCatalog,
    );
    if (screen.kind !== "unsupported") throw new Error("expected unsupported");
    expect(screen.reason.length).toBeGreaterThan(0);
  });

  it("unsupported HPC other has stage 'engine'", () => {
    expect(
      getWizardScreen({ environment: "hpc", scheduler: "other" }, eligibleCatalog),
    ).toMatchObject({ kind: "unsupported", stage: "engine" });
  });
});

// ── Planetary eligibility ─────────────────────────────────────────────────────

describe("getWizardScreen — Planetary eligibility", () => {
  it("uses Planetary with Sprocket only when the service is eligible", () => {
    const state = { environment: "cloud", service: "other", selfHost: true } as const;
    expect(getWizardScreen(state, catalogWithEligiblePlanetary())).toMatchObject({
      kind: "recommendation",
      engine: "sprocket",
      service: "planetary",
    });
    expect(getWizardScreen(state, SETUP_CATALOG).kind).toBe("unsupported");
  });

  it("Planetary recommendation uses the production catalog when Planetary is eligible", () => {
    const state = { environment: "cloud", service: "other", selfHost: true } as const;
    const screen = getWizardScreen(state, catalogWithEligiblePlanetary());
    if (screen.kind !== "recommendation") throw new Error("expected recommendation");
    expect(screen.engine).toBe("sprocket");
    expect(screen.service).toBe("planetary");
  });

  it("cloud other selfHost:true is unsupported when Planetary is ineligible (SETUP_CATALOG)", () => {
    const state = { environment: "cloud", service: "other", selfHost: true } as const;
    expect(getWizardScreen(state, SETUP_CATALOG).kind).toBe("unsupported");
  });
});

// ── Checklist screen ──────────────────────────────────────────────────────────

describe("getWizardScreen — checklist screen", () => {
  it("returns a checklist when environment, editor, and os are all set", () => {
    const screen = getWizardScreen(
      { environment: "local", editor: "vscode", os: "macos" },
      eligibleCatalog,
    );
    expect(screen.kind).toBe("checklist");
  });

  it("checklist carries the correct engine id", () => {
    const screen = getWizardScreen(
      { environment: "local", editor: "vscode", os: "macos" },
      eligibleCatalog,
    );
    if (screen.kind !== "checklist") throw new Error("expected checklist");
    expect(screen.engine).toBe("sprocket");
  });

  it("checklist screen has stage 'install'", () => {
    const screen = getWizardScreen(
      { environment: "local", editor: "vscode", os: "macos" },
      eligibleCatalog,
    );
    expect(screen).toMatchObject({ kind: "checklist", stage: "install" });
  });

  it("returns a checklist for hpc+slurm after editor and os are set", () => {
    const screen = getWizardScreen(
      { environment: "hpc", scheduler: "slurm", editor: "vscode", os: "linux" },
      eligibleCatalog,
    );
    expect(screen).toMatchObject({ kind: "checklist", engine: "sprocket" });
  });

  it("returns a checklist for cloud+terra after editor and os are set", () => {
    const screen = getWizardScreen(
      { environment: "cloud", service: "terra", editor: "vscode", os: "macos" },
      eligibleCatalog,
    );
    expect(screen).toMatchObject({ kind: "checklist", engine: "cromwell" });
  });
});

// ── pruneSetupState ───────────────────────────────────────────────────────────

describe("pruneSetupState", () => {
  it("sets the new value on the returned state", () => {
    const next = pruneSetupState({}, "environment", "local", eligibleCatalog);
    expect(next.environment).toBe("local");
  });

  it("clears scheduler when environment changes away from hpc", () => {
    const state: SetupState = {
      environment: "hpc",
      scheduler: "slurm",
      editor: "vscode",
      os: "linux",
    };
    const next = pruneSetupState(state, "environment", "local", eligibleCatalog);
    expect(next.scheduler).toBeUndefined();
    expect(next.environment).toBe("local");
  });

  it("retains scheduler when environment stays hpc", () => {
    const state: SetupState = { environment: "hpc", scheduler: "slurm" };
    const next = pruneSetupState(state, "scheduler", "lsf", eligibleCatalog);
    expect(next.scheduler).toBe("lsf");
    expect(next.environment).toBe("hpc");
  });

  it("clears service and selfHost when environment changes away from cloud", () => {
    const state: SetupState = {
      environment: "cloud",
      service: "other",
      selfHost: true,
    };
    const next = pruneSetupState(state, "environment", "local", eligibleCatalog);
    expect(next.service).toBeUndefined();
    expect(next.selfHost).toBeUndefined();
  });

  it("clears selfHost when service changes away from other", () => {
    const state: SetupState = { environment: "cloud", service: "other", selfHost: true };
    const next = pruneSetupState(state, "service", "terra", eligibleCatalog);
    expect(next.selfHost).toBeUndefined();
    expect(next.service).toBe("terra");
  });

  it("retains selfHost when service stays other", () => {
    const state: SetupState = { environment: "cloud", service: "other", selfHost: true };
    const next = pruneSetupState(state, "selfHost", false, eligibleCatalog);
    expect(next.selfHost).toBe(false);
    expect(next.service).toBe("other");
  });

  it("retains eligible editor after environment change", () => {
    const state: SetupState = {
      environment: "hpc",
      scheduler: "slurm",
      editor: "vscode",
      os: "macos",
    };
    const next = pruneSetupState(state, "environment", "local", eligibleCatalog);
    expect(next.editor).toBe("vscode");
  });

  it("retains os when the editor still supports it after environment change", () => {
    const state: SetupState = {
      environment: "hpc",
      scheduler: "slurm",
      editor: "vscode",
      os: "macos",
    };
    const next = pruneSetupState(state, "environment", "local", eligibleCatalog);
    expect(next.os).toBe("macos");
  });

  it("clears editor and os when the new editor is ineligible", () => {
    // vim is explicitly marked ineligible in the catalog
    const state: SetupState = { environment: "local", editor: "vscode", os: "macos" };
    const next = pruneSetupState(state, "editor", "vim", eligibleCatalog);
    expect(next.editor).toBeUndefined();
    expect(next.os).toBeUndefined();
  });

  it("clears os when the new editor does not support the current os", () => {
    // vim is ineligible in the catalog, so pruneSetupState clears both editor
    // and os regardless of the current os value.
    const state: SetupState = {
      environment: "local",
      editor: "vscode",
      os: "windows-wsl",
    };
    const next = pruneSetupState(state, "editor", "vim", eligibleCatalog);
    expect(next.editor).toBeUndefined();
    expect(next.os).toBeUndefined();
  });

  it("does not mutate the input state", () => {
    const state: SetupState = {
      environment: "hpc",
      scheduler: "slurm",
      editor: "vscode",
      os: "linux",
    };
    pruneSetupState(state, "environment", "local", eligibleCatalog);
    expect(state.scheduler).toBe("slurm");
    expect(state.environment).toBe("hpc");
  });
});
