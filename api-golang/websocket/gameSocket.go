package websocket

import (
	"net/http"
	"strings"

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
	ws.handleConnect()
	ws.handleDisconnect()
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
			ws.handleEcho(s, msg)
		case "update":
			ws.handleUpdate(s, msg, gameId.(string))
		case "score":
			ws.handleScore(s, msg, gameId.(string))
		case "randomize":
			ws.handleRandomize(s, gameId.(string))
		case "resumeRound":
			ws.handleResumeRound(s, msg)
		case "startGame":
			ws.handleStartGame(s, gameId.(string))
		case "startRound":
			ws.handleStartRound(s, gameId.(string))
		case "endRound":
			ws.handleEndRound(s, msg, gameId.(string))
		case "chat":
			ws.handleChat(s, msg)
		default:
			return
		}
	})
}

func (ws *GameSocket) handleDisconnect() {
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

		remainingUsers, err := ws.u.Remove(userId.(string), gameId.(string))
		if err != nil {
			log.Error("failed to remove user on disconnect: ", err.Error())
			s.Close()
			return
		}

		if remainingUsers > 0 {
			game, err := ws.g.Get(gameId.(string))
			if err != nil {
				log.Error("Failed to get game during disconnect: ", err.Error())
				s.Close()
				return
			}
			if game.InProgress {
				// not enough players to continue game
				if remainingUsers < 2 {
					ws.endGame(gameId.(string), s)
				} else {
					// not enough players on each team
					redUsers, blueUsers, err := ws.getTeamUsers(gameId.(string))
					if err != nil {
						log.Error("Failed to get team users during disconnect: ", err.Error())
						s.Close()
						return
					}

					if len(redUsers) < 1 || len(blueUsers) < 1 {
						ws.endGame(gameId.(string), s)
					} else {
						ws.endRound(BLUE_TEAM, gameId.(string), s)
					}
				}
			}
			ws.broadcastGameUsers(gameId.(string), s)
		}
	})
}

func (ws *GameSocket) handleConnect() {
	ws.m.HandleConnect(func(s *melody.Session) {
		gameId := s.Request.FormValue("gameId")
		userId := s.Request.FormValue("userId")

		if gameId != "" && userId != "" {
			s.Set("gameId", gameId)
			s.Set("userId", userId)

			ws.broadcastGameUsers(gameId, s)
		} else {
			s.Close()
		}
	})
}

func (ws *GameSocket) UpgradeConnection(w http.ResponseWriter, r *http.Request) {
	ws.m.HandleRequest(w, r)
}
