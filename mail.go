package main

import (
	"fmt"
	"net/smtp"
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file:", err)
		return
	}

	dirPath := "qr/path"

	files, err := os.ReadDir(dirPath)
	if err != nil {
		fmt.Println("Error reading directory:", err)
		return
	}

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".png") {
			// Extract the email from the file name
			fileName := strings.TrimSuffix(file.Name(), ".png")
			parts := strings.Split(fileName, "-")
			email := parts[0]

			err := sendQRCodeToEmail(email, filepath.Join(dirPath, file.Name()))
			if err != nil {
				fmt.Println("Error sending QR code to email:", err)
			} else {
				fmt.Println("QR code sent to email:", email)
			}
		}
	}
}

func sendQRCodeToEmail(email, qrCodeFilePath string) error {
	// SMTP CONF
	smtpServer := "smtp.gmail.com"
	smtpPort := "587"
	smtpUsername := os.Getenv("SMTP_USERNAME")
	smtpPassword := os.Getenv("SMTP_PASSWORD")

	message := []byte(fmt.Sprintf("To: %s\r\n"+
		"Subject: QR Code\r\n"+
		"\r\n"+
		"QR CODE TAKE.\r\n", email))

	qrCodeData, err := os.ReadFile(qrCodeFilePath)
	if err != nil {
		return err
	}

	auth := smtp.PlainAuth("", smtpUsername, smtpPassword, smtpServer)
	err = smtp.SendMail(fmt.Sprintf("%s:%s", smtpServer, smtpPort), auth, smtpUsername, []string{email}, append(message, qrCodeData...))
	if err != nil {
		return err
	}

	return nil
}
