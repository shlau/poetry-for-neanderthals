package models

import (
	"context"
	"regexp"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/pashagolub/pgxmock/v4"
)

func NewMockGameModel(t testing.TB) (GameModel, pgxmock.PgxConnIface) {
	mockConn, err := pgxmock.NewConn()
	if err != nil {
		t.Fatal(err)
	}

	g := GameModel{Conn: mockConn}
	return g, mockConn
}

func TestGameModel(t *testing.T) {
	mockGameModel, mockConn := NewMockGameModel(t)
	defer mockConn.Close(context.Background())

	t.Run("it removes game", func(t *testing.T) {
		mockConn.ExpectExec(regexp.QuoteMeta(`DELETE FROM games WHERE id=$1`)).
			WithArgs("1").
			WillReturnResult(pgxmock.NewResult("DELETE", 1))
		err := mockGameModel.Remove("1")

		if err != nil {
			t.Errorf("unexpected error %s", err)
		}
	})

	t.Run("it updates col", func(t *testing.T) {
		mockConn.ExpectExec(regexp.QuoteMeta(`UPDATE games SET in_progress=$1 WHERE id=$2`)).
			WithArgs(true, "1").
			WillReturnResult(pgxmock.NewResult("UPDATE", 1))
		err := mockGameModel.UpdateCol("1", "in_progress", true)

		if err != nil {
			t.Errorf("unexpected error %s", err)
		}
	})

	t.Run("it updates multiple cols", func(t *testing.T) {
		cols := []GameColumn{{name: "blue_score", val: 2}, {name: "red_score", val: 3}}
		mockConn.ExpectExec(regexp.QuoteMeta(`UPDATE games SET blue_score=$1,red_score=$2 WHERE id=1`)).
			WithArgs(2, 3).
			WillReturnResult(pgxmock.NewResult("UPDATE", 1))
		err := mockGameModel.Update("1", cols)

		if err != nil {
			t.Errorf("unexpected error %s", err)
		}
	})

	t.Run("it adds user to game", func(t *testing.T) {
		mockConn.ExpectBeginTx(pgx.TxOptions{})
		mockConn.ExpectQuery(regexp.QuoteMeta("SELECT EXISTS(SELECT true FROM games WHERE id = $1)")).
			WillReturnRows(mockConn.NewRows([]string{"true"}).AddRow(true)).WithArgs("1")
		mockConn.ExpectQuery(regexp.QuoteMeta("INSERT INTO users (name, game_id) VALUES($1, $2) RETURNING id")).
			WillReturnRows(mockConn.NewRows([]string{"id"}).AddRow("2")).WithArgs("username", "1")
		mockConn.ExpectCommit()
		_, err := mockGameModel.Join("username", "1")

		if err != nil {
			t.Errorf("unexpected error %s", err)
		}
	})

	t.Run("it creates new game", func(t *testing.T) {
		mockConn.ExpectBeginTx(pgx.TxOptions{})
		mockConn.ExpectQuery("INSERT INTO games DEFAULT VALUES RETURNING id").
			WillReturnRows(mockConn.NewRows([]string{"id"}).AddRow("1"))
		mockConn.ExpectQuery(regexp.QuoteMeta("INSERT INTO users (name, team, game_id) VALUES($1, $2, $3) RETURNING id")).
			WillReturnRows(mockConn.NewRows([]string{"id"}).AddRow(2)).
			WithArgs("username", "blue", "1")
		mockConn.ExpectCommit()
		_, err := mockGameModel.Create("username", "blue")

		if err != nil {
			t.Errorf("unexpected error %s", err)
		}
	})

	t.Run("it returns all users of a game", func(t *testing.T) {
		values := [][]any{
			{
				"1", "John", "blue", true, "1",
			},
			{
				"2", "Jane", "blue", true, "1",
			},
			{
				"3", "Peter", "red", false, "1",
			},
			{
				"4", "Emily", "red", false, "1",
			},
		}
		mockConn.ExpectQuery(regexp.QuoteMeta("SELECT id,name,team,ready,game_id FROM users WHERE game_id=$1")).
			WithArgs("1").
			WillReturnRows(mockConn.NewRows([]string{"id", "name", "team", "ready", "game_id"}).
				AddRows(values...))
		users := mockGameModel.Users("1")

		for i, user := range users {
			if user.Name != values[i][1] {
				t.Errorf("unexpected user want: %s , got: %s ", values[i][1], user.Name)
			}
		}
	})
}
