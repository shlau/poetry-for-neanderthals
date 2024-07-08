package models

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
)

type User struct {
	Id        int
	Name      string
	Team      string
	createdAt time.Time
	GameId    int
}

type UserModel struct {
	Conn *pgx.Conn
}

func (u *UserModel) Create(name string, team string, gameId int) (User, error) {
	var id int
	stmt := `INSERT INTO users (name, team, game_id) VALUES($1, $2, $3) RETURNING id`
	err := u.Conn.QueryRow(context.Background(), stmt, name, team, gameId).Scan(&id)

	if err != nil {
		return User{}, err
	}

	return User{Id: id, Name: name, Team: team, GameId: gameId}, nil
}
