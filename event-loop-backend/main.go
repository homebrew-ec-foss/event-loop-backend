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

	////////////////////////////////////////////////

	// Pre event endpoints
	// handles creation for event
	r.POST("/create", handlers.HandleCreate)


	////////////////////////////////////////////////

	// Generic functions for admin control

	r.GET("/search", handlers.HandleParticipantSearch)

	// Additional team addition besides CSV
	// future prospect
	r.POST("/createteam", func(ctx *gin.Context) {})


	////////////////////////////////////////////////

	// Endpoints accessed during events
	// eg: Crossing checkpoints, etc.

	// TODO: Handle checking by scanner
	r.POST("/checkin", func(ctx *gin.Context) {})

	r.POST("/checkout", func(ctx *gin.Context) {})

	r.PUT("/checkpoint", handlers.HandleCheckpoint)


	err := r.Run("localhost:8080")
	if err != nil {
		log.Fatal(err)
	}
}
