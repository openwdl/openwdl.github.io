import { describe, it, expect, vi, beforeEach } from "vitest";
import { copyText } from "./clipboard";

describe("copyText", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("writes the given text to the clipboard", async () => {
    await copyText("#4BD8FA");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("#4BD8FA");
  });
});
