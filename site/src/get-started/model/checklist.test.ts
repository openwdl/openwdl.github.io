import { describe, it, expect } from "vitest";
import { buildInstallChecklist } from "./checklist";
import { FIRST_WORKFLOW_SLUG } from "./constants";
import { eligibleCatalog, catalogWithEligiblePlanetary } from "../test/fixtures";
import type { SetupState } from "./types";

// ── Step ordering ─────────────────────────────────────────────────────────────

describe("buildInstallChecklist — step ordering", () => {
  it("returns exactly five steps in canonical order for local+sprocket", () => {
    expect(
      buildInstallChecklist(
        { environment: "local", editor: "vscode", os: "macos" },
        "sprocket",
        eligibleCatalog,
      ).map((step) => step.id),
    ).toEqual(["prerequisites", "engine", "editor", "verify", "first-workflow"]);
  });

  it("returns exactly five steps for hpc+slurm+sprocket+linux", () => {
    expect(
      buildInstallChecklist(
        { environment: "hpc", scheduler: "slurm", editor: "neovim", os: "linux" },
        "sprocket",
        eligibleCatalog,
      ).map((step) => step.id),
    ).toEqual(["prerequisites", "engine", "editor", "verify", "first-workflow"]);
  });

  it("returns exactly five steps for cloud+terra+cromwell", () => {
    expect(
      buildInstallChecklist(
        { environment: "cloud", service: "terra", editor: "vscode", os: "macos" },
        "cromwell",
        eligibleCatalog,
      ).map((step) => step.id),
    ).toEqual(["prerequisites", "engine", "editor", "verify", "first-workflow"]);
  });

  it("returns exactly five steps for cloud+aws-batch+miniwdl", () => {
    expect(
      buildInstallChecklist(
        { environment: "cloud", service: "aws-batch", editor: "vscode", os: "linux" },
        "miniwdl",
        eligibleCatalog,
      ).map((step) => step.id),
    ).toEqual(["prerequisites", "engine", "editor", "verify", "first-workflow"]);
  });

  it("returns exactly five steps for cloud+planetary+sprocket", () => {
    expect(
      buildInstallChecklist(
        {
          environment: "cloud",
          service: "other",
          selfHost: true,
          editor: "vscode",
          os: "linux",
        },
        "sprocket",
        catalogWithEligiblePlanetary(),
      ).map((step) => step.id),
    ).toEqual(["prerequisites", "engine", "editor", "verify", "first-workflow"]);
  });
});

// ── Step content — local Sprocket ─────────────────────────────────────────────

describe("buildInstallChecklist — local Sprocket (macos, vscode)", () => {
  const steps = () =>
    buildInstallChecklist(
      { environment: "local", editor: "vscode", os: "macos" },
      "sprocket",
      eligibleCatalog,
    );

  it("prerequisites step lists the install method prerequisites", () => {
    const prereqs = steps().find((s) => s.id === "prerequisites");
    expect(prereqs?.instructions.length).toBeGreaterThan(0);
  });

  it("engine step contains the install commands from the catalog", () => {
    const engineStep = steps().find((s) => s.id === "engine");
    expect(engineStep?.commands.length).toBeGreaterThan(0);
  });

  it("engine step references brew or cargo", () => {
    const engineStep = steps().find((s) => s.id === "engine");
    const cmds = engineStep?.commands.map((c) => c.command).join(" ") ?? "";
    expect(cmds).toMatch(/brew|cargo/);
  });

  it("editor step has a non-empty title and a link", () => {
    const editorStep = steps().find((s) => s.id === "editor");
    expect(editorStep?.title.length).toBeGreaterThan(0);
    expect(editorStep?.links.length).toBeGreaterThan(0);
  });

  it("verify step contains commands from the catalog", () => {
    const verifyStep = steps().find((s) => s.id === "verify");
    expect(verifyStep?.commands.length).toBeGreaterThan(0);
  });

  it("verify step command is the sprocket --version check", () => {
    const verifyStep = steps().find((s) => s.id === "verify");
    const cmds = verifyStep?.commands.map((c) => c.command).join(" ") ?? "";
    expect(cmds).toContain("sprocket --version");
  });

  it("first-workflow step has a link to the tutorial", () => {
    const fwStep = steps().find((s) => s.id === "first-workflow");
    expect(fwStep?.links.length).toBeGreaterThan(0);
    expect(fwStep?.links[0].href).toContain("your-first-workflow");
  });
});

// ── Step content — Terra (managed service) ────────────────────────────────────

describe("buildInstallChecklist — cloud Terra (cromwell, macos, vscode)", () => {
  const steps = () =>
    buildInstallChecklist(
      { environment: "cloud", service: "terra", editor: "vscode", os: "macos" },
      "cromwell",
      eligibleCatalog,
    );

  it("prerequisites step lists the Terra security prerequisites", () => {
    const prereqs = steps().find((s) => s.id === "prerequisites");
    const combined = prereqs?.instructions.join(" ") ?? "";
    expect(combined.toLowerCase()).toMatch(/terra|google|billing/i);
  });

  it("engine step has no install commands (Terra is managed)", () => {
    const engineStep = steps().find((s) => s.id === "engine");
    expect(engineStep?.commands).toEqual([]);
  });

  it("engine step carries a link to Terra", () => {
    const engineStep = steps().find((s) => s.id === "engine");
    const hrefs = engineStep?.links.map((l) => l.href) ?? [];
    expect(hrefs.some((h) => h.includes("terra"))).toBe(true);
  });

  it("verify step carries a link to Terra (no CLI)", () => {
    const verifyStep = steps().find((s) => s.id === "verify");
    const hrefs = verifyStep?.links.map((l) => l.href) ?? [];
    expect(hrefs.some((h) => h.includes("terra"))).toBe(true);
  });
});

// ── Step content — AWS Batch (YOUR_QUEUE_NAME placeholder) ───────────────────

describe("buildInstallChecklist — cloud AWS Batch (miniwdl, linux, vscode)", () => {
  const steps = () =>
    buildInstallChecklist(
      { environment: "cloud", service: "aws-batch", editor: "vscode", os: "linux" },
      "miniwdl",
      eligibleCatalog,
    );

  it("engine step contains the pip3 install command", () => {
    const engineStep = steps().find((s) => s.id === "engine");
    const cmds = engineStep?.commands.map((c) => c.command).join(" ") ?? "";
    expect(cmds).toContain("pip3");
  });

  it("verify step preserves YOUR_QUEUE_NAME placeholder in commands", () => {
    const verifyStep = steps().find((s) => s.id === "verify");
    const cmds = verifyStep?.commands.map((c) => c.command).join(" ") ?? "";
    expect(cmds).toContain("YOUR_QUEUE_NAME");
  });

  it("YOUR_QUEUE_NAME appears in the command explanation too", () => {
    const verifyStep = steps().find((s) => s.id === "verify");
    const explanations = verifyStep?.commands.map((c) => c.explanation).join(" ") ?? "";
    expect(explanations).toContain("YOUR_QUEUE_NAME");
  });

  it("prerequisites step lists the AWS security prerequisites", () => {
    const prereqs = steps().find((s) => s.id === "prerequisites");
    const combined = prereqs?.instructions.join(" ") ?? "";
    expect(combined.toLowerCase()).toMatch(/aws|iam/i);
  });
});

// ── Step content — windows-wsl variant ───────────────────────────────────────

describe("buildInstallChecklist — local Sprocket (windows-wsl, cli-only)", () => {
  it("uses the windows-wsl install method for Sprocket", () => {
    const steps = buildInstallChecklist(
      { environment: "local", editor: "cli-only", os: "windows-wsl" },
      "sprocket",
      eligibleCatalog,
    );
    const engineStep = steps.find((s) => s.id === "engine");
    const cmds = engineStep?.commands.map((c) => c.command).join(" ") ?? "";
    expect(cmds).toContain("cargo");
  });
});

// ── All steps have required fields ────────────────────────────────────────────

describe("buildInstallChecklist — structural invariants", () => {
  it("every step has a non-empty id, title, and array fields", () => {
    const steps = buildInstallChecklist(
      { environment: "local", editor: "vscode", os: "macos" },
      "sprocket",
      eligibleCatalog,
    );
    for (const step of steps) {
      expect(step.id.length).toBeGreaterThan(0);
      expect(step.title.length).toBeGreaterThan(0);
      expect(Array.isArray(step.instructions)).toBe(true);
      expect(Array.isArray(step.commands)).toBe(true);
      expect(Array.isArray(step.links)).toBe(true);
    }
  });

  it.each<[SetupState, string]>([
    [{ environment: "local", editor: "vscode", os: "macos" }, "sprocket"],
    [{ environment: "cloud", service: "terra", editor: "vscode", os: "macos" }, "cromwell"],
    [{ environment: "cloud", service: "aws-batch", editor: "vscode", os: "linux" }, "miniwdl"],
  ])("always emits exactly 5 steps (%j)", (state, engine) => {
    expect(
      buildInstallChecklist(
        state as Required<Pick<SetupState, "environment" | "editor" | "os">> & SetupState,
        engine as "sprocket" | "cromwell" | "miniwdl",
        eligibleCatalog,
      ),
    ).toHaveLength(5);
  });
});

// ── Multiple install methods — macOS Sprocket ─────────────────────────────────

describe("buildInstallChecklist — macOS Sprocket installOptions (Homebrew + Cargo)", () => {
  const steps = () =>
    buildInstallChecklist(
      { environment: "local", editor: "vscode", os: "macos" },
      "sprocket",
      eligibleCatalog,
    );

  it("engine step has installOptions with exactly 2 entries", () => {
    expect(steps().find((s) => s.id === "engine")?.installOptions).toHaveLength(2);
  });

  it("first install option is labeled Homebrew", () => {
    const opt = steps().find((s) => s.id === "engine")?.installOptions?.[0];
    expect(opt?.label).toBe("Homebrew");
  });

  it("first install option commands contain brew", () => {
    const opt = steps().find((s) => s.id === "engine")?.installOptions?.[0];
    expect(opt?.commands.map((c) => c.command).join(" ")).toContain("brew");
  });

  it("second install option is labeled Cargo", () => {
    const opt = steps().find((s) => s.id === "engine")?.installOptions?.[1];
    expect(opt?.label).toBe("Cargo");
  });

  it("second install option commands contain cargo", () => {
    const opt = steps().find((s) => s.id === "engine")?.installOptions?.[1];
    expect(opt?.commands.map((c) => c.command).join(" ")).toContain("cargo");
  });

  it("each install option preserves prerequisites, verification, and upstreamUrl", () => {
    for (const opt of steps().find((s) => s.id === "engine")?.installOptions ?? []) {
      expect(opt.prerequisites.length).toBeGreaterThan(0);
      expect(opt.verification.length).toBeGreaterThan(0);
      expect(opt.upstreamUrl.length).toBeGreaterThan(0);
    }
  });

  it("prerequisites step lists prerequisites from all install methods", () => {
    const prereqs = steps().find((s) => s.id === "prerequisites");
    const combined = prereqs?.instructions.join(" ") ?? "";
    expect(combined).toMatch(/Homebrew|brew/i);
    expect(combined).toMatch(/Rust|cargo/i);
  });

  it("single-method engine step has no installOptions (windows-wsl)", () => {
    const wslSteps = buildInstallChecklist(
      { environment: "local", editor: "cli-only", os: "windows-wsl" },
      "sprocket",
      eligibleCatalog,
    );
    expect(wslSteps.find((s) => s.id === "engine")?.installOptions).toBeUndefined();
  });
});

// ── Cross-validation: engine mismatch ─────────────────────────────────────────

describe("buildInstallChecklist — engine mismatch cross-validation", () => {
  it("throws when the engine parameter mismatches the state-derived recommendation", () => {
    expect(() =>
      buildInstallChecklist(
        { environment: "cloud", service: "terra", editor: "vscode", os: "macos" },
        "sprocket", // state implies cromwell
        eligibleCatalog,
      ),
    ).toThrow(/mismatch|cromwell/i);
  });

  it("throws when engine is sprocket but state implies miniwdl", () => {
    expect(() =>
      buildInstallChecklist(
        { environment: "cloud", service: "aws-batch", editor: "vscode", os: "linux" },
        "sprocket", // state implies miniwdl
        eligibleCatalog,
      ),
    ).toThrow();
  });

  it("does not throw when engine matches the state-derived recommendation", () => {
    expect(() =>
      buildInstallChecklist(
        { environment: "cloud", service: "terra", editor: "vscode", os: "macos" },
        "cromwell", // correct
        eligibleCatalog,
      ),
    ).not.toThrow();
  });
});

// ── First-workflow slug constant ───────────────────────────────────────────────

describe("buildInstallChecklist — first-workflow link", () => {
  it("first-workflow link href equals the exported FIRST_WORKFLOW_SLUG constant", () => {
    const fwStep = buildInstallChecklist(
      { environment: "local", editor: "vscode", os: "macos" },
      "sprocket",
      eligibleCatalog,
    ).find((s) => s.id === "first-workflow");
    expect(fwStep?.links[0].href).toBe(FIRST_WORKFLOW_SLUG);
  });
});
