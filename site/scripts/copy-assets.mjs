/**
 * Build-time asset copy script.
 *
 * Copies the repo-level `assets/` directory into `site/public/assets/` so
 * that Vite can serve logo SVGs and PNGs during development and include them
 * in the production build output.
 *
 * This script is intentionally kept as a plain Node.js module (no bundling)
 * so it can be invoked with `node scripts/copy-assets.mjs` before `vite build`.
 */

import { cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Resolve paths relative to this script file so the script works regardless
// of the working directory from which it is invoked.
const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "../../assets");
const dest = resolve(here, "../public/assets");

// Bail early with a clear error if the repo-level assets folder is missing,
// rather than silently producing an empty public/assets.
if (!existsSync(src)) {
  console.error(`Asset source not found: ${src}`);
  process.exit(1);
}

// Remove any previous copy so stale files (e.g. deleted assets) don't linger.
rmSync(dest, { recursive: true, force: true });

// Copy the entire assets tree into public/ recursively.
cpSync(src, dest, { recursive: true });

console.log(`Copied assets from ${src} to ${dest}`);

// Copy the brand-guidelines PDF from the repo root into public/ so Vite can
// serve it during development and include it in the production build output.
// Guarded by existsSync so the script still succeeds in CI environments where
// the PDF has not yet been generated.
const pdfSrc = resolve(here, "../../brand-guidelines.pdf");
if (existsSync(pdfSrc)) {
  cpSync(pdfSrc, resolve(here, "../public/brand-guidelines.pdf"));
  console.log(`Copied PDF from ${pdfSrc}`);
} else {
  console.warn(`PDF not found, skipping: ${pdfSrc}`);
}
