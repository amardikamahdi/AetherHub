package utils

import "testing"

func TestHashPassword(t *testing.T) {
	t.Run("hashes password successfully", func(t *testing.T) {
		hash, err := HashPassword("securepassword123")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if hash == "" {
			t.Fatal("hash should not be empty")
		}
		if hash == "securepassword123" {
			t.Fatal("hash should not equal plain password")
		}
	})

	t.Run("different passwords produce different hashes", func(t *testing.T) {
		hash1, _ := HashPassword("password1")
		hash2, _ := HashPassword("password2")
		if hash1 == hash2 {
			t.Fatal("different passwords should produce different hashes")
		}
	})
}

func TestCheckPassword(t *testing.T) {
	t.Run("returns true for matching password", func(t *testing.T) {
		password := "mypassword"
		hash, _ := HashPassword(password)
		if !CheckPassword(password, hash) {
			t.Fatal("should return true for matching password")
		}
	})

	t.Run("returns false for non-matching password", func(t *testing.T) {
		hash, _ := HashPassword("correctpassword")
		if CheckPassword("wrongpassword", hash) {
			t.Fatal("should return false for non-matching password")
		}
	})
}
