import { ReactNode, useState } from "react";
import "./Lobby.less";
import { Team, User } from "../models/User.model";
import CheckIcon from "@mui/icons-material/Check";
import { Button } from "@mui/material";
import { LobbyProps } from "../gameSession/GameSession";

export default function Lobby({
  sendMessage,
  users,
  currentUser,
  gameData,
}: LobbyProps) {
  const [ready, setReady] = useState(false);
  const blueUsers = users.filter(
    (user: User) => user.ready && user.team === Team.BLUE
  );
  const redUsers = users.filter((user: User) => user.team === Team.RED);
  const unReadyUsers = users.filter((user: User) => !user.ready);
  const canStart =
    unReadyUsers.length < 1 && redUsers.length >= 1 && blueUsers.length >= 1;

  const onReadyPress = () => {
    sendMessage(`update:users:${currentUser.id}:ready:${!ready}`);
    setReady((prevState) => !prevState);
  };

  const onRandomizePress = () => {
    sendMessage(`randomize`);
  };

  const onGameStart = () => {
    sendMessage(`startGame`);
  };

  const joinTeam = (team: Team) => {
    sendMessage(`update:users:${currentUser.id}:team:${team}`);
  };

  const getTeamUsers = (
    team: Team,
    showCheck: boolean = false
  ): Iterable<ReactNode> =>
    (users ?? [])
      .filter((user: User) => user.team === team)
      .map((user: User) => {
        return (
          <div className="user" key={user.id}>
            {user.name}
            {user.id == currentUser.id && <span>(YOU)</span>}
            {user.ready && showCheck && <CheckIcon />}
          </div>
        );
      });

  return (
    <div className="lobby">
      <div className="staging-area">
        <div className="staging-container">
          <h1>Lobby - {currentUser.gameId}</h1>
          <div className="users-container">{getTeamUsers(Team.UNASSIGNED)}</div>
        </div>
      </div>
      <div className="teams-container">
        <div className="red-team teams">
          <h1>TEAM 1</h1>
          <div className="users-container">
            {getTeamUsers(Team.RED, true)}
            <div
              className="join-button hover"
              onClick={() => joinTeam(Team.RED)}
            >
              +
            </div>
          </div>
        </div>
        <div className="blue-team teams">
          <h1>TEAM 2</h1>
          <div className="users-container">
            {getTeamUsers(Team.BLUE, true)}
            <div
              className="join-button hover"
              onClick={() => joinTeam(Team.BLUE)}
            >
              +
            </div>
          </div>
        </div>
      </div>
      <div className="footer">
        <Button
          onClick={onGameStart}
          className="start-button hover"
          variant="contained"
          disabled={!canStart}
        >
          Start game
        </Button>
        <Button
          className="ready-button hover"
          variant="contained"
          onClick={onReadyPress}
          disabled={currentUser.team === Team.UNASSIGNED}
        >
          {ready ? "Unready" : "Ready"}
        </Button>
        <Button
          className="randomize-button hover"
          variant="contained"
          onClick={onRandomizePress}
        >
          Randomize Teams
        </Button>
      </div>
      {gameData.redScore != null && gameData.blueScore != null && (
        <div className="results">
          Match Results:
          <div className="red-score">Red Team: {gameData.redScore}</div>
          <div className="blue-score">Blue Team: {gameData.blueScore}</div>
        </div>
      )}
    </div>
  );
}
