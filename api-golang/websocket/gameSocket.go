package websocket

import (
	"encoding/json"
	"fmt"
	"net/http"
	"slices"
	"strconv"
	"strings"

	genericSlices "github.com/bobg/go-generics/slices"

	"github.com/olahol/melody"
	log "github.com/sirupsen/logrus"
	"poetry.sheldonlau.com/models"
)

const BLUE_TEAM = "1"
const RED_TEAM = "2"

type GameSocket struct {
	m *melody.Melody
	u *models.UserModel
	g *models.GameModel
}

type GameMessage struct {
	Data any    `json:"data"`
	Type string `json:"type"`
}

func NewGameSocket(users *models.UserModel, games *models.GameModel) *GameSocket {
	m := melody.New()
	return &GameSocket{m, users, games}
}

func (ws *GameSocket) Listen() {
	ws.HandleMessage()
	ws.HandleConnect()
	ws.HandleDisconnect()
}

func (ws *GameSocket) echoMessage(message string, s *melody.Session) {
	gameMessage := GameMessage{Data: message, Type: "echo"}
	ws.BroadcastGameMessage(gameMessage, s)
}

func (ws *GameSocket) HandleMessage() {
	ws.m.HandleMessage(func(s *melody.Session, msg []byte) {
		message := strings.Split(string(msg), ":")
		messageType := message[0]
		gameId, exists := s.Get("gameId")

		if !exists {
			log.Error("Missing session gameId")
			return
		}

		switch messageType {
		case "echo":
			if len(message) != 2 {
				log.Errorf("Invalid echo: %s", msg)
				return
			}
			ws.echoMessage(message[1], s)
		case "update":
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
					ws.BroadcastGameUsers(gameId.(string), s)
				}
			}
		case "score":
			if len(message) != 3 {
				log.Errorf("Invalid message: %s", msg)
				return
			}

			col, val := message[1], message[2]
			score, err := ws.g.IncreaseValue(gameId.(string), col, val)
			if err != nil {
				log.Error("Failed to update score, ", err)
			} else {
				teamVal := BLUE_TEAM
				if col == "red_score" {
					teamVal = RED_TEAM
				}

				gameMessage := GameMessage{Data: fmt.Sprintf("%s:%d", teamVal, score), Type: "score"}
				ws.BroadcastGameMessage(gameMessage, s)
				ws.PickNextWord(gameId.(string), s)
			}
		case "randomize":
			err := ws.g.RandomizeTeams(gameId.(string))
			if err != nil {
				log.Error("Failed to randomize teams, ", err)
			} else {
				ws.BroadcastGameUsers(gameId.(string), s)
			}
		case "resumeRound":
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
				ws.BroadcastGameMessage(gameMessage, s)
			}
		case "startGame":
			ws.echoMessage("startGame", s)
			ws.g.UpdateCol(gameId.(string), "in_progress", true)

			users := ws.g.Users(gameId.(string))
			idx := slices.IndexFunc(users, func(u models.User) bool { return u.Team == BLUE_TEAM })
			if idx != -1 {
				poetId := users[idx].Id
				gameMessage := GameMessage{Data: poetId, Type: "poetChange"}
				ws.BroadcastGameMessage(gameMessage, s)
			} else {
				log.Error("Poet not found at game start")
			}
		case "startRound":
			ws.PickNextWord(gameId.(string), s)
			ws.echoMessage("startRound", s)
		case "endRound":
			if len(message) != 2 {
				log.Errorf("Invalid message: %s", msg)
				return
			}
			ws.echoMessage("endRound", s)
			ws.SwitchPoet(gameId.(string), message[1], s)
		default:
			return
		}
	})
}

func (ws *GameSocket) PickNextWord(gameId string, s *melody.Session) {
	word, err := ws.g.NextWord(gameId)
	if err != nil {
		log.Error("Failed to get next word at round start")
	}
	gameMessage := GameMessage{Data: word, Type: "wordUpdate"}
	ws.BroadcastGameMessage(gameMessage, s)
}

func (ws *GameSocket) EndGame(gameId string, s *melody.Session) {
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
	ws.BroadcastToChannel(jsonEncoding, s)
}

func (ws *GameSocket) SwitchPoet(gameId string, currentTeam string, s *melody.Session) {
	users := ws.g.Users(gameId)
	redUsers, err := genericSlices.Filter(users, func(user models.User) (bool, error) {
		return user.Team == RED_TEAM, nil
	})
	if err != nil {
		log.Error("Failed to filter red users: ", err.Error())
		return
	}
	blueUsers, err := genericSlices.Filter(users, func(user models.User) (bool, error) {
		return user.Team == BLUE_TEAM, nil
	})
	if err != nil {
		log.Error("Failed to filter blue users", err.Error())
		return
	}

	game, err := ws.g.Get(gameId)

	if err != nil {
		log.Error("Failed to get game for poet switch: ", err.Error())
		return
	}

	col := ""
	nextPoet := users[0]
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
		ws.EndGame(gameId, s)
		return
	}

	gameMessage := GameMessage{Data: nextPoet.Id, Type: "poetChange"}
	ws.BroadcastGameMessage(gameMessage, s)
}

func (ws *GameSocket) HandleDisconnect() {
	ws.m.HandleDisconnect(func(s *melody.Session) {
		userId, exists := s.Get("userId")
		if !exists {
			log.Errorf("Disconnected user does not exist id: %s", userId)
			return
		}
		gameId, exists := s.Get("gameId")
		if !exists {
			log.Errorf("Game does not exist id: %s", userId)
			return
		}

		log.Printf("Removed user: %s", userId)
		err := ws.u.Remove(userId.(string), gameId.(string))
		if err != nil {
			log.Error("failed to remove user on disconnect: ", err.Error())
			return
		}
		ws.BroadcastGameUsers(gameId.(string), s)
	})
}

func (ws *GameSocket) HandleConnect() {
	ws.m.HandleConnect(func(s *melody.Session) {
		gameId := s.Request.FormValue("gameId")
		userId := s.Request.FormValue("userId")

		if gameId != "" && userId != "" {
			s.Set("gameId", gameId)
			s.Set("userId", userId)

			ws.BroadcastGameUsers(gameId, s)
		} else {
			s.Close()
		}
	})
}

func (ws *GameSocket) BroadcastToChannel(msg []byte, s *melody.Session) {
	ws.m.BroadcastFilter(msg, func(q *melody.Session) bool {
		return q.Request.URL.Path == s.Request.URL.Path
	})
}

func (ws *GameSocket) BroadcastGameMessage(gameMessage GameMessage, s *melody.Session) {
	jsonEncoding, err := json.Marshal(gameMessage)
	if err != nil {
		log.Error("Failed to send game message: ", err.Error())
		return
	}
	ws.BroadcastToChannel(jsonEncoding, s)
}

func (ws *GameSocket) BroadcastGameUsers(gameId string, s *melody.Session) {
	users := ws.g.Users(gameId)
	gameMessage := GameMessage{Data: users, Type: "users"}
	ws.BroadcastGameMessage(gameMessage, s)
}

func (ws *GameSocket) UpgradeConnection(w http.ResponseWriter, r *http.Request) {
	ws.m.HandleRequest(w, r)
}
