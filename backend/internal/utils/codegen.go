package utils

import (
	"crypto/rand"
	"errors"
	"math/big"
)

const codeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// GenerateUniqueCode creates a random alphanumeric code of the specified length.
func GenerateUniqueCode(length int) (string, error) {
	if length <= 0 {
		return "", errors.New("length must be positive")
	}

	result := make([]byte, length)
	for i := range result {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(codeChars))))
		if err != nil {
			return "", err
		}
		result[i] = codeChars[n.Int64()]
	}
	return string(result), nil
}
