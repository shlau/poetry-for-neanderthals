import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WordCard from "./WordCard";
import { Team, User } from "../../models/User.model";

describe("WordCard", () => {
  it("should not show card if round not in progress", () => {
    render(
      <WordCard
        isPoet={true}
        currentUser={{ team: Team.BLUE } as User}
        poet={{ team: Team.BLUE } as User}
        roundInProgress={false}
        word={{ easy: "easy word", hard: "hard word" }}
      />
    );
    expect(screen.getByTestId("card-container").classList).toContain(
      "hide-card"
    );
  });

  it("should not show card if guessing", () => {
    render(
      <WordCard
        isPoet={false}
        currentUser={{ team: Team.BLUE } as User}
        poet={{ team: Team.BLUE } as User}
        roundInProgress={true}
        word={{ easy: "easy word", hard: "hard word" }}
      />
    );
    expect(screen.getByTestId("card-container").classList).toContain(
      "hide-card"
    );
  });

  it("should show card if bonking", () => {
    render(
      <WordCard
        isPoet={false}
        currentUser={{ team: Team.RED } as User}
        poet={{ team: Team.BLUE } as User}
        roundInProgress={true}
        word={{ easy: "easy word", hard: "hard word" }}
      />
    );
    expect(screen.getByTestId("card-container").classList).not.toContain(
      "hide-card"
    );
  });

  it("should show card if current user is poet", () => {
    render(
      <WordCard
        isPoet={true}
        currentUser={{ team: Team.RED } as User}
        poet={{ team: Team.BLUE } as User}
        roundInProgress={true}
        word={{ easy: "easy word", hard: "hard word" }}
      />
    );
    expect(screen.getByTestId("card-container").classList).not.toContain(
      "hide-card"
    );
  });
});
