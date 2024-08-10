// deadline: in 2-weeks Infinite
package main

import (
	"io"
	"log"
	"mime/multipart"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/homebrew-ec-foss/event-loop-backend/handlers"
)

func main() {
	r := gin.Default()

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
