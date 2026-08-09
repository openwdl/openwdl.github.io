/**
 * The canonical list of author identifiers recognized across the site.
 * Blog post front matter, the author registry, and byline components all
 * validate against this tuple.
 */
export const AUTHOR_IDS = [
  "clay-mcleod",
  "venkat-malladi",
  "john-didion",
] as const;

/**
 * A valid author identifier, derived from the `AUTHOR_IDS` tuple.
 */
export type AuthorId = typeof AUTHOR_IDS[number];
