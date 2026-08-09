import { authorIds } from "./authors";
import {
  parseBlogSource,
  sortPosts,
  validatePostCollection,
  type BlogPost,
} from "./blogSchema";

const sources = import.meta.glob<string>("./blog/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const posts = sortPosts(
  Object.entries(sources).map(([path, raw]) =>
    parseBlogSource(path, raw, authorIds)),
);
validatePostCollection(posts);

/**
 * Returns every published blog post, sorted newest-first.
 */
export function getPosts(): readonly BlogPost[] {
  return posts;
}

/**
 * Selects the explicitly featured post, falling back to the newest post.
 *
 * Returns `undefined` for an empty collection rather than an absent element
 * typed as present: an empty content directory or a glob that matches nothing
 * previously produced `undefined` here and threw on the caller's first
 * property access, which is the one failure in this pipeline that did not
 * surface as a validation error naming the file.
 */
export function selectFeaturedPost(
  candidates: readonly BlogPost[],
): BlogPost | undefined {
  return candidates.find((post) => post.featured) ?? candidates[0];
}

/**
 * Returns the post promoted in the blog's featured card, or `undefined` when
 * no posts are published.
 */
export function getFeaturedPost(): BlogPost | undefined {
  return selectFeaturedPost(posts);
}

/**
 * Looks up a single published blog post by its slug, or `undefined` if no
 * post with that slug exists.
 */
export function getPost(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}
