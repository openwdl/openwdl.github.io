import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LogoPreview } from "./LogoPreview";

describe("LogoPreview", () => {
  it("recommends the matching variant when the background changes", () => {
    render(<LogoPreview />);
    // Default dark background recommends Teal + White.
    expect(screen.getByTestId("recommended")).toHaveTextContent("Teal + White");

    fireEvent.input(screen.getByLabelText("Background color"), {
      target: { value: "#e8e8e9" },
    });
    expect(screen.getByTestId("recommended")).toHaveTextContent("Teal + Black");
  });
});
