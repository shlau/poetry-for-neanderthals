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

func (ts *TestServer) ExpectConnect() {
	ts.mockConn.ExpectQuery(regexp.QuoteMeta(`SELECT id,name,team,ready,game_id FROM users WHERE game_id=$1`)).
		WithArgs("mockGameId").
		WillReturnRows(pgxmock.NewRows([]string{"id", "name", "team", "ready", "game_id"}).
			AddRow("mockUserId", "mockUserName", "blueTeam", false, "mockGameId"))
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

func GetDialerConn(server *httptest.Server) *websocket.Conn {
	return MustNewDialer(fmt.Sprintf("%s?gameId=mockGameId&userId=mockUserId", server.URL))
}

func AssertMessage(t testing.TB, b []byte, want string) {
	if string(b) != want {
		t.Errorf("invalid session data - want: %s, got: %s", want, string(b))
	}
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

		ts.ExpectConnect()
		ts.gs.handleConnect()
		ts.gs.m.HandleSentMessage(func(s *melody.Session, b []byte) {
			want := `{"data":[{"id":"mockUserId","name":"mockUserName","team":"blueTeam","ready":false,"gameId":"mockGameId"}],"type":"users"}`
			AssertMessage(t, b, want)
			s.Close()
		})

		ts.gs.m.HandleDisconnect(func(s *melody.Session) {
			close(done)
		})

		conn := GetDialerConn(server)
		conn.ReadMessage()
		defer conn.Close()

		<-done
	})

	t.Run("it should close session if invalid data", func(t *testing.T) {
		done := make(chan bool)
		ts := NewTestServer(t)

		server := httptest.NewServer(ts)
		defer server.Close()

		ts.gs.handleConnect()
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
		msg := `update:users:mockUserId:team:blueTeam`
		want := `{"data":[{"id":"mockUserId","name":"mockUserName","team":"blueTeam","ready":false,"gameId":"mockGameId"}],"type":"users"}`
		i := 0

		server := httptest.NewServer(ts)
		defer server.Close()

		// broadcast users on connect
		ts.ExpectConnect()

		// update specified user
		ts.mockConn.ExpectExec(regexp.QuoteMeta(`UPDATE users SET team=$1 WHERE id=$2`)).
			WithArgs("blueTeam", "mockUserId").
			WillReturnResult(pgxmock.NewResult("UPDATE", 1))

		// broadcast users on update
		ts.mockConn.ExpectQuery(regexp.QuoteMeta(`SELECT id,name,team,ready,game_id FROM users WHERE game_id=$1`)).
			WithArgs("mockGameId").
			WillReturnRows(pgxmock.NewRows([]string{"id", "name", "team", "ready", "game_id"}).
				AddRow("mockUserId", "mockUserName", "blueTeam", false, "mockGameId"))

		ts.gs.handleConnect()
		ts.gs.HandleMessage()
		ts.gs.m.HandleSentMessage(func(s *melody.Session, b []byte) {
			AssertMessage(t, b, want)
			if i == 1 {
				s.Close()
			}
			i++
		})
		ts.gs.m.HandleDisconnect(func(s *melody.Session) {
			close(done)
		})
		conn := GetDialerConn(server)
		conn.WriteMessage(websocket.TextMessage, []byte(msg))
		conn.ReadMessage()
		defer conn.Close()

		<-done
	})

	t.Run("it handles echo message", func(t *testing.T) {
		done := make(chan bool)
		ts := NewTestServer(t)
		msg := `echo:start`
		wantConnect := `{"data":[{"id":"mockUserId","name":"mockUserName","team":"blueTeam","ready":false,"gameId":"mockGameId"}],"type":"users"}`
		wantEcho := `{"data":"start","type":"echo"}`
		i := 0

		server := httptest.NewServer(ts)
		defer server.Close()

		ts.ExpectConnect()
		ts.gs.handleConnect()
		ts.gs.HandleMessage()
		ts.gs.m.HandleSentMessage(func(s *melody.Session, b []byte) {
			if i == 0 {
				AssertMessage(t, b, wantConnect)

			}
			if i == 1 {
				AssertMessage(t, b, wantEcho)
				s.Close()
			}

			i++
		})
		ts.gs.m.HandleDisconnect(func(s *melody.Session) {
			close(done)
		})
		conn := GetDialerConn(server)
		conn.WriteMessage(websocket.TextMessage, []byte(msg))
		conn.ReadMessage()
		defer conn.Close()

		<-done
	})

	t.Run("it handles resume round", func(t *testing.T) {
		done := make(chan bool)
		ts := NewTestServer(t)
		msg := `resumeRound:10`
		want := `{"data":10,"type":"resumeRound"}`
		i := 0

		server := httptest.NewServer(ts)
		defer server.Close()

		ts.ExpectConnect()
		ts.gs.handleConnect()
		ts.gs.HandleMessage()
		ts.gs.m.HandleSentMessage(func(s *melody.Session, b []byte) {
			if i == 1 {
				AssertMessage(t, b, want)
				s.Close()
			}

			i++
		})
		ts.gs.m.HandleDisconnect(func(s *melody.Session) {
			close(done)
		})
		conn := GetDialerConn(server)
		conn.WriteMessage(websocket.TextMessage, []byte(msg))
		conn.ReadMessage()
		defer conn.Close()

		<-done
	})

	t.Run("it handles score change", func(t *testing.T) {
		done := make(chan bool)
		ts := NewTestServer(t)
		msg := `score:red_score:3`
		want := `{"data":"2:4","type":"score"}`
		i := 0

		server := httptest.NewServer(ts)
		defer server.Close()

		ts.ExpectConnect()
		ts.mockConn.ExpectQuery(regexp.QuoteMeta(`UPDATE games SET red_score=red_score+$1 WHERE id=$2 RETURNING red_score`)).
			WillReturnRows(ts.mockConn.NewRows([]string{"red_score"}).
				AddRow(4)).
			WithArgs("3", "mockGameId")
		ts.mockConn.ExpectQuery(regexp.QuoteMeta(`SELECT words FROM games WHERE id=$1`)).
			WillReturnRows(ts.mockConn.NewRows([]string{"words"}).
				AddRow(`{"easy":"easy_word", "hard":"hard_word"}`)).
			WithArgs("mockGameId")

		ts.gs.handleConnect()
		ts.gs.HandleMessage()
		ts.gs.m.HandleSentMessage(func(s *melody.Session, b []byte) {
			if i == 1 {
				AssertMessage(t, b, want)
				s.Close()
			}

			i++
		})
		ts.gs.m.HandleDisconnect(func(s *melody.Session) {
			close(done)
		})
		conn := GetDialerConn(server)
		conn.WriteMessage(websocket.TextMessage, []byte(msg))
		conn.ReadMessage()
		defer conn.Close()

		<-done
	})

	t.Run("it handles startGame", func(t *testing.T) {
		done := make(chan bool)
		ts := NewTestServer(t)
		msg := `startGame`
		wantPoetChange := `{"data":"poetId","type":"poetChange"}`
		wantEcho := `{"data":"startGame","type":"echo"}`
		i := 0

		server := httptest.NewServer(ts)
		defer server.Close()

		ts.ExpectConnect()
		ts.mockConn.ExpectExec(regexp.QuoteMeta(`UPDATE games SET in_progress=$1 WHERE id=$2`)).
			WithArgs(true, "mockGameId").
			WillReturnResult(pgxmock.NewResult("UPDATE", 1))
		ts.mockConn.ExpectQuery(regexp.QuoteMeta("SELECT id,name,team,ready,game_id FROM users WHERE game_id=$1 ORDER BY id")).
			WithArgs("mockGameId").
			WillReturnRows(ts.mockConn.NewRows([]string{"id", "name", "team", "ready", "game_id"}).
				AddRows([]any{"poetId", "John", "1", true, "mockGameId"}))

		ts.gs.handleConnect()
		ts.gs.HandleMessage()
		ts.gs.m.HandleSentMessage(func(s *melody.Session, b []byte) {
			if i == 1 {
				AssertMessage(t, b, wantEcho)
				s.Close()
			}
			if i == 2 {
				AssertMessage(t, b, wantPoetChange)
				s.Close()
			}

			i++
		})
		ts.gs.m.HandleDisconnect(func(s *melody.Session) {
			close(done)
		})
		conn := GetDialerConn(server)
		conn.WriteMessage(websocket.TextMessage, []byte(msg))
		conn.ReadMessage()
		defer conn.Close()

		<-done
	})

	t.Run("it handles endRound", func(t *testing.T) {
		done := make(chan bool)
		ts := NewTestServer(t)
		msg := `endRound:1`
		wantPoetChange := `{"data":"poetId","type":"poetChange"}`
		wantEcho := `{"data":"endRound","type":"echo"}`
		i := 0

		server := httptest.NewServer(ts)
		defer server.Close()

		ts.ExpectConnect()
		ts.mockConn.ExpectQuery(regexp.QuoteMeta("SELECT id,name,team,ready,game_id FROM users WHERE game_id=$1 ORDER BY id")).
			WithArgs("mockGameId").
			WillReturnRows(ts.mockConn.NewRows([]string{"id", "name", "team", "ready", "game_id"}).
				AddRows([]any{"mockUserId", "John", "blueTeam", true, "mockGameId"}, []any{"poetId", "Ann", "2", true, "1"}))
		ts.mockConn.ExpectQuery(regexp.QuoteMeta("SELECT red_poet_idx, blue_poet_idx, red_score, blue_score, in_progress FROM games WHERE id=$1")).
			WithArgs("mockGameId").
			WillReturnRows(ts.mockConn.NewRows([]string{"red_poet_idx", "blue_poet_idx", "red_score", "blue_score", "in_progress"}).
				AddRows([]any{0, 0, 0, 0, true}))
		ts.mockConn.ExpectQuery(regexp.QuoteMeta(`UPDATE games SET blue_poet_idx=blue_poet_idx+$1 WHERE id=$2 RETURNING blue_poet_idx`)).WillReturnRows(ts.mockConn.NewRows([]string{"blue_poet_idx"}).
			AddRow(3)).
			WithArgs("1", "mockGameId")

		ts.gs.handleConnect()
		ts.gs.HandleMessage()
		ts.gs.m.HandleSentMessage(func(s *melody.Session, b []byte) {
			if i == 1 {
				AssertMessage(t, b, wantEcho)
				s.Close()
			}
			if i == 2 {
				AssertMessage(t, b, wantPoetChange)
				s.Close()
			}

			i++
		})
		ts.gs.m.HandleDisconnect(func(s *melody.Session) {
			close(done)
		})
		conn := GetDialerConn(server)
		conn.WriteMessage(websocket.TextMessage, []byte(msg))
		conn.ReadMessage()
		defer conn.Close()

		<-done
	})

	t.Run("it randomizes teams", func(t *testing.T) {
		done := make(chan bool)
		ts := NewTestServer(t)
		msg := `randomize`
		want := `{"data":[{"id":"poetId","name":"John","team":"blueTeam","ready":true,"gameId":"mockGameId"},{"id":"mockUserId","name":"Ann","team":"redTeam","ready":true,"gameId":"mockGameId"}],"type":"users"}`
		i := 0

		server := httptest.NewServer(ts)
		defer server.Close()

		ts.ExpectConnect()
		ts.mockConn.ExpectExec(regexp.QuoteMeta(`UPDATE users SET team=ceil(random()*2) WHERE game_id=$1`)).
			WithArgs("mockGameId").
			WillReturnResult(pgxmock.NewResult("UPDATE", 1))
		ts.mockConn.ExpectQuery(regexp.QuoteMeta("SELECT id,name,team,ready,game_id FROM users WHERE game_id=$1 ORDER BY id")).
			WithArgs("mockGameId").
			WillReturnRows(ts.mockConn.NewRows([]string{"id", "name", "team", "ready", "game_id"}).
				AddRows([]any{"poetId", "John", "blueTeam", true, "mockGameId"}, []any{"mockUserId", "Ann", "redTeam", true, "mockGameId"}))

		ts.gs.handleConnect()
		ts.gs.HandleMessage()
		ts.gs.m.HandleSentMessage(func(s *melody.Session, b []byte) {
			if i == 1 {
				AssertMessage(t, b, want)
				s.Close()
			}

			i++
		})
		ts.gs.m.HandleDisconnect(func(s *melody.Session) {
			close(done)
		})
		conn := GetDialerConn(server)
		conn.WriteMessage(websocket.TextMessage, []byte(msg))
		conn.ReadMessage()
		defer conn.Close()

		<-done
	})
}
