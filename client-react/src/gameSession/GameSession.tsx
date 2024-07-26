import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { Team, User } from "../models/User.model";
import { GameMessage } from "../models/GameMessage.model";
import Game from "../game/Game";
import Lobby from "../lobby/Lobby";

const ROUND_DURATION_MILLIS = 90000;
export interface GameProps {
  sendMessage: Function;
  users: User[];
  currentUser: User;
  redScore: string;
  blueScore: string;
  roundInProgress: boolean;
  duration: number;
}

export interface LobbyProps {
  sendMessage: Function;
  users: User[];
  currentUser: User;
}

export default function GameSession() {
  const [users, setUsers] = useState([] as User[]);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [redScore, setRedScore] = useState("0");
  const [blueScore, setBlueScore] = useState("0");
  const [poetId, setPoetId] = useState("");

  const ref = useRef({ id: 0, endTime: Date.now() });
  const [duration, setDuration] = useState(ROUND_DURATION_MILLIS);
  const [roundInProgress, setRoundInProgress] = useState(false);

  const location = useLocation();
  const currentUserData: User = location.state;
  const currentUser: User =
    users.find((user: User) => user.id === currentUserData.id) ??
    currentUserData;
  const poet: User | undefined = users.find((user: User) => user.id === poetId);
  const socketUrl = `/channel/${currentUser.gameId}/ws?userId=${currentUser.id}&gameId=${currentUser.gameId}&name=${currentUser.name}`;
  const { sendMessage, lastMessage } = useWebSocket(socketUrl);

  const startTimer = (): void => {
    ref.current.id = setInterval(() => {
      const newDuration = ref.current.endTime - Date.now();
      setDuration(newDuration);
      if (newDuration <= 0) {
        clearInterval(ref.current.id);
        if (currentUser.id === poet?.id) {
          sendMessage(`echo:endRound`);
        }
      }
    }, 1000);
    setRoundInProgress(true);
  };

  const pauseRoundTime = (): void => {
    clearInterval(ref.current.id);
  };

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
        case "resumeRound":
          const newDuration = message.data;
          ref.current.endTime = Date.now() + newDuration;
          setDuration(newDuration);
          startTimer();
          break;
        default:
      }
    }
  };

  const handleEcho = (message: GameMessage) => {
    switch (message.data) {
      case "startGame":
        setGameInProgress(true);
        break;
      case "startRound":
        ref.current.endTime = Date.now() + ROUND_DURATION_MILLIS;
        startTimer();
        break;
      case "pauseRound":
        pauseRoundTime();
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
      roundInProgress={roundInProgress}
      duration={duration}
    />
  ) : (
    <Lobby sendMessage={sendMessage} users={users} currentUser={currentUser} />
  );
}
