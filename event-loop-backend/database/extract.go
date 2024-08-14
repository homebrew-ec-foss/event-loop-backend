
package database

import (
	"log"
	"strconv"
)

func GetTeamParticipants(record []string) []Participant {
	participant := []Participant{}

	// record := strings.Split(record, ",")

	// teamName := record[0]
	// teamTopic := record[1]

	// participant id 1-4
	for i := 2; i < 26; i += 6 {
		phone_num, err := strconv.Atoi(record[i+2])
		if err != nil {
			log.Fatal(phone_num)
		}
		// part := Participant{
		// 	Name:          record[i],
		// 	Email:         record[i+1],
		// 	PhoneNumber:   uint(phone_num),
		// 	CollegeName:   record[i+3],
		// 	BranchName:    record[i+4],
		// 	PESHostelName: record[i+5],

		// 	TeamName: teamName,
		// }

		// participant = append(participant, part)
	}

	// log.Println(participant)
	return participant
}
