import type { BlogPost } from "../../content/blogSchema";
import { docHref } from "../../docs/docHref";

/** Props for {@link GenrePagination}. */
export interface GenrePaginationProps {
  /** The next-newer post in the same genre, if one exists. */
  newer?: BlogPost;
  /** The next-older post in the same genre, if one exists. */
  older?: BlogPost;
  /** Additional class name applied to the root element. */
  className?: string;
}

/**
 * Renders "newer/older" navigation between posts in the same genre (see
 * `getAdjacentPosts`), never crossing into a different genre. Either side
 * is omitted when there is no adjacent post in that direction.
 */
export function GenrePagination({ newer, older, className }: GenrePaginationProps) {
  if (!newer && !older) {
    return null;
  }

  return (
    <nav aria-label="More in this genre" className={className}>
      {older && (
        <a href={docHref(`/blog/${older.slug}/`)} rel="prev">
          <span>Older</span>
          <span>{older.title}</span>
        </a>
      )}
      {newer && (
        <a href={docHref(`/blog/${newer.slug}/`)} rel="next">
          <span>Newer</span>
          <span>{newer.title}</span>
        </a>
      )}
    </nav>
  );
}
