import { describe, it, expect } from "vitest";
import { parseSetupSearch, serializeSetupState } from "./url";
import { SETUP_CATALOG } from "../catalog/catalog";
import type { SetupState } from "./types";
import type { SetupCatalog } from "../catalog/types";

// ── serializeSetupState ───────────────────────────────────────────────────────

describe("serializeSetupState", () => {
  it("produces empty URLSearchParams for an empty state", () => {
    expect(Array.from(serializeSetupState({}).entries())).toEqual([]);
  });

  it("serializes selfHost as the key 'self-host', not 'selfHost'", () => {
    const params = serializeSetupState({
      environment: "cloud",
      service: "other",
      selfHost: true,
    });
    expect(params.get("self-host")).toBe("true");
    expect(params.has("selfHost")).toBe(false);
  });

  it("serializes selfHost:false as 'false'", () => {
    const params = serializeSetupState({ environment: "cloud", service: "other", selfHost: false });
    expect(params.get("self-host")).toBe("false");
  });

  it("emits keys only for defined fields", () => {
    const params = serializeSetupState({ environment: "local" });
    expect(Array.from(params.keys())).toEqual(["environment"]);
  });

  it("emits keys in the stable order: environment, scheduler, service, self-host, editor, os", () => {
    const state: SetupState = {
      os: "macos",
      editor: "vscode",
      service: "aws-batch",
      environment: "cloud",
    };
    expect(Array.from(serializeSetupState(state).keys())).toEqual([
      "environment",
      "service",
      "editor",
      "os",
    ]);
  });

  it("emits all six keys when every field is present", () => {
    const state: SetupState = {
      environment: "hpc",
      scheduler: "slurm",
      editor: "vscode",
      os: "linux",
    };
    expect(Array.from(serializeSetupState(state).keys())).toEqual([
      "environment",
      "scheduler",
      "editor",
      "os",
    ]);
  });
});

// ── parseSetupSearch — valid inputs ───────────────────────────────────────────

describe("parseSetupSearch — valid inputs", () => {
  it("returns empty state and no invalid for empty params", () => {
    const result = parseSetupSearch(new URLSearchParams(), SETUP_CATALOG);
    expect(result.state).toEqual({});
    expect(result.invalid).toEqual([]);
  });

  it("accepts a valid partial environment", () => {
    const result = parseSetupSearch(new URLSearchParams("environment=local"), SETUP_CATALOG);
    expect(result.state).toEqual({ environment: "local" });
    expect(result.invalid).toEqual([]);
  });

  it("accepts scheduler when environment is hpc", () => {
    const result = parseSetupSearch(
      new URLSearchParams("environment=hpc&scheduler=slurm"),
      SETUP_CATALOG,
    );
    expect(result.state).toEqual({ environment: "hpc", scheduler: "slurm" });
    expect(result.invalid).toEqual([]);
  });

  it("accepts service when environment is cloud", () => {
    const result = parseSetupSearch(
      new URLSearchParams("environment=cloud&service=terra"),
      SETUP_CATALOG,
    );
    expect(result.state).toEqual({ environment: "cloud", service: "terra" });
    expect(result.invalid).toEqual([]);
  });

  it("accepts self-host when service is other", () => {
    const result = parseSetupSearch(
      new URLSearchParams("environment=cloud&service=other&self-host=true"),
      SETUP_CATALOG,
    );
    expect(result.state).toEqual({ environment: "cloud", service: "other", selfHost: true });
    expect(result.invalid).toEqual([]);
  });

  it("accepts self-host=false when service is other", () => {
    const result = parseSetupSearch(
      new URLSearchParams("environment=cloud&service=other&self-host=false"),
      SETUP_CATALOG,
    );
    expect(result.state.selfHost).toBe(false);
    expect(result.invalid).toEqual([]);
  });

  it("accepts an eligible editor", () => {
    const result = parseSetupSearch(new URLSearchParams("editor=vscode"), SETUP_CATALOG);
    expect(result.state.editor).toBe("vscode");
    expect(result.invalid).toEqual([]);
  });

  it("accepts os when editor supports it", () => {
    const result = parseSetupSearch(
      new URLSearchParams("editor=vscode&os=macos"),
      SETUP_CATALOG,
    );
    expect(result.state.os).toBe("macos");
    expect(result.invalid).toEqual([]);
  });
});

// ── parseSetupSearch — round-trips ────────────────────────────────────────────

describe("parseSetupSearch — round-trips", () => {
  it("round-trips a complete cloud state from the brief", () => {
    const state: SetupState = {
      environment: "cloud",
      service: "terra",
      editor: "vscode",
      os: "macos",
    };
    expect(parseSetupSearch(serializeSetupState(state), SETUP_CATALOG).state).toEqual(state);
  });

  it("round-trips an HPC state with scheduler", () => {
    const state: SetupState = {
      environment: "hpc",
      scheduler: "slurm",
      editor: "vscode",
      os: "linux",
    };
    expect(parseSetupSearch(serializeSetupState(state), SETUP_CATALOG).state).toEqual(state);
  });

  it("round-trips selfHost:false", () => {
    const state: SetupState = { environment: "cloud", service: "other", selfHost: false };
    expect(parseSetupSearch(serializeSetupState(state), SETUP_CATALOG).state).toEqual(state);
  });

  it("round-trips an editor-only partial state", () => {
    const state: SetupState = { editor: "neovim" };
    expect(parseSetupSearch(serializeSetupState(state), SETUP_CATALOG).state).toEqual(state);
  });
});

// ── parseSetupSearch — invalid and impossible inputs ─────────────────────────

describe("parseSetupSearch — invalid and impossible descendants", () => {
  it("removes impossible descendants from the brief example and reports them", () => {
    const parsed = parseSetupSearch(
      new URLSearchParams("environment=local&service=terra&self-host=true"),
      SETUP_CATALOG,
    );
    expect(parsed.state).toEqual({ environment: "local" });
    expect(parsed.invalid).toEqual(["service", "self-host"]);
  });

  it("rejects an invalid environment value", () => {
    const result = parseSetupSearch(
      new URLSearchParams("environment=cloud9"),
      SETUP_CATALOG,
    );
    expect(result.state.environment).toBeUndefined();
    expect(result.invalid).toContain("environment");
  });

  it("rejects scheduler when environment is not hpc", () => {
    const result = parseSetupSearch(
      new URLSearchParams("environment=local&scheduler=slurm"),
      SETUP_CATALOG,
    );
    expect(result.state.scheduler).toBeUndefined();
    expect(result.invalid).toContain("scheduler");
  });

  it("rejects scheduler with an invalid value even when environment is hpc", () => {
    const result = parseSetupSearch(
      new URLSearchParams("environment=hpc&scheduler=unknown"),
      SETUP_CATALOG,
    );
    expect(result.state.scheduler).toBeUndefined();
    expect(result.invalid).toContain("scheduler");
  });

  it("rejects service when environment is not cloud", () => {
    const result = parseSetupSearch(
      new URLSearchParams("environment=hpc&service=terra"),
      SETUP_CATALOG,
    );
    expect(result.state.service).toBeUndefined();
    expect(result.invalid).toContain("service");
  });

  it("rejects self-host when service is not other", () => {
    const result = parseSetupSearch(
      new URLSearchParams("environment=cloud&service=terra&self-host=true"),
      SETUP_CATALOG,
    );
    expect(result.state.selfHost).toBeUndefined();
    expect(result.invalid).toContain("self-host");
  });

  it("rejects self-host when service is absent", () => {
    const result = parseSetupSearch(
      new URLSearchParams("self-host=true"),
      SETUP_CATALOG,
    );
    expect(result.state.selfHost).toBeUndefined();
    expect(result.invalid).toContain("self-host");
  });

  it("rejects self-host with an invalid boolean string", () => {
    const result = parseSetupSearch(
      new URLSearchParams("environment=cloud&service=other&self-host=yes"),
      SETUP_CATALOG,
    );
    expect(result.state.selfHost).toBeUndefined();
    expect(result.invalid).toContain("self-host");
  });

  it("rejects an ineligible editor", () => {
    const result = parseSetupSearch(new URLSearchParams("editor=vim"), SETUP_CATALOG);
    expect(result.state.editor).toBeUndefined();
    expect(result.invalid).toContain("editor");
  });

  it("rejects an unknown editor id", () => {
    const result = parseSetupSearch(
      new URLSearchParams("editor=notepad"),
      SETUP_CATALOG,
    );
    expect(result.state.editor).toBeUndefined();
    expect(result.invalid).toContain("editor");
  });

  it("rejects os when no editor is present", () => {
    const result = parseSetupSearch(new URLSearchParams("os=macos"), SETUP_CATALOG);
    expect(result.state.os).toBeUndefined();
    expect(result.invalid).toContain("os");
  });

  it("rejects os with an invalid OsId value", () => {
    const result = parseSetupSearch(
      new URLSearchParams("editor=vscode&os=haiku"),
      SETUP_CATALOG,
    );
    expect(result.state.os).toBeUndefined();
    expect(result.invalid).toContain("os");
  });

  it("reports unknown keys in invalid", () => {
    const result = parseSetupSearch(
      new URLSearchParams("environment=local&foo=bar"),
      SETUP_CATALOG,
    );
    expect(result.invalid).toContain("foo");
    expect(result.state.environment).toBe("local");
  });

  it("reports multiple unknown keys", () => {
    const result = parseSetupSearch(
      new URLSearchParams("x=1&y=2"),
      SETUP_CATALOG,
    );
    expect(result.invalid).toContain("x");
    expect(result.invalid).toContain("y");
  });
});

// ── parseSetupSearch — invalid array ordering ─────────────────────────────────

describe("parseSetupSearch — invalid key ordering", () => {
  it("reports invalid keys in stable key order (service before self-host)", () => {
    const parsed = parseSetupSearch(
      new URLSearchParams("environment=local&self-host=true&service=terra"),
      SETUP_CATALOG,
    );
    // Both are invalid; service appears in the stable key order before self-host
    expect(parsed.invalid.indexOf("service")).toBeLessThan(parsed.invalid.indexOf("self-host"));
  });
});

// ── parseSetupSearch — duplicate known keys (Finding 3) ──────────────────────

describe("parseSetupSearch — duplicate known keys", () => {
  it("reports a duplicated parent key once and treats it as absent", () => {
    // environment appears twice → both values ambiguous → reject, treat as absent
    const result = parseSetupSearch(
      new URLSearchParams("environment=local&environment=cloud"),
      SETUP_CATALOG,
    );
    expect(result.state.environment).toBeUndefined();
    expect(result.invalid.filter((k) => k === "environment")).toHaveLength(1);
  });

  it("cascades: duplicated environment causes dependent service to be rejected too", () => {
    const result = parseSetupSearch(
      new URLSearchParams("environment=cloud&environment=local&service=terra"),
      SETUP_CATALOG,
    );
    // environment rejected (duplicate) → service has no valid parent → also rejected
    expect(result.state.environment).toBeUndefined();
    expect(result.state.service).toBeUndefined();
    expect(result.invalid).toContain("environment");
    expect(result.invalid).toContain("service");
  });

  it("reports a duplicated editor once and treats it as absent (os then also rejected)", () => {
    const result = parseSetupSearch(
      new URLSearchParams("editor=vscode&editor=neovim&os=macos"),
      SETUP_CATALOG,
    );
    expect(result.state.editor).toBeUndefined();
    expect(result.state.os).toBeUndefined();
    expect(result.invalid.filter((k) => k === "editor")).toHaveLength(1);
    expect(result.invalid).toContain("os");
  });

  it("reports a duplicated leaf key once (os, no further descendants)", () => {
    const result = parseSetupSearch(
      new URLSearchParams("editor=vscode&os=macos&os=linux"),
      SETUP_CATALOG,
    );
    expect(result.state.editor).toBe("vscode"); // not duplicated, accepted
    expect(result.state.os).toBeUndefined();
    expect(result.invalid.filter((k) => k === "os")).toHaveLength(1);
  });
});

// ── parseSetupSearch — unknown duplicate keys (Finding 3) ────────────────────

describe("parseSetupSearch — unknown duplicate keys", () => {
  it("reports an unknown key exactly once even when it appears multiple times", () => {
    const result = parseSetupSearch(
      new URLSearchParams("foo=bar&foo=baz"),
      SETUP_CATALOG,
    );
    expect(result.invalid.filter((k) => k === "foo")).toHaveLength(1);
  });

  it("reports two different unknown keys each once", () => {
    const result = parseSetupSearch(
      new URLSearchParams("x=1&y=2&x=3"),
      SETUP_CATALOG,
    );
    expect(result.invalid.filter((k) => k === "x")).toHaveLength(1);
    expect(result.invalid.filter((k) => k === "y")).toHaveLength(1);
  });
});

// ── parseSetupSearch — editor/OS compatibility (Finding 4) ───────────────────

describe("parseSetupSearch — editor/OS compatibility with cloned catalog", () => {
  it("rejects os=linux when the eligible editor only supports macos", () => {
    // Clone the catalog with vscode restricted to macOS only.
    const macOnlyCatalog: SetupCatalog = {
      ...SETUP_CATALOG,
      editors: {
        ...SETUP_CATALOG.editors,
        vscode: {
          ...SETUP_CATALOG.editors.vscode,
          supportedOs: ["macos"],
        },
      },
    };

    const result = parseSetupSearch(
      new URLSearchParams("editor=vscode&os=linux"),
      macOnlyCatalog,
    );
    expect(result.state.editor).toBe("vscode");
    expect(result.state.os).toBeUndefined();
    expect(result.invalid).toContain("os");
  });

  it("accepts os=macos for the same macOS-only editor", () => {
    const macOnlyCatalog: SetupCatalog = {
      ...SETUP_CATALOG,
      editors: {
        ...SETUP_CATALOG.editors,
        vscode: {
          ...SETUP_CATALOG.editors.vscode,
          supportedOs: ["macos"],
        },
      },
    };

    const result = parseSetupSearch(
      new URLSearchParams("editor=vscode&os=macos"),
      macOnlyCatalog,
    );
    expect(result.state.editor).toBe("vscode");
    expect(result.state.os).toBe("macos");
    expect(result.invalid).toEqual([]);
  });
});

// ── parseSetupSearch — percent-encoding (Finding 5) ──────────────────────────

describe("parseSetupSearch — percent-encoding", () => {
  it("decodes percent-encoded characters in parameter values", () => {
    // %61 = 'a', so environment=loc%61l decodes to 'local'
    const result = parseSetupSearch(
      new URLSearchParams("environment=loc%61l"),
      SETUP_CATALOG,
    );
    expect(result.state).toEqual({ environment: "local" });
    expect(result.invalid).toEqual([]);
  });

  it("round-trips aws-batch service through the serialized query string", () => {
    const state: SetupState = { environment: "cloud", service: "aws-batch" };
    const qs = serializeSetupState(state).toString();
    const reparsed = parseSetupSearch(new URLSearchParams(qs), SETUP_CATALOG);
    expect(reparsed.state).toEqual(state);
    expect(reparsed.invalid).toEqual([]);
  });

  it("accepts service=aws%2Dbatch (percent-encoded hyphen)", () => {
    // %2D = '-', so aws%2Dbatch decodes to 'aws-batch'
    const result = parseSetupSearch(
      new URLSearchParams("environment=cloud&service=aws%2Dbatch"),
      SETUP_CATALOG,
    );
    expect(result.state).toEqual({ environment: "cloud", service: "aws-batch" });
    expect(result.invalid).toEqual([]);
  });

  it("accepts os=windows%2Dwsl (percent-encoded hyphen in os value)", () => {
    const result = parseSetupSearch(
      new URLSearchParams("editor=vscode&os=windows%2Dwsl"),
      SETUP_CATALOG,
    );
    expect(result.state.os).toBe("windows-wsl");
    expect(result.invalid).toEqual([]);
  });
});
