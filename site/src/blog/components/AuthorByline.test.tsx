import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthorByline } from "./AuthorByline";
import { getAuthor } from "../../content/authors";

describe("AuthorByline", () => {
  it("renders plain, unlinked full names by default (register rows)", () => {
    render(<AuthorByline ids={["venkat-malladi", "john-didion"]} size={47} />);

    const venkat = screen.getByText("Venkat Malladi");
    const didion = screen.getByText("John Didion");
    expect(venkat.closest("a")).toBeNull();
    expect(didion.closest("a")).toBeNull();
  });

  it("links each author's full name to their profile URL only when opted in (featured byline)", () => {
    render(
      <AuthorByline
        ids={["venkat-malladi"]}
        size={82}
        label="Written by"
        linkProfiles
      />,
    );

    const link = screen.getByRole("link", { name: "Venkat Malladi" });
    expect(link).toHaveAttribute("href", "https://github.com/vsmalladi");
  });

  it("shows provided social links only when opted in (article byline)", () => {
    const { rerender } = render(
      <AuthorByline ids={["clay-mcleod"]} size={66} linkProfiles />,
    );

    expect(screen.queryByRole("link", { name: "Clay McLeod on GitHub" })).toBeNull();

    rerender(
      <AuthorByline
        ids={["clay-mcleod"]}
        size={66}
        linkProfiles
        showSocialLinks
      />,
    );

    expect(screen.getByRole("link", { name: "Clay McLeod on GitHub" }))
      .toHaveAttribute("href", "https://github.com/claymcleod");
    expect(screen.getByRole("link", { name: "Clay McLeod on LinkedIn" }))
      .toHaveAttribute("href", "https://www.linkedin.com/in/claymcleod/");
    expect(screen.getByRole("link", { name: "Clay McLeod on Website" }))
      .toHaveAttribute("href", "https://claymcleod.dev");
  });

  it("gives every author a portrait in authored order, carrying their registered name and image", () => {
    render(<AuthorByline ids={["venkat-malladi", "john-didion"]} size={47} />);

    const portraits = screen.getAllByRole("img");
    expect(portraits.map((portrait) => portrait.getAttribute("alt"))).toEqual([
      "Venkat Malladi",
      "John Didion",
    ]);
    expect(portraits[0]).toHaveAttribute(
      "src",
      getAuthor("venkat-malladi").avatar,
    );
    expect(portraits[1]).toHaveAttribute(
      "src",
      getAuthor("john-didion").avatar,
    );
  });

  it("sizes every portrait in the byline from the requested diameter", () => {
    render(<AuthorByline ids={["venkat-malladi", "john-didion"]} size={82} />);

    for (const portrait of screen.getAllByRole("img")) {
      expect(portrait.parentElement).toHaveStyle({ "--avatar-size": "82px" });
    }
  });

  it("keeps the author identifiable when their portrait fails to load", () => {
    const { container } = render(
      <AuthorByline ids={["venkat-malladi"]} size={47} />,
    );

    fireEvent.error(screen.getByRole("img", { name: "Venkat Malladi" }));

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Venkat Malladi" })).toHaveTextContent(
      "VM",
    );
  });

  it("rings the portraits only for the featured entry", () => {
    const { container, rerender } = render(
      <AuthorByline ids={["venkat-malladi"]} size={82} />,
    );

    expect(container.querySelector("[class*='ring']")).toBeNull();

    rerender(<AuthorByline ids={["venkat-malladi"]} size={82} accentRing />);

    expect(container.querySelector("[class*='ring']")).not.toBeNull();
  });
});
