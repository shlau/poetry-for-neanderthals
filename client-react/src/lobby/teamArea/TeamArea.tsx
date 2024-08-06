import { Team, User } from "../models/User.model";

interface TeamAreaProps {
  currentUser: User;
  sendMessage: Function;
  getTeamUsers: Function;
}

export default function TeamArea({
  currentUser,
  sendMessage,
  getTeamUsers,
}: TeamAreaProps) {
  const joinTeam = (team: Team) => {
    sendMessage(`update:users:${currentUser.id}:team:${team}`);
  };

  return (
    <div className="teams-container">
      <div className="red-team teams">
        <h1>TEAM 1</h1>
        <div className="users-container">
          {getTeamUsers(Team.RED, true)}
          <div className="join-button hover" onClick={() => joinTeam(Team.RED)}>
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
  );
}
