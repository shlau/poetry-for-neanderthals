import { useNavigate } from "react-router-dom";
import InstructionDialog from "../dialogs/instruction-dialog/InstructionDialog";
import LobbyDialog, {
  LobbyDialogType,
} from "../dialogs/lobby-dialog/LobbyDialog";
import { createGame, joinGame } from "../services/api/GamesService";
import "./Home.less";
import { User } from "../models/User.model";

export default function Home() {
  const navigate = useNavigate();
  const handleCreateGame = (data: { name: string }) => {
    createGame(data.name).then((user: User) => {
      navigate(`/lobby/${user.gameId}`, { state: user });
    });
  };

  const handleJoinGame = (data: { name: string; gameId: string }) => {
    joinGame(data.name, data.gameId);
  };
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
