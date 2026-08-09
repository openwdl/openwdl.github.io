import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider } from "@openwdl/ui";
import { ColorPalette } from "./ColorPalette";

describe("ColorPalette", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("renders all 20 swatches and copies a hex on click", async () => {
    render(
      <ToastProvider>
        <ColorPalette />
      </ToastProvider>,
    );
    const swatches = screen.getAllByRole("button", {
      name: /copy (teal|cool gray) \d+ #[0-9a-f]{6}/i,
    });
    expect(swatches).toHaveLength(20);

    await userEvent.click(screen.getByRole("button", {
      name: "Copy Teal 500 #4BD8FA",
    }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("#4BD8FA");
    expect(await screen.findByText("Copied #4BD8FA")).toBeInTheDocument();
  });
});
