package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"mime/multipart"
	"net/http"
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

	dirPath := "test/"

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

	message := bytes.NewBuffer(nil)

	message.WriteString("Subject: Inginy24 Attendance QR's\n")
	message.WriteString(fmt.Sprintf("To: %s\n", email))
	message.WriteString("MIME-Version: 1.0\n")

	writer := multipart.NewWriter(message)
	boundary := writer.Boundary()

	message.WriteString(fmt.Sprintf("Content-Type: multipart/mixed; boundary=%s\n", boundary))
	message.WriteString(fmt.Sprintf("--%s\n", boundary))

	message.WriteString("Please save the following QR which will be used through your time in this competition")

	qrData, err := os.ReadFile(qrCodeFilePath)
	if err != nil {
		return err
	}

	message.WriteString(fmt.Sprintf("\n\n--%s\n", boundary))
	message.WriteString(fmt.Sprintf("Content-Type: %s\n", http.DetectContentType(qrData)))
	message.WriteString("Content-Transfer-Encoding: base64\n")

	_, fileName := filepath.Split(qrCodeFilePath)
	message.WriteString(fmt.Sprintf("Content-Disposition: attachment; filename=%s\n", fileName))

	img := make([]byte, base64.StdEncoding.EncodedLen(len(qrData)))
	base64.StdEncoding.Encode(img, qrData)
	message.Write(img)
	message.WriteString(fmt.Sprintf("\n--%s", boundary))

	message.WriteString("--")

	auth := smtp.PlainAuth("", smtpUsername, smtpPassword, smtpServer)

	addr := fmt.Sprintf("%s:%s", smtpServer, smtpPort)
	err = smtp.SendMail(addr, auth, smtpUsername, []string{email}, message.Bytes())
	if err != nil {
		return err
	}

	return nil
}
