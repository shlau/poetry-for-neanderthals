import { ReactNode } from "react";
import "./Lobby.less";
import { Team, User } from "../models/User.model";
import CheckIcon from "@mui/icons-material/Check";
import { LobbyProps } from "../gameSession/GameSession";
import Footer from "./footer/Footer";
import GameResults from "./gameResults/GameResults";
import StagingArea from "./stagingArea/StagingArea";
import TeamArea from "./teamArea/TeamArea";

export default function Lobby({
  sendMessage,
  users,
  currentUser,
  gameData,
  numRounds,
}: LobbyProps) {
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
      <StagingArea currentUser={currentUser} getTeamUsers={getTeamUsers} />
      <TeamArea
        currentUser={currentUser}
        sendMessage={sendMessage}
        getTeamUsers={getTeamUsers}
      />
      <Footer
        sendMessage={sendMessage}
        currentUser={currentUser}
        users={users}
        numRounds={numRounds}
      />
      <GameResults gameData={gameData} />
    </div>
  );
}
