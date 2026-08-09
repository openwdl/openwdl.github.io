import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { GenrePagination } from "./GenrePagination";
import type { BlogPost } from "../../content/blogSchema";

/** Builds a minimal, valid `BlogPost` fixture with the given overrides. */
function makePost(overrides: Partial<BlogPost>): BlogPost {
  return {
    sourcePath: "fixture.md",
    slug: "fixture",
    title: "Fixture",
    publishedAt: "2026-01-01T00:00:00Z",
    publishedTime: Date.parse("2026-01-01T00:00:00Z"),
    authors: ["clay-mcleod"],
    genre: "release",
    standfirst: "A fixture post.",
    featured: false,
    legacyPath: "/wdl/bioinformatics/workflows/fixture/",
    body: "Fixture body.",
    readingMinutes: 1,
    ...overrides,
  };
}

const older = makePost({ slug: "older-post", title: "Older Post" });
const newer = makePost({ slug: "newer-post", title: "Newer Post" });

describe("GenrePagination", () => {
  it("links both neighbours from the genre landmark", () => {
    render(<GenrePagination older={older} newer={newer} />);

    const nav = screen.getByRole("navigation", { name: "More in this genre" });
    const previous = within(nav).getByRole("link", { name: "Older Older Post" });
    expect(previous).toHaveAttribute("href", "/blog/older-post/");
    expect(previous).toHaveAttribute("rel", "prev");
    const next = within(nav).getByRole("link", { name: "Newer Newer Post" });
    expect(next).toHaveAttribute("href", "/blog/newer-post/");
    expect(next).toHaveAttribute("rel", "next");
  });

  it("renders only the side that has an adjacent post", () => {
    render(<GenrePagination older={older} />);

    const nav = screen.getByRole("navigation", { name: "More in this genre" });
    expect(within(nav).getAllByRole("link")).toHaveLength(1);
    expect(within(nav).getByRole("link", { name: "Older Older Post" })).toHaveAttribute(
      "rel",
      "prev",
    );
  });

  it("renders no landmark when the post has no genre neighbours", () => {
    render(<GenrePagination />);

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
