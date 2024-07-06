import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import InstructionDialog from "./InstructionDialog";

describe("InstructionDialog", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(<InstructionDialog />);
  });

  it("renders how to play button", () => {
    expect(screen.getByText("How to Play")).toBeDefined();
  });

  it("renders instruction dialog", async () => {
    await user.click(screen.getByRole("button", { name: /How to Play/i }));
    expect(
      screen.getByTitle("Poetry for Neanderthals - How to Play")
    ).toBeDefined();
  });
});
