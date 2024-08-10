package handlers

import (
	"bufio"
	"bytes"
	"encoding/csv"
	"fmt"
	"io"

	"github.com/gin-gonic/gin"
)

func HandleCreate(ctx *gin.Context) {
	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(400, gin.H{"error": "No file uploaded"})
		return
	}

	fileContent, err := file.Open()
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to open file"})
		return
	}
	defer fileContent.Close()

	reader := bufio.NewReader(fileContent)
	content := bytes.Buffer{}
	_, err = io.Copy(&content, reader)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to read file"})
		return
	}

	csvReader := csv.NewReader(bytes.NewReader(content.Bytes()))
	for i := 0; i < 5; i++ {
		record, err := csvReader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			ctx.JSON(500, gin.H{"error": "Failed to parse CSV"})
			return
		}
		fmt.Println(record)
	}

	ctx.JSON(200, gin.H{"message": "File printed successfully"})
}

func HandleCheckpoint(ctx *gin.Context) {}

func HandleParticipantSearch(ctx *gin.Context) {}

//ill write comments later lel
