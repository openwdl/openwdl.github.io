import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ToastProvider, useToast } from "@openwdl/ui";

function Trigger() {
  const toast = useToast();
  return <button onClick={() => toast("Copied #4BD8FA")}>copy</button>;
}

describe("ToastProvider", () => {
  it("shows a toast message when triggered", async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await act(async () => {
      screen.getByText("copy").click();
    });
    expect(await screen.findByText("Copied #4BD8FA")).toBeInTheDocument();
  });
});
