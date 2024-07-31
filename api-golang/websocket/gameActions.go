package websocket

import (
	"fmt"
	"slices"
	"strconv"
	"strings"

	"github.com/olahol/melody"
	log "github.com/sirupsen/logrus"
	"poetry.sheldonlau.com/models"
)

func (ws *GameSocket) handleEcho(s *melody.Session, msg []byte) {
	message := strings.Split(string(msg), ":")
	if len(message) != 2 {
		log.Errorf("Invalid echo: %s", msg)
		return
	}
	ws.echoMessage(message[1], s)
}

func (ws *GameSocket) handleUpdate(s *melody.Session, msg []byte, gameId string) {
	message := strings.Split(string(msg), ":")
	if len(message) != 5 {
		log.Errorf("Invalid message: %s", msg)
		return
	}
	table, id, col, val := message[1], message[2], message[3], message[4]

	if table == "users" {
		err := ws.u.UpdateCol(id, col, val)
		if err != nil {
			log.Error("Failed to update user, ", err)
		} else {
			ws.broadcastGameUsers(gameId, s)
		}
	}
}

func (ws *GameSocket) handleScore(s *melody.Session, msg []byte, gameId string) {
	message := strings.Split(string(msg), ":")
	if len(message) != 3 {
		log.Errorf("Invalid message: %s", msg)
		return
	}

	col, val := message[1], message[2]
	score, err := ws.g.IncreaseValue(gameId, col, val)
	if err != nil {
		log.Error("Failed to update score, ", err)
	} else {
		teamVal := BLUE_TEAM
		if col == "red_score" {
			teamVal = RED_TEAM
		}

		gameMessage := GameMessage{Data: fmt.Sprintf("%s:%d", teamVal, score), Type: "score"}
		ws.broadcastGameMessage(gameMessage, s)
		ws.pickNextWord(gameId, s)
	}
}

func (ws *GameSocket) handleRandomize(s *melody.Session, msg []byte, gameId string) {
	err := ws.g.RandomizeTeams(gameId)
	if err != nil {
		log.Error("Failed to randomize teams, ", err)
	} else {
		ws.broadcastGameUsers(gameId, s)
	}
}
func (ws *GameSocket) handleResumeRound(s *melody.Session, msg []byte, gameId string) {
	message := strings.Split(string(msg), ":")
	if len(message) != 2 {
		log.Errorf("Invalid message: %s", msg)
		return
	}
	duration := message[1]
	i, err := strconv.Atoi(duration)
	if err != nil {
		log.Errorf("Unable to parse duration: %s", duration)
	} else {
		gameMessage := GameMessage{Data: i, Type: "resumeRound"}
		ws.broadcastGameMessage(gameMessage, s)
	}
}

func (ws *GameSocket) handleStartGame(s *melody.Session, msg []byte, gameId string) {
	ws.echoMessage("startGame", s)
	ws.g.UpdateCol(gameId, "in_progress", true)

	users := ws.g.Users(gameId)
	idx := slices.IndexFunc(users, func(u models.User) bool { return u.Team == BLUE_TEAM })
	if idx != -1 {
		poetId := users[idx].Id
		gameMessage := GameMessage{Data: poetId, Type: "poetChange"}
		ws.broadcastGameMessage(gameMessage, s)
	} else {
		log.Error("Poet not found at game start")
	}
}

func (ws *GameSocket) handleStartRound(s *melody.Session, msg []byte, gameId string) {
	ws.pickNextWord(gameId, s)
	ws.echoMessage("startRound", s)
}

func (ws *GameSocket) handleEndRound(s *melody.Session, msg []byte, gameId string) {
	message := strings.Split(string(msg), ":")
	if len(message) != 2 {
		log.Errorf("Invalid message: %s", msg)
		return
	}
	ws.endRound(message[1], gameId, s)
}
