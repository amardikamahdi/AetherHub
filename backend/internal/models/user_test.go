package models

import (
	"testing"
	"time"
)

func TestUserModel(t *testing.T) {
	t.Run("creates user with valid fields", func(t *testing.T) {
		user := User{
			ID:           "uuid-123",
			Email:        "test@example.com",
			PasswordHash: "$2a$10$hash",
			Name:         "Test User",
			Role:         RoleTalent,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		if user.ID == "" {
			t.Fatal("user ID should not be empty")
		}
		if user.Email != "test@example.com" {
			t.Errorf("expected email 'test@example.com', got '%s'", user.Email)
		}
		if user.Role != RoleTalent {
			t.Errorf("expected role 'talent', got '%s'", user.Role)
		}
	})

	t.Run("validates role constants", func(t *testing.T) {
		if RoleSuperadmin != "superadmin" {
			t.Errorf("expected 'superadmin', got '%s'", RoleSuperadmin)
		}
		if RoleAdmin != "admin" {
			t.Errorf("expected 'admin', got '%s'", RoleAdmin)
		}
		if RoleTalent != "talent" {
			t.Errorf("expected 'talent', got '%s'", RoleTalent)
		}
	})
}

func TestCreateUserRequest(t *testing.T) {
	t.Run("validates required fields", func(t *testing.T) {
		req := CreateUserRequest{
			Email:    "test@example.com",
			Password: "password123",
			Name:     "Test User",
			Role:     RoleTalent,
		}

		if req.Email == "" {
			t.Fatal("email should not be empty")
		}
		if req.Password == "" {
			t.Fatal("password should not be empty")
		}
		if req.Name == "" {
			t.Fatal("name should not be empty")
		}
	})
}
