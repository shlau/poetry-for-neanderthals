import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import "./Lobby.less";
import { useLocation } from "react-router-dom";
import { User } from "../models/User.model";

export default function Lobby() {
  const location = useLocation();
  const currentUser: User = location.state;
  const socketUrl = `/channel/${currentUser.gameId}/ws?userId=${currentUser.id}&gameId=${currentUser.gameId}&name=${currentUser.name}`;
  const [messageHistory, setMessageHistory] = useState<MessageEvent<any>[]>([]);
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);
  const [ready, setReady] = useState(false);

  const onReadyPress = () => {
    sendMessage(`users:${currentUser.id}:ready:${!ready}`);
    setReady((prevState) => !prevState);
  };

  useEffect(() => {
    console.log(lastMessage);
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage]);

  return (
    <div className="lobby">
      <div className="staging-area">
        <div className="staging-container">
          <h1>Lobby - {currentUser.gameId}</h1>
          <div className="users-container">{currentUser.name}</div>
          <button
            className="ready-button hover"
            color="basic"
            onClick={onReadyPress}
          ></button>
        </div>
      </div>
    </div>
  );
}
