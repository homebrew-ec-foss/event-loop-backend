package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/homebrew-ec-foss/eventloop/database"
)

func CorsMiddleware() gin.HandlerFunc {
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

func AuthenticationMiddleware(userRole string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		log.Println("Authenticating")

		body, err := io.ReadAll(ctx.Request.Body)
		ctx.Request.Body = io.NopCloser(bytes.NewBuffer(body))

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

		log.Println(data)

		user_sub := data["sub"].(string)

		_, err = database.SubAuthentication(user_sub, userRole)

		switch err {
		case database.ErrDbOpenFailure:
			{
				ctx.JSON(http.StatusInternalServerError, gin.H{"message": "Backend server failed to perform operations. Contact administrator"})
				return
			}
		case database.ErrDbMissingRecord:
			{
				ctx.JSON(http.StatusBadRequest, gin.H{"message": "Missing auth records for incoming user"})
				return
			}
		case database.ErrNoAccess:
			{
				ctx.JSON(http.StatusBadRequest, gin.H{"message": "Incoming request was authoriesed but has no access to endpoint"})
				return
			}
		}

		// querry db and check if they have the grant
		log.Println("Authorised request")
	}
}

// Parsing a slice of maps(rows of records) from csv data to a slice of participant structs
func ParseParticipants(teamRecords []map[string]string) ([]database.Participant, error) {
	participants := []database.Participant{}

	for i := 0; i < len(teamRecords); i++ {
		record := teamRecords[i]
		for j := 1; j <= 5; j++ {
			participantName := record[fmt.Sprintf("Name %d", j)]
			if participantName == "" {
				continue
			} else {
				ph, err := strconv.Atoi(record[fmt.Sprintf("Phone %d", j)])
				if err != nil {
					return nil, err
				}

				participants = append(participants, database.Participant{
					Name:      strings.TrimSpace(record[fmt.Sprintf("Name %d", j)]),
					Email:     strings.TrimSpace(record[fmt.Sprintf("Email %d", j)]),
					Phone:     int64(ph),
					College:   strings.TrimSpace(record[fmt.Sprintf("College %d", j)]),
					Branch:    strings.TrimSpace(record[fmt.Sprintf("Branch %d", j)]),
					PesHostel: strings.TrimSpace(record[fmt.Sprintf("PES Hostel %d", j)]),
					Team:      strings.TrimSpace(record["Team Name"]),
					Theme:     strings.TrimSpace(record["Theme"]),
				})
			}
		}
	}

	return participants, nil
}

func CreateDBParticipants(participantsRec []database.Participant) ([]database.DBParticipant, error) {
	var participantPointers []database.DBParticipant

	for _, p := range participantsRec {
		pid, _ := GenerateUUID(p)
		signedString, _ := GenerateAuthoToken(p, pid)

		_, err := GenerateQR(signedString, p.Name, p.Email, pid)
		if err != nil {
			log.Fatal(err)
		}

		participantPointers = append(participantPointers, database.DBParticipant{
			ID:          pid,
			Participant: p,
			Checkpoints: database.Checkpoints{
				Checkin:   false,
				Checkout:  false,
				Snacks:    false,
				Dinner:    false,
				Breakfast: false,
			},
		})
	}

	return participantPointers, nil
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
