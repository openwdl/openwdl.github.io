import { Container } from "@openwdl/ui";
import { getPost, getPosts } from "../content/blogContent";
import { getAdjacentPosts } from "../content/blogSchema";
import { extractTableOfContents } from "../content/tableOfContents";
import { AuthorByline } from "../blog/components/AuthorByline";
import { RecordChip } from "../blog/components/RecordChip";
import { PostMeta } from "../blog/components/PostMeta";
import { ReleaseFacts } from "../blog/components/ReleaseFacts";
import { ArticleToc } from "../blog/components/ArticleToc";
import { BlogMarkdown } from "../blog/components/BlogMarkdown";
import { BlogShell } from "../blog/components/BlogShell";
import { GenrePagination } from "../blog/components/GenrePagination";
import { docHref } from "../docs/docHref";
import { NotFoundPage } from "../not-found/NotFoundPage";
import styles from "../blog/BlogPostPage.module.css";

function splitAfterParagraphs(body: string, count: number): [first: string, rest: string] {
  const blocks = body.split(/\n{2,}/);
  if (blocks.length <= count) {
    return [body, ""];
  }
  return [
    blocks.slice(0, count).join("\n\n"),
    blocks.slice(count).join("\n\n"),
  ];
}

/**
 * A single long-form blog article: the record label, title, standfirst,
 * byline, publication facts, an optional release facts panel, a table of
 * contents (a sticky rail on desktop, a `<details>` disclosure on mobile),
 * the rendered Markdown body, and same-genre "newer/older" navigation.
 *
 * Renders the shared `NotFoundPage` for any slug that doesn't resolve to a
 * published post, so an unknown article and an unknown route look and
 * behave identically.
 */
export function BlogPostPage({ slug }: { slug: string }) {
  const post = getPost(slug);

  if (!post) {
    return <NotFoundPage />;
  }

  const toc = extractTableOfContents(post.body);
  const { newer, older } = getAdjacentPosts(getPosts(), post);
  const [introduction, remainingBody] = splitAfterParagraphs(post.body, 3);

  return (
    <BlogShell>
      <main aria-labelledby="article-title" className={styles.page}>
        <Container>
          <div className={styles.layout}>
            <article className={styles.article}>
              <a href={docHref("/blog/")} className={styles.backLink}>
                <span aria-hidden="true">&larr;</span>
                Back to the blog
              </a>
            <div className={styles.topicRow}>
              <p className={styles.eyebrow}>
                OpenWDL blog · {post.genre.charAt(0).toUpperCase() + post.genre.slice(1)}
              </p>
              <RecordChip post={post} className={styles.chip} />
            </div>
            <h1 id="article-title" className={styles.title}>{post.title}</h1>
            <p className={styles.standfirst}>{post.standfirst}</p>

            <div className={styles.bylineRow}>
              <AuthorByline
                ids={post.authors}
                size={66}
                showSocialLinks
                className={styles.byline}
              />
              <PostMeta post={post} className={styles.meta} />
            </div>

            {toc.length > 0 && (
              <details className={styles.tocMobile}>
                <summary>Table of contents</summary>
                <ArticleToc items={toc} className={styles.tocList} />
              </details>
            )}

            <div className={styles.body}>
              {post.genre === "release" ? (
                <>
                  <BlogMarkdown body={introduction} />
                  <ReleaseFacts post={post} className={styles.facts} />
                  {remainingBody && <BlogMarkdown body={remainingBody} />}
                </>
              ) : (
                <BlogMarkdown body={post.body} />
              )}
            </div>

              <GenrePagination newer={newer} older={older} className={styles.pagination} />
            </article>

            {toc.length > 0 && (
              <nav aria-label="Table of contents" className={styles.tocDesktop}>
                <p className={styles.tocLabel}>On this page</p>
                <ArticleToc items={toc} className={styles.tocList} />
              </nav>
            )}
          </div>
        </Container>
      </main>
    </BlogShell>
  );
}
