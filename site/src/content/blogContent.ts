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
 */
export function selectFeaturedPost(candidates: readonly BlogPost[]): BlogPost {
  return candidates.find((post) => post.featured) ?? candidates[0];
}

/**
 * Returns the post promoted in the blog's featured card.
 */
export function getFeaturedPost(): BlogPost {
  return selectFeaturedPost(posts);
}

/**
 * Looks up a single published blog post by its slug, or `undefined` if no
 * post with that slug exists.
 */
export function getPost(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}
