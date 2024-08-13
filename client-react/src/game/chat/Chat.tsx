import { TextField } from "@mui/material";
import "./Chat.less";
import React, { ChangeEvent, useState } from "react";
import { Team, User } from "../../models/User.model";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

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
  const [chatOpen, setChatOpen] = useState(true);
  const [currentChatMessage, setCurrentChatMessage] = useState("");
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      sendMessage(`chat:${currentChatMessage}`);
      setCurrentChatMessage("");
    }
  };
  return (
    <React.Fragment>
      {chatOpen && (
        <div className="chat-box chat-open">
          <div className="header">
            <ChevronRightIcon onClick={() => setChatOpen(false)} />
          </div>
          <div className="chat-history">
            {chatMessages.map((msg: ChatMessage, idx: number) => {
              return (
                <div className="chat-message" key={idx}>
                  <p
                    className={`name ${
                      msg.team === Team.BLUE ? "blue" : "red"
                    } ${currentUser.id === msg.id ? "current" : ""} ${
                      poetId === msg.id ? "orange" : ""
                    }`}
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
            onChange={(
              e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => setCurrentChatMessage(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      )}
      {!chatOpen && (
        <div className="chat-box chat-closed">
          <div className="header">
            <ChevronLeftIcon onClick={() => setChatOpen(true)} />
          </div>
          <div className="chat-body"></div>
        </div>
      )}
    </React.Fragment>
  );
}
