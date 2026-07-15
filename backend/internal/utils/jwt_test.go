package utils

import (
	"testing"
	"time"
)

func TestGenerateToken(t *testing.T) {
	t.Run("generates valid JWT token", func(t *testing.T) {
		token, err := GenerateToken("user-123", "admin", "test-secret", 24*time.Hour)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if token == "" {
			t.Fatal("token should not be empty")
		}
	})

	t.Run("different users produce different tokens", func(t *testing.T) {
		token1, _ := GenerateToken("user-1", "admin", "secret", 24*time.Hour)
		token2, _ := GenerateToken("user-2", "talent", "secret", 24*time.Hour)
		if token1 == token2 {
			t.Fatal("different users should produce different tokens")
		}
	})
}

func TestValidateToken(t *testing.T) {
	t.Run("validates valid token", func(t *testing.T) {
		secret := "test-secret"
		token, _ := GenerateToken("user-123", "admin", secret, 24*time.Hour)
		claims, err := ValidateToken(token, secret)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if claims.UserID != "user-123" {
			t.Errorf("expected userID 'user-123', got '%s'", claims.UserID)
		}
		if claims.Role != "admin" {
			t.Errorf("expected role 'admin', got '%s'", claims.Role)
		}
	})

	t.Run("rejects expired token", func(t *testing.T) {
		secret := "test-secret"
		token, _ := GenerateToken("user-123", "admin", secret, -1*time.Hour)
		_, err := ValidateToken(token, secret)
		if err == nil {
			t.Fatal("should reject expired token")
		}
	})

	t.Run("rejects token with wrong secret", func(t *testing.T) {
		token, _ := GenerateToken("user-123", "admin", "secret-1", 24*time.Hour)
		_, err := ValidateToken(token, "secret-2")
		if err == nil {
			t.Fatal("should reject token signed with different secret")
		}
	})
}
