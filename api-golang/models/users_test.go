package models

import (
	"context"
	"regexp"
	"testing"

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
			WithArgs("username", "blue", "1").
			WillReturnRows(pgxmock.NewRows([]string{"id"}).
				AddRow("1"))

		user, err := mockUserModel.Create("username", "blue", "1")
		if err != nil {
			t.Errorf("unexpected error %s", err)
		}

		if user.Name != "username" || user.Team != "blue" || user.GameId != "1" {
			t.Errorf("unexpected output want: %s %s %s, got: %s %s %s", "username", "blue", "1", user.Name, user.Team, user.GameId)
		}
	})

	t.Run("it removes user", func(t *testing.T) {
		mockConn.ExpectExec(regexp.QuoteMeta(`DELETE FROM users WHERE id=$1`)).
			WithArgs("1").WillReturnResult(pgxmock.NewResult("DELETE", 1))

		err := mockUserModel.Remove("1")
		if err != nil {
			t.Errorf("unexpected error %s", err)
		}
	})

	t.Run("it updates value", func(t *testing.T) {
		mockConn.ExpectExec(regexp.QuoteMeta(`UPDATE users SET team=$1 WHERE id=$2`)).
			WithArgs("blue", "1").
			WillReturnResult(pgxmock.NewResult("UPDATE", 1))
		err := mockUserModel.UpdateCol("1", "team", "blue")
		if err != nil {
			t.Errorf("unexpected error %s", err)
		}
	})
}
