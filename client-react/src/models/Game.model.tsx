export interface GameMessage {
  data: any;
  type: string;
}

export interface Word {
  easy: string;
  hard: string;
}

export interface GameData {
  redScore: number;
  blueScore: number;
}
