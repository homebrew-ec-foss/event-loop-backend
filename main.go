// deadline: in 2-weeks Infinite
package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/homebrew-ec-foss/event-loop-backend/handlers"
)

func main() {

	r := gin.Default()

	r.POST("/create", handlers.HandleCreate)

	r.PUT("/checkpoint", handlers.HandleCheckpoint)

	r.GET("/search", handlers.HandleParticipantSearch)

	err := r.Run("localhost:8080")
	if err != nil {
		log.Fatal(err)
	}

}
