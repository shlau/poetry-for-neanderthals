import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import "./Lobby.less";
import { useLocation } from "react-router-dom";
import { User } from "../models/User.model";
import { GameMessage } from "../models/GameMessage.model";
import CheckIcon from "@mui/icons-material/Check";
import { Button } from "@mui/material";

export default function Lobby() {
  const location = useLocation();
  const currentUser: User = location.state;
  const socketUrl = `/channel/${currentUser.gameId}/ws?userId=${currentUser.id}&gameId=${currentUser.gameId}&name=${currentUser.name}`;
  // const [messageHistory, setMessageHistory] = useState<MessageEvent<any>[]>([]);
  const { sendMessage, lastMessage } = useWebSocket(socketUrl);
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (lastMessage !== null) {
      console.log(JSON.parse(lastMessage.data));
      handleMessage(JSON.parse(lastMessage.data));
      // setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage]);

  const onReadyPress = () => {
    sendMessage(`users:${currentUser.id}:ready:${!ready}`);
    setReady((prevState) => !prevState);
  };

  const joinTeam = (team: string) => {
    sendMessage(`users:${currentUser.id}:team:${team}`);
  };

  const handleMessage = (message: GameMessage) => {
    if (message.type && message.data) {
      switch (message.type) {
        case "users":
          setUsers(message.data);
          break;
        default:
      }
    }
  };

  const getTeamUsers = (team: string, showCheck: boolean = false) =>
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
          <div className="users-container">{getTeamUsers("unassigned")}</div>
        </div>
      </div>
      <div className="teams-container">
        <div className="red-team teams">
          <h1>TEAM 1</h1>
          <div className="users-container">
            {getTeamUsers("red", true)}
            <div className="join-button hover" onClick={() => joinTeam("red")}>
              +
            </div>
          </div>
        </div>
        <div className="blue-team teams">
          <h1>TEAM 2</h1>
          <div className="users-container">
            {getTeamUsers("blue", true)}
            <div className="join-button hover" onClick={() => joinTeam("blue")}>
              +
            </div>
          </div>
        </div>
      </div>
      <div className="footer">
        <Button className="start-button hover" variant="contained">
          Start game
        </Button>
        <Button
          className="ready-button hover"
          variant="contained"
          onClick={onReadyPress}
        >
          {ready ? "Unready" : "Ready"}
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
