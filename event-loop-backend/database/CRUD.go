package database

import (
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

func CreateParticipants(dbParticipants []DBParticipant) error {

	db, err := openDB()
	if err != nil {
		return err
	}

	// Writing to DB
	db.Create(dbParticipants)

	return nil
}

// func TestCreateRecords(formEntriesMap []map[string]string) error {
// 	db, err := openDB()
// 	if err != nil {
// 		return err
// 	}

// 	sampleParticipant := DBParticipant{
// 		Participant{
// 			"Team-1",
// 			"Theme-1",
// 			"Name-1",
// 			"Email-1",
// 			123456789,
// 			"PES",
// 			"EC",
// 			"EC",
// 		},
// 		Checkpoints{
// 			false,
// 			false,
// 			false,
// 		},
// 	}

// 	db.Create(&sampleParticipant)
// 	return nil
// }
