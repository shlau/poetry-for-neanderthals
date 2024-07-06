import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import "./LobbyDialog.less";

export const enum LobbyDialogType {
  CREATE = "create",
  JOIN = "join",
}

interface LobbyDialogProps {
  dialogType: LobbyDialogType;
  onSubmit: Function;
}

export default function LobbyDialog({
  dialogType,
  onSubmit,
}: LobbyDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());
    onSubmit(formJson);
    handleClose();
  };

  return (
    <div className="lobby-dialog-wrapper">
      <Button
        className={dialogType}
        variant="contained"
        onClick={handleClickOpen}
      >
        {dialogType === LobbyDialogType.CREATE ? "Create Lobby" : "Join Lobby"}
      </Button>
      <Dialog
        className="lobby-dialog"
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: handleSubmit,
        }}
      >
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
          />
          {dialogType === LobbyDialogType.JOIN && (
            <TextField
              autoFocus
              required
              margin="dense"
              id="lobby-id"
              name="lobby-id"
              label="Enter Lobby ID:"
              type="text"
              fullWidth
              variant="standard"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="success" type="submit">
            Play
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
