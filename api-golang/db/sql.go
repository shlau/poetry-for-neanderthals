package db

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5"
	log "github.com/sirupsen/logrus"
)

func InitDB() *pgx.Conn {
	conn, err := pgx.Connect(context.Background(), os.Getenv("DB_URL"))
	if err != nil {
		log.Fatal("Unable to connect to database.")
		os.Exit(1)
	}

	return conn
}
