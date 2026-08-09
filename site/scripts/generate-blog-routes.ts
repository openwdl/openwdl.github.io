import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBlogFiles } from "./load-blog-files";

const siteRoot = fileURLToPath(new URL("..", import.meta.url));
const generatedFile = join(siteRoot, "src", "generated", "blog-routes.generated.ts");
const posts = await loadBlogFiles();
const routeData = posts.map(({ slug, title, standfirst, legacyPath }) => ({
  slug,
  title,
  standfirst,
  legacyPath,
}));

const source = `/** Generated from src/content/blog/*.md. Do not edit manually. */
export const BLOG_ROUTE_DATA = ${JSON.stringify(routeData, null, 2)} as const;
`;

await mkdir(dirname(generatedFile), { recursive: true });
await writeFile(generatedFile, source, "utf8");
console.log(`Compiled ${routeData.length} blog route(s).`);
