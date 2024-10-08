import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { Team, User } from "../models/User.model";
import { GameData, GameMessage, Word } from "../models/Game.model";
import Game from "../game/Game";
import Lobby from "../lobby/Lobby";
import { ChatMessage } from "../game/chat/Chat";

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
  chatMessages: ChatMessage[];
}

export interface LobbyProps {
  sendMessage: Function;
  users: User[];
  currentUser: User;
  gameData: GameData;
  numRounds: string;
}

export default function GameSession() {
  const [users, setUsers] = useState([] as User[]);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [redScore, setRedScore] = useState("0");
  const [blueScore, setBlueScore] = useState("0");
  const [poetId, setPoetId] = useState("");
  const [word, setWord] = useState<Word>({ easy: [], hard: [] });
  const [gameData, setGameData] = useState({} as GameData);
  const ref = useRef({ id: 0, endTime: Date.now() });
  const [duration, setDuration] = useState(ROUND_DURATION_MILLIS);
  const [roundInProgress, setRoundInProgress] = useState(false);
  const [bonkOpen, setBonkOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([] as ChatMessage[]);
  const [numRounds, setNumRounds] = useState("1");

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
      handleMessage(JSON.parse(lastMessage.data));
    }
  }, [lastMessage]);

  const endRound = () => {
    setWord({ easy: [], hard: [] });
    setRoundInProgress(false);
    clearInterval(ref.current.id);
    setDuration(0);
  };

  const handleMessage = (message: GameMessage) => {
    if (message.type && message.data) {
      switch (message.type) {
        case "numRounds":
          setNumRounds(message.data);
          break;
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
          const easyWords = message.data.easy
            .split(" ")
            .map((w: string) => ({ value: w, revealed: false }));
          const hardWords = message.data.hard
            .split(" ")
            .map((w: string) => ({ value: w, revealed: false }));
          setWord({ easy: easyWords, hard: hardWords });
          break;
        case "endGame":
          setGameData(message.data);
          setGameInProgress(false);
          endRound();
          break;
        case "chat":
          const chatMessage: ChatMessage = message.data;
          setChatMessages((prevMessages: ChatMessage[]) => [
            ...prevMessages,
            chatMessage,
          ]);
          break;
        default:
      }
    }
  };

  const handleEcho = (message: GameMessage) => {
    if (message.data.includes("reveal")) {
      const wordData = message.data.split("-");
      const wordType: "easy" | "hard" = wordData[1];
      const wordIdx = wordData[2];
      const wordCopy: Word = { ...word };
      wordCopy[wordType][wordIdx].revealed = true;
      setWord(wordCopy);
    } else {
      switch (message.data) {
        case "startGame":
          setRedScore("0");
          setBlueScore("0");
          setGameInProgress(true);
          break;
        case "endRound":
          endRound();
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
      chatMessages={chatMessages}
    />
  ) : (
    <Lobby
      sendMessage={sendMessage}
      users={users}
      currentUser={currentUser}
      gameData={gameData}
      numRounds={numRounds}
    />
  );
}
