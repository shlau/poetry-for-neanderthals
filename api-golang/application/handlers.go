package application

import (
	"bufio"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
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

func (app *Application) UploadWords(w http.ResponseWriter, r *http.Request) {
	gameId := chi.URLParam(r, "gameId")
	r.ParseMultipartForm(10 << 20)
	file, _, err := r.FormFile("gameWords")
	if err != nil {
		log.Error("failed to get file:", err.Error())
		app.serverError(w, r, err)
		return
	}
	defer file.Close()

	newWords := []models.Word{}
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		words := strings.Split(line, ":")
		if len(words) != 2 {
			log.Errorf("custom word file has invalid line: %s", words)
			app.clientError(w, http.StatusBadRequest)
			return
		}
		newWords = append(newWords, models.Word{Easy: words[0], Hard: words[1]})
	}

	jsonEnc, err := json.Marshal(newWords)
	if err != nil {
		log.Error("failed to encode new words: ", err.Error())
		app.serverError(w, r, err)
		return
	}

	err = app.games.UpdateCol(gameId, "words", jsonEnc)
	if err != nil {
		log.Error("failed to use custom words: ", err.Error())
		app.serverError(w, r, err)
		return
	}
}
