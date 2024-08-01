import { useState } from "react";
import { GameProps } from "../gameSession/GameSession";
import { Team } from "../models/User.model";
import "./Game.less";
import { Snackbar } from "@mui/material";
import BonkBat from "./BonkBat";
import PoetActions from "./PoetActions";
import WordCard from "./WordCard";
import TeamSection from "./TeamSection";
import Header from "./Header";
import BonkButton from "./BonkButton";
import Timer from "./Timer";
import Chat from "./Chat";

export default function Game({
  sendMessage,
  users,
  currentUser,
  blueScore,
  redScore,
  roundInProgress,
  duration,
  poet,
  word,
  bonkOpen,
  hideBonk,
  chatMessages,
}: GameProps) {
  const [roundPaused, setRoundPaused] = useState(false);
  const isPoet = poet?.id === currentUser.id;

  return (
    <div className="gamepage">
      <Snackbar
        open={bonkOpen}
        autoHideDuration={1000}
        onClose={hideBonk}
        action={<BonkBat />}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
      <div className="page-body">
        <TeamSection
          users={users}
          currentUser={currentUser}
          poet={poet}
          score={redScore}
          team={Team.RED}
        />
        <div className="page-center">
          <Header poet={poet} isPoet={isPoet} currentUser={currentUser} />
          <div className="poet-section">
            <WordCard
              isPoet={isPoet}
              currentUser={currentUser}
              poet={poet}
              roundInProgress={roundInProgress}
              word={word}
            />
          </div>
          <div>
            <Timer duration={duration} />
            {isPoet && (
              <PoetActions
                sendMessage={sendMessage}
                roundInProgress={roundInProgress}
                roundPaused={roundPaused}
                duration={duration}
                setRoundPaused={setRoundPaused}
                currentUser={currentUser}
              />
            )}
            {poet?.team !== currentUser?.team && (
              <BonkButton sendMessage={sendMessage} isPoet={isPoet} />
            )}
          </div>
        </div>
        <TeamSection
          users={users}
          currentUser={currentUser}
          poet={poet}
          score={blueScore}
          team={Team.BLUE}
        />
        <Chat
          sendMessage={sendMessage}
          chatMessages={chatMessages}
          currentUser={currentUser}
          poetId={poet?.id}
        />
      </div>
    </div>
  );
}
