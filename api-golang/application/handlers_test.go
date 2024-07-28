package application

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
	"poetry.sheldonlau.com/util"
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

func TestCreateGame(t *testing.T) {
	t.Run("it returns client error if request params are invalid", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		var jsonData = []byte(`{ name": "name", }`)
		request, _ := http.NewRequest(http.MethodPost, "/api/games", bytes.NewBuffer((jsonData)))
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		util.AssertStatus(t, response.Code, http.StatusBadRequest)
	})

	t.Run("it returns server error", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		conn.ExpectBeginTx(pgx.TxOptions{}).WillReturnError(errors.New("failed transaction"))
		var jsonData = []byte(`{ "name": "name" }`)
		request, _ := http.NewRequest(http.MethodPost, "/api/games", bytes.NewBuffer((jsonData)))
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		util.AssertStatus(t, response.Code, http.StatusInternalServerError)
	})

	t.Run("it returns successful status", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		var jsonData = []byte(`{
		"name": "name",
		"team": "team"
		}`)

		conn.ExpectBeginTx(pgx.TxOptions{})
		conn.ExpectQuery("INSERT INTO games DEFAULT VALUES RETURNING id").
			WillReturnRows(conn.NewRows([]string{"id"}).AddRow("1"))
		conn.ExpectQuery(regexp.QuoteMeta("INSERT INTO users (name, team, game_id) VALUES($1, $2, $3) RETURNING id")).
			WillReturnRows(conn.NewRows([]string{"id"}).AddRow(2)).
			WithArgs("name", "team", "1")
		conn.ExpectCommit()

		request, _ := http.NewRequest(http.MethodPost, `/api/games`, bytes.NewBuffer(jsonData))
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		util.AssertStatus(t, response.Code, http.StatusOK)
	})
}

func TestJoinGame(t *testing.T) {
	t.Run("it returns client error if request params are invalid", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		var jsonData = []byte(`{ "name": "name" }`)
		request, _ := http.NewRequest(http.MethodPost, `/api/join`, bytes.NewBuffer(jsonData))
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		util.AssertStatus(t, response.Code, http.StatusBadRequest)
	})

	t.Run("it returns client error when game is in progress", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		conn.ExpectQuery(regexp.QuoteMeta("SELECT red_poet_idx, blue_poet_idx, red_score, blue_score, in_progress FROM games WHERE id=$1")).
			WillReturnRows(conn.NewRows([]string{"red_poet_idx", "blue_poet_idx", "red_score", "blue_score", "in_progress"}).AddRow(1, 1, 1, 1, true)).WithArgs("1")
		var jsonData = []byte(`{ "name": "name", "gameId": "1" }`)
		request, _ := http.NewRequest(http.MethodPost, `/api/join`, bytes.NewBuffer(jsonData))
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		util.AssertStatus(t, response.Code, http.StatusBadRequest)
	})
	t.Run("it returns server error when no game exists", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		conn.ExpectQuery(regexp.QuoteMeta("SELECT red_poet_idx, blue_poet_idx, red_score, blue_score, in_progress FROM games WHERE id=$1")).
			WillReturnRows(conn.NewRows([]string{"in_progress"}).AddRow(false)).WithArgs("1")
		conn.ExpectBeginTx(pgx.TxOptions{})
		conn.ExpectQuery(regexp.QuoteMeta("SELECT EXISTS(SELECT true FROM games WHERE id = $1)")).WithArgs("1").
			WillReturnError(errors.New("invalid game id"))
		conn.ExpectQuery(regexp.QuoteMeta("INSERT INTO users (name, game_id) VALUES($1, $2, $3) RETURNING id")).
			WillReturnRows(conn.NewRows([]string{"id"})).WithArgs(2)
		conn.ExpectCommit()
		var jsonData = []byte(`{ "name": "name", "gameId": "1" }`)
		request, _ := http.NewRequest(http.MethodPost, `/api/join`, bytes.NewBuffer(jsonData))
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		util.AssertStatus(t, response.Code, http.StatusInternalServerError)
	})

	t.Run("it returns successful status", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		var jsonData = []byte(`{"name": "name", "gameId": "1"}`)
		conn.ExpectQuery(regexp.QuoteMeta("SELECT red_poet_idx, blue_poet_idx, red_score, blue_score, in_progress FROM games WHERE id=$1")).
			WillReturnRows(conn.NewRows([]string{"in_progress"}).AddRow(false)).WithArgs("1")
		conn.ExpectBeginTx(pgx.TxOptions{})
		conn.ExpectQuery(regexp.QuoteMeta("SELECT EXISTS(SELECT true FROM games WHERE id = $1)")).
			WillReturnRows(conn.NewRows([]string{"true"}).AddRow(true)).WithArgs("1")
		conn.ExpectQuery(regexp.QuoteMeta("INSERT INTO users (name, game_id) VALUES($1, $2) RETURNING id")).
			WillReturnRows(conn.NewRows([]string{"id"}).AddRow("2")).WithArgs("name", "1")
		conn.ExpectCommit()
		request, _ := http.NewRequest(http.MethodPost, `/api/join`, bytes.NewBuffer(jsonData))
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		util.AssertStatus(t, response.Code, http.StatusOK)
	})

}
