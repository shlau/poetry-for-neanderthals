import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { User } from "../models/User.model";
import { GameMessage } from "../models/GameMessage.model";
import Game from "../game/Game";
import Lobby from "../lobby/Lobby";

export interface GameSessionProps {
  sendMessage: Function;
  users: User[];
  currentUser: User;
}

export default function GameSession() {
  const location = useLocation();
  const currentUser: User = location.state;
  const socketUrl = `/channel/${currentUser.gameId}/ws?userId=${currentUser.id}&gameId=${currentUser.gameId}&name=${currentUser.name}`;
  const { sendMessage, lastMessage } = useWebSocket(socketUrl);
  const [users, setUsers] = useState([]);
  const [gameInProgress, setGameInProgress] = useState(false);

  useEffect(() => {
    if (lastMessage !== null) {
      console.log(JSON.parse(lastMessage.data));
      handleMessage(JSON.parse(lastMessage.data));
    }
  }, [lastMessage]);

  const handleMessage = (message: GameMessage) => {
    if (message.type && message.data) {
      switch (message.type) {
        case "users":
          setUsers(message.data);
          break;
        case "echo":
          handleEcho(message);
          break;
        default:
      }
    }
  };

  const handleEcho = (message: GameMessage) => {
    switch (message.data) {
      case "start":
        setGameInProgress(true);
        break;
      default:
    }
  };

  return gameInProgress ? (
    <Game sendMessage={sendMessage} users={users} currentUser={currentUser} />
  ) : (
    <Lobby sendMessage={sendMessage} users={users} currentUser={currentUser} />
  );
}
