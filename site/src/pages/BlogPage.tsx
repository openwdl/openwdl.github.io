import { Container } from "@openwdl/ui";
import { getFeaturedPost, getPosts } from "../content/blogContent";
import { AuthorByline } from "../blog/components/AuthorByline";
import { BlogShell } from "../blog/components/BlogShell";
import { PostMeta } from "../blog/components/PostMeta";
import { RecordChip } from "../blog/components/RecordChip";
import { docHref } from "../docs/docHref";
import styles from "../blog/BlogPage.module.css";

/**
 * The OpenWDL blog: a compact masthead, the promoted post as a featured
 * entry, and the complete chronological register of
 * every published post (including the featured post again, as the
 * register's first row). There is no pagination at the current catalog
 * size.
 */
export function BlogPage() {
  const posts = getPosts();
  const featured = getFeaturedPost();

  return (
    <BlogShell>
      <main aria-label="OpenWDL blog" className={styles.page}>
        <Container>
          <header className={styles.masthead}>
            <p className={styles.eyebrow}>The OpenWDL blog</p>
            <p className={styles.description}>
              Releases, tooling, and reports from the open standard.
            </p>
          </header>

          <article className={styles.featured}>
            <RecordChip post={featured} className={styles.featuredChip} />
            <h1 className={styles.featuredTitle}>{featured.title}</h1>
            <p className={styles.standfirst}>{featured.standfirst}</p>
            <AuthorByline
              ids={featured.authors}
              size={82}
              label="Written by"
              className={styles.featuredByline}
              accentRing
            />
            <a
              href={docHref(`/blog/${featured.slug}/`)}
              className={styles.featuredLink}
            >
              Read the post
            </a>
          </article>

          <ol aria-label="All posts" className={styles.register}>
            {posts.map((post) => (
              <li key={post.slug} className={styles.registerItem}>
                <article className={styles.row}>
                  <div className={styles.recordCell}>
                    <RecordChip post={post} />
                  </div>
                  <div className={styles.entryCell}>
                    <a
                      href={docHref(`/blog/${post.slug}/`)}
                      className={styles.title}
                    >
                      {post.title}
                    </a>
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
            ))}
          </ol>
        </Container>
      </main>
    </BlogShell>
  );
}
