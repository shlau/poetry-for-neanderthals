package models

import (
	"context"
	"regexp"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/pashagolub/pgxmock/v4"
)

func NewMockUserModel(t testing.TB) (UserModel, pgxmock.PgxConnIface) {
	mockConn, err := pgxmock.NewConn()
	if err != nil {
		t.Fatal(err)
	}

	u := UserModel{Conn: mockConn}
	return u, mockConn
}

func TestUserModel(t *testing.T) {
	mockUserModel, mockConn := NewMockUserModel(t)
	defer mockConn.Close(context.Background())
	t.Run("it creates user", func(t *testing.T) {
		mockConn.ExpectQuery(regexp.QuoteMeta(`INSERT INTO users (name, team, game_id) VALUES($1, $2, $3) RETURNING id`)).
			WithArgs("mockUserName", "blueTeam", "mockGameId").
			WillReturnRows(pgxmock.NewRows([]string{"id"}).
				AddRow("mockUserId"))

		user, err := mockUserModel.Create("mockUserName", "blueTeam", "mockGameId")
		if err != nil {
			t.Errorf("unexpected error %s", err)
		}

		if user.Name != "mockUserName" || user.Team != "blueTeam" || user.GameId != "mockGameId" {
			t.Errorf("unexpected output want: %s %s %s, got: %s %s %s", "mockUserName", "blueTeam", "mockGameId", user.Name, user.Team, user.GameId)
		}
	})

	t.Run("it removes user", func(t *testing.T) {
		mockConn.ExpectBeginTx(pgx.TxOptions{})
		mockConn.ExpectExec(regexp.QuoteMeta(`DELETE FROM users WHERE id=$1`)).
			WithArgs("mockUserId").WillReturnResult(pgxmock.NewResult("DELETE", 1))
		mockConn.ExpectQuery(regexp.QuoteMeta(`SELECT COUNT(*) FROM users WHERE game_id=$1`)).
			WithArgs("mockGameId").
			WillReturnRows(pgxmock.NewRows([]string{"COUNT"}).
				AddRow(3))
		mockConn.ExpectCommit()
		_, err := mockUserModel.Remove("mockUserId", "mockGameId")
		if err != nil {
			t.Errorf("unexpected error %s", err)
		}
	})

	t.Run("it removes user and game if no more users", func(t *testing.T) {
		mockConn.ExpectBeginTx(pgx.TxOptions{})
		mockConn.ExpectExec(regexp.QuoteMeta(`DELETE FROM users WHERE id=$1`)).
			WithArgs("mockUserId").WillReturnResult(pgxmock.NewResult("DELETE", 1))
		mockConn.ExpectQuery(regexp.QuoteMeta(`SELECT COUNT(*) FROM users WHERE game_id=$1`)).
			WithArgs("mockGameId").
			WillReturnRows(pgxmock.NewRows([]string{"COUNT"}).
				AddRow(0))
		mockConn.ExpectExec(regexp.QuoteMeta(`DELETE FROM games WHERE id=$1`)).
			WithArgs("mockGameId").WillReturnResult(pgxmock.NewResult("DELETE", 1))
		mockConn.ExpectCommit()
		_, err := mockUserModel.Remove("mockUserId", "mockGameId")
		if err != nil {
			t.Errorf("unexpected error %s", err)
		}
	})

	t.Run("it updates value", func(t *testing.T) {
		mockConn.ExpectExec(regexp.QuoteMeta(`UPDATE users SET team=$1 WHERE id=$2`)).
			WithArgs("blueTeam", "mockUserId").
			WillReturnResult(pgxmock.NewResult("UPDATE", 1))
		err := mockUserModel.UpdateCol("mockUserId", "team", "blueTeam")
		if err != nil {
			t.Errorf("unexpected error %s", err)
		}
	})
}
