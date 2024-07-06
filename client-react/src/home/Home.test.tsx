import { describe, it } from "vitest";
import Home from "./Home";
import { render } from "@testing-library/react";

describe("Home", () => {
  it("renders", () => {
    render(<Home />);
  });
});
