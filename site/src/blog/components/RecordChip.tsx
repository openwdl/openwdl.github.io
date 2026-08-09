import { formatRecordLabel, type BlogPost } from "../../content/blogSchema";
import styles from "../BlogPage.module.css";

/** Props for {@link RecordChip}. */
export interface RecordChipProps {
  /** The post whose record label is rendered. */
  post: BlogPost;
  /** Additional class name applied to the root element. */
  className?: string;
}

/**
 * A small label identifying a post's record: its semantic version for
 * releases (e.g. `v1.3`) via {@link formatRecordLabel}, or its genre (e.g.
 * `TOOL`) for every other post.
 */
export function RecordChip({ post, className }: RecordChipProps) {
  const label = formatRecordLabel(post) || post.genre.toUpperCase();

  return <span className={[styles.chip, className].filter(Boolean).join(" ")}>{label}</span>;
}
