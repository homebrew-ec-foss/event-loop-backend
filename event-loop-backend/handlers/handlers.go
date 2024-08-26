package handlers

import (
	"bufio"
	"bytes"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
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
	log.Println(dbParticipants)

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
	if err != nil && jwtClaims == nil {
		log.Println("Invalid jwt")
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Failed to pasrse JWT for the cliams. Seems like an invlaid QR"})
		return
	}

	checkpointName := data["checkpoint"].(string)

	if jwtClaims == nil {
		log.Println("Invalid JWT")
		ctx.JSON(http.StatusUnauthorized, gin.H{"Error": "Invalid JWT"})
		return
	}
	log.Println("JWT claims:", jwtClaims)

	dbParticipant, checkpointCleared, err := database.ParticipantCheckpoint(jwtClaims["UUID"].(string), checkpointName)
	log.Println(dbParticipant, checkpointCleared, err)

	switch err {
	case database.ErrDbOpenFailure:
		{
			log.Println(err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"message": "Database OP failed server side, contact operators"})
			return
		}
	case database.ErrDbMissingRecord:
		{
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "The QR might not be accurate", "checkpointCleared": false, "operation": true})
			return
		}
	case database.ErrParticipantAbsent:
		{
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "Participant has never checked into the envet. Can't proceed with operation"})
			return
		}
	case database.ErrParticipantLeft:
		{
			log.Println("Already left the event")
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "Participant has left the event. Can't proceed with operation"})
			return
		}
	}

	// Respond to the client
	// ctx.JSON(http.StatusOK, gin.H{"message": "QR code content received successfully", "claims": jwtClaims})
	ctx.JSON(http.StatusOK, gin.H{"message": "QR code parsed sucessfully and operation sucessful", "checkpointCleared": checkpointCleared, "operation": true, "dbParticipant": dbParticipant})
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
	dbParticipant, checkin, err := database.ParticipantEntry(jwtClaims["UUID"].(string))

	switch err {
	case database.ErrDbOpenFailure:
		{
			log.Println(err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"message": "Database OP failed server side, contact operators"})
			return
		}
	case database.ErrDbMissingRecord:
		{
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "The QR might not be accurate", "checkin": false, "operation": true})
			return
		}
	case database.ErrParticipantLeft:
		{
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "Participant has left the event. Can't proceed with operation"})
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
	dbParticipant, checkout, err := database.ParticipantExit(jwtClaims["UUID"].(string))

	switch err {
	case database.ErrDbOpenFailure:
		{
			log.Println(err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"message": "Database OP failed server side, contact operators"})
			return
		}
	case database.ErrDbMissingRecord:
		{
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "The QR might not be accurate", "checkin": false, "operation": true})
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
}

func HandleParticipantSearch(ctx *gin.Context) {}

func HandleQRFetch(ctx *gin.Context) {
	log.Println("Recieved")
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

	// Parsing claims and validating JWT
	jwtClaims, err := GetClaimsInfo(data["jwt"].(string))

	if err != nil && jwtClaims == nil {
		log.Println("Invalid jwt")
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Failed to pasrse JWT for the cliams. Seems like an invlaid QR"})
		return
	}

	dbparticipant, err := database.JWTFetchParticipant(data["jwt"].(string))

	log.Println(dbparticipant)

	if errors.Is(err, database.ErrDbOpenFailure) {
		log.Println(err)
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "details parseed sucessfully", "dbParticipant": dbparticipant})
}

// TODO:
// This endpoint exposes way too much data
// Non JWTID basesd search expects the name and phone to
// be unique together
func HandleParticipantFetch(ctx *gin.Context) {
	jwtID := ctx.DefaultQuery("jwtID", "")
	partName := ctx.DefaultQuery("pname", "")
	partPhone := ctx.DefaultQuery("pphone", "")

	fmt.Println(jwtID, partName, partPhone)

	if jwtID != "" {
		// search based on JWT ID
		valid, _ := JWTAuthCheck(jwtID)
		if !valid {
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "Invalid jwt ID"})
			return
		}
		dbParticipant, err := database.JWTFetchParticipant(jwtID)
		if errors.Is(err, database.ErrDbOpenFailure) {
			log.Println(err)
			ctx.JSON(http.StatusInternalServerError, gin.H{"message": "Database OP failed server side, contact operators"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"message": "participant fetched successfully", "dbParticipant": dbParticipant})
		return
	} else {
		log.Println("Fetching based on ID")
		dbParticipant, err := database.FetchParticipant(partName, partPhone)
		switch err {
		case database.ErrDbOpenFailure:
			{
				ctx.JSON(http.StatusInternalServerError, gin.H{"message": "Database OP failed server side, contact operators"})
				return
			}
		case database.ErrDbMissingRecord:
			{
				ctx.JSON(http.StatusBadRequest, gin.H{"message": "No participant exists. Details may be incorrect"})
				return
			}
		}
		ctx.JSON(http.StatusOK, gin.H{"message": "participant fetched successfully", "dbParticipant": dbParticipant})
		return
	}
}

func HandleLogin(ctx *gin.Context) {
	// apparently map only i needto do
	var requestBody map[string]interface{}

	// json-> map tried doing with string because ez but was not nice
	if err := ctx.BindJSON(&requestBody); err != nil {
		log.Println("Error binding JSON:", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// print ingo
	log.Println("Received login request:", requestBody)

	// dbAuthUser, err := database.VerifyLogin(int64(strconv.Itoa(requestBody["sub"].(string))),requestBody["email"].(string))

	incomingUserReq := database.DBAuthoriesedUsers{
		VerifiedEmail: requestBody["email"].(string),
		SUB:           requestBody["sub"].(string),
	}

	dbAuthUser, err := database.VerifyLogin(incomingUserReq)
	log.Println(err)
	switch err {
	case database.ErrDbOpenFailure:
		{
			log.Println("couldnt return user")
			ctx.JSON(http.StatusInternalServerError, gin.H{"message": "Database OP failed server side, contact operators", "success": false})
			return
		}
	case database.ErrDbMissingRecord:
		{
			log.Println(err)
			log.Println("Missing databse record")
			ctx.JSON(http.StatusBadRequest, gin.H{"message": "No records available for", "success": false})
			return
		}
	}

	// Respond to the client
	ctx.JSON(http.StatusOK, gin.H{"message": "Login successful", "success": true, "dbAuthUser": dbAuthUser})
}

func HandleParticipantUpdate(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{"message": "Participants details updated sucessfully"})
}
