import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { BlogPage } from "./BlogPage";

function renderPage() {
  return render(<BlogPage />);
}

describe("BlogPage", () => {
  it("renders the featured entry and the complete register", () => {
    renderPage();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Announcing WDL 1.3.0",
    );
    expect(screen.getAllByRole("article")).toHaveLength(11);
    expect(screen.getByRole("list", { name: "All posts" }).children).toHaveLength(10);
    expect(screen.getAllByText("Clay McLeod").length).toBeGreaterThan(1);
    expect(screen.getByText("The OpenWDL blog")).toBeInTheDocument();
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

    const featuredArticle = screen.getByRole("heading", { level: 1 }).closest("article");
    expect(featuredArticle).not.toBeNull();
    const featuredName = within(featuredArticle as HTMLElement).getByText("Clay McLeod");
    expect(featuredName.closest("a")).toBeNull();

    const register = screen.getByRole("list", { name: "All posts" });
    for (const name of within(register).getAllByText("Clay McLeod")) {
      expect(name.closest("a")).toBeNull();
    }
  });
});
