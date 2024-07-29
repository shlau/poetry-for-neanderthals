package models

import (
	"context"
	"fmt"
	"slices"
	"time"

	"github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
	"poetry.sheldonlau.com/db"
)

type User struct {
	Id        string `json:"id"`
	Name      string `json:"name" required:"true"`
	Team      string `json:"team"`
	Ready     bool   `json:"ready"`
	createdAt time.Time
	GameId    string `json:"gameId"`
}

type UserModel struct {
	Conn db.DbConn
}

func (u *UserModel) Get(userId string) (*User, error) {
	user := new(User)
	stmt := `SELECT id,name,team,ready,game_id FROM users WHERE id=$1`
	err := u.Conn.QueryRow(context.Background(), stmt, userId).
		Scan(&user.Id, &user.Name, &user.Team, &user.Ready, &user.GameId)

	if err != nil {
		log.Error("Failed to get game: ", err.Error())
		return user, err
	}

	return user, nil
}

func (u *UserModel) Create(name string, team string, gameId string) (User, error) {
	var id string
	stmt := `INSERT INTO users (name, team, game_id) VALUES($1, $2, $3) RETURNING id`
	err := u.Conn.QueryRow(context.Background(), stmt, name, team, gameId).Scan(&id)

	if err != nil {
		log.Error("Failed to create user: ", err.Error())
		return User{}, err
	}

	return User{Id: id, Name: name, Team: team, GameId: gameId}, nil
}

func (u *UserModel) Remove(userId string, gameId string) (int, error) {
	ctx := context.Background()
	tx, err := u.Conn.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Error("Failed to start transaction for user removal: ", err.Error())
		return -1, err
	}

	defer tx.Rollback(ctx)

	stmt := `DELETE FROM users WHERE id=$1`
	_, err = u.Conn.Exec(ctx, stmt, userId)
	if err != nil {
		log.Error("Failed to delete user: ", err.Error())
		return -1, err
	}

	var numUsers int
	stmt = `SELECT COUNT(*) FROM users WHERE game_id=$1`
	err = u.Conn.QueryRow(ctx, stmt, gameId).Scan(&numUsers)
	if err != nil {
		log.Error("Failed to get user count: ", err.Error())
		return -1, err
	}

	if numUsers == 0 {
		stmt = `DELETE FROM games WHERE id=$1`
		_, err = u.Conn.Exec(ctx, stmt, gameId)
		if err != nil {
			log.Error("Failed to delete game: ", err.Error())
			return -1, err
		}
	}

	if err = tx.Commit(ctx); err != nil {
		log.Error("Failed to commit transaction for user removal: ", err.Error())
		return -1, err
	}

	return numUsers, nil
}

func (u *UserModel) UpdateCol(userId string, col string, val any) error {
	validCols := []string{"ready", "team"}
	if slices.Contains(validCols, col) {
		stmt := fmt.Sprintf(`UPDATE users SET %s=$1 WHERE id=$2`, col)
		_, err := u.Conn.Exec(context.Background(), stmt, val, userId)
		if err != nil {
			log.Error("Failed to update user column: ", col, ",", err.Error())
			return err
		}

		return nil
	}

	return fmt.Errorf("invalid column for users table %s", col)
}
