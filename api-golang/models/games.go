package models

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
	"poetry.sheldonlau.com/db"
)

type GameColumn struct {
	name string
	val  any
}

type Game struct {
	Id         string `json:"id"`
	InProgress bool   `json:"inProgress"`
	createdAt  time.Time
	poetIdx    int
	RedScore   int `json: "redScore"`
	BlueScore  int `json: "blueScore"`
}

type GameModel struct {
	Conn db.DbConn
}

func (g *GameModel) Users(gameId string) []User {
	rows, err := g.Conn.Query(context.Background(), "SELECT id,name,team,ready,game_id FROM users WHERE game_id=$1", gameId)
	if err != nil {
		log.Fatal(err)
		return []User{}
	}

	defer rows.Close()

	var rowSlice []User
	for rows.Next() {
		var r User
		err := rows.Scan(&r.Id, &r.Name, &r.Team, &r.Ready, &r.GameId)
		if err != nil {
			log.Fatal(err)
			return []User{}
		}
		rowSlice = append(rowSlice, r)
	}
	if err := rows.Err(); err != nil {
		log.Fatal(err)
		return []User{}
	}

	return rowSlice
}

func (g *GameModel) Remove(gameId string) error {
	stmt := `DELETE FROM games WHERE id=$1`
	_, err := g.Conn.Exec(context.Background(), stmt, gameId)
	if err != nil {
		log.Error("Failed to delete game: ", err.Error())
		return err
	}
	return nil
}

func (g *GameModel) Create(username string, team string) (User, error) {
	ctx := context.Background()
	tx, err := g.Conn.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Error("Failed to start transaction: ", err.Error())
		return User{}, err
	}

	defer tx.Rollback(ctx)

	var gameId string
	stmt := `INSERT INTO games DEFAULT VALUES RETURNING id`
	err = g.Conn.QueryRow(ctx, stmt).Scan(&gameId)
	if err != nil {
		log.Error("Failed to insert into games: ", err.Error())
		return User{}, err
	}

	var userId string
	stmt = `INSERT INTO users (name, team, game_id) VALUES($1, $2, $3) RETURNING id`
	err = g.Conn.QueryRow(ctx, stmt, username, team, gameId).Scan(&userId)
	if err != nil {
		log.Error("Failed to insert into users: ", err.Error())
		return User{}, err
	}

	if err = tx.Commit(ctx); err != nil {
		log.Error("Failed to commit transaction: ", err.Error())
		return User{}, err
	}

	return User{Name: username, Team: team, Id: userId, GameId: gameId}, nil
}

func (g *GameModel) Join(username string, gameId string) (User, error) {
	ctx := context.Background()
	tx, err := g.Conn.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return User{}, err
	}

	defer tx.Rollback(ctx)

	var gameExists bool
	stmt := `SELECT EXISTS(SELECT true FROM games WHERE id = $1)`
	err = g.Conn.QueryRow(ctx, stmt, gameId).Scan(&gameExists)
	if err != nil || !gameExists {
		log.Error("Failed to find existing game: ", err.Error())
		return User{}, err
	}

	var userId string
	stmt = `INSERT INTO users (name, game_id) VALUES($1, $2) RETURNING id`
	err = g.Conn.QueryRow(ctx, stmt, username, gameId).Scan(&userId)
	if err != nil {
		log.Error("Failed to insert into users: ", err.Error())
		return User{}, err
	}

	if err = tx.Commit(ctx); err != nil {
		log.Error("Failed to commit transaction: ", err.Error())
		return User{}, err
	}

	return User{Name: username, Id: userId, GameId: gameId}, nil
}

func (g *GameModel) UpdateCol(gameId string, col string, val any) error {
	stmt := `UPDATE games SET $1=$2 WHERE id=$3`
	_, err := g.Conn.Exec(context.Background(), stmt, col, val, gameId)
	if err != nil {
		log.Error("Failed to update game column: ", col, ",", err.Error())
		return err
	}

	return nil
}

func (g *GameModel) Update(gameId string, cols []GameColumn) error {
	var sb strings.Builder

	sb.WriteString(`UPDATE games SET `)
	colLen := len(cols)
	numArgs := colLen * 2

	args := make([]any, numArgs+1)
	colIdx := 0
	for i := 0; i < numArgs; i += 2 {
		sb.WriteString(fmt.Sprintf(`$%d=$%d`, i+1, i+2))
		if colIdx < colLen-1 {
			sb.WriteString(`,`)
		}

		args[i] = cols[colIdx].name
		args[i+1] = cols[colIdx].val
		colIdx++
	}
	args[numArgs] = gameId
	sb.WriteString(fmt.Sprintf(` WHERE id=$%d`, numArgs+1))

	_, err := g.Conn.Exec(context.Background(), sb.String(), args...)
	if err != nil {
		log.Error("Failed to update game columns: ", err.Error())
		return err
	}

	return nil
}
