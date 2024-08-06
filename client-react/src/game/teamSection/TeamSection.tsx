import { ReactNode } from "react";
import { User, Team } from "../../models/User.model";

interface TeamSectionProps {
  users: User[];
  currentUser: User;
  poet: User | undefined;
  score: string;
  team: Team;
}
export default function TeamSection({
  users,
  currentUser,
  poet,
  score,
  team,
}: TeamSectionProps) {
  const getTeamUsers = (team: Team): Iterable<ReactNode> =>
    (users ?? [])
      .filter((user: User) => user.team === team)
      .map((user: User) => {
        return (
          <div className="user-container" key={user.id}>
            <span className="username">{user.name}</span>
            {user.id === currentUser.id && <span>(YOU)</span>}
            {user.id === poet?.id && <span>--(POET)</span>}
          </div>
        );
      });
  return (
    <div className="teams">
      <div className={`team ${team == Team.BLUE ? "blue-team" : "red-team"}`}>
        {team === Team.RED && <h1>RED TEAM</h1>}
        {team === Team.BLUE && <h1>BLUE TEAM</h1>}
        <h1 className="score">SCORE: {score}</h1>
        <div className="users-section">{getTeamUsers(team)}</div>
      </div>
    </div>
  );
}
