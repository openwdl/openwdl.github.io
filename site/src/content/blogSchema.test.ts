import {
  formatRecordLabel,
  getAdjacentPosts,
  isSafeLegacyPath,
  parseBlogSource,
  sortPosts,
  validatePostCollection,
} from "./blogSchema";

const authors = new Set(["clay-mcleod", "venkat-malladi", "john-didion"]);
const source = (frontMatter: string, body = "one two three") =>
  `---\n${frontMatter}\n---\n${body}`;

describe("parseBlogSource", () => {
  it("parses valid ordered authors and rounds reading time up", () => {
    const body = Array.from({ length: 226 }, () => "word").join(" ");
    const post = parseBlogSource("post.md", source(`
slug: wdl-1-2
title: WDL 1.2
date: 2024-05-29T11:02:15-06:00
authors: [venkat-malladi, john-didion]
genre: release
standfirst: A release summary.
version: 1.2.0
featured: true
legacyPath: /wdl/bioinformatics/workflows/announcing-wdl-1-2-0/
`, body), authors);

    expect(post.authors).toEqual(["venkat-malladi", "john-didion"]);
    expect(post.featured).toBe(true);
    expect(post.readingMinutes).toBe(2);
    expect(formatRecordLabel(post)).toBe("v1.2");
  });

  it.each([
    ["authors: clay-mcleod", "authors must be a non-empty list"],
    ["authors: [missing]", "unknown author `missing`"],
    ["genre: news", "genre must be one of"],
    ["standfirst: ''", "standfirst must be non-empty"],
    ["version: '1.3'", "version must use MAJOR.MINOR.PATCH"],
    ["featured: promoted", "featured must be a boolean"],
  ])("rejects invalid metadata: %s", (replacement, message) => {
    const valid = `
slug: example
title: Example
date: 2026-01-10T12:00:00-06:00
authors: [clay-mcleod]
genre: release
standfirst: A release summary.
version: 1.3.0
featured: true
legacyPath: /wdl/bioinformatics/workflows/example/
`;
    const key = replacement.split(":")[0];
    const changed = valid.replace(new RegExp(`^${key}:.*$`, "m"), replacement);
    expect(() => parseBlogSource("post.md", source(changed), authors)).toThrow(message);
  });

  it("rejects a release post with an omitted version", () => {
    const missingVersion = `
slug: example
title: Example
date: 2026-01-10T12:00:00-06:00
authors: [clay-mcleod]
genre: release
standfirst: A release summary.
legacyPath: /wdl/bioinformatics/workflows/example/
`;
    expect(() => parseBlogSource("post.md", source(missingVersion), authors)).toThrow(
      "version is required when genre is `release`",
    );
  });

  it.each([
    ["legacyPath: relative/no-leading-slash/"],
    ["legacyPath: /no-trailing-slash"],
    ["legacyPath: /"],
    ["legacyPath: ''"],
    ["legacyPath: /a/./b/"],
    ["legacyPath: /a/../b/"],
    ["legacyPath: /../a/"],
    ["legacyPath: /a//b/"],
    ["legacyPath: /a/b?x=1/"],
    ["legacyPath: /a/b/#frag/"],
    ["legacyPath: /a\\b/"],
    ["legacyPath: /a/%2e%2e/b/"],
    ["legacyPath: /a/%2f/b/"],
    ["legacyPath: /-a/b/"],
    ["legacyPath: /a-/b/"],
    ["legacyPath: /a b/c/"],
  ])("rejects an unsafe legacyPath: %s", (replacement) => {
    const valid = `
slug: example
title: Example
date: 2026-01-10T12:00:00-06:00
authors: [clay-mcleod]
genre: report
standfirst: A report summary.
legacyPath: /wdl/bioinformatics/workflows/example/
`;
    const changed = valid.replace(/^legacyPath:.*$/m, replacement);
    expect(() => parseBlogSource("post.md", source(changed), authors)).toThrow("legacyPath must be");
  });
});

describe("isSafeLegacyPath", () => {
  it("accepts absolute, trailing-slash paths of safe, hyphenated segments", () => {
    expect(isSafeLegacyPath("/wdl/bioinformatics/workflows/announcing-wdl-1-2-0/")).toBe(true);
    expect(isSafeLegacyPath("/a/b_c/d123/")).toBe(true);
  });

  it.each([
    ["/", "the site root"],
    ["", "an empty string"],
    ["relative/", "a relative path"],
    ["/no-trailing-slash", "a path without a trailing slash"],
    ["/a/./b/", "a `.` segment"],
    ["/a/../b/", "a `..` segment"],
    ["/../a/", "a leading `..` segment"],
    ["/a//b/", "an empty (double-slash) segment"],
    ["/a/b?x=1/", "an embedded query string"],
    ["/a/b#frag/", "an embedded fragment"],
    ["/a\\b/", "a backslash"],
    ["/a/%2e%2e/b/", "a percent-encoded traversal segment"],
    ["/a/%2f/b/", "a percent-encoded slash"],
    ["/-a/b/", "a segment starting with a hyphen"],
    ["/a-/b/", "a segment ending with a hyphen"],
    ["/a b/c/", "a segment containing a space"],
  ])("rejects %s (%s)", (candidate) => {
    expect(isSafeLegacyPath(candidate)).toBe(false);
  });
});

describe("validatePostCollection", () => {
  const makePost = (slug: string, legacyPath: string) =>
    parseBlogSource(`${slug}.md`, source(`
slug: ${slug}
title: ${slug}
date: 2026-01-10T12:00:00-06:00
authors: [clay-mcleod]
genre: report
standfirst: Summary.
legacyPath: ${legacyPath}
`), authors);

  it("rejects duplicate slugs", () => {
    const first = makePost("duplicate-slug", "/wdl/bioinformatics/workflows/first/");
    const second = { ...makePost("duplicate-slug", "/wdl/bioinformatics/workflows/second/"), sourcePath: "second.md" };
    expect(() => validatePostCollection([first, second])).toThrow(
      "duplicate slug `duplicate-slug`",
    );
  });

  it("rejects duplicate legacy paths", () => {
    const first = makePost("first-post", "/wdl/bioinformatics/workflows/shared/");
    const second = { ...makePost("second-post", "/wdl/bioinformatics/workflows/shared/"), sourcePath: "second.md" };
    expect(() => validatePostCollection([first, second])).toThrow(
      "duplicate legacyPath `/wdl/bioinformatics/workflows/shared/`",
    );
  });

  it("rejects more than one featured post", () => {
    const first = { ...makePost("first-post", "/wdl/bioinformatics/workflows/first/"), featured: true };
    const second = { ...makePost("second-post", "/wdl/bioinformatics/workflows/second/"), featured: true };

    expect(() => validatePostCollection([first, second])).toThrow(
      "multiple featured posts: first-post.md, second-post.md",
    );
  });
});

describe("blog ordering", () => {
  it("sorts equal timestamps by descending slug", () => {
    const posts = ["announcing-wdl-1-1-3", "announcing-wdl-1-2-1"].map((slug) =>
      parseBlogSource(`${slug}.md`, source(`
slug: ${slug}
title: ${slug}
date: 2026-02-15T12:00:00-06:00
authors: [venkat-malladi]
genre: release
standfirst: Summary.
version: 1.2.1
legacyPath: /wdl/bioinformatics/workflows/${slug}/
`), authors));
    expect(sortPosts(posts).map((post) => post.slug)).toEqual([
      "announcing-wdl-1-2-1",
      "announcing-wdl-1-1-3",
    ]);
  });

  it("finds adjacent posts only within the same genre", () => {
    const makePost = (
      slug: string,
      genre: "release" | "report",
      date: string,
    ) => parseBlogSource(`${slug}.md`, source(`
slug: ${slug}
title: ${slug}
date: ${date}
authors: [clay-mcleod]
genre: ${genre}
standfirst: Summary.
${genre === "release" ? "version: 1.3.0" : ""}
legacyPath: /wdl/bioinformatics/workflows/${slug}/
`), authors);
    const newer = makePost("newer-release", "release", "2026-03-01T12:00:00Z");
    const current = makePost("current-release", "release", "2026-02-01T12:00:00Z");
    const report = makePost("intervening-report", "report", "2026-01-15T12:00:00Z");
    const older = makePost("older-release", "release", "2026-01-01T12:00:00Z");

    expect(getAdjacentPosts([older, report, current, newer], current)).toEqual({
      newer,
      older,
    });
  });
});
