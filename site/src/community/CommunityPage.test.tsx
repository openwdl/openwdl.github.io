import { render, screen, within } from "@testing-library/react";
import { CommunityPage } from "./CommunityPage";

it("offers six concrete ways to participate", () => {
  render(<CommunityPage />);

  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(screen.getByRole("heading", {
    level: 1,
    name: "A language maintained by the people who use it.",
  })).toBeInTheDocument();

  const gallery = screen.getByRole("list", { name: "Ways to participate" });
  expect(within(gallery).getAllByRole("listitem")).toHaveLength(6);
  for (const title of [
    "Join the conversation",
    "Attend a meeting",
    "Share workflows",
    "Improve docs and code",
    "Build and test engines",
    "Shape the specification",
  ]) {
    expect(within(gallery).getByRole("heading", { level: 3, name: title }))
      .toBeInTheDocument();
  }
});

it("links every involvement path to its authoritative destination", () => {
  render(<CommunityPage />);

  // Scope within the gallery to avoid matching the Footer's "Join Slack" CTA.
  const gallery = screen.getByRole("list", { name: "Ways to participate" });
  expect(within(gallery).getByRole("link", { name: "Join Slack" }))
    .toHaveAttribute("href", expect.stringContaining("join.slack.com"));
  expect(within(gallery).getByRole("link", { name: "Find meeting information" }))
    .toHaveAttribute("href", expect.stringContaining("join.slack.com"));
  expect(within(gallery).getByRole("link", { name: "Explore community workflows" }))
    .toHaveAttribute("href", "/docs/start/ecosystem/#community-workflows");
  expect(within(gallery).getByRole("link", { name: "Contribute on GitHub" }))
    .toHaveAttribute("href", "https://github.com/openwdl");
  expect(within(gallery).getByRole("link", { name: "View execution engines" }))
    .toHaveAttribute("href", "/docs/start/ecosystem/#execution-engines");
  expect(within(gallery).getByRole("link", { name: "Read the RFC process" }))
    .toHaveAttribute("href", "https://github.com/openwdl/governance/blob/main/RFC.md");
  for (const link of within(gallery).getAllByRole("link")) {
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  }
});

it("uses canonical chrome", () => {
  render(<CommunityPage />);

  const primaryNav = screen.getByRole("navigation", {
    name: "Primary navigation",
  });
  expect(within(primaryNav).getByRole("link", { name: "Community" }))
    .toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
});
