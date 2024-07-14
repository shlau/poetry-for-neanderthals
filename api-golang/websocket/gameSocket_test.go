package websocket

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gorilla/websocket"
	"github.com/olahol/melody"
	"github.com/pashagolub/pgxmock/v4"
	"poetry.sheldonlau.com/models"
)

type TestServer struct {
	gs *GameSocket
}

func (ts *TestServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ts.gs.UpgradeConnection(w, r)
}

func NewTestServer(t testing.TB) *TestServer {
	mockConn, err := pgxmock.NewConn()
	if err != nil {
		t.Fatal(err)
	}

	u := &models.UserModel{Conn: mockConn}
	g := &models.GameModel{Conn: mockConn}

	gameSocket := NewGameSocket(u, g)
	return &TestServer{gs: gameSocket}
}

func NewDialer(url string) (*websocket.Conn, error) {
	dialer := &websocket.Dialer{}
	conn, _, err := dialer.Dial(strings.Replace(url, "http", "ws", 1), nil)
	return conn, err
}

func MustNewDialer(url string) *websocket.Conn {
	conn, err := NewDialer(url)

	if err != nil {
		panic("could not dial websocket")
	}

	return conn
}
func TestConnect(t *testing.T) {
	t.Run("it should save request data and broadcast new user", func(t *testing.T) {
		done := make(chan bool)
		ts := NewTestServer(t)

		server := httptest.NewServer(ts)
		defer server.Close()

		ts.gs.HandleConnect()
		ts.gs.m.HandleSentMessage(func(s *melody.Session, b []byte) {
			want := `{"id":"2","name":"","team":"","ready":false,"gameId":"1"}`
			if string(b) != want {
				t.Errorf("invalid session data - want: %s, got: %s", want, string(b))
			}
			s.Close()
		})

		ts.gs.m.HandleDisconnect(func(s *melody.Session) {
			close(done)
		})

		conn := MustNewDialer(fmt.Sprintf("%s?gameId=1&userId=2", server.URL))
		conn.ReadMessage()
		defer conn.Close()

		<-done
	})

	t.Run("it should close session if invalid data", func(t *testing.T) {
		done := make(chan bool)
		ts := NewTestServer(t)

		server := httptest.NewServer(ts)
		defer server.Close()

		ts.gs.HandleConnect()
		ts.gs.m.HandleDisconnect(func(s *melody.Session) {
			close(done)
		})

		conn := MustNewDialer(server.URL)
		conn.ReadMessage()
		defer conn.Close()

		<-done
	})
}
