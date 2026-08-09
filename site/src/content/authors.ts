import clayMcleodAvatar from "../assets/authors/clay-mcleod.png";
import venkatMalladiAvatar from "../assets/authors/venkat-malladi.png";
import johnDidionAvatar from "../assets/authors/john-didion.png";
import { AUTHOR_IDS, type AuthorId } from "./authorIds";

/** A social platform supported by author bylines. */
export type AuthorSocialPlatform =
  | "github"
  | "linkedin"
  | "bluesky"
  | "mastodon"
  | "website";

/** A link to one of an author's external profiles. */
export interface AuthorSocialLink {
  platform: AuthorSocialPlatform;
  url: string;
}

/**
 * A blog post author, combining a display name with optional avatar and
 * external links used in bylines and author cards.
 */
export interface Author {
  id: AuthorId;
  name: string;
  avatar?: string;
  socialLinks?: readonly AuthorSocialLink[];
}

/**
 * The registry of every author who has published on the OpenWDL blog,
 * keyed by their stable `AuthorId`. Validated at compile time against
 * `AUTHOR_IDS` via `satisfies`.
 */
export const authors = {
  "clay-mcleod": {
    id: "clay-mcleod",
    name: "Clay McLeod",
    avatar: clayMcleodAvatar,
    socialLinks: [
      { platform: "github", url: "https://github.com/claymcleod" },
      {
        platform: "linkedin",
        url: "https://www.linkedin.com/in/claymcleod/",
      },
      { platform: "website", url: "https://claymcleod.dev" },
    ],
  },
  "venkat-malladi": {
    id: "venkat-malladi",
    name: "Venkat Malladi",
    avatar: venkatMalladiAvatar,
    socialLinks: [
      { platform: "github", url: "https://github.com/vsmalladi" },
    ],
  },
  "john-didion": {
    id: "john-didion",
    name: "John Didion",
    avatar: johnDidionAvatar,
    socialLinks: [
      { platform: "github", url: "https://github.com/jdidion" },
    ],
  },
} satisfies Record<AuthorId, Author>;

/**
 * The set of every valid author identifier, derived from `AUTHOR_IDS`.
 * Used to validate the `authors` front-matter field on every blog post.
 */
export const authorIds: ReadonlySet<string> = new Set(AUTHOR_IDS);

/**
 * Looks up a registered author by id. Because `id` is constrained to the
 * `AuthorId` union and `authors` satisfies `Record<AuthorId, Author>`, every
 * valid id is guaranteed to resolve; there is no unknown-id case to handle.
 */
export function getAuthor(id: AuthorId): Author {
  return authors[id];
}
