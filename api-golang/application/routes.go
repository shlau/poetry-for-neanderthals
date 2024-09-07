package application

import "github.com/go-chi/chi/v5"

func (app *Application) Routes() *chi.Mux {
	r := chi.NewRouter()
	r.Post("/games", app.CreateGame)
	r.Post("/join", app.JoinGame)
	r.Post("/upload/{gameId}/{action}", app.UploadWords)
	r.Post("/reset_words/{gameId}", app.ResetWords)
	return r
}
