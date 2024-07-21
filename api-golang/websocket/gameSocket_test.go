package websocket

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"

	"github.com/gorilla/websocket"
	"github.com/olahol/melody"
	"github.com/pashagolub/pgxmock/v4"
	"poetry.sheldonlau.com/models"
)

type TestServer struct {
	gs       *GameSocket
	mockConn pgxmock.PgxConnIface
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
	return &TestServer{gs: gameSocket, mockConn: mockConn}
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

		ts.mockConn.ExpectQuery(regexp.QuoteMeta(`SELECT id,name,team,ready,game_id FROM users WHERE game_id=$1`)).
			WithArgs("1").
			WillReturnRows(pgxmock.NewRows([]string{"id", "name", "team", "ready", "game_id"}).
				AddRow("2", "new name", "blue", false, "1"))

		ts.gs.HandleConnect()
		ts.gs.m.HandleSentMessage(func(s *melody.Session, b []byte) {
			want := `{"data":[{"id":"2","name":"new name","team":"blue","ready":false,"gameId":"1"}],"type":"users"}`
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

	t.Run("it handles user update message", func(t *testing.T) {
		done := make(chan bool)
		ts := NewTestServer(t)
		msg := `update:users:1:team:blue`
		want := `{"data":[{"id":"2","name":"new name","team":"blue","ready":false,"gameId":"1"}],"type":"users"}`
		i := 0

		server := httptest.NewServer(ts)
		defer server.Close()

		// broadcast users on connect
		ts.mockConn.ExpectQuery(regexp.QuoteMeta(`SELECT id,name,team,ready,game_id FROM users WHERE game_id=$1`)).
			WithArgs("1").
			WillReturnRows(pgxmock.NewRows([]string{"id", "name", "team", "ready", "game_id"}).
				AddRow("2", "new name", "blue", false, "1"))

		// update specified user
		ts.mockConn.ExpectExec(regexp.QuoteMeta(`UPDATE users SET team=$1 WHERE id=$2`)).
			WithArgs("blue", "1").
			WillReturnResult(pgxmock.NewResult("UPDATE", 1))

		// broadcast users on update
		ts.mockConn.ExpectQuery(regexp.QuoteMeta(`SELECT id,name,team,ready,game_id FROM users WHERE game_id=$1`)).
			WithArgs("1").
			WillReturnRows(pgxmock.NewRows([]string{"id", "name", "team", "ready", "game_id"}).
				AddRow("2", "new name", "blue", false, "1"))

		ts.gs.HandleConnect()
		ts.gs.HandleMessage()
		ts.gs.m.HandleSentMessage(func(s *melody.Session, b []byte) {
			if string(b) != want {
				t.Errorf("invalid session data - want: %s, got: %s", want, string(b))
			}
			if i == 1 {
				s.Close()
			}
			i++
		})
		ts.gs.m.HandleDisconnect(func(s *melody.Session) {
			close(done)
		})
		conn := MustNewDialer(fmt.Sprintf("%s?gameId=1&userId=2", server.URL))
		conn.WriteMessage(websocket.TextMessage, []byte(msg))
		conn.ReadMessage()
		defer conn.Close()

		<-done
	})

	t.Run("it handles echo message", func(t *testing.T) {
		done := make(chan bool)
		ts := NewTestServer(t)
		msg := `echo:start`
		wantConnect := `{"data":[{"id":"2","name":"new name","team":"blue","ready":false,"gameId":"1"}],"type":"users"}`
		wantEcho := `{"data":"start","type":"echo"}`
		i := 0

		server := httptest.NewServer(ts)
		defer server.Close()

		ts.mockConn.ExpectQuery(regexp.QuoteMeta(`SELECT id,name,team,ready,game_id FROM users WHERE game_id=$1`)).
			WithArgs("1").
			WillReturnRows(pgxmock.NewRows([]string{"id", "name", "team", "ready", "game_id"}).
				AddRow("2", "new name", "blue", false, "1"))

		ts.gs.HandleConnect()
		ts.gs.HandleMessage()
		ts.gs.m.HandleSentMessage(func(s *melody.Session, b []byte) {
			if i == 0 {
				if string(b) != wantConnect {
					t.Errorf("invalid session data - want: %s, got: %s", wantConnect, string(b))
				}

			}
			if i == 1 {
				if string(b) != wantEcho {
					t.Errorf("invalid session data - want: %s, got: %s", wantEcho, string(b))
				}
				s.Close()
			}

			i++
		})
		ts.gs.m.HandleDisconnect(func(s *melody.Session) {
			close(done)
		})
		conn := MustNewDialer(fmt.Sprintf("%s?gameId=1&userId=2", server.URL))
		conn.WriteMessage(websocket.TextMessage, []byte(msg))
		conn.ReadMessage()
		defer conn.Close()

		<-done
	})
}
