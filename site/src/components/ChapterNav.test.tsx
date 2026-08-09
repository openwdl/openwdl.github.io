import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChapterNav } from "./ChapterNav";

/** Chapter id paired with the link's accessible name (the ordinal is hidden). */
const chapters = [
  ["foundation", "Foundation"],
  ["logo-system", "Logo system"],
  ["using-the-mark", "Using the mark"],
  ["visual-language", "Color and typography"],
  ["grid-texture", "Grid and texture"],
  ["design-system", "Design system"],
  ["downloads", "Downloads"],
] as const;

/** Renders the nav alongside the chapter sections its scroll-spy looks up. */
function renderWithSections() {
  return render(
    <>
      <ChapterNav />
      {chapters.map(([id]) => (
        <section key={id} id={id} />
      ))}
    </>,
  );
}

describe("ChapterNav", () => {
  it("links every chapter from a labeled navigation landmark", () => {
    renderWithSections();
    const nav = screen.getByRole("navigation", { name: "On this page" });

    expect(within(nav).getAllByRole("link")).toHaveLength(chapters.length);
    for (const [id, name] of chapters) {
      expect(within(nav).getByRole("link", { name })).toHaveAttribute("href", `#${id}`);
    }
  });

  it("marks the first chapter current once the scroll-spy resolves the sections", () => {
    renderWithSections();
    const nav = screen.getByRole("navigation", { name: "On this page" });

    expect(within(nav).getByRole("link", { name: /foundation/i }))
      .toHaveAttribute("aria-current", "location");
    expect(within(nav).getByRole("link", { name: /downloads/i }))
      .not.toHaveAttribute("aria-current");
  });

  it("marks nothing current when the chapter sections are absent", () => {
    render(<ChapterNav />);
    expect(document.querySelector("[aria-current]")).toBeNull();
  });

  it("reveals the chapter list from the small-screen disclosure", async () => {
    const user = userEvent.setup();
    renderWithSections();

    const toggle = screen.getByRole("button", { name: "On this page" });
    const list = document.getElementById("brand-chapter-links");
    expect(toggle).toHaveAttribute("aria-controls", "brand-chapter-links");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(list).toHaveAttribute("data-open", "false");

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(list).toHaveAttribute("data-open", "true");
  });

  it("closes the disclosure after a chapter is chosen", async () => {
    const user = userEvent.setup();
    renderWithSections();

    const toggle = screen.getByRole("button", { name: "On this page" });
    await user.click(toggle);
    await user.click(screen.getByRole("link", { name: /downloads/i }));

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("brand-chapter-links"))
      .toHaveAttribute("data-open", "false");
  });
});
