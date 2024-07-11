import InstructionDialog from "../dialogs/instruction-dialog/InstructionDialog";
import LobbyDialog, {
  LobbyDialogType,
} from "../dialogs/lobby-dialog/LobbyDialog";
import { createGame, joinGame } from "../services/api/Games.service";
import "./Home.less";

const handleCreateGame = (data: { name: string }) => {
  createGame(data.name);
};

const handleJoinGame = (data: { name: string; gameId: string }) => {
  const id = parseInt(data.gameId);
  if (isNaN(id)) {
    throw Error("invalid game id");
  } else {
    joinGame(data.name, id);
  }
};

export default function Home() {
  return (
    <>
      <div className="homepage">
        <div className="page-body">
          <div className="buttons-container">
            <div className="buttons">
              <LobbyDialog
                onSubmit={handleCreateGame}
                dialogType={LobbyDialogType.CREATE}
              ></LobbyDialog>
              <LobbyDialog
                onSubmit={handleJoinGame}
                dialogType={LobbyDialogType.JOIN}
              ></LobbyDialog>
              <InstructionDialog></InstructionDialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
