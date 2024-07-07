package models

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
)

type Game struct {
	id         int
	InProgress bool
	createdAt  time.Time
	poetIdx    int
	redScore   int
	blueScore  int
}

type GameModel struct {
	Conn *pgx.Conn
}

func (g *GameModel) Create(username string, team string) (User, error) {
	ctx := context.Background()
	tx, err := g.Conn.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return User{}, err
	}

	defer tx.Rollback(ctx)

	var gameId int
	stmt := `INSERT INTO games DEFAULT VALUES RETURNING id`
	err = g.Conn.QueryRow(ctx, stmt).Scan(&gameId)
	if err != nil {
		return User{}, err
	}

	var userId int
	stmt = `INSERT INTO users (name, team, game_id) VALUES($1, $2, $3) RETURNING id`
	err = g.Conn.QueryRow(ctx, stmt, username, team, gameId).Scan(&userId)
	if err != nil {
		return User{}, err
	}

	if err = tx.Commit(ctx); err != nil {
		return User{}, err
	}

	return User{name: username, team: team, id: userId, gameId: gameId}, nil
}
