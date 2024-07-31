import { User } from "../models/User.model";

interface HeaderProps {
  poet: User | undefined;
  isPoet: boolean;
  currentUser: User;
}
export default function Header({ poet, isPoet, currentUser }: HeaderProps) {
  return (
    <div className="header">
      <div className="header-text">
        {isPoet ? "YOU ARE " : poet?.name + " IS"} THE POET
      </div>
      {poet?.team === currentUser?.team && !isPoet && (
        <div className="header-text">YOU ARE GUESSING</div>
      )}
      {poet?.team !== currentUser?.team && (
        <div className="header-text">YOU ARE BONKING</div>
      )}
    </div>
  );
}
