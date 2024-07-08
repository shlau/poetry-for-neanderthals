package main

import (
	"net/http"
	"strconv"

	"github.com/go-chi/render"
)

func (app *application) CreateGame(w http.ResponseWriter, r *http.Request) {
	name, team := r.FormValue("name"), r.FormValue("team")
	if name == "" || team == "" {
		app.clientError(w, http.StatusBadRequest)
		return
	}

	user, err := app.games.Create(name, team)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	render.JSON(w, r, user)
}

func (app *application) JoinGame(w http.ResponseWriter, r *http.Request) {
	name, gameIdStr := r.FormValue("name"), r.FormValue("game_id")
	gameId, err := strconv.Atoi(gameIdStr)

	if name == "" || gameIdStr == "" || err != nil {
		app.clientError(w, http.StatusBadRequest)
		return
	}

	user, err := app.games.Join(name, gameId)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	render.JSON(w, r, user)

}
