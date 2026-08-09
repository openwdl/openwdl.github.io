import type { BlogPost } from "../../content/blogSchema";
import styles from "../BlogPage.module.css";

/** Props for {@link PostMeta}. */
export interface PostMetaProps {
  /** The post whose publication year and reading time are rendered. */
  post: BlogPost;
  /** Additional class name applied to the root element. */
  className?: string;
}

/**
 * Renders a post's formatted publication date and estimated reading time.
 */
export function PostMeta({ post, className }: PostMetaProps) {
  const publishedYear = new Date(post.publishedAt).getFullYear();

  return (
    <p className={[styles.meta, className].filter(Boolean).join(" ")}>
      <time dateTime={post.publishedAt}>{publishedYear}</time>
      <span aria-hidden="true"> · </span>
      <span>{post.readingMinutes} min read</span>
    </p>
  );
}
