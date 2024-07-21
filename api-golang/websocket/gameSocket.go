package websocket

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/olahol/melody"
	log "github.com/sirupsen/logrus"
	"poetry.sheldonlau.com/models"
)

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

func (ws *GameSocket) HandleMessage() {
	ws.m.HandleMessage(func(s *melody.Session, msg []byte) {
		message := strings.Split(string(msg), ":")

		if len(message) != 4 {
			log.Errorf("Invalid message: %s", msg)
			return
		}

		table, id, col, val := message[0], message[1], message[2], message[3]

		if table == "users" {
			err := ws.u.UpdateCol(id, col, val)
			if err != nil {
				log.Error("Failed to update user, ", err)
			} else {
				gameId, exists := s.Get("gameId")

				if !exists {
					log.Error("Missing session gameId")
					return
				}

				ws.BroadCastGameUsers(gameId.(string), s)
			}
		}
	})
}

func (ws *GameSocket) HandleDisconnect() {
	ws.m.HandleDisconnect(func(s *melody.Session) {
		userId, exists := s.Get("userId")
		if !exists {
			log.Errorf("Disconnected user does not exist id: %s", userId)
		} else {
			ws.u.Remove(userId.(string))
		}

		// TODO remove game if no users exist
	})
}

func (ws *GameSocket) HandleConnect() {
	ws.m.HandleConnect(func(s *melody.Session) {
		gameId := s.Request.FormValue("gameId")
		userId := s.Request.FormValue("userId")

		if gameId != "" && userId != "" {
			s.Set("gameId", gameId)
			s.Set("userId", userId)

			ws.BroadCastGameUsers(gameId, s)
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

func (ws *GameSocket) BroadCastGameUsers(gameId string, s *melody.Session) {
	users := ws.g.Users(gameId)
	gameMessage := GameMessage{Data: users, Type: "users"}
	jsonEncoding, err := json.Marshal(gameMessage)
	if err != nil {
		log.Error("Failed to encode users data: ", err.Error())
		s.Close()
		return
	}
	ws.BroadcastToChannel(jsonEncoding, s)
}

func (ws *GameSocket) UpgradeConnection(w http.ResponseWriter, r *http.Request) {
	ws.m.HandleRequest(w, r)
}
