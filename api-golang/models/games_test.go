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

	t.Run("it randomizes game teams", func(t *testing.T) {
		mockConn.ExpectExec(regexp.QuoteMeta(`UPDATE users SET team=ceil(random()*2) WHERE game_id=$1`)).
			WithArgs("1").
			WillReturnResult(pgxmock.NewResult("UPDATE", 1))
		err := mockGameModel.RandomizeTeams("1")

		if err != nil {
			t.Errorf("unexpected error %s", err)
		}
	})

	// TODO: pgxmock doesn't decode json? Alternatives to unit testing jsonb col
	// t.Run("it removes and returns random word", func(t *testing.T) {
	// 	word := Word{Easy: "easy word", Hard: "hard word"}
	// 	words := []Word{word}
	// 	b, err := json.Marshal(words)
	// 	if err != nil {
	// 		t.Errorf("unexpected error while encoding: %s", err)
	// 	}
	// 	mockConn.ExpectQuery(regexp.QuoteMeta(`SELECT words FROM games WHERE id=$1`)).
	// 		WillReturnRows(mockConn.NewRows([]string{"words"}).
	// 			AddRow(b)).
	// 		WithArgs("1")
	// 	mockConn.ExpectExec(regexp.QuoteMeta(`UPDATE games SET words=$1 WHERE id=$2`)).
	// 		WithArgs("'[]'", "1").
	// 		WillReturnResult(pgxmock.NewResult("UPDATE", 1))
	// 	mockGameModel.NextWord("1")
	// })

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

	t.Run("it updates score", func(t *testing.T) {
		mockConn.ExpectQuery(regexp.QuoteMeta(`UPDATE games SET blue_score=blue_score+$1 WHERE id=$2 RETURNING blue_score`)).WillReturnRows(mockConn.NewRows([]string{"blue_score"}).
			AddRow(3)).
			WithArgs("2", "1")
		score, err := mockGameModel.IncreaseValue("1", "blue_score", "2")

		if err != nil {
			t.Errorf("unexpected error %s", err)
		}

		if score != 3 {
			t.Errorf("incorrect score, want %d, got %d", 3, score)
		}
	})

	t.Run("it updates multiple cols", func(t *testing.T) {
		cols := []GameColumn{{Name: "blue_score", Val: 2}, {Name: "red_score", Val: 3}}
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
			WithArgs("username", "1", "1")
		mockConn.ExpectCommit()
		_, err := mockGameModel.Create("username", "1")

		if err != nil {
			t.Errorf("unexpected error %s", err)
		}
	})

	t.Run("it returns all users of a game", func(t *testing.T) {
		values := [][]any{
			{
				"1", "John", "1", true, "1",
			},
			{
				"2", "Jane", "1", true, "1",
			},
			{
				"3", "Peter", "2", false, "1",
			},
			{
				"4", "Emily", "2", false, "1",
			},
		}
		mockConn.ExpectQuery(regexp.QuoteMeta("SELECT id,name,team,ready,game_id FROM users WHERE game_id=$1 ORDER BY id")).
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

	t.Run("it resets the game", func(t *testing.T) {
		mockConn.ExpectExec(regexp.QuoteMeta(`UPDATE games SET red_poet_idx=DEFAULT,blue_poet_idx=DEFAULT,blue_score=DEFAULT,red_score=DEFAULT,in_progress=DEFAULT,words=DEFAULT WHERE id=$1`)).
			WithArgs("1").
			WillReturnResult(pgxmock.NewResult("UPDATE", 1))
		err := mockGameModel.Reset("1")
		if err != nil {
			t.Errorf("unexpected error %s", err)
		}
	})
}
