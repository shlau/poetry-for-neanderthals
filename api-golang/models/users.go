package models

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
)

type User struct {
	id        int
	name      string
	team      string
	createdAt time.Time
	gameId    int
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

	return User{id: id, name: name, team: team, gameId: gameId}, nil
}
