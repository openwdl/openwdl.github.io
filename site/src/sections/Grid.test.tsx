import { render } from "@testing-library/react";
import { Grid } from "./Grid";

describe("Grid", () => {
  it("lets all density previews fill a shared stage instead of sizing the cards", () => {
    const { container } = render(<Grid />);
    const previews = Array.from(
      container.querySelectorAll<HTMLElement>("[style*='background-image']"),
    );

    expect(previews).toHaveLength(3);
    for (const preview of previews) {
      expect(preview.style.width).toBe("");
      expect(preview.style.height).toBe("");
    }
  });
});
