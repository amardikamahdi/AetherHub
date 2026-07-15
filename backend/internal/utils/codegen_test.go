package utils

import (
	"testing"
)

func TestGenerateUniqueCode(t *testing.T) {
	t.Run("generates code of specified length", func(t *testing.T) {
		code, err := GenerateUniqueCode(10)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(code) != 10 {
			t.Errorf("expected length 10, got %d", len(code))
		}
	})

	t.Run("generates alphanumeric code", func(t *testing.T) {
		code, _ := GenerateUniqueCode(20)
		for _, c := range code {
			if !((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')) {
				t.Errorf("unexpected character: %c", c)
			}
		}
	})

	t.Run("generates different codes", func(t *testing.T) {
		code1, _ := GenerateUniqueCode(10)
		code2, _ := GenerateUniqueCode(10)
		if code1 == code2 {
			t.Error("consecutive codes should differ")
		}
	})

	t.Run("returns error for invalid length", func(t *testing.T) {
		_, err := GenerateUniqueCode(0)
		if err == nil {
			t.Error("should return error for length 0")
		}
	})
}
