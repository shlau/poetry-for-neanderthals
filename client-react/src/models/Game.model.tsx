export interface GameMessage {
  data: any;
  type: string;
}

export interface Word {
  easy: Array<{ value: string; revealed: boolean }>;
  hard: Array<{ value: string; revealed: boolean }>;
}

export interface GameData {
  redScore: number;
  blueScore: number;
}
