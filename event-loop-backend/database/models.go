package database

type Team struct {
	ID    string `gorm:"primaryKey"`
	Team  string
	Theme string
}

type Participant struct {
	ID        string `gorm:"primaryKey"`
	Team      string
	Theme     string
	Name      string
	Email     string
	Phone     int64
	College   string
	Branch    string
	PesHostel string
}
