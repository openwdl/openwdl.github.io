import type { SetupCatalog, CatalogIssue, OsId } from "./types";

/** Valid OS identifiers used to catch runtime contamination of install method records. */
const VALID_OS_IDS: ReadonlySet<OsId> = new Set<OsId>(["macos", "linux", "windows-wsl"]);

/**
 * Validates a {@link SetupCatalog} and returns a (possibly empty) array of
 * {@link CatalogIssue} records describing every constraint violation found.
 *
 * Rules enforced:
 * - Every `id` field on an entry must match its key in the parent `Record`.
 * - Every service `engine` field must reference a key present in `catalog.engines`.
 * - Every install method `os` value must be a recognised {@link OsId}.
 * - Eligible engines must have a non-empty `owner`, `upstreamUrl`, `docsUrl`, and
 *   at least one install method; each install method must have at least one
 *   verification command.
 * - Eligible services must have a non-empty `owner`, `upstreamUrl`, `docsUrl`, and
 *   at least one verification command.
 * - Eligible editors must have a non-empty `verification` description.
 */
export function validateSetupCatalog(catalog: SetupCatalog): CatalogIssue[] {
  const issues: CatalogIssue[] = [];

  // ── Engines ──────────────────────────────────────────────────────────────
  for (const [rawId, engine] of Object.entries(catalog.engines)) {
    const base = `engines.${rawId}`;

    if (engine.id !== rawId) {
      issues.push({ path: `${base}.id`, message: `ID mismatch: key "${rawId}" vs. id field "${engine.id}".` });
    }

    if (engine.eligible) {
      if (!engine.owner) {
        issues.push({ path: `${base}.owner`, message: "Eligible engine must have a non-empty owner." });
      }
      if (!engine.upstreamUrl) {
        issues.push({ path: `${base}.upstreamUrl`, message: "Eligible engine must have a non-empty upstreamUrl." });
      }
      if (!engine.docsUrl) {
        issues.push({ path: `${base}.docsUrl`, message: "Eligible engine must have a non-empty docsUrl." });
      }
      if (engine.install.length === 0) {
        issues.push({ path: `${base}.install`, message: "Eligible engine must have at least one install method." });
      }
    }

    for (let i = 0; i < engine.install.length; i++) {
      const method = engine.install[i];
      const methodBase = `${base}.install.${i}`;

      if (!VALID_OS_IDS.has(method.os)) {
        issues.push({ path: `${methodBase}.os`, message: `Unrecognised OS value: "${method.os}".` });
      }

      if (engine.eligible && method.verification.length === 0) {
        issues.push({
          path: `${methodBase}.verification`,
          message: "Install method for an eligible engine must have at least one verification command.",
        });
      }
    }
  }

  // ── Services ─────────────────────────────────────────────────────────────
  for (const [rawId, service] of Object.entries(catalog.services)) {
    const base = `services.${rawId}`;

    if (service.id !== rawId) {
      issues.push({ path: `${base}.id`, message: `ID mismatch: key "${rawId}" vs. id field "${service.id}".` });
    }

    if (!(service.engine in catalog.engines)) {
      issues.push({
        path: `${base}.engine`,
        message: `Engine "${service.engine}" is not present in catalog.engines.`,
      });
    }

    if (service.eligible) {
      if (!service.owner) {
        issues.push({ path: `${base}.owner`, message: "Eligible service must have a non-empty owner." });
      }
      if (!service.upstreamUrl) {
        issues.push({ path: `${base}.upstreamUrl`, message: "Eligible service must have a non-empty upstreamUrl." });
      }
      if (!service.docsUrl) {
        issues.push({ path: `${base}.docsUrl`, message: "Eligible service must have a non-empty docsUrl." });
      }
      // Managed services may provide a browser-based verificationUrl instead of CLI commands.
      if (service.verification.length === 0 && !service.verificationUrl) {
        issues.push({ path: `${base}.verification`, message: "Eligible service must have at least one verification command or a verificationUrl." });
      }
    }
  }

  // ── Editors ───────────────────────────────────────────────────────────────
  for (const [rawId, editor] of Object.entries(catalog.editors)) {
    const base = `editors.${rawId}`;

    if (editor.id !== rawId) {
      issues.push({ path: `${base}.id`, message: `ID mismatch: key "${rawId}" vs. id field "${editor.id}".` });
    }

    if (editor.eligible && !editor.verification) {
      issues.push({
        path: `${base}.verification`,
        message: "Eligible editor must have a non-empty verification description.",
      });
    }
  }

  return issues;
}
