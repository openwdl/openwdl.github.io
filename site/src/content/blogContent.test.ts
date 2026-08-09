import { authorIds } from "./authors";
import {
  getFeaturedPost,
  getPost,
  getPosts,
  selectFeaturedPost,
} from "./blogContent";
import { BLOG_ROUTE_DATA } from "../generated/blog-routes.generated";

describe("blog content collection", () => {
  it("loads exactly ten posts", () => {
    expect(getPosts()).toHaveLength(10);
  });

  it("orders WDL 1.2.1 first", () => {
    expect(getPosts()[0]?.slug).toBe("announcing-wdl-1-2-1");
  });

  it("selects WDL 1.3.0 as the featured post", () => {
    expect(getFeaturedPost().slug).toBe("announcing-wdl-1-3-0");
  });

  it("falls back to the newest post when none is featured", () => {
    const posts = getPosts().map((post) => ({ ...post, featured: false }));
    expect(selectFeaturedPost(posts).slug).toBe("announcing-wdl-1-2-1");
  });

  it("has unique slugs and legacy paths across the collection", () => {
    const posts = getPosts();
    expect(new Set(posts.map((post) => post.slug)).size).toBe(posts.length);
    expect(new Set(posts.map((post) => post.legacyPath)).size).toBe(posts.length);
  });

  it("preserves author order for the WDL 1.2.0 announcement", () => {
    const post = getPost("announcing-wdl-1-2-0");
    expect(post?.authors).toEqual(["venkat-malladi", "john-didion"]);
  });

  it("resolves every author id referenced by every post", () => {
    for (const post of getPosts()) {
      for (const authorId of post.authors) {
        expect(authorIds.has(authorId)).toBe(true);
      }
    }
  });

  it("returns undefined for an unknown slug", () => {
    expect(getPost("does-not-exist")).toBeUndefined();
  });

  it("keeps generated route metadata aligned with the content collection", () => {
    expect(BLOG_ROUTE_DATA).toEqual(
      getPosts().map(({ slug, title, standfirst, legacyPath }) => ({
        slug,
        title,
        standfirst,
        legacyPath,
      })),
    );
  });
});
