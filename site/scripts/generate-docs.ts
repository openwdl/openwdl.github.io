import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileDocs } from "./docs/compile.js";
import type { SearchManifest } from "./docs/search.js";

const SEARCH_BUDGET_BYTES = 500 * 1024;

const siteRoot = fileURLToPath(new URL("..", import.meta.url));
const contentRoot = join(siteRoot, "src", "content", "docs");
const generatedFile = join(siteRoot, "src", "generated", "docs.generated.ts");
const searchRoot = join(siteRoot, "public", "search");

const result = await compileDocs({ contentRoot, generatedFile, searchRoot });
console.log(`Compiled ${result.pages.length} documentation page(s).`);

const manifestJson = await readFile(join(searchRoot, "manifest.json"), "utf8");
const manifest = JSON.parse(manifestJson) as SearchManifest;
console.log(`Search index: ${manifest.gzipBytes} bytes (gzipped).`);
if (manifest.gzipBytes > SEARCH_BUDGET_BYTES) {
  console.error(
    `ERROR: Search index exceeds the 500 KB gzip budget (${manifest.gzipBytes} bytes). ` +
      "Reduce content or split the index further.",
  );
  process.exit(1);
}
