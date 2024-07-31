import { Button } from "@mui/material";

interface BonkButtonProps {
  sendMessage: Function;
  isPoet: boolean;
}
export default function BonkButton({ sendMessage, isPoet }: BonkButtonProps) {
  const bonkPoet = () => {
    sendMessage("echo:bonk");
  };

  return (
    <div className="bonk-button">
      <Button variant="contained" disabled={isPoet} onClick={bonkPoet}>
        Bonk!
      </Button>
    </div>
  );
}
