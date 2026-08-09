import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlogPostPage } from "./BlogPostPage";

function renderRoute(slug: string) {
  return render(<BlogPostPage slug={slug} />);
}

describe("BlogPostPage", () => {
  it("renders the WDL 1.3.0 article", () => {
    renderRoute("announcing-wdl-1-3-0");

    // Landmark + title.
    expect(screen.getByRole("main", { name: "Announcing WDL 1.3.0" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Announcing WDL 1.3.0" }))
      .toBeInTheDocument();
    const topic = screen.getByText("OpenWDL blog · Release");
    expect(topic).toBeInTheDocument();
    const backLink = screen.getByRole("link", { name: "Back to the blog" });
    expect(backLink).toHaveAttribute("href", "/blog/");
    expect(backLink.className).toContain("Button_secondary");
    // The back arrow is decorative and must stay out of the accessible name.
    expect(backLink.querySelector("[aria-hidden='true']")?.textContent).toBe("←");
    expect(
      backLink.compareDocumentPosition(topic) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // Standfirst.
    expect(screen.getByText(
      "WDL 1.3 improves language ergonomics, type safety, retry behavior, and cross-engine consistency.",
    )).toBeInTheDocument();

    // 66px Clay McLeod byline.
    expect(screen.getByText("Clay McLeod").closest("a")).toBeNull();
    expect(document.querySelector("img[width='66']")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Clay McLeod on GitHub" }))
      .toHaveAttribute("href", "https://github.com/claymcleod");

    // Release facts: version and spec link.
    expect(screen.getByText("Latest release")).toBeInTheDocument();
    expect(screen.getByText("WDL 1.3.0")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read the specification" }))
      .toHaveAttribute("href", "https://github.com/openwdl/wdl/blob/wdl-1.3/SPEC.md");
    const releaseCta = screen.getByText("WDL 1.3.0").closest("dl");
    const thirdIntro = screen.getByText("We'll cover the main additions below", { exact: false });
    const firstSection = screen.getByRole("heading", { level: 2, name: "Language Ergonomics" });
    expect(releaseCta).not.toBeNull();
    expect(
      thirdIntro.compareDocumentPosition(releaseCta as HTMLElement)
      & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      (releaseCta as HTMLElement).compareDocumentPosition(firstSection)
      & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // Table of contents links.
    const toc = screen.getByRole("navigation", { name: "Table of contents" });
    expect(within(toc).getByText("On this page")).toBeInTheDocument();
    expect(within(toc).getByRole("link", { name: "Language Ergonomics" }))
      .toHaveAttribute("href", "#language-ergonomics");
    expect(within(toc).getByRole("link", { name: "Type Safety" }))
      .toHaveAttribute("href", "#type-safety");

    // WDL code label and copy button.
    expect(screen.getAllByText("wdl").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Copy code" }).length).toBeGreaterThan(0);

    const compatibilityNote = screen.getByText("Compatibility note").closest("blockquote");
    expect(compatibilityNote).not.toBeNull();

    // Same-genre navigation (adjacent releases), oldest as `prev`.
    const genreNav = screen.getByRole("navigation", { name: "More in this genre" });
    const older = within(genreNav).getByRole("link", { name: "Older Announcing WDL 1.2.0" });
    expect(older).toHaveAttribute("href", "/blog/announcing-wdl-1-2-0/");
    expect(older).toHaveAttribute("rel", "prev");
    const newer = within(genreNav).getByRole("link", { name: "Newer Announcing WDL 1.1.3" });
    expect(newer).toHaveAttribute("href", "/blog/announcing-wdl-1-1-3/");
    expect(newer).toHaveAttribute("rel", "next");
  });

  it("renders the shared not-found page for an unknown slug", () => {
    renderRoute("does-not-exist");
    expect(screen.getByRole("heading", { name: "Workflow route failed" }))
      .toBeInTheDocument();
  });

  it("collapses the mobile table of contents behind a closed disclosure", async () => {
    const user = userEvent.setup();
    renderRoute("announcing-wdl-1-3-0");

    const toggle = screen.getByRole("button", { name: "Table of contents" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const panel = document.getElementById("article-toc-mobile");
    expect(panel).not.toBeNull();
    expect(panel).toHaveAttribute("hidden");

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("hidden");
    expect(within(panel as HTMLElement).getByRole("link", { name: "Type Safety" }))
      .toHaveAttribute("href", "#type-safety");
  });

  it("omits release facts for non-release posts", () => {
    renderRoute("introducing-sprocket");
    expect(screen.queryByRole("link", { name: "Read the specification" })).toBeNull();
    expect(screen.queryByText("Version")).toBeNull();
  });
});
