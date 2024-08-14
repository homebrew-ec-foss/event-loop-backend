package handlers

import (
	"bufio"
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/homebrew-ec-foss/event-loop-backend/database"
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
	formData, err := csvReader.ReadAll()

	// TODO: do proper checks here for form headers
	// check for validation of opiniated headers and
	// dynamic headers
	formHeaders := formData[0]

	var formEntriesMap []map[string]string
	formEntriesMap = make([]map[string]string, 0)

	for i := 1; i < len(formData); i++ {
		entry := make(map[string]string)
		// each entry is a slice of strings
		for j := 0; j < len(formHeaders); j++ {
			entry[formHeaders[j]] = formData[i][j]
		}
		formEntriesMap = append(formEntriesMap, entry)
	}

	// Parsing and storing participants in the database
	participants, err := database.CreateParticipants(formEntriesMap)
	if err != nil {
		ctx.String(http.StatusInternalServerError, "Error: Failed to write records to the database")
	}

	// Convert records to JSON
	jsonData, err := json.Marshal(participants)
	fmt.Println(string(jsonData))
	if err != nil {
		ctx.String(http.StatusInternalServerError, "Error: Failed to convert records to JSON")
		return
	}

	ctx.String(http.StatusOK, string(jsonData))
	// send json data to the frontend
	// ctx.JSON(http.StatusOK, gin.H{"data": jsonData})
}

func HandleCheckpoint(ctx *gin.Context) {}

func HandleParticipantSearch(ctx *gin.Context) {}
