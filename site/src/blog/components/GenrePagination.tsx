import { Pagination } from "@openwdl/ui";
import type { BlogPost } from "../../content/blogSchema";
import { docHref } from "../../docs/docHref";
import styles from "./GenrePagination.module.css";

/** Props for {@link GenrePagination}. */
export interface GenrePaginationProps {
  /** The next-newer post in the same genre, if one exists. */
  newer?: BlogPost;
  /** The next-older post in the same genre, if one exists. */
  older?: BlogPost;
}

/**
 * Renders "newer/older" navigation between posts in the same genre (see
 * `getAdjacentPosts`), never crossing into a different genre. Either side
 * is omitted when there is no adjacent post in that direction; the shared
 * {@link Pagination} renders nothing when both are.
 */
export function GenrePagination({ newer, older }: GenrePaginationProps) {
  return (
    <Pagination
      className={styles.pager}
      aria-label="More in this genre"
      prev={older && { href: docHref(`/blog/${older.slug}/`), label: "Older", title: older.title }}
      next={newer && { href: docHref(`/blog/${newer.slug}/`), label: "Newer", title: newer.title }}
    />
  );
}
