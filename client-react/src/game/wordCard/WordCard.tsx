import { Word } from "../../models/Game.model";
import { User } from "../../models/User.model";

interface WordCardProps {
  isPoet: boolean;
  currentUser: User;
  poet: User | undefined;
  roundInProgress: boolean;
  word: Word;
}
export default function WordCard({
  isPoet,
  currentUser,
  poet,
  roundInProgress,
  word,
}: WordCardProps) {
  return (
    <div
      className={`word-card ${
        !roundInProgress || (!isPoet && currentUser?.team === poet?.team)
          ? "hide-card"
          : ""
      }`}
    >
      <div className="word-container easy-word-container">
        <div className="word-wrapper easy-word-wrapper">
          <div className="word-value">
            <span>1</span>
          </div>
          <span className="word-text easy-word-text">{word.easy}</span>
        </div>
      </div>
      <div className="word-container hard-word-container">
        <div className="word-wrapper hard-word-wrapper">
          <span className="word-text hard-word-text">{word.hard}</span>
          <div className="word-value">
            <span>3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
