import { render, screen } from "@testing-library/react";
import { act } from "react";
import type { DocHeading } from "../../scripts/docs/types";
import { DocsToc } from "./DocsToc";

it("formats heading code literals in the page outline", () => {
  const headings = [
    {
      depth: 2 as const,
      id: "new-taskmax_retries-variable",
      text: "New task.max_retries variable",
      parts: [
        { type: "text", value: "New " },
        { type: "code", value: "task.max_retries" },
        { type: "text", value: " variable" },
      ],
    },
  ] satisfies DocHeading[];

  render(<DocsToc headings={headings} />);

  expect(screen.getByText("task.max_retries").tagName).toBe("CODE");
  expect(
    screen.getByRole("link", { name: "New task.max_retries variable" }),
  ).toHaveAttribute("href", "#new-taskmax_retries-variable");
});

it("highlights the heading currently passing through the reading position", () => {
  let notify: IntersectionObserverCallback = () => undefined;
  const observe = vi.fn();
  const disconnect = vi.fn();
  class MockIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      notify = callback;
    }

    observe = observe;
    disconnect = disconnect;
    unobserve = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

  const headings = [
    { depth: 2 as const, id: "inputs", text: "Inputs" },
    { depth: 2 as const, id: "outputs", text: "Outputs" },
  ] satisfies DocHeading[];

  const { container } = render(
    <>
      <article>
        <h2 id="inputs">Inputs</h2>
        <h2 id="outputs">Outputs</h2>
      </article>
      <DocsToc headings={headings} />
    </>,
  );
  const inputs = container.querySelector<HTMLElement>("#inputs")!;
  const outputs = container.querySelector<HTMLElement>("#outputs")!;
  vi.spyOn(inputs, "getBoundingClientRect").mockReturnValue({
    top: -200,
  } as DOMRect);
  vi.spyOn(outputs, "getBoundingClientRect").mockReturnValue({
    top: -1,
  } as DOMRect);

  expect(screen.getByRole("link", { name: "Inputs" })).toHaveAttribute(
    "aria-current",
    "location",
  );
  expect(observe).toHaveBeenCalledTimes(2);

  act(() => {
    notify([], {} as IntersectionObserver);
  });

  expect(screen.getByRole("link", { name: "Outputs" })).toHaveAttribute(
    "aria-current",
    "location",
  );
  expect(screen.getByRole("link", { name: "Inputs" })).not.toHaveAttribute(
    "aria-current",
  );

  vi.unstubAllGlobals();
});
