/**
 * Base-relative href helper shared across all documentation components.
 *
 * Resolves a root-relative doc path (e.g. `/docs/start/language/tasks/`) against the
 * configured Vite BASE_URL so all internal links work under both the preview
 * base (`/brand/`) and the production root (`/`).
 *
 * Accepts an optional `base` argument so the function can be exercised in
 * tests without mocking `import.meta.env`.
 *
 * @example
 * docHref("/docs/start/language/tasks/", "/brand/") // → "/brand/docs/start/language/tasks/"
 * docHref("/docs/start/language/tasks/", "/") // → "/docs/start/language/tasks/"
 */
export function docHref(path: string, base = import.meta.env.BASE_URL): string {
  // base always ends with "/" (Vite guarantees this); path always starts with "/".
  return base + path.slice(1);
}
