package database

import (
	"fmt"
	"strconv"
	"strings"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB
var err error

func openDB() (*gorm.DB, error) {
	if db == nil {
		db, err = gorm.Open(sqlite.Open("event.db"), &gorm.Config{})
		if err != nil {
			return nil, err
		}

		db.AutoMigrate(&DBParticipant{})
	}

	return db, nil
}

func CreateParticipants(teamRecords []map[string]string) ([]Participant, error) {
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
					return nil, err
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

	db, err := openDB()
	if err != nil {
		return nil, err
	}

	var participantPointers []*DBParticipant
	for _, p := range participants {
		participantPointers = append(participantPointers, &DBParticipant{
			Participant: p,
			Checkpoints: Checkpoints{
				false,
				false,
				false,
			},
		})
	}

	db.Create(participantPointers)

	return participants, nil
}

func TestCreateRecords(formEntriesMap []map[string]string) error {
	db, err := openDB()
	if err != nil {
		return err
	}

	sampleParticipant := DBParticipant{
		Participant{
			"Team-1",
			"Theme-1",
			"Name-1",
			"Email-1",
			123456789,
			"PES",
			"EC",
			"EC",
		},
		Checkpoints{
			false,
			false,
			false,
		},
	}

	db.Create(&sampleParticipant)
	return nil
}
