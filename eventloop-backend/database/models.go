package database

import "gorm.io/gorm"


type Participant struct {
	gorm.Model
	// Participant Info
	// - Name
	// - Email
	// - SRN???
	// - Phone Number
	// - CGPA

	// Team Relation info
	// - Team Name
}
