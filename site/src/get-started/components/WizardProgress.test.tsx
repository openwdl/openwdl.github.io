import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WizardProgress } from "./WizardProgress";

describe("WizardProgress — stage labels", () => {
  it("renders all four stable stages", () => {
    render(<WizardProgress current="environment" completed={[]} />);
    expect(screen.getByText(/^Environment/)).toBeInTheDocument();
    expect(screen.getByText(/^Engine/)).toBeInTheDocument();
    expect(screen.getByText(/^Editor/)).toBeInTheDocument();
    expect(screen.getByText(/^Install/)).toBeInTheDocument();
  });

  it("renders all four stages even on the last step", () => {
    render(<WizardProgress current="install" completed={["environment", "engine", "editor"]} />);
    const items = screen.getAllByRole("listitem");
    expect(items.some((item) => item.textContent?.includes("Environment"))).toBe(true);
    expect(items.some((item) => item.textContent?.includes("Engine"))).toBe(true);
    expect(items.some((item) => item.textContent?.includes("Editor"))).toBe(true);
    expect(items.some((item) => item.textContent?.includes("Install"))).toBe(true);
  });
});

describe("WizardProgress — current step semantics", () => {
  it("marks the current stage with aria-current='step'", () => {
    render(<WizardProgress current="engine" completed={["environment"]} />);
    const currentItem = screen.getAllByRole("listitem").find(
      (item) => item.getAttribute("aria-current") === "step",
    );
    expect(currentItem).toBeDefined();
    expect(currentItem).toHaveTextContent("Engine");
  });

  it("marks exactly one item with aria-current='step'", () => {
    render(<WizardProgress current="editor" completed={["environment", "engine"]} />);
    const currentItems = screen.getAllByRole("listitem").filter(
      (item) => item.getAttribute("aria-current") === "step",
    );
    expect(currentItems).toHaveLength(1);
  });

  it("does not mark non-current stages with aria-current", () => {
    render(<WizardProgress current="environment" completed={[]} />);
    const nonCurrentItems = screen.getAllByRole("listitem").filter(
      (item) => item.getAttribute("aria-current") === "step",
    );
    expect(nonCurrentItems).toHaveLength(1);
    expect(nonCurrentItems[0]).toHaveTextContent("Environment");
  });
});

describe("WizardProgress — navigation landmark", () => {
  it("renders inside a nav landmark with an accessible label", () => {
    render(<WizardProgress current="install" completed={[]} />);
    expect(screen.getByRole("navigation", { name: /setup/i })).toBeInTheDocument();
  });
});

describe("WizardProgress — completed semantics", () => {
  it("includes an sr-only '(completed)' indicator for each completed stage", () => {
    render(<WizardProgress current="engine" completed={["environment"]} />);
    const items = screen.getAllByRole("listitem");
    const environmentItem = items.find((item) => item.textContent?.includes("Environment"));
    expect(environmentItem?.textContent).toContain("(completed)");
  });

  it("does not add completed indicator to the current stage", () => {
    render(<WizardProgress current="engine" completed={["environment"]} />);
    const items = screen.getAllByRole("listitem");
    const engineItem = items.find((item) => item.getAttribute("aria-current") === "step");
    expect(engineItem?.textContent).not.toContain("(completed)");
  });

  it("does not add completed indicator to pending stages", () => {
    render(<WizardProgress current="engine" completed={["environment"]} />);
    const items = screen.getAllByRole("listitem");
    const installItem = items.find((item) => item.textContent?.includes("Install"));
    expect(installItem?.textContent).not.toContain("(completed)");
  });

  it("accessible text of a completed stage includes its label and completed", () => {
    render(<WizardProgress current="install" completed={["environment", "engine", "editor"]} />);
    const items = screen.getAllByRole("listitem");
    const editorItem = items.find((item) => item.textContent?.includes("Editor"));
    expect(editorItem?.textContent).toContain("Editor");
    expect(editorItem?.textContent).toContain("(completed)");
  });
});

describe("WizardProgress — stage position text", () => {
  it("includes sr-only 'Stage N of 4' for every item", () => {
    render(<WizardProgress current="engine" completed={["environment"]} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0].textContent).toContain("Stage 1 of 4");
    expect(items[1].textContent).toContain("Stage 2 of 4");
    expect(items[2].textContent).toContain("Stage 3 of 4");
    expect(items[3].textContent).toContain("Stage 4 of 4");
  });

  it("stage position is prepended to visible label text", () => {
    render(<WizardProgress current="environment" completed={[]} />);
    const items = screen.getAllByRole("listitem");
    const engineItem = items[1];
    expect(engineItem.textContent).toContain("Stage 2 of 4");
    expect(engineItem.textContent).toContain("Engine");
  });

  it("completed stage includes position, label, and completed marker", () => {
    render(<WizardProgress current="engine" completed={["environment"]} />);
    const items = screen.getAllByRole("listitem");
    const envItem = items[0];
    expect(envItem.textContent).toContain("Stage 1 of 4");
    expect(envItem.textContent).toContain("Environment");
    expect(envItem.textContent).toContain("(completed)");
  });
});
