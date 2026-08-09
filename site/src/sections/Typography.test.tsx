import { render, screen } from "@testing-library/react";
import { ToastProvider } from "@openwdl/ui";
import { Typography } from "./Typography";

describe("Typography", () => {
  it("renders every approved type style as a copyable live specimen", () => {
    render(
      <ToastProvider>
        <Typography />
      </ToastProvider>,
    );

    expect(screen.getAllByRole("button", { name: /copy .* css/i })).toHaveLength(15);
    expect(screen.getByText("Headline 1")).toHaveStyle({
      fontFamily: '"Public Sans"',
      fontWeight: "700",
      fontSize: "56px",
    });
    expect(screen.getByText("Accent / Caption")).toHaveStyle({
      fontFamily: '"Martian Mono"',
      fontWeight: "300",
      fontSize: "14px",
    });
    expect(screen.getByText("56px").className).toMatch(/size/);
  });
});
