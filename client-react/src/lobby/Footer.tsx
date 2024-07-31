import { Button } from "@mui/material";
import { useState } from "react";
import { Team, User } from "../models/User.model";

interface FooterProps {
  sendMessage: Function;
  currentUser: User;
  users: User[];
}
export default function Footer({
  sendMessage,
  currentUser,
  users,
}: FooterProps) {
  const blueUsers = users.filter(
    (user: User) => user.ready && user.team === Team.BLUE
  );
  const redUsers = users.filter((user: User) => user.team === Team.RED);
  const unReadyUsers = users.filter((user: User) => !user.ready);

  const canStart =
    unReadyUsers.length < 1 && redUsers.length >= 1 && blueUsers.length >= 1;
  const [ready, setReady] = useState(false);
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

  return (
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
  );
}
