import LobbyDialog, {
  LobbyDialogType,
} from "../dialogs/lobby-dialog/LobbyDialog";
import "./Home.less";
import { Button } from "@mui/material";

export default function Home() {
  return (
    <>
      <div className="homepage">
        <div className="page-body">
          <div className="buttons">
            <LobbyDialog
              onSubmit={() => null}
              dialogType={LobbyDialogType.CREATE}
            ></LobbyDialog>
            <LobbyDialog
              onSubmit={() => null}
              dialogType={LobbyDialogType.JOIN}
            ></LobbyDialog>
            <div>
              <Button
                className="how-to-button"
                variant="contained"
                // (click)="playVideo()"
              >
                How to Play
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
