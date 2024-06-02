package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/homebrew-ec-foss/event-loop-backend/database"
	"github.com/homebrew-ec-foss/event-loop-backend/vitals"
)

func main() {
	router := gin.Default()

	// connect to database
	err := database.Connect("event-loop.db")
	// we can load the database file name
	// from a config file in the future.

	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	} else {
		log.Println("Connected to database.")
	}

	router.GET("/ping", vitals.Ping)

	s := &http.Server{
		Addr:         ":6969",
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
	log.Println("Listening on port 6969.")
	s.ListenAndServe()
}
