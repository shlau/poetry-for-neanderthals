import "./Home.less";
import { Button } from "@mui/material";

export default function Home() {
  return (
    <>
      <div className="homepage">
        <div className="page-body">
          <div className="buttons">
            <div>
              <Button
                variant="contained"
                //   (click)="openDialog(LobbyDialogType.CREATE)"
              >
                Create Lobby
              </Button>
            </div>
            <div>
              <Button
                variant="contained"
                className="join-button"
                //   (click)="openDialog(LobbyDialogType.JOIN)"
              >
                Join Lobby
              </Button>
            </div>
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
