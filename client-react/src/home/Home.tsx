import InstructionDialog from "../dialogs/instruction-dialog/InstructionDialog";
import LobbyDialog, {
  LobbyDialogType,
} from "../dialogs/lobby-dialog/LobbyDialog";
import "./Home.less";

export default function Home() {
  return (
    <>
      <div className="homepage">
        <div className="page-body">
          <div className="buttons-container">
            <div className="buttons">
              <LobbyDialog
                onSubmit={() => null}
                dialogType={LobbyDialogType.CREATE}
              ></LobbyDialog>
              <LobbyDialog
                onSubmit={() => null}
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
