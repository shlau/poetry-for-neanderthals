import { ReactNode } from "react";
import { GameProps } from "../gameSession/GameSession";
// import { GameMessage } from "../models/GameMessage.model";
import { Team, User } from "../models/User.model";
import "./Game.less";
import { Button } from "@mui/material";

export default function Game({
  sendMessage,
  users,
  currentUser,
  blueScore,
  redScore,
}: GameProps) {
  const poet = { id: "0", name: "poetName", team: Team.BLUE };
  const isPoet = true;
  const roundInProgress = true;
  const roundPaused = false;
  const gameOver = false;
  const currentWord = { easy: "test easy word", hard: "test hard word" };
  const minutes = 1;
  const seconds = 10;

  const startRound = () => {};
  const pauseResumeRound = () => {};
  const updateScore = (amount: number) => {
    const col = currentUser.team === Team.BLUE ? "blue_score" : "red_score";
    sendMessage(`score:${col}:${amount}`);
  };
  const skipWord = () => {};
  const bonkPoet = () => {};

  const getTeamUsers = (team: Team): Iterable<ReactNode> =>
    (users ?? [])
      .filter((user: User) => user.team === team)
      .map((user: User) => {
        return (
          <div className="user-container" key={user.id}>
            <span className="username">{user.name}</span>
            {user.id === currentUser.id && <span>(YOU)</span>}
            {user.id === poet.id && <span>--(POET)</span>}
          </div>
        );
      });

  return (
    <div className="gamepage">
      <div className="page-body">
        <div className="teams">
          <div className="team red-team">
            <h1>RED TEAM</h1>
            <h1 className="score">SCORE: {redScore}</h1>
            <div className="users-section">{getTeamUsers(Team.RED)}</div>
          </div>
        </div>
        <div className="page-center">
          <div className="header">
            <div className="header-text">
              {isPoet ? "YOU ARE " : poet?.name + " IS"} THE POET
            </div>
            {poet?.team === currentUser?.team && !isPoet && (
              <div className="header-text">YOU ARE GUESSING</div>
            )}
            {poet?.team !== currentUser?.team && (
              <div className="header-text">YOU ARE BONKING</div>
            )}
          </div>
          <div className="poet-section">
            <div
              className={`word-card ${
                !roundInProgress ||
                (!isPoet && currentUser?.team === poet?.team)
                  ? "hide-card"
                  : ""
              }`}
            >
              <div className="word-container easy-word-container">
                <div className="word-wrapper easy-word-wrapper">
                  <div className="word-value">
                    <span>1</span>
                  </div>
                  <span className="word-text easy-word-text">
                    {currentWord.easy}
                  </span>
                </div>
              </div>
              <div className="word-container hard-word-container">
                <div className="word-wrapper hard-word-wrapper">
                  <span className="word-text hard-word-text">
                    {currentWord.hard}
                  </span>
                  <div className="word-value">
                    <span>3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="timer">
              <span>{minutes}</span>:
              <span>{seconds?.toString()?.padStart(2, "0")}</span>
            </div>
            {isPoet && (
              <div className="poet-buttons">
                <div className="timer-buttons">
                  <Button
                    variant="contained"
                    disabled={roundInProgress || gameOver}
                    onClick={startRound}
                  >
                    Start Round
                  </Button>
                  <Button
                    variant="contained"
                    onClick={pauseResumeRound}
                    disabled={!roundInProgress || gameOver}
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
                      // color="warn"
                      onClick={skipWord}
                    >
                      SKIP
                    </Button>
                  )}
                </div>
              </div>
            )}
            {poet?.team !== currentUser?.team && (
              <div className="bonk-button">
                <Button
                  variant="contained"
                  // color="warn"
                  disabled={isPoet}
                  onClick={bonkPoet}
                >
                  Bonk!
                </Button>
              </div>
            )}
            {gameOver && <div>GAME OVER!</div>}
          </div>
        </div>
        <div className="teams">
          <div className="team blue-team">
            <h1>BLUE TEAM</h1>
            <h1 className="score">SCORE: {blueScore}</h1>
            <div className="users-section">{getTeamUsers(Team.BLUE)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
