import { parse as parseYaml } from "yaml";
import type { AuthorId } from "./authorIds";

/**
 * The editorial category a blog post belongs to. Drives filtering, the
 * "previous/next" navigation within a genre, and any genre-specific styling.
 */
export type BlogGenre = "release" | "report" | "tool" | "guide" | "meta";

/**
 * A single parsed and validated blog post, combining its front-matter
 * metadata with the raw Markdown body and derived reading time.
 */
export interface BlogPost {
  sourcePath: string;
  slug: string;
  title: string;
  publishedAt: string;
  publishedTime: number;
  authors: AuthorId[];
  genre: BlogGenre;
  standfirst: string;
  featured: boolean;
  version?: string;
  specUrl?: string;
  legacyPath: string;
  body: string;
  readingMinutes: number;
}

const GENRES = new Set<BlogGenre>(["release", "report", "tool", "guide", "meta"]);
const VERSION = /^\d+\.\d+\.\d+$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FRONT_MATTER = /^---\s*\n([\s\S]*?)\n---\s*\n/;
const WORDS_PER_MINUTE = 225;

// A single safe legacy-path URL segment: starts and ends with an
// alphanumeric character, with only `-`/`_` allowed between them. This
// deliberately excludes `.` entirely, so both literal `.`/`..` segments and
// any segment merely containing a dot are already rejected by the pattern;
// it also excludes `%`, whitespace, and all other punctuation, so
// percent-encoded traversal/slash sequences (`%2e%2e`, `%2f`) and
// backslashes can never match.
const LEGACY_PATH_SEGMENT = /^[A-Za-z0-9](?:[A-Za-z0-9_-]*[A-Za-z0-9])?$/;

/**
 * Validates that `candidate` is safe to use as a blog post's `legacyPath`:
 * an absolute, trailing-slash URL path (no query string or fragment, no
 * backslashes) made up of one or more nonempty segments, each of which is a
 * "safe" URL segment per `LEGACY_PATH_SEGMENT` (so `.`, `..`, percent-encoded
 * traversal/slash sequences, and any other malformed segment are rejected).
 * Enforced at the content-schema boundary (`parseBlogSource`); the static
 * route generator additionally proves every output path resolves inside
 * its `distDir` and never collides with a reserved route as its own,
 * independent defense-in-depth layer.
 */
export function isSafeLegacyPath(candidate: string): boolean {
  if (candidate.includes("\\") || candidate.includes("?") || candidate.includes("#")) {
    return false;
  }
  if (!candidate.startsWith("/") || !candidate.endsWith("/") || candidate === "/") {
    return false;
  }

  const segments = candidate.slice(1, -1).split("/");
  return segments.length > 0 && segments.every((segment) => LEGACY_PATH_SEGMENT.test(segment));
}

/**
 * Raises a parse error tagged with the offending source path and field, so
 * failures during content loading point straight at the bad Markdown file.
 */
function fail(sourcePath: string, message: string): never {
  throw new Error(`${sourcePath}: ${message}`);
}

/**
 * Parses a single Markdown blog source (front matter + body) into a fully
 * validated `BlogPost`. Every metadata field is checked against its expected
 * shape; unknown authors, malformed versions, and invalid genres all raise
 * descriptive errors that include the source path.
 */
export function parseBlogSource(
  sourcePath: string,
  raw: string,
  authorIds: ReadonlySet<string>,
): BlogPost {
  const match = FRONT_MATTER.exec(raw);
  if (!match) {
    fail(sourcePath, "missing front matter block delimited by `---`");
  }

  const [fullMatch, frontMatterBlock] = match;
  const body = raw.slice(fullMatch.length).trim();

  let data: unknown;
  try {
    data = parseYaml(frontMatterBlock);
  } catch (error) {
    fail(sourcePath, `front matter is not valid YAML: ${(error as Error).message}`);
  }

  if (typeof data !== "object" || data === null) {
    fail(sourcePath, "front matter must be a YAML mapping");
  }

  const meta = data as Record<string, unknown>;

  const slug = meta.slug;
  if (typeof slug !== "string" || !SLUG.test(slug)) {
    fail(sourcePath, "slug must be a lowercase, hyphen-separated string");
  }

  const title = meta.title;
  if (typeof title !== "string" || title.trim() === "") {
    fail(sourcePath, "title must be non-empty");
  }

  const rawDate = meta.date;
  if (typeof rawDate !== "string" && !(rawDate instanceof Date)) {
    fail(sourcePath, "date must be an ISO 8601 timestamp");
  }
  const publishedAt = rawDate instanceof Date ? rawDate.toISOString() : rawDate;
  const publishedTime = new Date(publishedAt).getTime();
  if (Number.isNaN(publishedTime)) {
    fail(sourcePath, "date must be a valid ISO 8601 timestamp");
  }

  const rawAuthors = meta.authors;
  if (!Array.isArray(rawAuthors) || rawAuthors.length === 0) {
    fail(sourcePath, "authors must be a non-empty list");
  }
  for (const authorId of rawAuthors) {
    if (typeof authorId !== "string" || !authorIds.has(authorId)) {
      fail(sourcePath, `unknown author \`${authorId}\``);
    }
  }
  const authors = rawAuthors as AuthorId[];

  const genre = meta.genre;
  if (typeof genre !== "string" || !GENRES.has(genre as BlogGenre)) {
    fail(sourcePath, `genre must be one of ${[...GENRES].join(", ")}`);
  }

  const standfirst = meta.standfirst;
  if (typeof standfirst !== "string" || standfirst.trim() === "") {
    fail(sourcePath, "standfirst must be non-empty");
  }

  let featured = false;
  if (meta.featured !== undefined) {
    if (typeof meta.featured !== "boolean") {
      fail(sourcePath, "featured must be a boolean");
    }
    featured = meta.featured;
  }

  let version: string | undefined;
  if (meta.version !== undefined) {
    if (typeof meta.version !== "string" || !VERSION.test(meta.version)) {
      fail(sourcePath, "version must use MAJOR.MINOR.PATCH");
    }
    version = meta.version;
  } else if (genre === "release") {
    fail(sourcePath, "version is required when genre is `release`");
  }

  const specUrl = meta.specUrl;
  if (specUrl !== undefined && typeof specUrl !== "string") {
    fail(sourcePath, "specUrl must be a string");
  }

  const legacyPath = meta.legacyPath;
  if (typeof legacyPath !== "string" || !isSafeLegacyPath(legacyPath)) {
    fail(
      sourcePath,
      "legacyPath must be a safe, absolute, trailing-slash path of nonempty segments "
        + "(no `.`/`..`, no query string or fragment, no backslashes, no percent-encoding)",
    );
  }

  if (body === "") {
    fail(sourcePath, "body must be non-empty");
  }

  const wordCount = body.trim().split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

  return {
    sourcePath,
    slug,
    title,
    publishedAt,
    publishedTime,
    authors,
    genre: genre as BlogGenre,
    standfirst,
    featured,
    version,
    specUrl: specUrl as string | undefined,
    legacyPath,
    body,
    readingMinutes,
  };
}

/**
 * Sorts posts newest-first by publish time, breaking ties by descending
 * slug so that same-timestamp posts have a stable, deterministic order.
 */
export function sortPosts(posts: readonly BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (left, right) =>
      right.publishedTime - left.publishedTime
      || right.slug.localeCompare(left.slug),
  );
}

/**
 * Finds the posts immediately newer and older than the given post within
 * its own genre, enabling "previous/next" navigation that never crosses
 * between, for example, releases and reports.
 */
export function getAdjacentPosts(
  posts: readonly BlogPost[],
  post: BlogPost,
): { newer?: BlogPost; older?: BlogPost } {
  const related = sortPosts(posts.filter((candidate) => candidate.genre === post.genre));
  const index = related.findIndex((candidate) => candidate.slug === post.slug);
  return {
    newer: index > 0 ? related[index - 1] : undefined,
    older: index >= 0 && index < related.length - 1 ? related[index + 1] : undefined,
  };
}

/**
 * Formats the short record label shown next to release posts: `vMAJOR.MINOR`
 * when the patch is `0` (e.g. `1.3.0` → `v1.3`), or `vMAJOR.MINOR.PATCH`
 * when a non-zero patch carries meaning (e.g. `1.2.1` → `v1.2.1`). Returns
 * an empty string for posts without a version.
 */
export function formatRecordLabel(post: BlogPost): string {
  if (!post.version) {
    return "";
  }
  const [major, minor, patch] = post.version.split(".");
  return patch && patch !== "0" ? `v${major}.${minor}.${patch}` : `v${major}.${minor}`;
}

/**
 * Validates a full collection of posts for cross-post invariants that a
 * single `parseBlogSource` call cannot check on its own: unique slugs and
 * unique legacy paths across the whole site.
 */
export function validatePostCollection(posts: readonly BlogPost[]): void {
  const seenSlugs = new Map<string, string>();
  const seenLegacyPaths = new Map<string, string>();

  for (const post of posts) {
    const existingSlug = seenSlugs.get(post.slug);
    if (existingSlug) {
      throw new Error(
        `${post.sourcePath}: duplicate slug \`${post.slug}\` also used by ${existingSlug}`,
      );
    }
    seenSlugs.set(post.slug, post.sourcePath);

    const existingLegacyPath = seenLegacyPaths.get(post.legacyPath);
    if (existingLegacyPath) {
      throw new Error(
        `${post.sourcePath}: duplicate legacyPath \`${post.legacyPath}\` also used by ${existingLegacyPath}`,
      );
    }
    seenLegacyPaths.set(post.legacyPath, post.sourcePath);
  }

  const featuredPosts = posts.filter((post) => post.featured);
  if (featuredPosts.length > 1) {
    throw new Error(
      `multiple featured posts: ${featuredPosts.map((post) => post.sourcePath).join(", ")}`,
    );
  }
}
