import { render, screen } from "@testing-library/react";
import { SiteApp } from "./SiteApp";

it("renders the branded not-found route", () => {
  render(<SiteApp routeId="not-found" />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Workflow route failed" }),
  ).toBeInTheDocument();
  expect(screen.getByText("error: route not found")).toBeInTheDocument();
});

it("renders the branded not-found page for an unknown route id", () => {
  render(<SiteApp routeId="totally-unknown" />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Workflow route failed" }),
  ).toBeInTheDocument();
  expect(screen.getByText("error: route not found")).toBeInTheDocument();
});

it("renders the current WDL introduction as the home route", () => {
  render(<SiteApp routeId="home" />);
  expect(screen.getByRole("heading", {
    level: 1,
    name: "A human-readable description language for running workflows anywhere.",
  })).toBeInTheDocument();
});

it("renders a base-aware fallback while the legacy About route redirects", () => {
  const replaceLocation = vi.fn();
  render(<SiteApp routeId="about-redirect" replaceLocation={replaceLocation} />);
  expect(screen.getByRole("link", { name: "Continue to the new page" }))
    .toHaveAttribute("href", "/");
  expect(replaceLocation).toHaveBeenCalledWith("/");
});

it("has no community route, so its id falls through to not-found", () => {
  render(<SiteApp routeId="community" />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Workflow route failed" }),
  ).toBeInTheDocument();
});

it("renders the blog index route", () => {
  render(<SiteApp routeId="blog:index" />);
  expect(screen.getByRole("main", { name: "OpenWDL blog" })).toBeInTheDocument();
});

it("renders a blog article route", () => {
  render(<SiteApp routeId="blog:announcing-wdl-1-3-0" />);
  expect(screen.getByRole("heading", {
    level: 1,
    name: "Announcing WDL 1.3.0",
  })).toBeInTheDocument();
});
