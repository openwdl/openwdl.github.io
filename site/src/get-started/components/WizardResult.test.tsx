import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WizardResult } from "./WizardResult";
import { buildSetupIssueUrl } from "../model/issue";
import type { SetupState } from "../model/types";

const unsupportedScreen = {
  kind: "unsupported" as const,
  stage: "engine" as const,
  reason: "Only Slurm and LSF schedulers are currently supported.",
};

const recommendationScreen = {
  kind: "recommendation" as const,
  stage: "engine" as const,
  engine: "sprocket" as const,
};

const recommendationWithServiceScreen = {
  kind: "recommendation" as const,
  stage: "engine" as const,
  engine: "cromwell" as const,
  service: "terra" as const,
};

// ── Unsupported screen ────────────────────────────────────────────────────────

describe("WizardResult — unsupported", () => {
  const state: SetupState = { environment: "hpc", scheduler: "other" };
  const acceptedAnswers = [
    { label: "Environment", value: "hpc" },
    { label: "Scheduler", value: "other" },
  ];

  it("shows the exact unsupported headline", () => {
    render(
      <WizardResult
        screen={unsupportedScreen}
        state={state}
        acceptedAnswers={acceptedAnswers}
        onBack={vi.fn()}
      />,
    );
    expect(
      screen.getByText("We don't have a supported setup for this yet."),
    ).toBeInTheDocument();
  });

  it("shows each accepted answer", () => {
    render(
      <WizardResult
        screen={unsupportedScreen}
        state={state}
        acceptedAnswers={acceptedAnswers}
        onBack={vi.fn()}
      />,
    );
    expect(screen.getByText(/hpc/i)).toBeInTheDocument();
    expect(screen.getByText(/other/i)).toBeInTheDocument();
  });

  it("shows the Change answers button that calls onBack", async () => {
    const onBack = vi.fn();
    render(
      <WizardResult
        screen={unsupportedScreen}
        state={state}
        acceptedAnswers={acceptedAnswers}
        onBack={onBack}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Change answers/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("shows an external 'File a setup request' anchor with the correct issue URL", () => {
    render(
      <WizardResult
        screen={unsupportedScreen}
        state={state}
        acceptedAnswers={acceptedAnswers}
        onBack={vi.fn()}
      />,
    );
    const link = screen.getByRole("link", { name: /File a setup request/i });
    expect(link).toHaveAttribute("href", buildSetupIssueUrl(state));
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("issue URL encodes all accepted state fields", () => {
    const fullState: SetupState = {
      environment: "cloud",
      service: "other",
      selfHost: false,
    };
    render(
      <WizardResult
        screen={{ kind: "unsupported", stage: "engine", reason: "Not supported." }}
        state={fullState}
        acceptedAnswers={[{ label: "Environment", value: "cloud" }]}
        onBack={vi.fn()}
      />,
    );
    const link = screen.getByRole("link", { name: /File a setup request/i });
    const expected = buildSetupIssueUrl(fullState);
    expect(link).toHaveAttribute("href", expected);
    expect(expected).toContain("cloud");
  });
});

// ── Recommendation screen ─────────────────────────────────────────────────────

describe("WizardResult — recommendation", () => {
  const defaultRecommendationProps = {
    screen: recommendationScreen,
    engineLabel: "Sprocket",
    rationale: "Sprocket is the recommended local WDL engine.",
    prerequisites: ["Homebrew (https://brew.sh)"],
    engineUrl: "https://github.com/stjude-rust-labs/sprocket",
    onContinue: vi.fn(),
    onBack: vi.fn(),
  };

  it("shows the engine label as an h2 heading", () => {
    render(<WizardResult {...defaultRecommendationProps} />);
    expect(screen.getByRole("heading", { level: 2, name: "Sprocket" })).toBeInTheDocument();
  });

  it("shows the engine label", () => {
    render(<WizardResult {...defaultRecommendationProps} />);
    // Exact match avoids false positives from the rationale paragraph.
    expect(screen.getByText("Sprocket")).toBeInTheDocument();
  });

  it("shows the rationale", () => {
    render(<WizardResult {...defaultRecommendationProps} />);
    expect(
      screen.getByText("Sprocket is the recommended local WDL engine."),
    ).toBeInTheDocument();
  });

  it("shows prerequisites", () => {
    render(<WizardResult {...defaultRecommendationProps} />);
    expect(screen.getByText(/Homebrew/)).toBeInTheDocument();
  });

  it("links to the engine upstream URL", () => {
    render(<WizardResult {...defaultRecommendationProps} />);
    const link = screen.getByRole("link", { name: /engine/i });
    expect(link).toHaveAttribute("href", "https://github.com/stjude-rust-labs/sprocket");
  });

  it("shows a Continue button that calls onContinue", async () => {
    const onContinue = vi.fn();
    render(<WizardResult {...defaultRecommendationProps} onContinue={onContinue} />);
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("shows a Back button that calls onBack", async () => {
    const onBack = vi.fn();
    render(<WizardResult {...defaultRecommendationProps} onBack={onBack} />);
    await userEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("shows the service label when a service is present", () => {
    render(
      <WizardResult
        screen={recommendationWithServiceScreen}
        engineLabel="Cromwell"
        serviceLabel="Terra"
        rationale="Use Cromwell via Terra for cloud execution."
        prerequisites={[]}
        engineUrl="https://cromwell.readthedocs.io/"
        serviceUrl="https://terra.bio/"
        onContinue={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    // Exact match on the service label element, not the rationale prose.
    expect(screen.getByText("Terra")).toBeInTheDocument();
  });

  it("links to the service URL when a service is present", () => {
    render(
      <WizardResult
        screen={recommendationWithServiceScreen}
        engineLabel="Cromwell"
        serviceLabel="Terra"
        rationale="Use Cromwell via Terra for cloud execution."
        prerequisites={[]}
        engineUrl="https://cromwell.readthedocs.io/"
        serviceUrl="https://terra.bio/"
        onContinue={vi.fn()}
        onBack={vi.fn()}
      />,
    );
    const link = screen.getByRole("link", { name: /service/i });
    expect(link).toHaveAttribute("href", "https://terra.bio/");
  });

  it("does not show a service section when no service is present", () => {
    render(<WizardResult {...defaultRecommendationProps} />);
    expect(screen.queryByRole("link", { name: /service/i })).not.toBeInTheDocument();
  });
});
