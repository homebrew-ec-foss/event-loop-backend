package models

// This file contains models required for GORM.
// These models are automatically converted to tables on calling db.AutoMigrate() (which is done in /database/connect.go)
// See GORM documentation for more.

import (
	"time"

	"gorm.io/gorm"
)

type Event struct {
	gorm.Model    // this inserts basic fields like date created, modified, ID etc.
	Name          string
	StartTime     *time.Time
	Duration      int // number of hours
	IsTeamEvent   bool
	AdminEmail    string
	Participants  []Participant
	Teams         []Team
	CeckpointList []Checkpoint
}

type Participant struct {
	gorm.Model
	EventID     uint // event ID to which this participant belongs; used when it's an individual event
	TeamID      uint // team ID to which this participant belongs; if team event, else null
	Name        string
	PRN         string
	SRN         string
	Semester    string
	Email       string
	PhoneNumber string
	TableNumber int
	Checkpoints []Checkpoint
}

type Team struct {
	gorm.Model
	EventID     uint
	Name        string // team name
	TableNumber int
	TeamMembers []Participant
}

type Checkpoint struct {
	gorm.Model
	// the following two are required for GORM associations
	EventID       uint
	ParticipantID uint

	Name      string
	isVisited bool // this field is used when a participant visits a checkpoint
	// this field is not used when this checkpoint is referenced by an event.
}
