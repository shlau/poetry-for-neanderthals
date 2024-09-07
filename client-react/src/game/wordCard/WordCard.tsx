import { Word } from "../../models/Game.model";
import { User } from "../../models/User.model";

interface WordCardProps {
  isPoet: boolean;
  currentUser: User;
  poet: User | undefined;
  roundInProgress: boolean;
  word: Word;
  sendMessage: Function;
}
export default function WordCard({
  isPoet,
  currentUser,
  poet,
  roundInProgress,
  word,
  sendMessage,
}: WordCardProps) {
  const easyWords = word.easy.map((w, idx: number) => (
    <span
      key={idx}
      className={`word-text easy-word-text ${w.revealed ? "revealed" : ""} ${
        !roundInProgress || (!isPoet && currentUser?.team === poet?.team)
          ? "hide-card"
          : ""
      }`}
      onClick={() => {
        if (isPoet) {
          sendMessage(`echo:reveal-easy-${idx}`);
        }
      }}
    >
      {w.value}
    </span>
  ));
  const hardWords = word.hard.map((w, idx: number) => (
    <span
      key={idx}
      className={`word-text hard-word-text ${w.revealed ? "revealed" : ""} ${
        !roundInProgress || (!isPoet && currentUser?.team === poet?.team)
          ? "hide-card"
          : ""
      }`}
      onClick={() => {
        if (isPoet) {
          sendMessage(`echo:reveal-hard-${idx}`);
        }
      }}
    >
      {w.value}
    </span>
  ));
  return (
    <div data-testid="card-container" className={`word-card `}>
      <div className="word-container easy-word-container">
        <div className="word-wrapper easy-word-wrapper">
          <div className="word-value">
            <span>1</span>
          </div>
          <div className="words">{easyWords}</div>
        </div>
      </div>
      <div className="word-container hard-word-container">
        <div className="word-wrapper hard-word-wrapper">
          <div className="words">{hardWords}</div>
          <div className="word-value">
            <span>3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
