import React from "react";
import { GameData } from "../../models/Game.model";

interface GameResultsProps {
  gameData: GameData;
}
export default function GameResults({ gameData }: GameResultsProps) {
  return (
    <React.Fragment>
      {gameData.redScore != null && gameData.blueScore != null && (
        <div className="results">
          Match Results:
          <div className="red-score">Red Team: {gameData.redScore}</div>
          <div className="blue-score">Blue Team: {gameData.blueScore}</div>
        </div>
      )}
    </React.Fragment>
  );
}
