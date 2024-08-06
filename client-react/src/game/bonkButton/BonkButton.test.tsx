import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BonkButton from "./BonkButton";

describe("bonk button", () => {
  it("should be not be disabled if not poet", () => {
    render(<BonkButton sendMessage={() => null} isPoet={false} />);
    expect(screen.getByText("Bonk!").closest("button")).not.toHaveAttribute(
      "disabled"
    );
  });
});
