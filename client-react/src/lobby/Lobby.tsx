import { ReactNode, useState } from "react";
import "./Lobby.less";
import { Team, User } from "../models/User.model";
import CheckIcon from "@mui/icons-material/Check";
import { Button } from "@mui/material";
import { LobbyProps } from "../gameSession/GameSession";

export default function Lobby({ sendMessage, users, currentUser }: LobbyProps) {
  const [ready, setReady] = useState(false);
  const canStart = users.filter((user: User) => !user.ready).length === 0;

  const onReadyPress = () => {
    sendMessage(`update:users:${currentUser.id}:ready:${!ready}`);
    setReady((prevState) => !prevState);
  };

  const onRandomizePress = () => {
    sendMessage(`randomize`);
  };

  const onGameStart = () => {
    sendMessage(`echo:start`);
  };

  const joinTeam = (team: Team) => {
    sendMessage(`update:users:${currentUser.id}:team:${team}`);
  };

  const getTeamUsers = (
    team: Team,
    showCheck: boolean = false
  ): Iterable<ReactNode> =>
    (users ?? [])
      .filter((user: User) => user.team === team)
      .map((user: User) => {
        return (
          <div className="user" key={user.id}>
            {user.name}
            {user.id == currentUser.id && <span>(YOU)</span>}
            {user.ready && showCheck && <CheckIcon />}
          </div>
        );
      });

  return (
    <div className="lobby">
      <div className="staging-area">
        <div className="staging-container">
          <h1>Lobby - {currentUser.gameId}</h1>
          <div className="users-container">{getTeamUsers(Team.UNASSIGNED)}</div>
        </div>
      </div>
      <div className="teams-container">
        <div className="red-team teams">
          <h1>TEAM 1</h1>
          <div className="users-container">
            {getTeamUsers(Team.RED, true)}
            <div
              className="join-button hover"
              onClick={() => joinTeam(Team.RED)}
            >
              +
            </div>
          </div>
        </div>
        <div className="blue-team teams">
          <h1>TEAM 2</h1>
          <div className="users-container">
            {getTeamUsers(Team.BLUE, true)}
            <div
              className="join-button hover"
              onClick={() => joinTeam(Team.BLUE)}
            >
              +
            </div>
          </div>
        </div>
      </div>
      <div className="footer">
        <Button
          onClick={onGameStart}
          className="start-button hover"
          variant="contained"
          disabled={!canStart}
        >
          Start game
        </Button>
        <Button
          className="ready-button hover"
          variant="contained"
          onClick={onReadyPress}
          disabled={currentUser.team === Team.UNASSIGNED}
        >
          {ready ? "Unready" : "Ready"}
        </Button>
        <Button
          className="randomize-button hover"
          variant="contained"
          onClick={onRandomizePress}
        >
          Randomize Teams
        </Button>
      </div>
    </div>
  );
}
{
  /* <div class="lobby">
  <div class="staging-area">
    <div class="staging-container">
      <h1>Lobby - {{ game?.id }}</h1>
      <div class="users-container">
        <div class="user" *ngFor="let user of unassignedUsers$ | async">
          {{ user.name }}
          <span *ngIf="user.id == currentUserId">(YOU)</span>
        </div>
      </div>
    </div>
  </div>
  <div class="teams-container">
    <div class="red-team teams">
      <h1>TEAM 1</h1>
      <div class="users-container">
        <div class="user" *ngFor="let user of redUsers$ | async">
          {{ user.name }}
          <span *ngIf="user.id == currentUserId">(YOU)</span>
          <mat-icon
            *ngIf="user.ready"
            aria-hidden="false"
            aria-label="check"
            fontIcon="done"
          ></mat-icon>
        </div>
        <div class="join-button hover" (click)="joinTeam(Team.RED)">+</div>
      </div>
    </div>
    <div class="blue-team teams">
      <h1>TEAM 2</h1>
      <div class="users-container">
        <div class="user" *ngFor="let user of blueUsers$ | async">
          {{ user.name }}
          <span *ngIf="user.id == currentUserId">(YOU)</span>
          <mat-icon
            *ngIf="user.ready"
            aria-hidden="false"
            aria-label="check"
            fontIcon="done"
          ></mat-icon>
        </div>
        <div class="join-button hover" (click)="joinTeam(Team.BLUE)">+</div>
      </div>
    </div>
  </div>
  <div class="footer">
    <button
      class="start-button hover"
      mat-flat-button
      color="primary"
      (click)="onStartButtonPress()"
      [disabled]="!gameState.canStart"
    >
      Start game
    </button>
    <button
      class="ready-button hover"
      mat-flat-button
      color="basic"
      (click)="onReadyPress()"
      [disabled]="!gameState.currentUser?.team"
    >
      {{ gameState.ready ? "Unready" : "Ready" }}
    </button>
  </div>
  <div
    *ngIf="gameState.redScore != null && gameState.blueScore != null"
    class="results"
  >
    Match Results:
    <div class="red-score">Red Team: {{ gameState.redScore }}</div>
    <div class="blue-score">Blue Team: {{ gameState.blueScore }}</div>
  </div>
</div> */
}
