package database

import (
	"fmt"
	"log"
	"strconv"
	"strings"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func openDB() (*gorm.DB, error) {
	if db == nil {
		fmt.Println("connecting data to db")
		db, err := gorm.Open(sqlite.Open("event.db"), &gorm.Config{})
		if err != nil {
			return nil, err
		}

		fmt.Println(db)

		db.AutoMigrate(&Team{})
		db.AutoMigrate(&Participant{})
	}

	return db, nil
}

func CreateParticipants(teamRecords []map[string]string) []Participant {
	participants := []Participant{}

	for i := 0; i < len(teamRecords); i++ {
		record := teamRecords[i]
		for j := 1; j <= 4; j++ {
			participantName := record[fmt.Sprintf("Name %d", j)]
			if participantName == "" {
				continue
			} else {
				ph, err := strconv.Atoi(record[fmt.Sprintf("Phone %d", j)])
				if err != nil {
					log.Fatal(err)
				}

				participants = append(participants, Participant{
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

	return participants
}

func TestCreateRecords(formEntriesMap []map[string]string) error {
	db, err := openDB()
	if err != nil {
		return err
	}

	sampleTeam := Team{
		"RandomID-1",
		"Team-1",
		"Theme-1",
	}

	sampleParticipant := Participant{
		"RandomParticipantID-1",
		"Team-1",
		"Theme-1",
		"Name-1",
		"Email-1",
		123456789,
		"PES",
		"EC",
		"EC",
	}

	// teamResult := db.Create(&sampleTeam)
	// participantResult := db.Create(&sampleParticipant)

	_ = db.Create(&sampleTeam)
	_ = db.Create(&sampleParticipant)
	return nil
}
