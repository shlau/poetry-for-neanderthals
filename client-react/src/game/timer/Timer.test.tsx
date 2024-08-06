import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Timer from "./Timer";

describe("Timer", () => {
  it("should show time remaining", () => {
    render(<Timer duration={90000} />);
    expect(
      screen.getByText((_: string, element: Element | null) => {
        if (element && element.className === "timer") {
          const children = element.querySelectorAll("span");
          if (children.length >= 2) {
            const minutes = children[0].textContent;
            const seconds = children[1].textContent;
            return minutes === "1" && seconds === "30";
          }
        }
        return false;
      })
    ).toBeDefined();
  });

  it("should show time with padded 0", () => {
    render(<Timer duration={61000} />);
    expect(
      screen.getByText((_: string, element: Element | null) => {
        if (element && element.className === "timer") {
          const children = element.querySelectorAll("span");
          if (children.length >= 2) {
            const minutes = children[0].textContent;
            const seconds = children[1].textContent;
            return minutes === "1" && seconds === "01";
          }
        }
        return false;
      })
    ).toBeDefined();
  });
});
