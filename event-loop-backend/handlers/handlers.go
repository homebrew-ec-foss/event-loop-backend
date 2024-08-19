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

	// Reading csv to a 2-D slice
	csvReader := csv.NewReader(bytes.NewReader(content.Bytes()))
	formData, err := csvReader.ReadAll()

	// TODO(FUTURE): do proper checks here for form headers
	// check for validation of opinionated headers and
	// dynamic headers
	formHeaders := formData[0]

	formEntriesMap := make([]map[string]string, 0)

	// Converting csv data to a slice of maps (slice has several rows of records, where each row is a map)
	// Each map contains key-value pairs, where the key is the csv-header for the column
	for i := 1; i < len(formData); i++ {
		entry := make(map[string]string)
		for j := 0; j < len(formHeaders); j++ {
			entry[formHeaders[j]] = formData[i][j]
		}
		// Appending map(row) to slice(all rows)
		formEntriesMap = append(formEntriesMap, entry)
	}

	// Parsing the csv to a slice of Participants struct
	participants, err := ParseParticipants(formEntriesMap)
	if err != nil {
		ctx.String(http.StatusInternalServerError, "Error: Failed to write records to the database")
	}

	// Converting Participant structs to DBPartictipants
	// Performing JWT and QR generation and embedding 'Checkpoints' struct
	dbParticipants, err := CreateDBParticipants(participants)

	// Writing records to DB
	err = database.CreateParticipants(dbParticipants)
	if err != nil {
		log.Fatal(err)
	}

	ctx.JSON(http.StatusOK, gin.H{"data": participants})
}

// Handler receives the JWT and manages checkpoint(Eg: Dinner) updates
func HandleCheckpoint(ctx *gin.Context) {
	// Read the request body
	body, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"Error": "Failed to read request body"})
		return
	}
	log.Println("QR code content received:", string(body))

	var data map[string]interface{}
	err = json.Unmarshal(body, &data)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"Error": "Failed to parse JSON"})
		return
	}

	jwtClaims, err := GetClaimsInfo(data["jwt"].(string))
	if jwtClaims == nil {
		log.Println("Invalid JWT")
		ctx.JSON(http.StatusUnauthorized, gin.H{"Error": "Invalid JWT"})
		return
	}
	log.Println("JWT claims:", jwtClaims)

	// Respond to the client
	ctx.JSON(http.StatusOK, gin.H{"message": "QR code content received successfully", "claims": jwtClaims})
}

// Handler receives the JWT and manages event enrty updates
func HandleCheckin(ctx *gin.Context) {
	// Read the request body
	body, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
		return
	}
	log.Println("QR code content received:", string(body))

	var data map[string]interface{}
	err = json.Unmarshal(body, &data)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse JSON"})
		return
	}

	// Parsing claims and validating JWT
	jwtClaims, err := GetClaimsInfo(data["jwt"].(string))
	if err != nil && jwtClaims == nil {
		log.Println("Invalid jwt")
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Failed to pasrse JWT for the cliams. Seems like an invlaid QR"})
		return
	}

	// Querying DB for participant and updating with entry
	dbParticipant, checkin, err := database.ParticipantEntry(data["jwt"].(string))

	switch err {
	case database.ErrDbOpenFailure:
		{
			log.Println(err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"message": "Database OP failed server side, contact operators"})
			return
		}
	case database.ErrDbMissingRecord:
		{
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "The QR might not be accurate", "checkin": false, "operation": "true"})
			return
		}
	}

	// Respond to the client
	ctx.JSON(http.StatusOK, gin.H{"message": "QR JWT parsed and db operation was sucessful", "checkin": checkin, "operation": true, "dbParticipant": dbParticipant})
	return
}

func HandleCheckout(ctx *gin.Context) {
	// Read the request body
	body, err := io.ReadAll(ctx.Request.Body)
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
		return
	}

	var data map[string]interface{}
	err = json.Unmarshal(body, &data)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse JSON"})
		return
	}

	// DEBUG

	// Parsing claims and validating JWT
	jwtClaims, err := GetClaimsInfo(data["jwt"].(string))

	if err != nil && jwtClaims == nil {
		log.Println("Invalid jwt")
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Failed to pasrse JWT for the cliams. Seems like an invlaid QR"})
		return
	}

	log.Println(jwtClaims)

	// Querying DB for participant and updating with entry
	dbParticipant, checkout, err := database.ParticipantExit(data["jwt"].(string))

	switch err {
	case database.ErrDbOpenFailure:
		{
			log.Println(err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"message": "Database OP failed server side, contact operators"})
			return
		}
	case database.ErrDbMissingRecord:
		{
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "The QR might not be accurate", "checkin": false, "operation": "true"})
			return
		}
	case database.ErrParticipantAbsent:
		{
			log.Println("The guy never came!")
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "Participant has never checked into the envet. Can't proceed with operation"})
			return
		}
	}

	// Respond to the client
	ctx.JSON(http.StatusOK, gin.H{"message": "QR JWT parsed and db operation was sucessful", "checkout": checkout, "operation": true, "dbParticipant": dbParticipant})
	return
}

func HandleParticipantSearch(ctx *gin.Context) {}
