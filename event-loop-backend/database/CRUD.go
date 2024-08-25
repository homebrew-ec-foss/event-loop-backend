package database

import (
	"fmt"
	"log"
	"slices"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	dbGlobal  *gorm.DB
	errGlobal error
)

// Rather proposed custom error types
var (
	ErrDbOpenFailure   = fmt.Errorf("failed to run `OpenDB()`")
	ErrDbMissingRecord = fmt.Errorf("failed to fetch record")
	ErrIncorrectField  = fmt.Errorf("checkpoint missing in db")
)

// Event specific errors
// DB_Participants related errors
var (
	ErrParticipantAbsent = fmt.Errorf("participant never checkedin")
	ErrParticipantLeft   = fmt.Errorf("participant has left the event")
)

// Event authorised user specific

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

	log.Println("Attempting to write to db")
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

func VerifyLogin(userDetails DBAuthoriesedUsers) (*DBAuthoriesedUsers, error) {
	db, err := openDB()
	if err != nil {
		return nil, ErrDbOpenFailure
	}

	var dbAuthUser DBAuthoriesedUsers
	_ = db.First(&dbAuthUser, "sub = ?", userDetails.SUB)

	if dbAuthUser.VerifiedEmail == "" {

		// need admin side approval for
		// organisers and volunteers
		admins := []string{
			"adityahegde.clg@gmail.com",
			"adimhegde@gmail.com",
			"adheshathrey2004@gmail.com",
		}

		if !slices.Contains(admins, userDetails.VerifiedEmail) {
			log.Println("missing from admin slice")
			return nil, ErrDbMissingRecord
		}

		userDetails.UserRole = "admin"

		db.Create(userDetails)
		return &userDetails, nil
	}

	return &dbAuthUser, nil
}

func JWTFetchParticipant(jwt string) (*DBParticipant, error) {
	db, err := openDB()
	if err != nil {
		return nil, ErrDbOpenFailure
	}

	var dbParticipant DBParticipant
	_ = db.First(&dbParticipant, "id = ?", jwt)

	return &dbParticipant, nil
}

func FetchParticipant(name string, phone string) (*DBParticipant, error) {
	db, err := openDB()
	if err != nil {
		return nil, ErrDbOpenFailure
	}

	var dbParticipant DBParticipant
	_ = db.First(&dbParticipant, "name = ? and phone = ?", name, phone)

	log.Println(dbParticipant)

	if dbParticipant.Participant.Name == "" {
		return nil, ErrDbMissingRecord
	}

	return &dbParticipant, nil
}

// Update DB with the participant entry checkpoint
//
// Return signature
// - Pointer to participant
// - checkin : true if not checked in
// - error
func ParticipantEntry(p_uuid string) (*DBParticipant, bool, error) {
	db, err := openDB()
	if err != nil {
		return nil, false, ErrDbOpenFailure
	}

	var dbParticipant DBParticipant
	_ = db.First(&dbParticipant, "id = ?", p_uuid)
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
func ParticipantExit(p_uuid string) (*DBParticipant, bool, error) {
	db, err := openDB()
	if err != nil {
		return nil, false, ErrDbOpenFailure
	}

	var dbParticipants DBParticipant

	_ = db.First(&dbParticipants, "id = ?", p_uuid)

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

func ParticipantCheckpoint(p_uuid string, checkpointName string) (*DBParticipant, bool, error) {
	db, err := openDB()
	if err != nil {
		return nil, false, ErrDbOpenFailure
	}

	var dbParticipants DBParticipant

	_ = db.First(&dbParticipants, "id = ?", p_uuid)

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
			dbParticipants.Checkpoints.Breakfast = true
			db.Save(&dbParticipants)
			return &dbParticipants, true, nil
		}
	case "Dinner":
		{
			if dbParticipants.Checkpoints.Dinner {
				break
			}
			dbParticipants.Checkpoints.Dinner = true
			db.Save(&dbParticipants)
			return &dbParticipants, true, nil
		}
	case "Snacks":
		{
			if dbParticipants.Checkpoints.Snacks {
				break
			}
			dbParticipants.Checkpoints.Snacks = true
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
