package main

import (
	"crypto/tls"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/gomail.v2"
)

func main() {
	// SMTP server configuration
	dialer := gomail.NewDialer("smtp.gmail.com", 465, "kludge@pes.edu", "jsxk cocf oyml izbo")
	// For production, remove InsecureSkipVerify or set it to false.
	dialer.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	// Open a connection to the SMTP server
	sender, err := dialer.Dial()
	if err != nil {
		log.Fatalf("Could not connect to SMTP server: %v", err)
	}
	defer sender.Close()

	// Directory containing the QR code PNG files
	dir := "./qr-png"

	// Walk through the directory and process each PNG file
	err = filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Process only PNG files
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".png") {
			// Extract email from the file name
			email, name := extractEmailFromFileName(info.Name())
			if email == "" {
				log.Printf("Could not extract email from file name: %s", info.Name())
				return nil
			}

			// Create a new email message
			msg := gomail.NewMessage()
			msg.SetHeader("From", "kludge@pes.edu")
			msg.SetHeader("To", email)
			msg.SetHeader("Subject", "rr campus sudhir bus samosa scam")
			msg.SetBody("text/plain", fmt.Sprintf("SUDHIR SCAN %s", name))
			msg.Attach(path)

			// Send the email using the persistent connection
			if err := gomail.Send(sender, msg); err != nil {
				log.Printf("Could not send email to %s: %v", email, err)
			} else {
				fmt.Printf("Email sent to %s successfully.\n", email)
			}
		}

		return nil
	})

	if err != nil {
		log.Fatalf("Error walking the directory: %v", err)
	}
}

// extractEmailFromFileName extracts the email from the file name
func extractEmailFromFileName(fileName string) (string, string) {
	parts := strings.Split(fileName, "-")
	if len(parts) > 1 {
		return parts[0], parts[1]
	}
	return "", ""
}
