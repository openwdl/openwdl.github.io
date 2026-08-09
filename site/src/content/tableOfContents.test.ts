import { describe, it, expect } from "vitest";
import { extractTableOfContents } from "./tableOfContents";

describe("extractTableOfContents", () => {
  it("includes only depth-two and depth-three headings", () => {
    const markdown = [
      "# Title",
      "",
      "## Section",
      "",
      "#### Deep",
      "",
      "### Sub",
      "",
    ].join("\n");

    expect(extractTableOfContents(markdown)).toEqual([
      { depth: 2, id: "section", label: "Section" },
      { depth: 3, id: "sub", label: "Sub" },
    ]);
  });

  it("assigns the same duplicate-heading ids as rehype-slug", () => {
    const markdown = [
      "## Language",
      "",
      "Some text.",
      "",
      "## Language",
      "",
      "More text.",
      "",
    ].join("\n");

    expect(extractTableOfContents(markdown)).toEqual([
      { depth: 2, id: "language", label: "Language" },
      { depth: 2, id: "language-1", label: "Language" },
    ]);
  });

  it("keeps the shared slug counter in sync with headings outside depth two/three", () => {
    // rehype-slug slugs every heading in document order, regardless of
    // depth. An h1 sharing text with a later h2 therefore *does* consume
    // the h2's would-be id, exactly as it would in the rendered HTML: the
    // TOC must reflect that shared counter, not restart it at depth two.
    const markdown = [
      "# Overview",
      "",
      "## Overview",
      "",
    ].join("\n");

    expect(extractTableOfContents(markdown)).toEqual([
      { depth: 2, id: "overview-1", label: "Overview" },
    ]);
  });

  it("preserves inline code separately from the plain TOC label", () => {
    const markdown = "## The `split` Function\n";

    expect(extractTableOfContents(markdown)).toEqual([
      {
        depth: 2,
        id: "the-split-function",
        label: "The split Function",
        labelParts: [
          { value: "The ", code: false },
          { value: "split", code: true },
          { value: " Function", code: false },
        ],
      },
    ]);
  });

  it("returns an empty list when there are no headings", () => {
    expect(extractTableOfContents("Just a paragraph.\n")).toEqual([]);
  });

  it("resolves GFM strikethrough to plain text, matching the rendered heading", () => {
    // remark-parse alone (without remarkGfm) does not understand `~~`, so it
    // would leave the tildes in the extracted label/id — diverging from the
    // rendered heading, which passes through remarkGfm before rehype-slug
    // assigns its id. Verified against the actual remark-gfm + remark-rehype
    // + rehype-slug pipeline: `## ~~Old~~ New Feature` renders as
    // `<h2 id="old-new-feature">Old New Feature</h2>`.
    const markdown = "## ~~Old~~ New Feature\n";

    expect(extractTableOfContents(markdown)).toEqual([
      { depth: 2, id: "old-new-feature", label: "Old New Feature" },
    ]);
  });

  it("assigns matching duplicate ids when GFM strikethrough headings repeat", () => {
    // Confirmed against the real remark-gfm + remark-rehype + rehype-slug
    // pipeline: two `## Section ~~Two~~` headings render as
    // `id="section-two"` and `id="section-two-1"` with text "Section Two".
    const markdown = [
      "## Section ~~Two~~",
      "",
      "## Section ~~Two~~",
      "",
    ].join("\n");

    expect(extractTableOfContents(markdown)).toEqual([
      { depth: 2, id: "section-two", label: "Section Two" },
      { depth: 2, id: "section-two-1", label: "Section Two" },
    ]);
  });

  it("keeps GFM autolink literal content intact in the extracted label", () => {
    // GFM autolink literals (bare `www.`/`https://` text with no `<>` or
    // `[]()` wrapper) only resolve to links under remarkGfm; without it,
    // remark-parse still keeps the same literal text, but exercising this
    // alongside strikethrough proves the parser handles mixed GFM-only
    // heading syntax without throwing or dropping content.
    const markdown = "## See https://example.com for ~~old~~ new docs\n";

    expect(extractTableOfContents(markdown)).toEqual([
      {
        depth: 2,
        id: "see-httpsexamplecom-for-old-new-docs",
        label: "See https://example.com for old new docs",
      },
    ]);
  });
});
