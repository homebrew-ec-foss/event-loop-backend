package database

import (
	"errors"
	"log"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var dbGlobal *gorm.DB
var errGlobal error

// Open and return db access struct
func openDB() (*gorm.DB, error) {
	if dbGlobal == nil {
		dbGlobal, errGlobal = gorm.Open(sqlite.Open("event.db"), &gorm.Config{})
		if errGlobal != nil {
			log.Println(errGlobal)
			return nil, errGlobal
		}

		dbGlobal.AutoMigrate(&DBParticipant{})
	}

	return dbGlobal, nil
}

// Create records for all participants parsed from the csv
func CreateParticipants(dbParticipants []DBParticipant) error {

	db, err := openDB()
	if err != nil {
		return err
	}

	// Writing to DB
	db.Create(dbParticipants)

	return nil
}

// Update DB with the participant entry checkpoint
func ParticipantEntry(jwtID string) (*DBParticipant ,bool, error) {
	db, err := openDB()
	if err != nil {
		return nil, false,err
	}

	var participant DBParticipant
	_ = db.First(&participant, "id = ?", jwtID)
	log.Println(participant.Participant)

	if participant.Participant.Name == "" {
		return nil, false, errors.New("Participant does not exist in the DB")
	}

	if !participant.Checkpoints.Checkin {
		participant.Checkpoints.Entry_time = time.Now()
		participant.Checkpoints.Checkin = true
		db.Save(&participant)
		return &participant, true, nil
	}

	return &participant, false, nil
}

// TODO:
// Rewrite helper functions for tests
// Dont modify actual record
