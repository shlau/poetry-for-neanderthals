import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Lobby from "./Lobby";
import { Team, User } from "../models/User.model";
import "@testing-library/jest-dom";

describe("Lobby", () => {
  const currentUser = { id: "1", name: "user 1" } as User;
  const users: User[] = [currentUser, { id: "2", name: "user 2" } as User];
  const sendMessageSpy = vi.fn();

  describe("start button", () => {
    it("should be disabled if no users are ready", () => {
      render(
        <Lobby
          sendMessage={sendMessageSpy}
          users={users}
          currentUser={currentUser}
        />
      );
      expect(screen.getByText("Start game").closest("button")).toHaveAttribute(
        "disabled"
      );
    });

    it("should not be disabled if all users are ready", () => {
      render(
        <Lobby
          sendMessage={sendMessageSpy}
          users={[{ id: "1", name: "user 1", ready: true } as User]}
          currentUser={currentUser}
        />
      );
      expect(
        screen.getByText("Start game").closest("button")
      ).not.toHaveAttribute("disabled");
    });
  });

  describe("ready button", () => {
    it("should be disabled if not on a team", () => {
      render(
        <Lobby
          sendMessage={sendMessageSpy}
          users={[{ id: "1", name: "user 1", team: Team.UNASSIGNED } as User]}
          currentUser={currentUser}
        />
      );
      expect(screen.getByText("Ready").closest("button")).toHaveAttribute(
        "disabled"
      );
    });

    it("should not be disabled if on a team", () => {
      render(
        <Lobby
          sendMessage={sendMessageSpy}
          users={[{ id: "1", name: "user 1", team: Team.BLUE } as User]}
          currentUser={currentUser}
        />
      );
      expect(screen.getByText("Ready").closest("button")).not.toHaveAttribute(
        "disabled"
      );
    });
  });

  describe("check mark", () => {
    it("should be visible if on a team and ready", () => {
      render(
        <Lobby
          sendMessage={sendMessageSpy}
          users={[
            { id: "1", name: "user 1", team: Team.BLUE, ready: true } as User,
          ]}
          currentUser={currentUser}
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
        />
      );

      expect(screen.queryByTestId("CheckIcon")).toBeNull();
    });
  });
});
