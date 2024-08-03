import "./UploadDialog.less";
import { useState } from "react";
import { uploadWords } from "../../services/api/GamesService";
import { User } from "../../models/User.model";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  LinearProgress,
} from "@mui/material";

interface UploadDialogProps {
  currentUser: User;
}
export default function UploadDialog({ currentUser }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClickOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: FileList | null = e.target.files;
    if (files) {
      setFile(files[0]);
    }
  };
  const handleFileSubmit = () => {
    if (file) {
      setLoading(true);
      uploadWords(file, currentUser.gameId)
        .then(() => {
          setUploadError(false);
          setOpen(false);
        })
        .catch(() => {
          setUploadError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div className="upload-dialog">
      <Button variant="contained" onClick={handleClickOpen}>
        Upload Custom Words
      </Button>
      <Dialog className="upload-dialog" open={open} onClose={handleClose}>
        {uploadError && <Alert severity="error">Upload failed</Alert>}
        <DialogContent>
          <div className="instructions">
            <p>
              Upload a .txt file where each line has the format
              "easy_word:hard_word"
            </p>
          </div>
          <div className="example-file">
            <p>For example:</p>
            <p>banana:banana phone</p>
            <p>table:tablecloth</p>
            <p>water:water hose</p>
          </div>
          <input type="file" name="gameWords" onChange={handleFileChange} />
          {loading && (
            <Box sx={{ width: "100%" }}>
              <LinearProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleFileSubmit}
            disabled={!file}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
