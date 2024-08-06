import { beforeEach, describe, expect, it } from "vitest";
import LobbyDialog, { LobbyDialogType } from "./LobbyDialog";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

describe("LobbyDialog", () => {
  describe("create lobby dialog", () => {
    const user = userEvent.setup();

    beforeEach(() => {
      render(
        <LobbyDialog
          onSubmit={() => null}
          dialogType={LobbyDialogType.CREATE}
        />
      );
    });

    it("renders create lobby dialog button", () => {
      expect(screen.getByText("Create Lobby")).toBeDefined();
    });

    it("renders create dialog", async () => {
      await user.click(screen.getByRole("button", { name: /Create Lobby/i }));
      expect(screen.queryByText("Enter Lobby ID:")).toBeNull();
      expect(screen.getByText("Username")).toBeDefined();
      expect(screen.getByText("Play")).toBeDefined();
      expect(screen.getByText("Cancel")).toBeDefined();
    });

    it("should not close with empty inputs", async () => {
      await user.click(screen.getByRole("button", { name: /Create Lobby/i }));

      await user.click(screen.getByRole("button", { name: /Play/i }));
      expect(screen.getByText("Play")).toBeDefined();
      expect(screen.getByText("Cancel")).toBeDefined();
    });

    it("should close on cancel", async () => {
      await user.click(screen.getByRole("button", { name: /Create Lobby/i }));

      await user.click(screen.getByRole("button", { name: /Cancel/i }));
      await waitForElementToBeRemoved(() => screen.getByText(/Cancel/i));
      expect(screen.queryByText(/Cancel/i)).toBeNull();
      expect(screen.queryByText(/Play/i)).toBeNull();
    });

    it("should close with required inputs", async () => {
      await user.click(screen.getByRole("button", { name: /Create Lobby/i }));

      const nameInput = await screen.findByText("Username");

      await user.type(nameInput, "name");
      expect(screen.getByText("Play")).toBeDefined();
      expect(screen.getByText("Cancel")).toBeDefined();

      await user.click(screen.getByRole("button", { name: /Cancel/i }));
      await waitForElementToBeRemoved(() => screen.getByText(/Cancel/i));
      expect(screen.queryByText(/Cancel/i)).toBeNull();
      expect(screen.queryByText(/Play/i)).toBeNull();
    });
  });

  describe("join lobby dialog", () => {
    const user = userEvent.setup();

    beforeEach(() => {
      render(
        <LobbyDialog onSubmit={() => null} dialogType={LobbyDialogType.JOIN} />
      );
    });

    it("renders join lobby dialog button", () => {
      expect(screen.getByText("Join Lobby")).toBeDefined();
    });

    it("renders join dialog", async () => {
      await user.click(screen.getByRole("button", { name: /Join Lobby/i }));
      expect(screen.getByText("Enter Lobby ID:")).toBeDefined();
      expect(screen.getByText("Username")).toBeDefined();
      expect(screen.getByText("Play")).toBeDefined();
      expect(screen.getByText("Cancel")).toBeDefined();
    });

    it("should not close with empty inputs", async () => {
      await user.click(screen.getByRole("button", { name: /Join Lobby/i }));

      await user.click(screen.getByRole("button", { name: /Play/i }));
      expect(screen.getByText("Play")).toBeDefined();
      expect(screen.getByText("Cancel")).toBeDefined();
    });

    it("should close on cancel", async () => {
      await user.click(screen.getByRole("button", { name: /Join Lobby/i }));

      await user.click(screen.getByRole("button", { name: /Cancel/i }));
      await waitForElementToBeRemoved(() => screen.getByText(/Cancel/i));
      expect(screen.queryByText(/Cancel/i)).toBeNull();
      expect(screen.queryByText(/Play/i)).toBeNull();
    });

    it("should close with required inputs", async () => {
      await user.click(screen.getByRole("button", { name: /Join Lobby/i }));

      const nameInput = await screen.findByText("Username");
      const lobbyInput = await screen.findByText("Enter Lobby ID:");

      await user.type(nameInput, "name");
      await user.type(lobbyInput, "lobby id");
      expect(screen.getByText("Play")).toBeDefined();
      expect(screen.getByText("Cancel")).toBeDefined();

      await user.click(screen.getByRole("button", { name: /Cancel/i }));
      await waitForElementToBeRemoved(() => screen.getByText(/Cancel/i));
      expect(screen.queryByText(/Cancel/i)).toBeNull();
      expect(screen.queryByText(/Play/i)).toBeNull();
    });
  });
});
