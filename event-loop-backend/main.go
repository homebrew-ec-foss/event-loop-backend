// deadline: in 2-weeks Infinite
package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/homebrew-ec-foss/event-loop-backend/handlers"
)

func main() {
	r := gin.Default()
	r.Use(handlers.CorsMiddleware())

	r.GET("/ping", func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "pong")
	})

	r.POST("/create", handlers.HandleCreate)

	r.PUT("/checkpoint", handlers.HandleCheckpoint)

	r.GET("/search", handlers.HandleParticipantSearch)

	err := r.Run("localhost:8080")
	if err != nil {
		log.Fatal(err)
	}
}
