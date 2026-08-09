import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WizardQuestion } from "./WizardQuestion";
import type { WizardQuestionProps } from "./WizardQuestion";

const environmentQuestionProps: WizardQuestionProps<"local" | "hpc" | "cloud"> = {
  stage: "environment",
  stageNumber: 1,
  heading: "Where will your workflows run?",
  description: "Choose the environment where tasks execute.",
  name: "environment",
  options: [
    { value: "local", label: "My computer", description: "Run workflows locally." },
    { value: "hpc", label: "HPC cluster", description: "Submit work through Slurm or LSF." },
    { value: "cloud", label: "Cloud", description: "Use a managed or self-hosted service." },
  ],
  onChange: vi.fn(),
  onContinue: vi.fn(),
};

// ── Exact tests from the task brief ──────────────────────────────────────────

it("uses a fieldset, visible legend, and described radios", () => {
  render(<WizardQuestion {...environmentQuestionProps} />);
  expect(screen.getByRole("group", { name: "Where will your workflows run?" }))
    .toBeInTheDocument();
  expect(screen.getByRole("radio", { name: /HPC cluster/i }))
    .toHaveAccessibleDescription("Submit work through Slurm or LSF.");
});

it("keeps unavailable Continue focusable and announces validation", async () => {
  render(<WizardQuestion {...environmentQuestionProps} value={undefined} />);
  const button = screen.getByRole("button", { name: "Continue" });
  expect(button).toHaveAttribute("aria-disabled", "true");
  await userEvent.click(button);
  expect(screen.getByRole("alert")).toHaveTextContent("Choose an environment");
});

// ── Additional accessibility and interaction tests ────────────────────────────

describe("WizardQuestion — radio semantics", () => {
  it("renders each option as a radio input", () => {
    render(<WizardQuestion {...environmentQuestionProps} />);
    expect(screen.getByRole("radio", { name: /My computer/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /HPC cluster/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Cloud/i })).toBeInTheDocument();
  });

  it("all radios share the same name group", () => {
    render(<WizardQuestion {...environmentQuestionProps} />);
    const radios = screen.getAllByRole("radio");
    const names = radios.map((r) => (r as HTMLInputElement).name);
    expect(new Set(names).size).toBe(1);
    expect(names[0]).toBe("environment");
  });

  it("checks the radio matching the current value", () => {
    render(<WizardQuestion {...environmentQuestionProps} value="hpc" />);
    expect(screen.getByRole("radio", { name: /HPC cluster/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /My computer/i })).not.toBeChecked();
  });

  it("renders the description for each option", () => {
    render(<WizardQuestion {...environmentQuestionProps} />);
    expect(screen.getByRole("radio", { name: /My computer/i }))
      .toHaveAccessibleDescription("Run workflows locally.");
    expect(screen.getByRole("radio", { name: /Cloud/i }))
      .toHaveAccessibleDescription("Use a managed or self-hosted service.");
  });
});

describe("WizardQuestion — Continue button", () => {
  it("Continue is not aria-disabled when a value is selected", () => {
    render(<WizardQuestion {...environmentQuestionProps} value="local" />);
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).not.toHaveAttribute("aria-disabled");
  });

  it("does not show validation alert before Continue is clicked", () => {
    render(<WizardQuestion {...environmentQuestionProps} value={undefined} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls onContinue when a value is selected and Continue is clicked", async () => {
    const onContinue = vi.fn();
    render(
      <WizardQuestion {...environmentQuestionProps} value="local" onContinue={onContinue} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("calls onChange when a radio is selected", async () => {
    const onChange = vi.fn();
    render(<WizardQuestion {...environmentQuestionProps} onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: /Cloud/i }));
    expect(onChange).toHaveBeenCalledWith("cloud");
  });
});

describe("WizardQuestion — Back button", () => {
  it("renders Back when onBack is provided", () => {
    render(<WizardQuestion {...environmentQuestionProps} onBack={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("omits Back when onBack is not provided", () => {
    render(<WizardQuestion {...environmentQuestionProps} />);
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
  });

  it("calls onBack when Back is clicked", async () => {
    const onBack = vi.fn();
    render(<WizardQuestion {...environmentQuestionProps} onBack={onBack} />);
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

describe("WizardQuestion — validation alert lifecycle", () => {
  it("clears the alert when a radio is selected after Continue fails", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <WizardQuestion {...environmentQuestionProps} value={undefined} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    // Simulate selecting a radio; the parent would rerender with a value
    await userEvent.click(screen.getByRole("radio", { name: /My computer/i }));
    rerender(
      <WizardQuestion {...environmentQuestionProps} value="local" onChange={onChange} />,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("clears the alert when a valid controlled value arrives via rerender", async () => {
    const { rerender } = render(
      <WizardQuestion {...environmentQuestionProps} value={undefined} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(<WizardQuestion {...environmentQuestionProps} value="cloud" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("WizardQuestion — stage eyebrow", () => {
  it("renders a stage eyebrow with stage number and name", () => {
    render(<WizardQuestion {...environmentQuestionProps} />);
    expect(screen.getByText("Stage 1 of 4 · Environment")).toBeInTheDocument();
  });

  it("has data-stage and data-stage-number attributes on the container", () => {
    const { container } = render(<WizardQuestion {...environmentQuestionProps} />);
    const el = container.querySelector("[data-stage]");
    expect(el).toHaveAttribute("data-stage", "environment");
    expect(el).toHaveAttribute("data-stage-number", "1");
  });
});

describe("WizardQuestion — boolean options", () => {
  const selfHostProps: WizardQuestionProps<boolean> = {
    stage: "environment",
    stageNumber: 1,
    heading: "Will you self-host?",
    description: "Choose whether to self-host.",
    name: "selfHost",
    options: [
      { value: true, label: "Yes", description: "I will manage my own infrastructure." },
      { value: false, label: "No", description: "Use a fully managed service." },
    ],
    onChange: vi.fn(),
    onContinue: vi.fn(),
  };

  it("renders boolean options as radios", () => {
    render(<WizardQuestion {...selfHostProps} />);
    expect(screen.getByRole("radio", { name: /Yes/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /No/i })).toBeInTheDocument();
  });

  it("checks the radio matching a boolean value", () => {
    render(<WizardQuestion {...selfHostProps} value={true} />);
    expect(screen.getByRole("radio", { name: /Yes/i })).toBeChecked();
  });

  it("uses validationLabel in validation copy when provided", async () => {
    render(<WizardQuestion {...selfHostProps} validationLabel="hosting option" />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a hosting option");
  });

  it("transforms camelCase name so the raw field name never appears in validation copy", async () => {
    render(<WizardQuestion {...selfHostProps} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    const alert = screen.getByRole("alert");
    expect(alert.textContent).not.toContain("selfHost");
    expect(alert.textContent).toMatch(/self host/i);
  });
});
