import { render, screen, waitFor, within } from "@testing-library/react";
import { NotFoundPage } from "./NotFoundPage";

it("renders the branded site-wide recovery page", () => {
  render(<NotFoundPage />);

  expect(screen.getAllByRole("navigation")).toHaveLength(2);
  expect(screen.getByRole("main")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 1, name: "Workflow route failed" }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByText("error: route not found")).toBeInTheDocument();

  const main = screen.getByRole("main");
  expect(within(main).getByRole("link", { name: "OpenWDL home" }))
    .toHaveAttribute("href", "/");
  expect(within(main).getByRole("link", { name: "Browse docs" }))
    .toHaveAttribute("href", "/docs/");
  expect(within(main).getByRole("link", { name: "Get started" }))
    .toHaveAttribute("href", "/get-started/");
  // The kit Button wraps a leadingIcon in an aria-hidden span, so the glyph
  // stays decorative without polluting the link's accessible name.
  for (const link of within(main).getAllByRole("link")) {
    const icon = link.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon!.closest("[aria-hidden='true']")).not.toBeNull();
  }
});

it("uses the latest stable WDL version in the route example", () => {
  render(<NotFoundPage />);

  expect(screen.getByText("version")).toHaveClass(
    screen.getByText("workflow").className,
  );
  expect(screen.getByText("1.3")).not.toHaveAttribute("class");
  expect(screen.getByText("call")).toHaveClass(
    screen.getByText("workflow").className,
  );
});

it("passes the attempted URL route to the display task", async () => {
  const originalPath = window.location.pathname;
  window.history.replaceState({}, "", "/brand/missing-page/");

  try {
    render(<NotFoundPage />);

    const codePanel = screen.getByRole("region", { name: "Route error" });
    expect(codePanel).toHaveTextContent("workflow website");
    await waitFor(() => {
      expect(codePanel).toHaveTextContent(
        'String route = "/brand/missing-page/"',
      );
    });
    expect(codePanel).toHaveTextContent("call display { route }");
  } finally {
    window.history.replaceState({}, "", originalPath);
  }
});
