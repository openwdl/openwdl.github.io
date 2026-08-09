import { useState } from "react";
import type { Author } from "../../content/authors";
import styles from "../Authors.module.css";

/** Circular portrait diameters used across the blog, in pixels. */
export type AuthorAvatarSize = 47 | 66 | 82;

/** Props for {@link AuthorAvatar}. */
export interface AuthorAvatarProps {
  /** The author whose portrait (or initials fallback) is rendered. */
  author: Author;
  /** Circular portrait diameter. */
  size: AuthorAvatarSize;
  /** Additional class name applied to the root element. */
  className?: string;
  /** Use the featured-entry accent border instead of the default separator. */
  accentRing?: boolean;
}

/**
 * Derives deterministic initials from a full name, e.g. `"Venkat Malladi"`
 * becomes `"VM"`, for use whenever no portrait is available.
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "";
  }
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

/**
 * A circular author portrait. Renders deterministic initials whenever the
 * author has no registered avatar, or when the portrait image fails to
 * load. The portrait always carries `alt=""` because it is only ever
 * rendered adjacent to the author's full name (see {@link AuthorByline}),
 * which already supplies the accessible identity.
 */
export function AuthorAvatar({
  author,
  size,
  className,
  accentRing = false,
}: AuthorAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showPortrait = Boolean(author.avatar) && !failed;

  return (
    <span
      className={[styles.avatar, accentRing && styles.accentRing, className]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: size }}
    >
      {showPortrait ? (
        <img
          className={styles.portrait}
          src={author.avatar}
          alt=""
          width={size}
          height={size}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {getInitials(author.name)}
        </span>
      )}
    </span>
  );
}
