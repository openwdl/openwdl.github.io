import { Button, Container } from "@openwdl/ui";
import { getFeaturedPost, getPosts } from "../content/blogContent";
import { AuthorByline } from "../blog/components/AuthorByline";
import { BlogShell } from "../blog/components/BlogShell";
import { PostMeta } from "../blog/components/PostMeta";
import { RecordChip } from "../blog/components/RecordChip";
import { docHref } from "../docs/docHref";
import styles from "../blog/BlogPage.module.css";

/**
 * The OpenWDL blog: a masthead naming the page, the promoted post as a labelled
 * featured entry, and the complete chronological register of every published
 * post, newest first. The register is the full record rather than the
 * leftovers, so the promoted post also appears among its rows and is marked
 * there as the featured one. There is no pagination at the current catalog
 * size.
 *
 * The featured post is not necessarily the newest, so both the card and its
 * register row carry a date; without one, the promotion looks like the list is
 * mis-sorted.
 */
export function BlogPage() {
  const posts = getPosts();
  const featured = getFeaturedPost();

  // Promoting the only post duplicates it directly above itself, and promoting
  // nothing has no card to render at all.
  const showFeatured = featured !== undefined && posts.length > 1;

  return (
    <BlogShell>
      <main aria-label="OpenWDL blog" data-page="blog" className={styles.page}>
        <Container>
          <header className={styles.masthead}>
            <h1 className={styles.pageTitle}>The OpenWDL blog</h1>
            <p className={styles.description}>
              Releases, tooling, and reports from the open standard.
            </p>
          </header>

          {showFeatured && (
            <section aria-labelledby="featured-heading" className={styles.featuredSection}>
              <h2 id="featured-heading" className={styles.sectionHeading}>
                Featured
              </h2>
              <article className={styles.featured}>
                <RecordChip post={featured} className={styles.featuredChip} />
                <h3 className={styles.featuredTitle}>{featured.title}</h3>
                <p className={styles.standfirst}>{featured.standfirst}</p>
                <PostMeta post={featured} className={styles.featuredMeta} />
                <AuthorByline
                  ids={featured.authors}
                  size={82}
                  label="Written by"
                  className={styles.featuredByline}
                  accentRing
                />
                <Button
                  as="a"
                  href={docHref(`/blog/${featured.slug}/`)}
                  className={styles.featuredLink}
                >
                  Read the post
                </Button>
              </article>
            </section>
          )}

          <section aria-labelledby="all-posts">
            <h2 id="all-posts" className={styles.sectionHeading}>
              All posts
            </h2>
            {posts.length === 0 ? (
              <p className={styles.empty}>
                No posts have been published yet. Release announcements and
                reports will appear here.
              </p>
            ) : (
              <ol className={styles.register} aria-labelledby="all-posts">
                {posts.map((post) => {
                  const isFeatured = showFeatured && post.slug === featured.slug;
                  return (
                    <li key={post.slug} className={styles.registerItem}>
                      <article
                        className={styles.row}
                        data-featured={isFeatured || undefined}
                      >
                        <div className={styles.recordCell}>
                          <RecordChip post={post} />
                        </div>
                        <div className={styles.entryCell}>
                          <div className={styles.titleRow}>
                            <h3 className={styles.title}>
                              <a href={docHref(`/blog/${post.slug}/`)}>
                                {post.title}
                              </a>
                            </h3>
                            {isFeatured && (
                              <span className={styles.featuredMark}>Featured</span>
                            )}
                          </div>
                          <p className={styles.summary}>{post.standfirst}</p>
                        </div>
                        <div className={styles.authorCell}>
                          <AuthorByline ids={post.authors} size={47} />
                        </div>
                        <div className={styles.metaCell}>
                          <PostMeta post={post} />
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </Container>
      </main>
    </BlogShell>
  );
}
