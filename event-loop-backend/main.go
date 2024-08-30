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

	// Generic functions for admin control

	r.GET("/search", func(ctx *gin.Context) {})

	// fetch participants details based on JWT ID
	// fetched based on a qr code
	r.POST("/qrsearch", handlers.HandleQRFetch)

	r.GET("/participant", handlers.HandleParticipantFetch)
	// r.POST("/participant", handlers.HandleParticipantUpdate)

	// Additional team addition besides CSV
	// future prospect
	r.POST("/createteam", func(ctx *gin.Context) {})
	r.POST("/login", handlers.HandleLogin)

	////////////////////////////////////////////////

	// Endpoints accessed during events
	// eg: Crossing checkpoints, etc.

	// r.PUT("/checkin", handlers.HandleCheckin)
	// r.PUT("/checkout", handlers.HandleCheckout)
	// r.PUT("/checkpoint", handlers.HandleCheckpoint)

	// TODO: Handle checking by scanner

	// Router Groups for
	// 	- volunteers
	//  - organiser
	// 	- admin

	// NOTE:
	volunteers := r.Group("/volunteer", handlers.AuthenticationMiddleware("volunteer"))
	{
		// NOTE: endpoints active during events
		volunteers.PUT("/checkin", handlers.HandleCheckin)
		volunteers.PUT("/checkout", handlers.HandleCheckout)
		volunteers.PUT("/checkpoint", handlers.HandleCheckpoint)
	}

	r.POST("/create", handlers.HandleCreate)

	// NOTE:
	organiser := r.Group("/organiser", handlers.AuthenticationMiddleware("organiser"))
	{

		// NOTE: endpoints active during events
		organiser.PUT("/checkin", handlers.HandleCheckin)
		organiser.PUT("/checkout", handlers.HandleCheckout)
		organiser.PUT("/checkpoint", handlers.HandleCheckpoint)
	}

	// NOTE:
	admin := r.Group("/admin", handlers.AuthenticationMiddleware("admin"))
	{

		// NOTE: endpoints active during events
		admin.PUT("/checkin", handlers.HandleCheckin)
		admin.PUT("/checkout", handlers.HandleCheckout)
		admin.PUT("/checkpoint", handlers.HandleCheckpoint)
	}

	err := r.Run(":8080")
	if err != nil {
		log.Fatal(err)
	}
}
