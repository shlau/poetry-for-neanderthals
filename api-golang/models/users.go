package models

import (
	"context"
	"fmt"
	"time"

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

func (u *UserModel) Remove(userId string) error {
	stmt := `DELETE FROM users WHERE id=$1`
	_, err := u.Conn.Exec(context.Background(), stmt, userId)
	if err != nil {
		log.Error("Failed to delete user: ", err.Error())
		return err
	}

	return nil
}

func (u *UserModel) UpdateCol(userId string, col string, val any) error {
	stmt := fmt.Sprintf(`UPDATE users SET %s=$1 WHERE id=$2`, col)
	_, err := u.Conn.Exec(context.Background(), stmt, val, userId)
	if err != nil {
		log.Error("Failed to update user column: ", col, ",", err.Error())
		return err
	}

	return nil
}
