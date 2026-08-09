import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthorAvatar } from "./AuthorAvatar";
import type { Author } from "../../content/authors";
import styles from "../Authors.module.css";

const withPortrait: Author = {
  id: "venkat-malladi",
  name: "Venkat Malladi",
  avatar: "/avatars/venkat-malladi.png",
};

const withoutPortrait: Author = {
  id: "venkat-malladi",
  name: "Venkat Malladi",
};

describe("AuthorAvatar", () => {
  it("renders the supplied portrait as decorative, adjacent to the full name", () => {
    const { container } = render(
      <>
        <AuthorAvatar author={withPortrait} size={47} />
        <span>{withPortrait.name}</span>
      </>,
    );

    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
    expect(screen.getByText("Venkat Malladi")).toBeInTheDocument();
  });

  it("falls back to deterministic initials without a portrait", () => {
    const { container } = render(
      <>
        <AuthorAvatar author={withoutPortrait} size={47} />
        <span>{withoutPortrait.name}</span>
      </>,
    );

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("VM")).toBeInTheDocument();
    expect(screen.getByText("Venkat Malladi")).toBeInTheDocument();
  });

  it("falls back to initials and removes the image after it fails to load", () => {
    const { container } = render(
      <>
        <AuthorAvatar author={withPortrait} size={47} />
        <span>{withPortrait.name}</span>
      </>,
    );

    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    fireEvent.error(img!);

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("VM")).toBeInTheDocument();
    expect(screen.getByText("Venkat Malladi")).toBeInTheDocument();
  });

  it("adds the accent ring when requested", () => {
    const { container } = render(
      <AuthorAvatar author={withPortrait} size={82} accentRing />,
    );

    expect(container.firstChild).toHaveClass(styles.accentRing);
  });
});
