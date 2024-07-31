package websocket

import (
	"encoding/json"

	genericSlices "github.com/bobg/go-generics/slices"
	"github.com/olahol/melody"
	log "github.com/sirupsen/logrus"
	"poetry.sheldonlau.com/models"
)

func (ws *GameSocket) echoMessage(message string, s *melody.Session) {
	gameMessage := GameMessage{Data: message, Type: "echo"}
	ws.broadcastGameMessage(gameMessage, s)
}

func (ws *GameSocket) broadcastToChannel(msg []byte, s *melody.Session) {
	ws.m.BroadcastFilter(msg, func(q *melody.Session) bool {
		return q.Request.URL.Path == s.Request.URL.Path
	})
}

func (ws *GameSocket) broadcastGameMessage(gameMessage GameMessage, s *melody.Session) {
	jsonEncoding, err := json.Marshal(gameMessage)
	if err != nil {
		log.Error("Failed to send game message: ", err.Error())
		return
	}
	ws.broadcastToChannel(jsonEncoding, s)
}

func (ws *GameSocket) broadcastGameUsers(gameId string, s *melody.Session) {
	users := ws.g.Users(gameId)
	gameMessage := GameMessage{Data: users, Type: "users"}
	ws.broadcastGameMessage(gameMessage, s)
}

func (ws *GameSocket) endRound(currentTeam string, gameId string, s *melody.Session) {
	ws.echoMessage("endRound", s)
	ws.switchPoet(gameId, currentTeam, s)
}

func (ws *GameSocket) pickNextWord(gameId string, s *melody.Session) {
	word, err := ws.g.NextWord(gameId)
	if err != nil {
		log.Error("Failed to get next word at round start")
	}
	gameMessage := GameMessage{Data: word, Type: "wordUpdate"}
	ws.broadcastGameMessage(gameMessage, s)
}

func (ws *GameSocket) endGame(gameId string, s *melody.Session) {
	game, err := ws.g.Get(gameId)
	if err != nil {
		log.Error("Failed to get game data at end: ", err.Error())
		return
	}
	ws.g.Reset(gameId)

	endGameMessage := struct {
		Data *models.Game `json:"data"`
		Type string       `json:"type"`
	}{
		Data: game,
		Type: "endGame",
	}
	jsonEncoding, err := json.Marshal(endGameMessage)
	if err != nil {
		log.Error("Failed to send end game message: ", err.Error())
		return
	}
	ws.broadcastToChannel(jsonEncoding, s)
}

func (ws *GameSocket) getTeamUsers(gameId string) ([]models.User, []models.User, error) {
	users := ws.g.Users(gameId)
	redUsers, err := genericSlices.Filter(users, func(user models.User) (bool, error) {
		return user.Team == RED_TEAM, nil
	})
	if err != nil {
		log.Error("Failed to filter red users: ", err.Error())
		return []models.User{}, []models.User{}, err
	}
	blueUsers, err := genericSlices.Filter(users, func(user models.User) (bool, error) {
		return user.Team == BLUE_TEAM, nil
	})
	if err != nil {
		log.Error("Failed to filter blue users", err.Error())
		return []models.User{}, []models.User{}, err
	}

	return redUsers, blueUsers, nil
}

func (ws *GameSocket) switchPoet(gameId string, currentTeam string, s *melody.Session) {
	redUsers, blueUsers, err := ws.getTeamUsers(gameId)
	if err != nil {
		log.Error("Failed to get team users for poet switch: ", err.Error())
		return
	}

	game, err := ws.g.Get(gameId)

	if err != nil {
		log.Error("Failed to get game for poet switch: ", err.Error())
		return
	}

	col := ""
	nextPoet := models.User{}
	if currentTeam == BLUE_TEAM {
		col = "blue_poet_idx"
		redIdx := game.RedPoetIdx
		nextPoet = redUsers[redIdx%len(redUsers)]
	} else {
		col = "red_poet_idx"
		blueIdx := game.BluePoetIdx
		nextPoet = blueUsers[blueIdx%len(blueUsers)]
	}

	newIdx, err := ws.g.IncreaseValue(gameId, col, "1")
	if err != nil {
		log.Error("Failed to increase poet idx: ", err.Error())
		return
	}

	numRounds := max(len(redUsers), len(blueUsers))
	if newIdx >= numRounds*2 && currentTeam == RED_TEAM {
		ws.endGame(gameId, s)
		return
	}

	gameMessage := GameMessage{Data: nextPoet.Id, Type: "poetChange"}
	ws.broadcastGameMessage(gameMessage, s)
}
