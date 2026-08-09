import { describe, it, expect } from "vitest";
import { buildSetupIssueUrl } from "./issue";
import type { SetupState } from "./types";

// ── URL shape ─────────────────────────────────────────────────────────────────

describe("buildSetupIssueUrl — URL shape", () => {
  it("targets exactly https://github.com/openwdl/brand/issues/new", () => {
    const url = buildSetupIssueUrl({ environment: "cloud", service: "other", selfHost: false, editor: "vscode", os: "linux" });
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("https://github.com/openwdl/brand/issues/new");
  });

  it("sets a deterministic title", () => {
    const url = buildSetupIssueUrl({});
    const parsed = new URL(url);
    expect(parsed.searchParams.get("title")).toBe("Setup request: unsupported WDL environment");
  });

  it("sets labels to 'documentation,setup'", () => {
    const url = buildSetupIssueUrl({});
    const parsed = new URL(url);
    expect(parsed.searchParams.get("labels")).toBe("documentation,setup");
  });

  it("encodes all search params (no raw spaces in URL string)", () => {
    const url = buildSetupIssueUrl({ environment: "local" });
    expect(url).not.toContain(" ");
  });
});

// ── Body content — supported setup fields ─────────────────────────────────────

describe("buildSetupIssueUrl — body content", () => {
  it("includes only supported setup fields (from the task brief)", () => {
    const url = buildSetupIssueUrl({
      environment: "cloud",
      service: "other",
      selfHost: false,
      editor: "vscode",
      os: "linux",
    });
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("https://github.com/openwdl/brand/issues/new");
    expect(parsed.searchParams.get("body")).toContain("Environment: cloud");
    expect(parsed.searchParams.get("body")).not.toMatch(/token|credential|path/i);
  });

  it("includes Environment when set", () => {
    const body = new URL(buildSetupIssueUrl({ environment: "hpc" })).searchParams.get("body")!;
    expect(body).toContain("Environment: hpc");
  });

  it("includes Scheduler when set", () => {
    const body = new URL(buildSetupIssueUrl({ environment: "hpc", scheduler: "slurm" })).searchParams.get("body")!;
    expect(body).toContain("Scheduler: slurm");
  });

  it("includes Service when set", () => {
    const body = new URL(buildSetupIssueUrl({ environment: "cloud", service: "terra" })).searchParams.get("body")!;
    expect(body).toContain("Service: terra");
  });

  it("includes Self-host as 'false' when set to false", () => {
    const body = new URL(buildSetupIssueUrl({ environment: "cloud", service: "other", selfHost: false })).searchParams.get("body")!;
    expect(body).toContain("Self-host: false");
  });

  it("includes Self-host as 'true' when set to true", () => {
    const body = new URL(buildSetupIssueUrl({ environment: "cloud", service: "other", selfHost: true })).searchParams.get("body")!;
    expect(body).toContain("Self-host: true");
  });

  it("includes Editor when set", () => {
    const body = new URL(buildSetupIssueUrl({ editor: "vscode" })).searchParams.get("body")!;
    expect(body).toContain("Editor: vscode");
  });

  it("includes Operating system when set", () => {
    const body = new URL(buildSetupIssueUrl({ editor: "vscode", os: "macos" })).searchParams.get("body")!;
    expect(body).toContain("Operating system: macos");
  });

  it("omits fields that are undefined", () => {
    const body = new URL(buildSetupIssueUrl({ environment: "local" })).searchParams.get("body")!;
    expect(body).not.toContain("Scheduler");
    expect(body).not.toContain("Service");
    expect(body).not.toContain("Self-host");
    expect(body).not.toContain("Editor");
    expect(body).not.toContain("Operating system");
  });

  it("produces empty answered-fields section for an empty state", () => {
    const body = new URL(buildSetupIssueUrl({})).searchParams.get("body")!;
    expect(body).toContain("## Requested setup");
    expect(body).not.toContain("Environment:");
  });
});

// ── Privacy / security guarantees ─────────────────────────────────────────────

describe("buildSetupIssueUrl — privacy safety", () => {
  it("never includes 'token', 'credential', or 'path' in the URL", () => {
    const state: SetupState = { environment: "cloud", service: "other", selfHost: true, editor: "vscode", os: "linux" };
    const url = buildSetupIssueUrl(state);
    expect(url).not.toMatch(/token|credential|path/i);
  });

  it("output is deterministic for the same input", () => {
    const state: SetupState = { environment: "hpc", scheduler: "slurm", editor: "vscode", os: "linux" };
    expect(buildSetupIssueUrl(state)).toBe(buildSetupIssueUrl(state));
  });
});

// ── Deterministic field order — all six fields ─────────────────────────────────

describe("buildSetupIssueUrl — deterministic field order", () => {
  it("emits all six fields in declaration order (Environment → Scheduler → Service → Self-host → Editor → Operating system)", () => {
    const body = new URL(
      buildSetupIssueUrl({
        environment: "hpc",
        scheduler: "slurm",
        service: "other",
        selfHost: false,
        editor: "vscode",
        os: "linux",
      }),
    ).searchParams.get("body")!;
    const positions = [
      body.indexOf("Environment: hpc"),
      body.indexOf("Scheduler: slurm"),
      body.indexOf("Service: other"),
      body.indexOf("Self-host: false"),
      body.indexOf("Editor: vscode"),
      body.indexOf("Operating system: linux"),
    ];
    for (const pos of positions) expect(pos).toBeGreaterThan(-1);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});

// ── Input validation — reject invalid values ───────────────────────────────────

describe("buildSetupIssueUrl — input validation", () => {
  it("throws TypeError naming 'environment' for an unrecognised environment string", () => {
    expect(() => buildSetupIssueUrl({ environment: "datacenter" as never }))
      .toThrow(TypeError);
    expect(() => buildSetupIssueUrl({ environment: "datacenter" as never }))
      .toThrow(/environment/);
  });

  it("throws TypeError naming 'scheduler' for an unrecognised scheduler string", () => {
    expect(() => buildSetupIssueUrl({ environment: "hpc", scheduler: "torque" as never }))
      .toThrow(TypeError);
    expect(() => buildSetupIssueUrl({ environment: "hpc", scheduler: "torque" as never }))
      .toThrow(/scheduler/);
  });

  it("throws TypeError naming 'service' for an unrecognised service string", () => {
    expect(() => buildSetupIssueUrl({ service: "gcp" as never }))
      .toThrow(TypeError);
    expect(() => buildSetupIssueUrl({ service: "gcp" as never }))
      .toThrow(/service/);
  });

  it("throws TypeError naming 'editor' for an unrecognised editor string", () => {
    expect(() => buildSetupIssueUrl({ editor: "notepad" as never }))
      .toThrow(TypeError);
    expect(() => buildSetupIssueUrl({ editor: "notepad" as never }))
      .toThrow(/editor/);
  });

  it("throws TypeError naming 'os' for an unrecognised os string", () => {
    expect(() => buildSetupIssueUrl({ os: "freebsd" as never }))
      .toThrow(TypeError);
    expect(() => buildSetupIssueUrl({ os: "freebsd" as never }))
      .toThrow(/os/);
  });

  it("throws TypeError naming 'selfHost' when selfHost is a string instead of a boolean", () => {
    expect(() => buildSetupIssueUrl({ selfHost: "true" as unknown as boolean }))
      .toThrow(TypeError);
    expect(() => buildSetupIssueUrl({ selfHost: "true" as unknown as boolean }))
      .toThrow(/selfHost/);
  });

  it("throws TypeError naming 'environment' when environment is a number", () => {
    expect(() => buildSetupIssueUrl({ environment: 42 as unknown as "cloud" }))
      .toThrow(TypeError);
    expect(() => buildSetupIssueUrl({ environment: 42 as unknown as "cloud" }))
      .toThrow(/environment/);
  });

  it("throws TypeError for newline injection in environment", () => {
    expect(() => buildSetupIssueUrl({ environment: "cloud\ninjected" as never }))
      .toThrow(TypeError);
    expect(() => buildSetupIssueUrl({ environment: "cloud\ninjected" as never }))
      .toThrow(/environment/);
  });

  it("throws TypeError for carriage-return injection in editor", () => {
    expect(() => buildSetupIssueUrl({ editor: "vscode\revil" as never }))
      .toThrow(TypeError);
    expect(() => buildSetupIssueUrl({ editor: "vscode\revil" as never }))
      .toThrow(/editor/);
  });

  it("throws TypeError for NUL-byte injection in os", () => {
    expect(() => buildSetupIssueUrl({ os: "linux\x00" as never }))
      .toThrow(TypeError);
    expect(() => buildSetupIssueUrl({ os: "linux\x00" as never }))
      .toThrow(/os/);
  });

  it("preserves false for selfHost (does not silently omit falsy boolean)", () => {
    const body = new URL(
      buildSetupIssueUrl({ selfHost: false }),
    ).searchParams.get("body")!;
    expect(body).toContain("Self-host: false");
  });
});
