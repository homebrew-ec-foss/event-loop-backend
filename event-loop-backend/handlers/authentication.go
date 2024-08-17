package handlers

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/golang-jwt/jwt/v5"
	"github.com/homebrew-ec-foss/event-loop-backend/database"
	"github.com/joho/godotenv"
	"github.com/skip2/go-qrcode"
)

// Claims for JWT
type JWTClaims struct {
	Name    string `json:"name"`
	College string `json:"college"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
	// probably add team id here
	jwt.RegisteredClaims
}

func goDotEnvVariable(key string) string {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal(err)
	}

	return os.Getenv(key)
}

func JWTAuthCheck(rawtoken string) (bool, *jwt.MapClaims) {
	parser_struct := jwt.Parser{}

	claims := jwt.MapClaims{}
	dotenv := goDotEnvVariable("JWT_SECRET_KEY")
	token, err := parser_struct.ParseWithClaims(rawtoken, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(dotenv), nil
	})
	if err != nil {
		return false, nil
	}

	if token.Valid {
		// sucessful auth
		return true, &claims
	} else {
		return false, nil
	}
}

func GenerateAuthoToken(user_record database.Participant) (string, *JWTClaims) {
	claims := JWTClaims{
		user_record.Name,
		user_record.Email,
		strconv.Itoa(int(user_record.Phone)),
		user_record.Email,
		jwt.RegisteredClaims{
			Issuer: "userservices",
		},
	}

	dotenv := goDotEnvVariable("JWT_SECRET_KEY")

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedString, err := token.SignedString([]byte(dotenv))
	if err != nil {
		log.Println("Aiyo where is that []bytes")
		log.Fatal(err)
	}

	return signedString, &claims
}

func GetClaimsInfo(rawtoken string) map[string]interface{} {
	parser_struct := jwt.Parser{}
	claims := jwt.MapClaims{}
	token, err := parser_struct.ParseWithClaims(rawtoken, claims, func(t *jwt.Token) (interface{}, error) {
		dotenv := goDotEnvVariable("JWT_SECRET_KEY")
		return []byte(dotenv), nil
	})

	if token.Valid {
		return claims
	} else {
		log.Println(err)
		return nil
	}
}

// TODO: cleanup arguments for GenerateOR
func GenerateOR(signedString, participantName string, participantPhone int64) ([]byte, error) {
	var png []byte
	png, err := qrcode.Encode(signedString, qrcode.Low, 256)
	if err != nil {
		return nil, err
	}

	if err = os.MkdirAll("../test-data/qr-png/", 0750); err != nil {
		log.Println(err)
	}

	err = qrcode.WriteFile(signedString, qrcode.Medium, 256, fmt.Sprintf("../test-data/qr-png/person-%s-%d.png", participantName, participantPhone))
	if err != nil {
		return nil, err
	}

	return png, nil
}
