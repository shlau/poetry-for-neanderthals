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

		table, id, col, val := message[0], message[1], message[2], message[3]

		if table == "users" {
			err := ws.u.UpdateCol(id, col, val)
			if err != nil {
				log.Error("Failed to broadcast, ", err)
			} else {
				ws.m.BroadcastFilter(msg, func(q *melody.Session) bool {
					return q.Request.URL.Path == s.Request.URL.Path
				})
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
		name := s.Request.FormValue("name")

		if gameId != "" && userId != "" {
			s.Set("gameId", gameId)
			s.Set("userId", userId)

			user := models.User{Name: name, GameId: gameId, Id: userId}
			jsonEncoding, err := json.Marshal(user)
			if err != nil {
				log.Error("Failed to encode user: ", err.Error())
				s.Close()
				return
			}
			ws.BroadcastToChannel(jsonEncoding, s)
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

func (ws *GameSocket) UpgradeConnection(w http.ResponseWriter, r *http.Request) {
	ws.m.HandleRequest(w, r)
}
