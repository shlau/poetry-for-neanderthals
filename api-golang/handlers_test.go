package main

import (
	"bytes"
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/pashagolub/pgxmock/v4"
)

func NewMockServer(t testing.TB) (*http.Server, pgxmock.PgxConnIface) {
	mockConn, err := pgxmock.NewConn()
	if err != nil {
		t.Fatal(err)
	}
	r := chi.NewRouter()
	server := NewServer(r, mockConn)
	return server, mockConn
}

func AssertStatus(t testing.TB, got int, want int) {
	if got != want {
		t.Errorf("got code %d, want code %d", got, want)
	}
}
func TestCreateGame(t *testing.T) {
	t.Run("it returns client error if request params are invalid", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		var jsonData = []byte(`{
		name": "name",
	}`)
		request, _ := http.NewRequest(http.MethodPost, "/api/games", bytes.NewBuffer((jsonData)))
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		AssertStatus(t, response.Code, http.StatusBadRequest)
	})

	t.Run("it returns server error", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())

		request, _ := http.NewRequest(http.MethodPost, `/api/games`, nil)
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		AssertStatus(t, response.Code, http.StatusInternalServerError)
	})

	t.Run("it returns successful status", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		var jsonData = []byte(`{
		"name": "name",
		"team": "team"
		}`)

		conn.ExpectBeginTx(pgx.TxOptions{})
		conn.ExpectQuery("INSERT INTO games DEFAULT VALUES RETURNING id").WillReturnRows(conn.NewRows([]string{"id"}).AddRow(1))
		conn.ExpectQuery(regexp.QuoteMeta("INSERT INTO users (name, team, game_id) VALUES($1, $2, $3) RETURNING id")).WillReturnRows(conn.NewRows([]string{"id"}).AddRow(2)).WithArgs("name", "team", 1)
		conn.ExpectCommit()

		request, _ := http.NewRequest(http.MethodPost, `/api/games`, bytes.NewBuffer(jsonData))
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		AssertStatus(t, response.Code, http.StatusOK)
	})
}

func TestJoinGame(t *testing.T) {
	t.Run("it returns client error if request params are invalid", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		var jsonData = []byte(`{
		name": "name",
		}`)
		request, _ := http.NewRequest(http.MethodPost, `/api/join`, bytes.NewBuffer(jsonData))
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		AssertStatus(t, response.Code, http.StatusBadRequest)

	})

	t.Run("it returns server error when no game exists", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		conn.ExpectBeginTx(pgx.TxOptions{})
		conn.ExpectQuery(regexp.QuoteMeta("SELECT EXISTS(SELECT true FROM games WHERE id = $1)")).WillReturnError(errors.New("invalid game id"))
		conn.ExpectQuery(regexp.QuoteMeta("INSERT INTO users (name, game_id) VALUES($1, $2, $3) RETURNING id")).WillReturnRows(conn.NewRows([]string{"id"})).WithArgs(2)
		conn.ExpectCommit()
		request, _ := http.NewRequest(http.MethodPost, `/api/join?name=name&game_id=1`, nil)
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		AssertStatus(t, response.Code, http.StatusInternalServerError)

	})

	t.Run("it returns successful status", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		var jsonData = []byte(`{
		"name": "name",
		"gameId": 1
		}`)
		conn.ExpectBeginTx(pgx.TxOptions{})
		conn.ExpectQuery(regexp.QuoteMeta("SELECT EXISTS(SELECT true FROM games WHERE id = $1)")).WillReturnRows(conn.NewRows(
			[]string{"id"}).
			AddRow(uint64(1)),
		).WithArgs(1)
		conn.ExpectQuery(regexp.QuoteMeta("INSERT INTO users (name, game_id) VALUES($1, $2, $3) RETURNING id")).WillReturnRows(conn.NewRows([]string{"id"})).WithArgs(2)
		conn.ExpectCommit()
		request, _ := http.NewRequest(http.MethodPost, `/api/join?name=name&game_id=1`, bytes.NewBuffer(jsonData))
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		AssertStatus(t, response.Code, http.StatusOK)
	})

}
