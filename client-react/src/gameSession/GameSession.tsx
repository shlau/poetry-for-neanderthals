import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { Team, User } from "../models/User.model";
import { GameData, GameMessage, Word } from "../models/Game.model";
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
  poet: User | undefined;
  word: Word;
  bonkOpen: boolean;
  hideBonk: (event: React.SyntheticEvent | Event, reason?: string) => void;
}

export interface LobbyProps {
  sendMessage: Function;
  users: User[];
  currentUser: User;
  gameData: GameData;
}

export default function GameSession() {
  const [users, setUsers] = useState([] as User[]);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [redScore, setRedScore] = useState("0");
  const [blueScore, setBlueScore] = useState("0");
  const [poetId, setPoetId] = useState("");
  const [word, setWord] = useState({ easy: "", hard: "" });
  const [gameData, setGameData] = useState({} as GameData);
  const ref = useRef({ id: 0, endTime: Date.now() });
  const [duration, setDuration] = useState(ROUND_DURATION_MILLIS);
  const [roundInProgress, setRoundInProgress] = useState(false);
  const [bonkOpen, setBonkOpen] = useState(false);

  const location = useLocation();
  const currentUserData: User = location.state;

  const currentUser: User =
    users.find((user: User) => user.id === currentUserData.id) ??
    currentUserData;

  if (!currentUser?.gameId) {
    return <div>Unauthorized</div>;
  }

  const poet: User | undefined = users.find((user: User) => user.id === poetId);
  const socketUrl = `/channel/${currentUser.gameId}/ws?userId=${currentUser.id}&gameId=${currentUser.gameId}&name=${currentUser.name}`;
  const { sendMessage, lastMessage } = useWebSocket(socketUrl);

  const startTimer = (): void => {
    ref.current.id = setInterval(() => {
      const newDuration = ref.current.endTime - Date.now();
      setDuration(newDuration);
      if (newDuration <= 0) {
        clearInterval(ref.current.id);
        setRoundInProgress(false);
        if (currentUser.id === poet?.id) {
          sendMessage(`endRound:${poet.team}`);
        }
      }
    }, 1000);
    setRoundInProgress(true);
  };

  const pauseRoundTime = (): void => {
    clearInterval(ref.current.id);
  };

  const hideBonk = () => {
    setBonkOpen(false);
  };

  useEffect(() => {
    window.history.replaceState({}, "");
  }, []);

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
        case "poetChange":
          setPoetId(message.data);
          break;
        case "wordUpdate":
          setWord(message.data);
          break;
        case "endGame":
          setGameData(message.data);
          setGameInProgress(false);
          break;
        default:
      }
    }
  };

  const handleEcho = (message: GameMessage) => {
    switch (message.data) {
      case "startGame":
        setRedScore("0");
        setBlueScore("0");
        setGameInProgress(true);
        break;
      case "endRound":
        setDuration(0);
        break;
      case "startRound":
        ref.current.endTime = Date.now() + ROUND_DURATION_MILLIS;
        setDuration(ROUND_DURATION_MILLIS);
        startTimer();
        break;
      case "pauseRound":
        pauseRoundTime();
        break;
      case "bonk":
        setBonkOpen(true);
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
      poet={poet}
      word={word}
      bonkOpen={bonkOpen}
      hideBonk={hideBonk}
    />
  ) : (
    <Lobby
      sendMessage={sendMessage}
      users={users}
      currentUser={currentUser}
      gameData={gameData}
    />
  );
}
