import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Chat, { ChatMessage } from "./Chat";
import { Team, User } from "../../models/User.model";

describe("chat", () => {
  it("uses orange class for poet", () => {
    render(
      <Chat
        sendMessage={() => null}
        chatMessages={[
          {
            text: "test text",
            name: "test name",
            team: Team.BLUE,
            id: "poet-id",
          } as ChatMessage,
        ]}
        currentUser={{} as User}
        poetId={"poet-id"}
      />
    );

    expect(screen.getByText("test name:").closest("p")?.classList).toContain(
      "orange"
    );
  });

  it("uses blue class for message from blue user", () => {
    render(
      <Chat
        sendMessage={() => null}
        chatMessages={[
          {
            text: "test text",
            name: "test name",
            team: Team.BLUE,
            id: "blue-id",
          } as ChatMessage,
        ]}
        currentUser={{} as User}
        poetId={"poet-id"}
      />
    );

    expect(screen.getByText("test name:").closest("p")?.classList).toContain(
      "blue"
    );
  });

  it("uses red class for message from red user", () => {
    render(
      <Chat
        sendMessage={() => null}
        chatMessages={[
          {
            text: "test text",
            name: "test name",
            team: Team.RED,
            id: "red-id",
          } as ChatMessage,
        ]}
        currentUser={{} as User}
        poetId={"poet-id"}
      />
    );

    expect(screen.getByText("test name:").closest("p")?.classList).toContain(
      "red"
    );
  });

  it("uses current class for message from current user", () => {
    render(
      <Chat
        sendMessage={() => null}
        chatMessages={[
          {
            text: "test text",
            name: "test name",
            team: Team.BLUE,
            id: "current-id",
          } as ChatMessage,
        ]}
        currentUser={{id: "current-id"} as User}
        poetId={"poet-id"}
      />
    );

    expect(screen.getByText("test name:").closest("p")?.classList).toContain(
      "current"
    );
  });
});
