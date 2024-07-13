import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import "./Lobby.less";
import { useLocation } from "react-router-dom";
import { User } from "../models/User.model";

export default function Lobby() {
  const location = useLocation();
  const currentUser: User = location.state;
  const socketUrl = `/channel/${currentUser.gameId}/ws?userId=${currentUser.id}&gameId=${currentUser.gameId}&name=${currentUser.name}`;
  const [messageHistory, setMessageHistory] = useState<MessageEvent<any>[]>([]);
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    console.log(lastMessage);
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage]);

  return (
    <div>
      <p>{currentUser.gameId}</p>
      <button onClick={() => sendMessage("hello")}>click me</button>
    </div>
  );
  //  <div class="lobby">
  //   <div class="staging-area">
  //     <div class="staging-container">
  //       <h1>Lobby - {{ game?.id }}</h1>
  //       <div class="users-container">
  //         <div class="user" *ngFor="let user of unassignedUsers$ | async">
  //           {{ user.name }}
  //           <span *ngIf="user.id == currentUserId">(YOU)</span>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  //   <div class="teams-container">
  //     <div class="red-team teams">
  //       <h1>TEAM 1</h1>
  //       <div class="users-container">
  //         <div class="user" *ngFor="let user of redUsers$ | async">
  //           {{ user.name }}
  //           <span *ngIf="user.id == currentUserId">(YOU)</span>
  //           <mat-icon
  //             *ngIf="user.ready"
  //             aria-hidden="false"
  //             aria-label="check"
  //             fontIcon="done"
  //           ></mat-icon>
  //         </div>
  //         <div class="join-button hover" (click)="joinTeam(Team.RED)">+</div>
  //       </div>
  //     </div>
  //     <div class="blue-team teams">
  //       <h1>TEAM 2</h1>
  //       <div class="users-container">
  //         <div class="user" *ngFor="let user of blueUsers$ | async">
  //           {{ user.name }}
  //           <span *ngIf="user.id == currentUserId">(YOU)</span>
  //           <mat-icon
  //             *ngIf="user.ready"
  //             aria-hidden="false"
  //             aria-label="check"
  //             fontIcon="done"
  //           ></mat-icon>
  //         </div>
  //         <div class="join-button hover" (click)="joinTeam(Team.BLUE)">+</div>
  //       </div>
  //     </div>
  //   </div>
  //   <div class="footer">
  //     <button
  //       class="start-button hover"
  //       mat-flat-button
  //       color="primary"
  //       (click)="onStartButtonPress()"
  //       [disabled]="!gameState.canStart"
  //     >
  //       Start game
  //     </button>
  //     <button
  //       class="ready-button hover"
  //       mat-flat-button
  //       color="basic"
  //       (click)="onReadyPress()"
  //       [disabled]="!gameState.currentUser?.team"
  //     >
  //       {{ gameState.ready ? "Unready" : "Ready" }}
  //     </button>
  //   </div>
  //   <div
  //     *ngIf="gameState.redScore != null && gameState.blueScore != null"
  //     class="results"
  //   >
  //     Match Results:
  //     <div class="red-score">Red Team: {{ gameState.redScore }}</div>
  //     <div class="blue-score">Blue Team: {{ gameState.blueScore }}</div>
  //   </div>
  // </div>
}
