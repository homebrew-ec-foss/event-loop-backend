package database

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	dbGlobal  *gorm.DB
	errGlobal error
)

// Rather proposed custom error types
var ErrDbOpenFailure = fmt.Errorf("Failed to run `OpenDB()`")
var ErrDbMissingRecord = fmt.Errorf("Failed to fetch record")
var ErrIncorrectField = fmt.Errorf("Checkpoint missing in db")

// Event specific errors
// DB_Participants related errors
var ErrParticipantAbsent = fmt.Errorf("Participant never checkedin")
var ErrParticipantLeft = fmt.Errorf("Participant has left the event")

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

// Function to fetch all checkpoints and
// forward to backend
//
// for dynamic checkpoint loading for site
func FetchCheckpoints() []string {
	var checkpoints []string

	return checkpoints
}

// Update DB with the participant entry checkpoint
//
// Return signature
// - Pointer to participant
// - checkin : true if not checked in
// - error
func ParticipantEntry(jwtID string) (*DBParticipant, bool, error) {
	db, err := openDB()
	if err != nil {
		return nil, false, ErrDbOpenFailure
	}

	var dbParticipant DBParticipant
	_ = db.First(&dbParticipant, "id = ?", jwtID)
	log.Println(dbParticipant.Participant)

	if dbParticipant.Participant.Name == "" {
		// FIX:
		// Returns a pointer to an empty struct
		return nil, false, ErrDbMissingRecord
	}

	if dbParticipant.Checkpoints.Checkin && dbParticipant.Checkpoints.Checkout {
		return nil, false, ErrParticipantLeft
	}

	if !dbParticipant.Checkpoints.Checkin {
		dbParticipant.Checkpoints.Entry_time = time.Now()
		dbParticipant.Checkpoints.Checkin = true
		db.Save(&dbParticipant)
		return &dbParticipant, true, nil
	}

	return &dbParticipant, false, nil
}

// Update DB with the participant exit checkpoint
//
// Return signature
//   - Pointer to participant
//   - checkin : true if sucessfulyl checked in and
//     false if alreayd checked in
//   - error
func ParticipantExit(jwtID string) (*DBParticipant, bool, error) {
	db, err := openDB()
	if err != nil {
		return nil, false, ErrDbOpenFailure
	}

	var dbParticipants DBParticipant

	log.Println(jwtID)
	_ = db.First(&dbParticipants, "id = ?", jwtID)

	// Extra check if there has been some tampered entry
	// in the db
	if dbParticipants.Participant.Name == "" {
		return nil, false, ErrDbMissingRecord
	}

	// Participant MUST have checked in
	// for the checkout proceedure to be valid
	if !dbParticipants.Checkpoints.Checkin {
		return nil, false, ErrParticipantAbsent
	}

	if !dbParticipants.Checkpoints.Checkout {
		dbParticipants.Checkpoints.Checkout = true
		dbParticipants.Checkpoints.Exit_time = time.Now()
		db.Save(&dbParticipants)
		return &dbParticipants, true, nil
	}

	return &dbParticipants, false, nil
}

func ParticipantCheckpoint(jwtID string, checkpointName string) (*DBParticipant, bool, error) {

	db, err := openDB()
	if err != nil {
		return nil, false, ErrDbOpenFailure
	}

	var dbParticipants DBParticipant

	_ = db.First(&dbParticipants, "id = ?", jwtID)

	// Check if participant is in the db
	if dbParticipants.Participant.Name == "" {
		return nil, false, ErrDbMissingRecord
	}

	if !dbParticipants.Checkpoints.Checkin {
		return nil, false, ErrParticipantAbsent
	}

	if dbParticipants.Checkpoints.Checkin && dbParticipants.Checkpoints.Checkout {
		return nil, false, ErrParticipantLeft
	}

	// FIX: Refractor
	switch checkpointName {
	case "Breakfast":
		{
			if dbParticipants.Checkpoints.Breakfast {
				break
			}
			dbParticipants.Checkpoints.Breakfast = true;
			db.Save(&dbParticipants)
			return &dbParticipants, true, nil
		}
	case "Dinner":
		{
			if dbParticipants.Checkpoints.Dinner {
				break
			}
			dbParticipants.Checkpoints.Dinner = true;
			db.Save(&dbParticipants)
			return &dbParticipants, true, nil
		}
	case "Snacks":
		{
			if dbParticipants.Checkpoints.Snacks {
				break
			}
			dbParticipants.Checkpoints.Snacks = true;
			db.Save(&dbParticipants)
			return &dbParticipants, true, nil
		}
	default:
		{
			return nil, false, ErrIncorrectField
		}
	}

	// Participant has already opted for the option
	return &dbParticipants, false, nil
}
