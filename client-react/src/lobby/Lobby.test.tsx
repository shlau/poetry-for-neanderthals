import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Lobby from "./Lobby";
import { Team, User } from "../models/User.model";
import "@testing-library/jest-dom";

describe("Lobby", () => {
  const currentUser = { id: "1", name: "user 1" } as User;
  const sendMessageSpy = vi.fn();

  describe("check mark", () => {
    it("should be visible if on a team and ready", () => {
      render(
        <Lobby
          sendMessage={sendMessageSpy}
          users={[
            { id: "1", name: "user 1", team: Team.BLUE, ready: true } as User,
          ]}
          currentUser={currentUser}
          gameData={{ redScore: 0, blueScore: 0 }}
          numRounds={"1"}
        />
      );

      expect(screen.getAllByTestId("CheckIcon")).toBeDefined();
    });

    it("should not be visible if on a team and not ready", () => {
      render(
        <Lobby
          sendMessage={sendMessageSpy}
          users={[
            { id: "1", name: "user 1", team: Team.BLUE, ready: false } as User,
          ]}
          currentUser={currentUser}
          gameData={{ redScore: 0, blueScore: 0 }}
          numRounds={"1"}
        />
      );

      expect(screen.queryByTestId("CheckIcon")).toBeNull();
    });
  });
});
