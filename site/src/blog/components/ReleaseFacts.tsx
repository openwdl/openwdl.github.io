import type { BlogPost } from "../../content/blogSchema";

/** Props for {@link ReleaseFacts}. */
export interface ReleaseFactsProps {
  /** The release post whose facts are rendered. Must carry a `version`. */
  post: BlogPost;
  /** Additional class name applied to the root element. */
  className?: string;
}

/**
 * Renders the small facts panel shown on release articles: the full
 * semantic version, and a link to the spec at the exact tagged revision
 * when one is registered. The spec row is omitted entirely — never
 * rendered empty — when the post has no `specUrl`.
 */
export function ReleaseFacts({ post, className }: ReleaseFactsProps) {
  return (
    <dl className={className}>
      <div>
        <dt>Latest release</dt>
        <dd>WDL {post.version}</dd>
      </div>
      {post.specUrl && (
        <div>
          <dt>Spec</dt>
          <dd>
            <a href={post.specUrl}>Read the specification</a>
          </dd>
        </div>
      )}
    </dl>
  );
}
