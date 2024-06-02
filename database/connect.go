package database

import (
	"github.com/homebrew-ec-foss/event-loop-backend/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB // global variable to this package, also exported if needed to be used by other packages

func Connect(dbFilePath string) error {
	var err error
	DB, err = gorm.Open(sqlite.Open(dbFilePath), &gorm.Config{})
	if err != nil {
		return err
	}
	DB.AutoMigrate(&models.Event{}, &models.Participant{}, &models.Team{}, &models.Checkpoint{})
	return nil
}
