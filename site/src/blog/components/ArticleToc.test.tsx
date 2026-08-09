import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleToc } from "./ArticleToc";
import type { TocItem } from "../../content/tableOfContents";

const items: readonly TocItem[] = [
  { depth: 2, id: "language-ergonomics", label: "Language Ergonomics" },
  {
    depth: 3,
    id: "the-task-variable",
    label: "The task variable",
    labelParts: [
      { value: "The ", code: false },
      { value: "task", code: true },
      { value: " variable", code: false },
    ],
  },
];

describe("ArticleToc", () => {
  it("links each heading and marks depth-three items for indentation", () => {
    render(<ArticleToc items={items} />);

    expect(
      screen.getByRole("link", { name: "Language Ergonomics" }),
    ).toHaveAttribute("href", "#language-ergonomics");
    expect(
      screen.getByRole("link", { name: "The task variable" }).closest("li"),
    ).toHaveAttribute("data-depth", "3");
    expect(
      screen.getByRole("link", { name: "Language Ergonomics" }).closest("li"),
    ).toHaveAttribute("data-depth", "2");
  });

  it("renders inline-code label fragments as code", () => {
    render(<ArticleToc items={items} />);

    expect(screen.getByText("task").tagName).toBe("CODE");
  });

  it("stays a plain list fragment with no landmark or active-heading state", () => {
    // The same outline is rendered twice per post — collapsed in the mobile
    // disclosure and again as the desktop rail — so it must not be a `<nav>`
    // landmark and must not run scroll-spy. Swapping in the kit `Toc` here
    // would give a post two identically named landmarks and two observers.
    const { container } = render(<ArticleToc items={items} />);

    expect(screen.queryByRole("navigation")).toBeNull();
    expect(container.querySelector("ol")).not.toBeNull();
    expect(container.querySelector("[aria-current]")).toBeNull();
  });

  it("renders nothing without headings", () => {
    const { container } = render(<ArticleToc items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
