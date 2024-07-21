import { GameSessionProps } from "../gameSession/GameSession";
import { GameMessage } from "../models/GameMessage.model";
import { User } from "../models/User.model";
import "./Game.less";

export default function Game({
  sendMessage,
  users,
  currentUser,
}: GameSessionProps) {
  return <div>{currentUser.gameId}</div>;
}
