// deadline: in 2-weeks Infinite
package main

import (
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/homebrew-ec-foss/event-loop-backend/handlers"
)

func main() {
	r := gin.Default()
	r.Use(corsMiddleware())

	r.GET("/ping", func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "pong")
	})

	r.POST("/create", func(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		err = saveFile(file)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		handlers.HandleCreate(c)

		c.JSON(200, gin.H{"message": "File uploaded successfully"})
	})

	r.PUT("/checkpoint", handlers.HandleCheckpoint)

	r.GET("/search", handlers.HandleParticipantSearch)

	err := r.Run("localhost:8080")
	if err != nil {
		log.Fatal(err)
	}
}

func corsMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    }
}

func saveFile(file *multipart.FileHeader) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	dst, err := os.Create(file.Filename)
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = io.Copy(dst, src)
	if err != nil {
		return err
	}

	return nil
}
