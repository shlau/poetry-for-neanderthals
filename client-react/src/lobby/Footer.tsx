import { Button } from "@mui/material";
import React, { useState } from "react";
import { Team, User } from "../models/User.model";
import { uploadWords } from "../services/api/GamesService";

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
  const [file, setFile] = useState<File | null>(null);
  const onReadyPress = () => {
    sendMessage(`update:users:${currentUser.id}:ready:${!ready}`);
    setReady((prevState) => !prevState);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: FileList | null = e.target.files;
    if (files) {
      setFile(files[0]);
    }
  };
  const handleFileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (file) {
      uploadWords(file, currentUser.gameId);
    }
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
      <form onSubmit={handleFileSubmit}>
        <input type="file" name="gameWords" onChange={handleFileChange} />
        <Button type="submit">Upload Custom Words</Button>
      </form>
    </div>
  );
}
