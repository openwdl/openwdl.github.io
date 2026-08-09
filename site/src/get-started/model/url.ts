import type { SetupState } from "./types";
import type { SetupCatalog, CatalogEditor } from "../catalog/types";

/**
 * The result of parsing URL search parameters into a setup wizard state.
 *
 * `state` contains all accepted answers. `invalid` lists every key that was
 * rejected because its value was unrecognised, invalid, or impossible given
 * the answers that preceded it in the stable key order.
 */
export interface ParsedSetupSearch {
  /** The parsed and validated setup state; only accepted keys are present. */
  state: SetupState;
  /**
   * Keys that were rejected during parsing. Reported in the same stable order
   * as the URL key sequence: environment, scheduler, service, self-host,
   * editor, os, then any unknown keys in URL appearance order.
   */
  invalid: string[];
}

/**
 * The canonical stable key order used for both serialisation and invalid-key
 * reporting during parsing.
 *
 * Keys are processed in this exact order: `environment`, `scheduler`,
 * `service`, `self-host`, `editor`, `os`.
 */
const KEY_ORDER: readonly string[] = [
  "environment",
  "scheduler",
  "service",
  "self-host",
  "editor",
  "os",
];

/** O(1) membership test for the canonical key set. */
const KNOWN_KEYS: ReadonlySet<string> = new Set(KEY_ORDER);

/**
 * Looks up a catalog editor by an arbitrary runtime string, returning
 * `undefined` when the string is not a registered editor key.
 *
 * The widening cast to `Record<string, CatalogEditor | undefined>` is
 * intentionally safe: `Record<EditorId, CatalogEditor>` contains every known
 * editor key as a required property, so widening to a string-indexed record
 * with an `undefined` fallback correctly models the runtime behaviour for
 * unknown strings.  `noUncheckedIndexedAccess` would achieve the same result
 * without a cast, but this project does not enable that flag.
 *
 * A `hasOwnProperty` or `in` guard narrows the *object* type, not the string
 * key to `EditorId`, so the index access still requires a cast in either case —
 * there is no cast-free path in TypeScript's current type system for this
 * pattern.
 */
function lookupEditor(
  catalog: SetupCatalog,
  key: string,
): CatalogEditor | undefined {
  return (catalog.editors as Record<string, CatalogEditor | undefined>)[key];
}

/**
 * Parses URL search parameters into a validated {@link SetupState}.
 *
 * Keys are processed in the canonical stable order. A key is rejected
 * (omitted from `state` and added to `invalid`) when:
 * - its value is not a recognised literal for that field, or
 * - it is impossible given the already-accepted answers (e.g. `service` when
 *   `environment` is not `"cloud"`), or
 * - it is entirely unknown.
 *
 * Only catalog editor entries marked `eligible: true` are accepted.
 *
 * **Duplicate key policy:** If the same known key appears more than once in
 * `params`, it is added to `invalid` exactly once and skipped during value
 * processing.  For parent keys whose accepted value gates descendants (e.g.
 * `environment` gates `service`/`scheduler`; `editor` gates `os`), rejection
 * cascades naturally — each child's prerequisite check fails because the
 * parent is absent.  Unknown keys that appear more than once are reported
 * once, not once per occurrence.
 */
export function parseSetupSearch(
  params: URLSearchParams,
  catalog: SetupCatalog,
): ParsedSetupSearch {
  const state: SetupState = {};
  const invalid: string[] = [];

  // ── duplicate detection (runs before value processing, in KEY_ORDER) ──────
  // A duplicated known key is immediately added to `invalid` and treated as
  // absent for value processing.  This means any descendant that requires the
  // parent will also be rejected (by its own prerequisite check), making the
  // cascading effect automatic with no special-case logic.
  const duplicatedKnownKeys = new Set<string>();
  for (const key of KEY_ORDER) {
    if (params.getAll(key).length > 1) {
      duplicatedKnownKeys.add(key);
      invalid.push(key);
    }
  }

  // ── environment ──────────────────────────────────────────────────────────
  const envRaw = params.get("environment");
  if (envRaw !== null && !duplicatedKnownKeys.has("environment")) {
    if (envRaw === "local" || envRaw === "hpc" || envRaw === "cloud") {
      state.environment = envRaw;
    } else {
      invalid.push("environment");
    }
  }

  // ── scheduler (only valid when environment === "hpc") ─────────────────────
  const schedulerRaw = params.get("scheduler");
  if (schedulerRaw !== null && !duplicatedKnownKeys.has("scheduler")) {
    if (
      state.environment === "hpc" &&
      (schedulerRaw === "slurm" || schedulerRaw === "lsf" || schedulerRaw === "other")
    ) {
      state.scheduler = schedulerRaw;
    } else {
      invalid.push("scheduler");
    }
  }

  // ── service (only valid when environment === "cloud") ─────────────────────
  const serviceRaw = params.get("service");
  if (serviceRaw !== null && !duplicatedKnownKeys.has("service")) {
    if (
      state.environment === "cloud" &&
      (serviceRaw === "terra" || serviceRaw === "aws-batch" || serviceRaw === "other")
    ) {
      state.service = serviceRaw;
    } else {
      invalid.push("service");
    }
  }

  // ── self-host (only valid when service === "other") ────────────────────────
  const selfHostRaw = params.get("self-host");
  if (selfHostRaw !== null && !duplicatedKnownKeys.has("self-host")) {
    if (
      state.service === "other" &&
      (selfHostRaw === "true" || selfHostRaw === "false")
    ) {
      state.selfHost = selfHostRaw === "true";
    } else {
      invalid.push("self-host");
    }
  }

  // ── editor (only valid when the catalog marks it eligible) ─────────────────
  const editorRaw = params.get("editor");
  if (editorRaw !== null && !duplicatedKnownKeys.has("editor")) {
    const catalogEntry = lookupEditor(catalog, editorRaw);
    if (catalogEntry?.eligible === true) {
      state.editor = catalogEntry.id;
    } else {
      invalid.push("editor");
    }
  }

  // ── os (only valid when editor is present and supports this OS) ────────────
  const osRaw = params.get("os");
  if (osRaw !== null && !duplicatedKnownKeys.has("os")) {
    const editor = state.editor;
    if (
      editor !== undefined &&
      (osRaw === "macos" || osRaw === "linux" || osRaw === "windows-wsl")
    ) {
      const catalogEditor = catalog.editors[editor];
      if (catalogEditor.supportedOs.includes(osRaw)) {
        state.os = osRaw;
      } else {
        invalid.push("os");
      }
    } else {
      invalid.push("os");
    }
  }

  // ── unknown keys (in URL appearance order, deduplicated) ──────────────────
  // Each unknown key is reported once regardless of how many times it appears.
  const seenUnknown = new Set<string>();
  for (const key of params.keys()) {
    if (!KNOWN_KEYS.has(key) && !seenUnknown.has(key)) {
      seenUnknown.add(key);
      invalid.push(key);
    }
  }

  return { state, invalid };
}

/**
 * Serialises a {@link SetupState} into URL search parameters.
 *
 * Keys are always emitted in the canonical stable order:
 * `environment`, `scheduler`, `service`, `self-host`, `editor`, `os`.
 * The camelCase field `selfHost` is serialised under the key `self-host`.
 * Fields that are `undefined` are omitted entirely.
 */
export function serializeSetupState(state: SetupState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.environment !== undefined) params.set("environment", state.environment);
  if (state.scheduler !== undefined) params.set("scheduler", state.scheduler);
  if (state.service !== undefined) params.set("service", state.service);
  if (state.selfHost !== undefined) params.set("self-host", String(state.selfHost));
  if (state.editor !== undefined) params.set("editor", state.editor);
  if (state.os !== undefined) params.set("os", state.os);
  return params;
}
