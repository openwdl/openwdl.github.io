import { describe, it, expect } from "vitest";
import { SETUP_CATALOG } from "./catalog";
import { validateSetupCatalog } from "./validate";
import { eligibleCatalog, catalogWithEligiblePlanetary } from "../test/fixtures";

describe("validateSetupCatalog — production catalog", () => {
  it("returns no issues for the unmodified production catalog", () => {
    expect(validateSetupCatalog(SETUP_CATALOG)).toEqual([]);
  });
});

describe("validateSetupCatalog — engines", () => {
  it("rejects an eligible item without verification", () => {
    const catalog = structuredClone(SETUP_CATALOG);
    catalog.engines.sprocket.install[0].verification = [];
    expect(validateSetupCatalog(catalog)).toContainEqual(
      expect.objectContaining({ path: "engines.sprocket.install.0.verification" }),
    );
  });

  it("rejects an eligible engine with no install methods", () => {
    const catalog = structuredClone(SETUP_CATALOG);
    catalog.engines.sprocket.install = [];
    expect(validateSetupCatalog(catalog)).toContainEqual(
      expect.objectContaining({ path: "engines.sprocket.install" }),
    );
  });

  it("rejects an eligible engine with an empty owner", () => {
    const catalog = structuredClone(SETUP_CATALOG);
    catalog.engines.sprocket.owner = "";
    expect(validateSetupCatalog(catalog)).toContainEqual(
      expect.objectContaining({ path: "engines.sprocket.owner" }),
    );
  });

  it("rejects an eligible engine with an empty upstreamUrl", () => {
    const catalog = structuredClone(SETUP_CATALOG);
    catalog.engines.sprocket.upstreamUrl = "";
    expect(validateSetupCatalog(catalog)).toContainEqual(
      expect.objectContaining({ path: "engines.sprocket.upstreamUrl" }),
    );
  });

  it("rejects an eligible engine with an empty docsUrl", () => {
    const catalog = structuredClone(SETUP_CATALOG);
    catalog.engines.sprocket.docsUrl = "";
    expect(validateSetupCatalog(catalog)).toContainEqual(
      expect.objectContaining({ path: "engines.sprocket.docsUrl" }),
    );
  });

  it("rejects an install method with an unsupported OS value", () => {
    const catalog = structuredClone(SETUP_CATALOG);
    // @ts-expect-error -- testing runtime OS validation path
    catalog.engines.sprocket.install[0].os = "android";
    expect(validateSetupCatalog(catalog)).toContainEqual(
      expect.objectContaining({ path: "engines.sprocket.install.0.os" }),
    );
  });

  it("Cromwell is ineligible (managed via Terra)", () => {
    expect(SETUP_CATALOG.engines.cromwell.eligible).toBe(false);
  });

  it("Sprocket is eligible and has at least one install method for macOS", () => {
    const sprocket = SETUP_CATALOG.engines.sprocket;
    expect(sprocket.eligible).toBe(true);
    expect(sprocket.install.some((m) => m.os === "macos")).toBe(true);
  });

  it("Sprocket install methods reference the correct upstream URL", () => {
    for (const method of SETUP_CATALOG.engines.sprocket.install) {
      expect(method.upstreamUrl).toContain("stjude-rust-labs/sprocket");
    }
  });

  it("miniwdl is eligible and its install commands use pip3", () => {
    const miniwdl = SETUP_CATALOG.engines.miniwdl;
    expect(miniwdl.eligible).toBe(true);
    const allCommands = miniwdl.install.flatMap((m) => m.commands.map((c) => c.command));
    expect(allCommands.some((cmd) => cmd.includes("pip3"))).toBe(true);
  });

  it("miniwdl verification uses the documented self-test command", () => {
    const miniwdl = SETUP_CATALOG.engines.miniwdl;
    const allVerifications = miniwdl.install.flatMap((m) =>
      m.verification.map((v) => v.command),
    );
    expect(
      allVerifications.some((cmd) => cmd.includes("miniwdl-aws-submit")),
    ).toBe(true);
  });

  it("miniwdl self-test commands use YOUR_QUEUE_NAME placeholder, not a literal queue name", () => {
    const allVerifications = SETUP_CATALOG.engines.miniwdl.install.flatMap((m) =>
      m.verification,
    );
    for (const v of allVerifications) {
      expect(v.command).toContain("YOUR_QUEUE_NAME");
      expect(v.command).not.toContain("miniwdl-workflow");
      expect(v.explanation).toMatch(/YOUR_QUEUE_NAME/);
    }
  });

  it("Sprocket does not reference the wrong chanzuckerberg URL", () => {
    const sprocket = SETUP_CATALOG.engines.sprocket;
    expect(sprocket.upstreamUrl).not.toContain("chanzuckerberg");
    for (const method of sprocket.install) {
      expect(method.upstreamUrl).not.toContain("chanzuckerberg");
    }
  });
});

describe("validateSetupCatalog — services", () => {
  it("keeps Planetary ineligible until its identity and owner are complete", () => {
    const planetary = SETUP_CATALOG.services.planetary;
    expect(planetary.eligible).toBe(false);
    expect(planetary.role).toBe("execution-service");
  });

  it("rejects a service with a broken engine reference", () => {
    const catalog = structuredClone(SETUP_CATALOG);
    // @ts-expect-error -- testing runtime engine-reference validation
    catalog.services.terra.engine = "nonexistent";
    expect(validateSetupCatalog(catalog)).toContainEqual(
      expect.objectContaining({ path: "services.terra.engine" }),
    );
  });

  it("rejects an eligible service with empty verification and no verificationUrl", () => {
    const catalog = structuredClone(SETUP_CATALOG);
    catalog.services["aws-batch"].verification = [];
    expect(validateSetupCatalog(catalog)).toContainEqual(
      expect.objectContaining({ path: "services.aws-batch.verification" }),
    );
  });

  it("rejects an eligible service with an empty owner", () => {
    const catalog = structuredClone(SETUP_CATALOG);
    catalog.services.terra.owner = "";
    expect(validateSetupCatalog(catalog)).toContainEqual(
      expect.objectContaining({ path: "services.terra.owner" }),
    );
  });

  it("Terra service references the cromwell engine", () => {
    expect(SETUP_CATALOG.services.terra.engine).toBe("cromwell");
  });

  it("Terra service role is managed-service", () => {
    expect(SETUP_CATALOG.services.terra.role).toBe("managed-service");
  });

  it("AWS Batch service references the miniwdl engine", () => {
    expect(SETUP_CATALOG.services["aws-batch"].engine).toBe("miniwdl");
  });

  it("Planetary engine is sprocket even while ineligible", () => {
    expect(SETUP_CATALOG.services.planetary.engine).toBe("sprocket");
  });

  it("Terra uses browser-based verificationUrl instead of a CLI command", () => {
    expect(SETUP_CATALOG.services.terra.verification).toEqual([]);
    expect(SETUP_CATALOG.services.terra.verificationUrl).toBe("https://app.terra.bio");
  });

  it("accepts an eligible managed-service that has verificationUrl but no verification commands", () => {
    expect(validateSetupCatalog(SETUP_CATALOG)).toEqual([]);
  });
});

describe("validateSetupCatalog — editors", () => {
  it("rejects an eligible editor with an empty verification description", () => {
    const catalog = structuredClone(SETUP_CATALOG);
    catalog.editors.vscode.verification = "";
    expect(validateSetupCatalog(catalog)).toContainEqual(
      expect.objectContaining({ path: "editors.vscode.verification" }),
    );
  });

  it("VS Code editor is eligible", () => {
    expect(SETUP_CATALOG.editors.vscode.eligible).toBe(true);
  });

  it("CLI-only editor is eligible (it is the fallback)", () => {
    expect(SETUP_CATALOG.editors["cli-only"].eligible).toBe(true);
  });

  it("all editors have a non-empty verification description", () => {
    for (const [id, editor] of Object.entries(SETUP_CATALOG.editors)) {
      expect(editor.verification, `editor "${id}" is missing a verification description`).toBeTruthy();
    }
  });
});

describe("catalog completeness", () => {
  it("contains all three engine IDs", () => {
    expect(Object.keys(SETUP_CATALOG.engines)).toEqual(
      expect.arrayContaining(["sprocket", "cromwell", "miniwdl"]),
    );
  });

  it("contains all three service IDs", () => {
    expect(Object.keys(SETUP_CATALOG.services)).toEqual(
      expect.arrayContaining(["terra", "aws-batch", "planetary"]),
    );
  });

  it("contains all eight editor IDs", () => {
    expect(Object.keys(SETUP_CATALOG.editors)).toEqual(
      expect.arrayContaining([
        "vscode", "neovim", "generic-lsp", "jetbrains",
        "vim", "emacs", "sublime", "cli-only",
      ]),
    );
  });

  it("every engine id field matches its catalog key", () => {
    for (const [key, engine] of Object.entries(SETUP_CATALOG.engines)) {
      expect(engine.id).toBe(key);
    }
  });

  it("every service id field matches its catalog key", () => {
    for (const [key, service] of Object.entries(SETUP_CATALOG.services)) {
      expect(service.id).toBe(key);
    }
  });

  it("every editor id field matches its catalog key", () => {
    for (const [key, editor] of Object.entries(SETUP_CATALOG.editors)) {
      expect(editor.id).toBe(key);
    }
  });
});

describe("aws-batch service queue name placeholder", () => {
  it("aws-batch verification uses YOUR_QUEUE_NAME placeholder, not a literal queue name", () => {
    for (const v of SETUP_CATALOG.services["aws-batch"].verification) {
      expect(v.command).toContain("YOUR_QUEUE_NAME");
      expect(v.command).not.toContain("miniwdl-workflow");
      expect(v.explanation).toMatch(/YOUR_QUEUE_NAME/);
    }
  });
});

describe("fixture mutation isolation", () => {
  it("mutating eligibleCatalog does not affect SETUP_CATALOG", () => {
    const original = SETUP_CATALOG.engines.sprocket.owner;
    eligibleCatalog.engines.sprocket.owner = "__mutation_test__";
    expect(SETUP_CATALOG.engines.sprocket.owner).toBe(original);
    eligibleCatalog.engines.sprocket.owner = original;
  });

  it("mutating catalogWithEligiblePlanetary() output does not affect SETUP_CATALOG", () => {
    const original = SETUP_CATALOG.services.terra.owner;
    const catalog = catalogWithEligiblePlanetary();
    catalog.services.terra.owner = "__mutation_test__";
    expect(SETUP_CATALOG.services.terra.owner).toBe(original);
  });
});
