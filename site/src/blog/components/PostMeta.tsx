import type { BlogPost } from "../../content/blogSchema";
import styles from "../BlogPage.module.css";

/** Props for {@link PostMeta}. */
export interface PostMetaProps {
  /** The post whose publication date and reading time are rendered. */
  post: BlogPost;
  /** Additional class name applied to the root element. */
  className?: string;
}

/**
 * Formats a publication timestamp as an unambiguous day-level date.
 *
 * The register is ordered by publication date, so the date is what makes that
 * order legible. Showing only the year defeated it: three consecutive rows all
 * read "2026" while spanning two months, which left a patch release looking
 * newer than a later minor release. `en-GB` gives day-month-year without the
 * comma noise, and `UTC` keeps prerender and hydration from disagreeing.
 */
function formatPublishedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Renders a post's formatted publication date and estimated reading time.
 */
export function PostMeta({ post, className }: PostMetaProps) {
  return (
    <p className={[styles.meta, className].filter(Boolean).join(" ")}>
      <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt)}</time>
      <span aria-hidden="true"> · </span>
      <span>{post.readingMinutes} min read</span>
    </p>
  );
}
