import { vi, describe, it, expect } from "vitest";
import { User, Team } from "../../models/User.model";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

const currentUser = { id: "1", name: "user 1", team: Team.UNASSIGNED } as User;
const users: User[] = [currentUser, { id: "2", name: "user 2" } as User];
const sendMessageSpy = vi.fn();

describe("start button", () => {
  it("should be disabled if no users are ready", () => {
    render(
      <Footer
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
      <Footer
        sendMessage={sendMessageSpy}
        users={[
          { id: "1", name: "user 1", ready: true, team: Team.BLUE } as User,
          { id: "2", name: "user 2", ready: true, team: Team.RED } as User,
        ]}
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
      <Footer
        sendMessage={sendMessageSpy}
        users={[]}
        currentUser={currentUser}
      />
    );
    expect(screen.getByText("Ready").closest("button")).toHaveAttribute(
      "disabled"
    );
  });

  it("should not be disabled if on a team", () => {
    render(
      <Footer
        sendMessage={sendMessageSpy}
        users={[]}
        currentUser={{ id: "1", name: "user 1", team: Team.BLUE } as User}
      />
    );
    expect(screen.getByText("Ready").closest("button")).not.toHaveAttribute(
      "disabled"
    );
  });
});
