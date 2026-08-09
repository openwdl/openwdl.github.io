import type { SetupState } from "./types";

const VALID_ENVIRONMENT = ["local", "hpc", "cloud"] as const;
const VALID_SCHEDULER = ["slurm", "lsf", "other"] as const;
const VALID_SERVICE = ["terra", "aws-batch", "other"] as const;
const VALID_EDITOR = [
  "vscode", "neovim", "generic-lsp", "jetbrains",
  "vim", "emacs", "sublime", "cli-only",
] as const;
const VALID_OS = ["macos", "linux", "windows-wsl"] as const;

/** Returns true if the string contains any ASCII control character (0x00–0x1f or 0x7f). */
function hasControlChar(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

function assertEnum(field: string, value: unknown, allowed: readonly string[]): void {
  if (typeof value !== "string") {
    throw new TypeError(
      `SetupState.${field}: expected a string, got ${typeof value}`,
    );
  }
  if (hasControlChar(value)) {
    throw new TypeError(
      `SetupState.${field}: value contains disallowed control characters`,
    );
  }
  if (!allowed.includes(value)) {
    throw new TypeError(
      `SetupState.${field}: "${value}" is not one of [${allowed.join(", ")}]`,
    );
  }
}

function assertBoolean(field: string, value: unknown): void {
  if (typeof value !== "boolean") {
    throw new TypeError(
      `SetupState.${field}: expected boolean (true or false), got ${typeof value}`,
    );
  }
}

/**
 * Builds a prefilled GitHub issue URL for the openwdl/brand repository.
 *
 * Only enumerated, non-sensitive fields from {@link SetupState} are included in
 * the body. No credentials, file paths, arbitrary user text, tokens, or
 * auto-submit network behaviour are ever included. The URL is deterministic and
 * fully URL-encoded by {@link URLSearchParams}.
 *
 * @throws {TypeError} if any supplied field value is not in the exact typed
 *   allowlist, contains a control character, or is the wrong runtime type.
 *   Callers must pass already-parsed, validated state — invalid values are
 *   never silently omitted.
 */
export function buildSetupIssueUrl(state: SetupState): string {
  if (state.environment !== undefined) assertEnum("environment", state.environment, VALID_ENVIRONMENT);
  if (state.scheduler !== undefined) assertEnum("scheduler", state.scheduler, VALID_SCHEDULER);
  if (state.service !== undefined) assertEnum("service", state.service, VALID_SERVICE);
  if (state.selfHost !== undefined) assertBoolean("selfHost", state.selfHost);
  if (state.editor !== undefined) assertEnum("editor", state.editor, VALID_EDITOR);
  if (state.os !== undefined) assertEnum("os", state.os, VALID_OS);

  const rawEntries: [string, string | boolean | undefined][] = [
    ["Environment", state.environment],
    ["Scheduler", state.scheduler],
    ["Service", state.service],
    ["Self-host", state.selfHost],
    ["Editor", state.editor],
    ["Operating system", state.os],
  ];

  const answers: [string, string][] = rawEntries
    .filter((entry): entry is [string, string | boolean] => entry[1] !== undefined)
    .map(([label, value]): [string, string] => [label, String(value)]);

  const body = [
    "## Requested setup",
    "",
    ...answers.map(([label, value]) => `- ${label}: ${value}`),
    "",
    "## What environment or integration do you need?",
    "",
  ].join("\n");

  const url = new URL("https://github.com/openwdl/brand/issues/new");
  url.searchParams.set("title", "Setup request: unsupported WDL environment");
  url.searchParams.set("body", body);
  url.searchParams.set("labels", "documentation,setup");
  return url.toString();
}
