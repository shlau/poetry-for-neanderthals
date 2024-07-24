import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { Team, User } from "../models/User.model";
import { GameMessage } from "../models/GameMessage.model";
import Game from "../game/Game";
import Lobby from "../lobby/Lobby";

export interface GameProps {
  sendMessage: Function;
  users: User[];
  currentUser: User;
  redScore: string;
  blueScore: string;
}

export interface LobbyProps {
  sendMessage: Function;
  users: User[];
  currentUser: User;
}

export default function GameSession() {
  const [users, setUsers] = useState([]);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [redScore, setRedScore] = useState("0");
  const [blueScore, setBlueScore] = useState("0");

  const location = useLocation();
  const currentUserData: User = location.state;
  const currentUser: User =
    users.find((user: User) => user.id === currentUserData.id) ?? currentUserData;
  const socketUrl = `/channel/${currentUser.gameId}/ws?userId=${currentUser.id}&gameId=${currentUser.gameId}&name=${currentUser.name}`;
  const { sendMessage, lastMessage } = useWebSocket(socketUrl);

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
        case "score":
          const [team, score] = message.data.split(":");
          if (team === Team.BLUE) {
            setBlueScore(score);
          } else {
            setRedScore(score);
          }
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
    <Game
      sendMessage={sendMessage}
      users={users}
      currentUser={currentUser}
      redScore={redScore}
      blueScore={blueScore}
    />
  ) : (
    <Lobby sendMessage={sendMessage} users={users} currentUser={currentUser} />
  );
}
