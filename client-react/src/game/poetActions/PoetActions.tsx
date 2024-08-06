import { Button } from "@mui/material";
import { Team, User } from "../../models/User.model";

interface PoetActionsProps {
  sendMessage: Function;
  roundInProgress: boolean;
  roundPaused: boolean;
  duration: number;
  setRoundPaused: Function;
  currentUser: User;
}
export default function PoetActions({
  sendMessage,
  roundInProgress,
  roundPaused,
  duration,
  setRoundPaused,
  currentUser,
}: PoetActionsProps) {
  const startRound = () => {
    sendMessage(`startRound`);
  };
  const pauseResumeRound = () => {
    let message = "";
    if (roundPaused) {
      message = `resumeRound:${duration}`;
    } else {
      message = "echo:pauseRound";
    }
    setRoundPaused((prevState: boolean) => !prevState);
    sendMessage(message);
  };

  const updateScore = (amount: number) => {
    const col = currentUser.team === Team.BLUE ? "blue_score" : "red_score";
    sendMessage(`score:${col}:${amount}`);
  };
  const skipWord = () => {
    updateScore(-1);
  };

  return (
    <div className="poet-buttons">
      <div className="timer-buttons">
        <Button
          variant="contained"
          disabled={roundInProgress}
          onClick={startRound}
        >
          Start Round
        </Button>
        <Button
          variant="contained"
          onClick={pauseResumeRound}
          disabled={!roundInProgress}
        >
          {roundPaused ? "Resume" : "Pause"}
        </Button>
      </div>
      <div className="score-buttons">
        <Button variant="contained" onClick={() => updateScore(-1)}>
          -1
        </Button>
        <Button variant="contained" onClick={() => updateScore(1)}>
          +1
        </Button>
        <Button variant="contained" onClick={() => updateScore(3)}>
          +3
        </Button>
        {roundInProgress && (
          <Button
            variant="contained"
            onClick={skipWord}
          >
            SKIP
          </Button>
        )}
      </div>
    </div>
  );
}
