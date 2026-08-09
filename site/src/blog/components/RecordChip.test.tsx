import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecordChip } from "./RecordChip";
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

describe("RecordChip", () => {
  it.each([
    ["1.2.1", "v1.2.1"],
    ["1.3.0", "v1.3"],
  ])("renders %s as %s for a release post", (version, expected) => {
    render(<RecordChip post={makePost({ genre: "release", version })} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it.each([
    ["report", "REPORT"],
    ["tool", "TOOL"],
    ["guide", "GUIDE"],
    ["meta", "META"],
  ])("renders the uppercased genre %s as %s for non-release posts", (genre, expected) => {
    render(<RecordChip post={makePost({ genre: genre as BlogPost["genre"], version: undefined })} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
