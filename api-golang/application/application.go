package application

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"poetry.sheldonlau.com/db"
	"poetry.sheldonlau.com/models"
	"poetry.sheldonlau.com/websocket"
)

type Application struct {
	router *chi.Mux
	games  *models.GameModel
}

func NewServer(r *chi.Mux, conn db.DbConn) *http.Server {
	games := &models.GameModel{Conn: conn}
	users := &models.UserModel{Conn: conn}
	ws := websocket.NewGameSocket(users, games)
	ws.Listen()
	app := Application{router: r, games: games}
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))
	r.Mount("/api", app.Routes())
	r.HandleFunc("/channel/{gameId}/ws", ws.UpgradeConnection)

	httpServer := &http.Server{
		Addr:           fmt.Sprintf(":%s", os.Getenv("SERVER_PORT")),
		Handler:        r,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
		IdleTimeout:    time.Minute,
	}
	return httpServer
}
