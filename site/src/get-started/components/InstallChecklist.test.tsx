import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InstallChecklist } from "./InstallChecklist";
import { FIRST_WORKFLOW_SLUG } from "../model/constants";
import { eligibleCatalog } from "../test/fixtures";
import { buildInstallChecklist } from "../model/checklist";

// macOS Sprocket has two install methods (Homebrew + Cargo) → installOptions populated
const macosMultiOptionSteps = buildInstallChecklist(
  { environment: "local", editor: "vscode", os: "macos" },
  "sprocket",
  eligibleCatalog,
);

// Linux Sprocket has a single install method (Cargo only) → installOptions absent
const linuxSingleOptionSteps = buildInstallChecklist(
  { environment: "local", editor: "vscode", os: "linux" },
  "sprocket",
  eligibleCatalog,
);

describe("InstallChecklist — step structure", () => {
  it("renders exactly five steps", () => {
    render(<InstallChecklist steps={macosMultiOptionSteps} />);
    expect(macosMultiOptionSteps).toHaveLength(5);
    expect(screen.getByText("Prerequisites")).toBeInTheDocument();
    expect(screen.getByText("Verify your setup")).toBeInTheDocument();
  });

  it("renders steps in canonical order: prerequisites → engine → editor → verify → first-workflow", () => {
    render(<InstallChecklist steps={macosMultiOptionSteps} />);
    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    const prereqIndex = headings.findIndex((h) => h?.includes("Prerequisites"));
    const verifyIndex = headings.findIndex((h) => h?.includes("Verify"));
    const firstWorkflowIndex = headings.findIndex(
      (h) => h?.includes("first") || h?.includes("WDL workflow") || h?.toLowerCase().includes("workflow"),
    );
    expect(prereqIndex).toBeLessThan(verifyIndex);
    expect(verifyIndex).toBeLessThan(firstWorkflowIndex);
  });

  it("renders the engine step title", () => {
    render(<InstallChecklist steps={macosMultiOptionSteps} />);
    expect(screen.getByRole("heading", { name: /Install Sprocket/i, level: 3 })).toBeInTheDocument();
  });

  it("renders the editor step title", () => {
    render(<InstallChecklist steps={macosMultiOptionSteps} />);
    const editorStep = macosMultiOptionSteps.find((s) => s.id === "editor");
    expect(screen.getByText(editorStep!.title)).toBeInTheDocument();
  });
});

describe("InstallChecklist — commands via CodeBlock", () => {
  it("renders shell commands in the engine step", () => {
    render(<InstallChecklist steps={macosMultiOptionSteps} />);
    expect(screen.getAllByText(/sprocket/i).length).toBeGreaterThan(0);
  });

  it("renders all install options when multiple methods exist for macOS", () => {
    render(<InstallChecklist steps={macosMultiOptionSteps} />);
    const engineStep = macosMultiOptionSteps.find((s) => s.id === "engine");
    expect(engineStep?.installOptions).toBeDefined();
    expect(screen.getByText("Homebrew")).toBeInTheDocument();
    expect(screen.getByText("Cargo")).toBeInTheDocument();
  });

  it("renders commands directly (no install-option cards) for a single-method OS", () => {
    render(<InstallChecklist steps={linuxSingleOptionSteps} />);
    const engineStep = linuxSingleOptionSteps.find((s) => s.id === "engine");
    // Linux has exactly one install method → installOptions is undefined
    expect(engineStep?.installOptions).toBeUndefined();
    // The cargo command still appears (rendered via step.commands)
    expect(screen.getAllByText(/sprocket/i).length).toBeGreaterThan(0);
    // No multi-option label cards
    expect(screen.queryByText("Homebrew")).not.toBeInTheDocument();
  });
});

describe("InstallChecklist — links", () => {
  it("renders step links as anchors", () => {
    render(<InstallChecklist steps={macosMultiOptionSteps} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });

  it("the first-workflow step links to FIRST_WORKFLOW_SLUG", () => {
    render(<InstallChecklist steps={macosMultiOptionSteps} />);
    const firstWorkflowStep = macosMultiOptionSteps.find((s) => s.id === "first-workflow");
    const tutorialLink = firstWorkflowStep?.links[0];
    expect(tutorialLink?.href).toBe(FIRST_WORKFLOW_SLUG);
    const link = screen.getByRole("link", { name: tutorialLink!.label });
    expect(link).toHaveAttribute("href", FIRST_WORKFLOW_SLUG);
  });

  it("the first-workflow link is same-tab (no target=_blank) because FIRST_WORKFLOW_SLUG is internal", () => {
    render(<InstallChecklist steps={macosMultiOptionSteps} />);
    const firstWorkflowStep = macosMultiOptionSteps.find((s) => s.id === "first-workflow");
    const tutorialLink = firstWorkflowStep?.links[0];
    const link = screen.getByRole("link", { name: tutorialLink!.label });
    expect(link).not.toHaveAttribute("target");
  });

  it("renders each install option's upstreamUrl as a secure external link", () => {
    render(<InstallChecklist steps={macosMultiOptionSteps} />);
    const engineStep = macosMultiOptionSteps.find((s) => s.id === "engine");
    for (const opt of engineStep?.installOptions ?? []) {
      const link = screen.getByRole("link", { name: `${opt.label} documentation` });
      expect(link).toHaveAttribute("href", opt.upstreamUrl);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    }
  });

  it("http/https step links open in a new tab with noopener", () => {
    render(<InstallChecklist steps={macosMultiOptionSteps} />);
    const links = screen.getAllByRole("link");
    const externalLinks = links.filter(
      (l) => l.getAttribute("href")?.startsWith("https://"),
    );
    for (const link of externalLinks) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    }
  });
});

describe("InstallChecklist — back navigation", () => {
  it("renders Back when onBack is provided", () => {
    render(<InstallChecklist steps={macosMultiOptionSteps} onBack={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
  });

  it("omits Back when onBack is not provided", () => {
    render(<InstallChecklist steps={macosMultiOptionSteps} />);
    expect(screen.queryByRole("button", { name: /Back/i })).not.toBeInTheDocument();
  });

  it("calls onBack when Back is clicked", async () => {
    const onBack = vi.fn();
    render(<InstallChecklist steps={macosMultiOptionSteps} onBack={onBack} />);
    await userEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
