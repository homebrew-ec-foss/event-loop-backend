package handlers

import (
	"bufio"
	"bytes"
	"encoding/csv"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleCreate(ctx *gin.Context) {
	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.String(http.StatusBadRequest, "Error: No file uploaded")
		return
	}

	fileContent, err := file.Open()
	if err != nil {
		ctx.String(http.StatusInternalServerError, "Error: Failed to open file")
		return
	}
	defer fileContent.Close()

	reader := bufio.NewReader(fileContent)
	content := bytes.Buffer{}
	_, err = io.Copy(&content, reader)
	if err != nil {
		ctx.String(http.StatusInternalServerError, "Error: Failed to read file")
		return
	}

	csvReader := csv.NewReader(bytes.NewReader(content.Bytes()))
	var records [][]string
	for i := 0; i < 5; i++ {
		record, err := csvReader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			ctx.String(http.StatusInternalServerError, "Error: Failed to parse CSV")
			return
		}
		records = append(records, record)
	}

	// Format the output string
	output := "File processed successfully\n\nContent:\n" + content.String() + "\n\nRecords:\n"
	for _, record := range records {
		output += fmt.Sprintf("%v\n", record)
	}

	ctx.String(http.StatusOK, output)
}
func HandleCheckpoint(ctx *gin.Context) {}

func HandleParticipantSearch(ctx *gin.Context) {}

//ill write comments later lel
