package database

// This struct is another table to hold team data
// type Team struct {
// 	ID    string `gorm:"primaryKey"`
// 	Team  string
// 	Theme string
// }

// This struct holds all of the unified participant data stored in the DB
type DBParticipant struct {
	ID          string      `gorm:"primaryKey"`
	Participant Participant `gorm:"embedded"`
	Checkpoints Checkpoints `gorm:"embedded"`
}

// This struct stores all fields parsed from the csv
type Participant struct {
	Team      string
	Theme     string
	Name      string
	Email     string
	Phone     int64
	College   string
	Branch    string
	PesHostel string
}

// This struct stores all event checkpoints
type Checkpoints struct {
	Snacks    bool
	Dinner    bool
	Breakfast bool
}
