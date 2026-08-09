import type { IconType } from "react-icons";
import {
  FaBluesky,
  FaGithub,
  FaLink,
  FaLinkedin,
  FaMastodon,
} from "react-icons/fa6";
import { getAuthor } from "../../content/authors";
import type { AuthorSocialPlatform } from "../../content/authors";
import type { AuthorId } from "../../content/authorIds";
import { AuthorAvatar, type AuthorAvatarSize } from "./AuthorAvatar";
import styles from "../Authors.module.css";

const socialPlatforms: Record<
  AuthorSocialPlatform,
  { label: string; icon: IconType }
> = {
  github: { label: "GitHub", icon: FaGithub },
  linkedin: { label: "LinkedIn", icon: FaLinkedin },
  bluesky: { label: "Bluesky", icon: FaBluesky },
  mastodon: { label: "Mastodon", icon: FaMastodon },
  website: { label: "Website", icon: FaLink },
};

/** Props for {@link AuthorByline}. */
export interface AuthorBylineProps {
  /** Author identifiers, in authored order (never re-sorted). */
  ids: readonly AuthorId[];
  /** Portrait diameter shared by every author in the byline. */
  size: AuthorAvatarSize;
  /** Optional label rendered above the byline, e.g. `"Written by"`. */
  label?: string;
  /** Additional class name applied to the root element. */
  className?: string;
  /**
   * Opt in to linking each author's full name to their registered profile
   * URL. Reserved for the single featured entry's 82px byline; register
   * rows always render plain, unlinked text (default `false`) so the dense
   * list doesn't gain extra hover/focus targets per row.
   */
  linkProfiles?: boolean;
  /** Show each provided social profile as an icon beside its author. */
  showSocialLinks?: boolean;
  /** Use accent borders for portraits in the featured entry. */
  accentRing?: boolean;
}

/**
 * Renders every author's portrait and full name for a post, preserving
 * authored order. Names are always visible text and never depend on
 * portrait alternative text or hover state. When more than one author is
 * present, adjacent portraits overlap by 14px via CSS only; keyboard and
 * reading order are unaffected. Each name links to the author's registered
 * profile URL only when `linkProfiles` is set.
 */
export function AuthorByline({
  ids,
  size,
  label,
  className,
  linkProfiles = false,
  showSocialLinks = false,
  accentRing = false,
}: AuthorBylineProps) {
  const authorList = ids.map((id) => getAuthor(id));

  return (
    <div className={[styles.byline, className].filter(Boolean).join(" ")}>
      {label && <span className={styles.bylineLabel}>{label}</span>}
      <div className={styles.portraits}>
        {authorList.map((author) => (
          <span key={author.id} className={styles.portraitWrap}>
            <AuthorAvatar author={author} size={size} accentRing={accentRing} />
          </span>
        ))}
      </div>
      <p className={styles.names}>
        {authorList.map((author, index) => (
          <span key={author.id} className={styles.name}>
            <span
              className={
                showSocialLinks && author.socialLinks
                  ? styles.authorIdentity
                  : undefined
              }
            >
              {linkProfiles && author.socialLinks?.[0] ? (
                <a href={author.socialLinks[0].url}>{author.name}</a>
              ) : (
                <span>{author.name}</span>
              )}
              {showSocialLinks && author.socialLinks && (
                <span className={styles.socialLinks}>
                  {author.socialLinks.map((link) => {
                    const platform = socialPlatforms[link.platform];
                    const Icon = platform.icon;

                    return (
                      <a
                        key={`${link.platform}-${link.url}`}
                        href={link.url}
                        className={styles.socialLink}
                        aria-label={`${author.name} on ${platform.label}`}
                        title={platform.label}
                      >
                        <Icon aria-hidden="true" />
                      </a>
                    );
                  })}
                </span>
              )}
            </span>
            {index < authorList.length - 2 && ", "}
            {index === authorList.length - 2 && " and "}
          </span>
        ))}
      </p>
    </div>
  );
}
