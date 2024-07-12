package websocket

import (
	"fmt"
	"net/http"

	"github.com/olahol/melody"
)

type GameSocket struct {
	m *melody.Melody
}

func NewGameSocket() *GameSocket {
	m := melody.New()
	m.HandleMessage(func(s *melody.Session, msg []byte) {
		fmt.Println(msg, ":", s.Request.URL.Path)
		m.BroadcastFilter(msg, func(q *melody.Session) bool {
			fmt.Printf("have %s, want %s\n", s.Request.URL.Path, q.Request.URL.Path)
			return q.Request.URL.Path == s.Request.URL.Path
		})
	})

	return &GameSocket{m}
}

func (ws *GameSocket) UpgradeConnection(w http.ResponseWriter, r *http.Request) {
	ws.m.HandleRequest(w, r)
}
