import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import "./InstructionDialog.less";
import DialogContent from "@mui/material/DialogContent";

export default function InstructionDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <div className="instruction-dialog-wrapper">
      <Button variant="contained" onClick={handleClickOpen}>
        How to Play
      </Button>
      <Dialog className="instruction-dialog" open={open} onClose={handleClose}>
        <DialogContent>
          <div className="video">
            <iframe
              width="625"
              height="351"
              src="https://www.youtube.com/embed/hpbqepbvoJ8?autoplay=1"
              title="Poetry for Neanderthals - How to Play"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
