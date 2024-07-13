package main

import (
	"context"

	"github.com/go-chi/chi/v5"
	"poetry.sheldonlau.com/application"
	"poetry.sheldonlau.com/db"
)

func main() {
	conn := db.InitDB()
	defer conn.Close(context.Background())
	r := chi.NewRouter()
	server := application.NewServer(r, conn)
	server.ListenAndServe()
}
