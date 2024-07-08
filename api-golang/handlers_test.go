package main

import (
	"context"
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
		request, _ := http.NewRequest(http.MethodPost, "/api/games", nil)
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		AssertStatus(t, response.Code, http.StatusBadRequest)
	})

	t.Run("it returns server error", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		request, _ := http.NewRequest(http.MethodPost, `/api/games?name=name&team=team`, nil)
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		AssertStatus(t, response.Code, http.StatusInternalServerError)
	})

	t.Run("it returns successful status", func(t *testing.T) {
		server, conn := NewMockServer(t)
		defer conn.Close(context.Background())
		conn.ExpectBeginTx(pgx.TxOptions{})
		conn.ExpectQuery("INSERT INTO games DEFAULT VALUES RETURNING id").WillReturnRows(conn.NewRows([]string{"id"}).AddRow(1))
		conn.ExpectQuery(regexp.QuoteMeta("INSERT INTO users (name, team, game_id) VALUES($1, $2, $3) RETURNING id")).WillReturnRows(conn.NewRows([]string{"id"}).AddRow(2)).WithArgs("name", "team", 1)
		conn.ExpectCommit()

		request, _ := http.NewRequest(http.MethodPost, `/api/games?name=name&team=team`, nil)
		response := httptest.NewRecorder()
		server.Handler.ServeHTTP(response, request)

		AssertStatus(t, response.Code, http.StatusOK)
	})
}
