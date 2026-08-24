import { render, screen, within } from "@testing-library/react";
import App from "./App";

describe("App navigation", () => {
  it("renders the canonical OpenWDL navbar instead of page-section links", () => {
    render(<App />);
    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });

    expect(within(navigation).queryByRole("link", { name: "About" })).not.toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "Documentation" }))
      .toBeInTheDocument();
    expect(within(navigation).queryByRole("link", { name: "Brand" }))
      .not.toBeInTheDocument();
    expect(within(navigation).queryByRole("link", { name: "Modules" }))
      .not.toBeInTheDocument();
    expect(within(navigation).getAllByRole("link").map((a) => a.textContent))
      .toEqual(["Documentation", "Blog", "OpenWDL on GitHub"]);
    // The "Get started" action link sits in the site header but outside the <nav>
    expect(within(navigation.closest("header") as HTMLElement).getByRole("link", { name: "Get started" })).toBeInTheDocument();
    expect(within(navigation).queryByRole("link", { name: "Logo system" })).toBeNull();
  });

  it("renders an independent chapter navigation for the brand guide", () => {
    render(<App />);
    const navigation = screen.getByRole("navigation", { name: "On this page" });

    const expectedLinks = [
      ["Foundation", "#foundation"],
      ["Logo system", "#logo-system"],
      ["Using the mark", "#using-the-mark"],
      ["Color and typography", "#visual-language"],
      ["Grid and texture", "#grid-texture"],
      ["Design system", "#design-system"],
      ["Downloads", "#downloads"],
    ];

    for (const [name, href] of expectedLinks) {
      expect(within(navigation).getByRole("link", { name: new RegExp(name, "i") }))
        .toHaveAttribute("href", href);
    }
    expect(within(navigation).getByRole("link", { name: /foundation/i }))
      .toHaveAttribute("aria-current", "location");
  });
});

describe("App brand field guide", () => {
  it("renders the approved hero and chapter sequence", () => {
    render(<App />);
    const main = screen.getByRole("main");
    const heroHeading = within(main).getByRole("heading", {
      level: 1,
      name: /human-readable\. writable\. portable\./i,
    });
    const headings = within(main).getAllByRole("heading", { level: 2 });
    const chapters = Array.from(main.querySelectorAll("section"))
      .filter((section) => section.id !== "top");

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(heroHeading.children).toHaveLength(2);
    expect(heroHeading.children[0]).toHaveTextContent("Human-readable.");
    expect(heroHeading.children[1]).toHaveTextContent("Writable. Portable.");
    expect(headings.map((heading) => heading.textContent)).toEqual([
      "The visual system follows the language.",
      "A computational graph, simplified.",
      "Choose an approved treatment for the background.",
      "One primary palette. Two typefaces.",
      "Use the dotted grid to add structure, not noise.",
      "Shared components apply the brand to interfaces.",
      "Use the source assets.",
    ]);
    expect(chapters).toHaveLength(7);
    expect(chapters.every((chapter) => chapter.getAttribute("data-revealed") === "true"))
      .toBe(true);
    // Kit Button hides a leadingIcon behind an aria-hidden wrapper.
    for (const name of ["Download brand assets", "Read the guidelines"]) {
      const icon = screen.getByRole("link", { name }).querySelector("svg");
      expect(icon).not.toBeNull();
      expect(icon!.closest("[aria-hidden='true']")).not.toBeNull();
    }
    expect(screen.getByRole("link", { name: "Download brand assets" }))
      .toHaveAttribute("href", "#downloads");
    expect(screen.getByRole("link", { name: "Read the guidelines" }))
      .toHaveAttribute("href", "#foundation");
  });

  it("shows the full design-system preview and Storybook handoff", () => {
    render(<App />);

    for (const family of [
      "Actions and links",
      "Status and guidance",
      "Content and grouping",
      "Code and utilities",
      "Feedback",
      "Shared site chrome",
    ]) {
      expect(screen.getByRole("heading", { level: 3, name: family })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: /explore storybook/i }))
      .toHaveAttribute("href", "https://openwdl.github.io/ui/");
    expect(
      screen.getByRole("link", { name: /explore storybook/i })
        .querySelector("svg")!.closest("[aria-hidden='true']"),
    ).not.toBeNull();
    expect(screen.getByText("{ greeting }")).toBeInTheDocument();
  });
});

describe("App footer", () => {
  it("renders the community actions and brand-page legal notice", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: /join slack/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /follow on github/i })).toBeInTheDocument();
    expect(screen.getByText(`© ${new Date().getFullYear()} The OpenWDL Developers.`))
      .toBeInTheDocument();
    expect(screen.getByText(/brand guidelines and assets licensed under/i))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cc by 4\.0/i })).toBeInTheDocument();
    // The footer logo is theme-derived: a `role="img"` wrapper holds the
    // accessible name so it survives the light/dark swap, while both inner
    // images are `aria-hidden` and CSS reveals whichever suits the theme.
    const footerLogo = within(screen.getByRole("contentinfo"))
      .getByRole("img", { name: "OpenWDL" });
    expect(footerLogo).toBeInTheDocument();
    expect(footerLogo.querySelectorAll("img")).toHaveLength(2);
  });
});
