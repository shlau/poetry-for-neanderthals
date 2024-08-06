import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "./Header";
import { Team, User } from "../../models/User.model";

describe("Header", () => {
  it("show poet text", () => {
    render(
      <Header
        poet={{ id: "poet-id", name: "poet name", team: Team.BLUE } as User}
        isPoet={true}
        currentUser={{ team: Team.BLUE } as User}
      />
    );

    expect(screen.getByText("YOU ARE THE POET")).toBeDefined();
  });

  it("show guesser text", () => {
    render(
      <Header
        poet={{ id: "poet-id", name: "poet name", team: Team.BLUE } as User}
        isPoet={false}
        currentUser={{ team: Team.BLUE } as User}
      />
    );

    expect(screen.getByText("poet name IS THE POET")).toBeDefined();
    expect(screen.getByText("YOU ARE GUESSING")).toBeDefined();
  });

  it("show bonker text", () => {
    render(
      <Header
        poet={{ id: "poet-id", name: "poet name", team: Team.BLUE } as User}
        isPoet={false}
        currentUser={{ team: Team.RED } as User}
      />
    );

    expect(screen.getByText("poet name IS THE POET")).toBeDefined();
    expect(screen.getByText("YOU ARE BONKING")).toBeDefined();
  });
});
