import { TextField } from "@mui/material";
import "./Chat.less";
import { ChangeEvent, useState } from "react";
import { Team, User } from "../models/User.model";

export interface ChatMessage {
  text: string;
  id: string;
  name: string;
  team: Team;
}
interface ChatProps {
  sendMessage: Function;
  chatMessages: ChatMessage[];
  currentUser: User;
  poetId?: string;
}
export default function Chat({
  sendMessage,
  chatMessages,
  currentUser,
  poetId,
}: ChatProps) {
  const [currentChatMessage, setCurrentChatMessage] = useState("");
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      sendMessage(`chat:${currentChatMessage}`);
      setCurrentChatMessage("");
    }
  };
  return (
    <div className="chat-box">
      <div className="chat-history">
        {chatMessages.map((msg: ChatMessage, idx: number) => {
          return (
            <div className="chat-message" key={idx}>
              <p
                className={`name ${msg.team === Team.BLUE ? "blue" : "red"} ${
                  currentUser.id === msg.id ? "current" : ""
                } ${poetId === msg.id ? "orange" : ""}`}
              >
                {msg.name}:
              </p>
              <p className="text">{msg.text}</p>
            </div>
          );
        })}
      </div>
      <TextField
        className="chat-input"
        id="outlined-basic"
        label="Message"
        variant="outlined"
        value={currentChatMessage}
        onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          setCurrentChatMessage(e.currentTarget.value)
        }
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
