import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthorByline } from "./AuthorByline";

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
});
