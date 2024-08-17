package handlers

import (
	"bufio"
	"bytes"
	"encoding/csv"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/homebrew-ec-foss/event-loop-backend/database"
)

// TODO:
// HandleCreate only handles the incoming file
// - Create db based on event name
// - Store imporatnt event related info regarding date, etc...
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

	// PARSING the db and storing []Participants slice
	participants, err := ParseParticipants(formEntriesMap)
	if err != nil {
		ctx.String(http.StatusInternalServerError, "Error: Failed to write records to the database")
	}

	// NOTE:
	// Create auth tokens and form a []DBParticipants slice
	// This will only be for it to be written to database
	// dbParticipants, err := CreateDBParticipants(participants)
	dbParticipants, err := CreateDBParticipants(participants)

	// NOTE:
	// Pass over dbParticcipants to the CRUD for
	// file writes
	err = database.CreateParticipants(dbParticipants)
	if err != nil {
		log.Fatal(err)
	}

	// Convert records to JSON
	jsonData, err := json.Marshal(participants)
	// fmt.Println(string(jsonData))
	if err != nil {
		ctx.String(http.StatusInternalServerError, "Error: Failed to convert records to JSON")
		return
	}

	//TODO: testing DB operations, to be replaced by production operations
	ctx.String(http.StatusOK, string(jsonData))
	// BUG: ctx.JSON fails
}

func HandleCheckpoint(ctx *gin.Context) {}

func HandleParticipantSearch(ctx *gin.Context) {}
