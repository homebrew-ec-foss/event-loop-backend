package database

import (
	"fmt"

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
