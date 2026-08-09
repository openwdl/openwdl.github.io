import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AUTHOR_IDS } from "../src/content/authorIds";
import {
  type BlogPost,
  parseBlogSource,
  sortPosts,
  validatePostCollection,
} from "../src/content/blogSchema";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * The on-disk location of the Markdown blog content, resolved relative to
 * this file so the loader works regardless of the process's current
 * working directory.
 */
export const DEFAULT_BLOG_CONTENT_DIR = resolve(here, "../src/content/blog");

const authorIds: ReadonlySet<string> = new Set(AUTHOR_IDS);

/**
 * Loads, parses, and validates every Markdown blog post from disk using
 * `node:fs/promises`. This mirrors the browser loader in
 * `src/content/blogContent.ts` (same `parseBlogSource`, `sortPosts`, and
 * `validatePostCollection` calls) but never imports `src/content/authors.ts`,
 * which pulls in bundler-only portrait image imports that Node cannot
 * resolve. It instead validates against the image-free `AUTHOR_IDS` tuple.
 */
export async function loadBlogFiles(
  contentDir: string = DEFAULT_BLOG_CONTENT_DIR,
): Promise<BlogPost[]> {
  const entries = await readdir(contentDir);
  const markdownFiles = entries.filter((entry) => entry.endsWith(".md")).sort();

  const posts = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const sourcePath = join(contentDir, fileName);
      const raw = await readFile(sourcePath, "utf8");
      return parseBlogSource(`./blog/${fileName}`, raw, authorIds);
    }),
  );

  const sorted = sortPosts(posts);
  validatePostCollection(sorted);
  return sorted;
}
