package application

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/render"
	log "github.com/sirupsen/logrus"
	"poetry.sheldonlau.com/models"
)

func (app *Application) CreateGame(w http.ResponseWriter, r *http.Request) {
	var userParams models.User
	err := json.NewDecoder(r.Body).Decode(&userParams)
	if err != nil {
		app.clientError(w, http.StatusBadRequest)
		return
	}

	name, team := userParams.Name, userParams.Team

	if name == "" {
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

func (app *Application) JoinGame(w http.ResponseWriter, r *http.Request) {
	var userParams models.User
	err := json.NewDecoder(r.Body).Decode(&userParams)
	if err != nil {
		app.clientError(w, http.StatusBadRequest)
		return
	}

	name, gameId := userParams.Name, userParams.GameId

	if name == "" || gameId == "" {
		app.clientError(w, http.StatusBadRequest)
		return
	}

	game, err := app.games.Get(gameId)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if game.InProgress {
		log.Info("Game already in progress")
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
