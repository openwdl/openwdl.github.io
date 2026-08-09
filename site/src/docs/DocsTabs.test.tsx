import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarkdownBody } from "./MarkdownBody";

const tabsSource = [
  "::::tabs",
  ':::tab{label="macOS"}',
  "Install with brew.",
  ":::",
  ':::tab{label="Linux"}',
  "Install with apt.",
  ":::",
  "::::",
].join("\n");

it("renders a tab button for each tab directive", () => {
  render(<MarkdownBody source={tabsSource} />);
  expect(screen.getByRole("tab", { name: "macOS" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Linux" })).toBeInTheDocument();
});

it("shows the first tab by default and hides the others", () => {
  render(<MarkdownBody source={tabsSource} />);
  const panels = screen.getAllByRole("tabpanel", { hidden: true });
  expect(panels[0]).not.toHaveAttribute("hidden");
  expect(panels[1]).toHaveAttribute("hidden");
});

it("switches to the clicked tab", async () => {
  const user = userEvent.setup();
  render(<MarkdownBody source={tabsSource} />);
  const linuxTab = screen.getByRole("tab", { name: "Linux" });
  await user.click(linuxTab);
  const panels = screen.getAllByRole("tabpanel", { hidden: true });
  expect(panels[0]).toHaveAttribute("hidden");
  expect(panels[1]).not.toHaveAttribute("hidden");
});

it("renders the tablist role", () => {
  render(<MarkdownBody source={tabsSource} />);
  expect(screen.getByRole("tablist")).toBeInTheDocument();
});

it("active tabpanel has tabIndex 0 and inactive panels have tabIndex -1", () => {
  render(<MarkdownBody source={tabsSource} />);
  const panels = screen.getAllByRole("tabpanel", { hidden: true });
  expect(panels[0]).toHaveAttribute("tabindex", "0");
  expect(panels[1]).toHaveAttribute("tabindex", "-1");
});

const duplicateLabelSource = [
  "::::tabs",
  ':::tab{label="Setup"}',
  "First setup.",
  ":::",
  ':::tab{label="Setup"}',
  "Second setup.",
  ":::",
  "::::",
].join("\n");

it("renders all tabs when labels repeat within a group without key collisions", () => {
  render(<MarkdownBody source={duplicateLabelSource} />);
  const tabs = screen.getAllByRole("tab", { name: "Setup" });
  expect(tabs).toHaveLength(2);
  const panels = screen.getAllByRole("tabpanel", { hidden: true });
  expect(panels).toHaveLength(2);
});

const twoGroupsSource = [
  "::::tabs",
  ':::tab{label="Alpha"}',
  "First group first tab.",
  ":::",
  "::::",
  "",
  "::::tabs",
  ':::tab{label="Alpha"}',
  "Second group first tab.",
  ":::",
  "::::",
].join("\n");

it("generates unique IDs across two co-existing tab groups", () => {
  render(<MarkdownBody source={twoGroupsSource} />);
  const tabs = screen.getAllByRole("tab", { name: "Alpha" });
  const panels = screen.getAllByRole("tabpanel", { hidden: true });

  expect(tabs).toHaveLength(2);
  expect(tabs[0].getAttribute("id")).not.toBe(tabs[1].getAttribute("id"));
  expect(panels[0].getAttribute("id")).not.toBe(panels[1].getAttribute("id"));
  expect(tabs[0].getAttribute("aria-controls")).toBe(panels[0].getAttribute("id"));
  expect(tabs[1].getAttribute("aria-controls")).toBe(panels[1].getAttribute("id"));
});
