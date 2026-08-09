import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClientApp } from "./ClientApp";

vi.mock("./SiteApp", () => ({
  SiteApp: ({ routeId }: { routeId: string }) => (
    <div>
      <span data-testid="route-id">{routeId}</span>
      <a href="/docs/start/overview/">Documentation</a>
      <a href="/blog/">Blog index</a>
      <a href="https://example.com/">External</a>
      <a href="/blog/announcing-wdl-1-3-0/" target="_blank">Post in new tab</a>
    </div>
  ),
}));

beforeEach(() => {
  window.history.replaceState({}, "", "/");
});

it("updates internal routes without reloading the document", async () => {
  const user = userEvent.setup();
  render(<ClientApp initialRouteId="home" base="/" />);

  await user.click(screen.getByRole("link", { name: "Documentation" }));

  expect(window.location.pathname).toBe("/docs/start/overview/");
  expect(screen.getByTestId("route-id")).toHaveTextContent(
    "docs:/docs/start/overview/",
  );
});

it("updates the rendered route when browser history changes", () => {
  render(<ClientApp initialRouteId="home" base="/" />);

  window.history.pushState({}, "", "/blog/");
  fireEvent.popState(window);

  expect(screen.getByTestId("route-id")).toHaveTextContent("blog:index");
});

it("does not intercept modified, external, or new-tab links", () => {
  render(<ClientApp initialRouteId="home" base="/" />);

  function dispatchWithoutNavigating(link: HTMLElement, event: MouseEvent): boolean {
    let routerPrevented = true;
    window.addEventListener(
      "click",
      (clickEvent) => {
        routerPrevented = clickEvent.defaultPrevented;
        clickEvent.preventDefault();
      },
      { once: true },
    );
    link.dispatchEvent(event);
    return routerPrevented;
  }

  const modified = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    metaKey: true,
  });
  expect(
    dispatchWithoutNavigating(
      screen.getByRole("link", { name: "Blog index" }),
      modified,
    ),
  ).toBe(false);

  const external = new MouseEvent("click", { bubbles: true, cancelable: true });
  expect(
    dispatchWithoutNavigating(
      screen.getByRole("link", { name: "External" }),
      external,
    ),
  ).toBe(false);

  const newTab = new MouseEvent("click", { bubbles: true, cancelable: true });
  expect(
    dispatchWithoutNavigating(
      screen.getByRole("link", { name: "Post in new tab" }),
      newTab,
    ),
  ).toBe(false);
});
