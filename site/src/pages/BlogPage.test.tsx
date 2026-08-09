import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { BlogPage } from "./BlogPage";

function renderPage() {
  return render(<BlogPage />);
}

describe("BlogPage", () => {
  it("names the page in its own h1, not the promoted post's title", () => {
    renderPage();

    // The h1 identifies the page; the featured post is an h2 beneath it. This
    // was previously inverted, leaving the index with no heading of its own.
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "The OpenWDL blog",
    );
    expect(screen.getByRole("heading", { level: 2, name: "Featured" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3, name: "Announcing WDL 1.3.0" }))
      .toHaveLength(2);
  });

  it("gives every register entry a heading so the list is navigable", () => {
    renderPage();

    const register = screen.getByRole("list", { name: "All posts" });
    const entryHeadings = within(register).getAllByRole("heading", { level: 3 });
    expect(entryHeadings).toHaveLength(10);
    // The register is the complete record, so the promoted post appears here
    // too — not only in the featured card above it.
    expect(entryHeadings.map((h) => h.textContent)).toContain("Announcing WDL 1.3.0");
  });

  it("renders the featured entry and the complete register", () => {
    renderPage();

    expect(screen.getAllByRole("article")).toHaveLength(11);
    expect(screen.getByRole("list", { name: "All posts" }).children).toHaveLength(10);
    expect(screen.getAllByText("Clay McLeod").length).toBeGreaterThan(1);
    expect(screen.getByRole("link", { name: "Read the post" }))
      .toHaveAttribute("href", "/blog/announcing-wdl-1-3-0/");
  });

  it("preserves author order for WDL 1.2.0: Venkat Malladi then John Didion", () => {
    renderPage();

    const item = screen.getByText("Announcing WDL 1.2.0").closest("li");
    expect(item).not.toBeNull();

    const scoped = within(item as HTMLElement);
    const venkat = scoped.getByText("Venkat Malladi");
    const didion = scoped.getByText("John Didion");

    expect(
      venkat.compareDocumentPosition(didion) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders the OpenWDL blog landmark", () => {
    renderPage();
    expect(screen.getByRole("main", { name: "OpenWDL blog" })).toBeInTheDocument();
  });

  it("renders every index-page author name as plain text", () => {
    renderPage();

    // Two h3s now carry this title — the featured card and its register row —
    // so scope to the labelled Featured section rather than matching by name.
    const featuredArticle = screen
      .getByRole("region", { name: "Featured" })
      .querySelector("article");
    expect(featuredArticle).not.toBeNull();
    const featuredName = within(featuredArticle as HTMLElement).getByText("Clay McLeod");
    expect(featuredName.closest("a")).toBeNull();

    const register = screen.getByRole("list", { name: "All posts" });
    for (const name of within(register).getAllByText("Clay McLeod")) {
      expect(name.closest("a")).toBeNull();
    }
  });
});
