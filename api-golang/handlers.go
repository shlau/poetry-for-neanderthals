package main

import (
	"net/http"

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
