package main

import "github.com/go-chi/chi/v5"

func (app *Application) Routes() *chi.Mux {
	r := chi.NewRouter()
	r.Post("/games", app.CreateGame)
	r.Post("/join", app.JoinGame)
	return r
}
