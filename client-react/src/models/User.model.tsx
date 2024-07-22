export enum Team {
  UNASSIGNED = "0",
  BLUE = "1",
  RED = "2",
}
export interface User {
  id: string;
  name: string;
  team: Team;
  gameId: string;
  ready: boolean;
}
