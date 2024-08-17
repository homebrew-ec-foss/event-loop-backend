Test-QR's

The test qr's work only with the `labels.csv`, generated with a specific env key at `event-loop-backend/.env`

Regenerating QR's


`handlers/authentication.go`

```go
func GenerateOR(signedString string, i int) ([]byte, error) {
	// -- snip --

	err = qrcode.WriteFile(signedString, qrcode.Medium, 256, fmt.Sprintf("part-%d.png", i))
	if err != nil {
		return nil, err
	}

	// -- snip --
}
```
