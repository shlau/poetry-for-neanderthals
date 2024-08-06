import { Team, User } from "../../models/User.model";

interface StagingAreaProps {
  currentUser: User;
  getTeamUsers: Function;
}
export default function StagingArea({
  currentUser,
  getTeamUsers,
}: StagingAreaProps) {
  return (
    <div className="staging-area">
      <div className="staging-container">
        <h1>Lobby - {currentUser.gameId}</h1>
        <div className="users-container">{getTeamUsers(Team.UNASSIGNED)}</div>
      </div>
    </div>
  );
}
