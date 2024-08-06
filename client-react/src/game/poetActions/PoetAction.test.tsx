import { vi, describe, it, expect } from "vitest";
import { User, Team } from "../../models/User.model";
import { render, screen } from "@testing-library/react";
import PoetActions from "./PoetActions";

const currentUser = { id: "1", name: "user 1", team: Team.UNASSIGNED } as User;
const sendMessageSpy = vi.fn();
const setRoundPausedSpy = vi.fn();

describe("start round button", () => {
  it("should be not be disabled", () => {
    render(
      <PoetActions
        sendMessage={sendMessageSpy}
        roundInProgress={false}
        roundPaused={false}
        duration={0}
        setRoundPaused={setRoundPausedSpy}
        currentUser={currentUser}
      />
    );
    expect(
      screen.getByText("Start Round").closest("button")
    ).not.toHaveAttribute("disabled");
  });

  it("should be disabled", () => {
    render(
      <PoetActions
        sendMessage={sendMessageSpy}
        roundInProgress={true}
        roundPaused={false}
        duration={0}
        setRoundPaused={setRoundPausedSpy}
        currentUser={currentUser}
      />
    );
    expect(screen.getByText("Start Round").closest("button")).toHaveAttribute(
      "disabled"
    );
  });
});

describe("pause/resume button", () => {
  it("pause button should be not be disabled", () => {
    render(
      <PoetActions
        sendMessage={sendMessageSpy}
        roundInProgress={true}
        roundPaused={false}
        duration={0}
        setRoundPaused={setRoundPausedSpy}
        currentUser={currentUser}
      />
    );
    expect(screen.getByText("Pause").closest("button")).not.toHaveAttribute(
      "disabled"
    );
  });

  it("pause button should be disabled", () => {
    render(
      <PoetActions
        sendMessage={sendMessageSpy}
        roundInProgress={false}
        roundPaused={false}
        duration={0}
        setRoundPaused={setRoundPausedSpy}
        currentUser={currentUser}
      />
    );
    expect(screen.getByText("Pause").closest("button")).toHaveAttribute(
      "disabled"
    );
  });

  it("resume button should be not be disabled", () => {
    render(
      <PoetActions
        sendMessage={sendMessageSpy}
        roundInProgress={true}
        roundPaused={true}
        duration={0}
        setRoundPaused={setRoundPausedSpy}
        currentUser={currentUser}
      />
    );
    expect(screen.getByText("Resume").closest("button")).not.toHaveAttribute(
      "disabled"
    );
  });

  it("resume button should be disabled", () => {
    render(
      <PoetActions
        sendMessage={sendMessageSpy}
        roundInProgress={false}
        roundPaused={true}
        duration={0}
        setRoundPaused={setRoundPausedSpy}
        currentUser={currentUser}
      />
    );
    expect(screen.getByText("Resume").closest("button")).toHaveAttribute(
      "disabled"
    );
  });
});

describe("skip button", () => {
  it("should show skip button", () => {
    render(
      <PoetActions
        sendMessage={sendMessageSpy}
        roundInProgress={true}
        roundPaused={true}
        duration={0}
        setRoundPaused={setRoundPausedSpy}
        currentUser={currentUser}
      />
    );
    expect(screen.getByText("SKIP").closest("button")).toBeDefined();
  });

  it("should not show skip button", () => {
    render(
      <PoetActions
        sendMessage={sendMessageSpy}
        roundInProgress={false}
        roundPaused={true}
        duration={0}
        setRoundPaused={setRoundPausedSpy}
        currentUser={currentUser}
      />
    );
    expect(screen.queryByText("SKIP")).toBeNull();
  });
});
