package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/gofiber/fiber/v2"
)

// mockUserService is a mock implementation for testing.
type mockUserService struct {
	users map[string]*models.User
}

func newMockUserService() *mockUserService {
	return &mockUserService{
		users: make(map[string]*models.User),
	}
}

func (m *mockUserService) CreateUser(user *models.User) error {
	if _, exists := m.users[user.Email]; exists {
		return fmt.Errorf("email already exists")
	}
	m.users[user.Email] = user
	return nil
}

func (m *mockUserService) GetUserByEmail(email string) (*models.User, error) {
	user, exists := m.users[email]
	if !exists {
		return nil, fmt.Errorf("user not found")
	}
	return user, nil
}

func TestRegisterHandler(t *testing.T) {
	app := fiber.New()
	handler := NewAuthHandler(newMockUserService(), "test-secret")
	app.Post("/api/auth/register", handler.Register)

	t.Run("registers new talent successfully", func(t *testing.T) {
		body, _ := json.Marshal(models.CreateUserRequest{
			Email:    "talent@test.com",
			Password: "password123",
			Name:     "Test Talent",
			Role:     models.RoleTalent,
		})

		req := httptest.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := app.Test(req)

		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if resp.StatusCode != http.StatusCreated {
			t.Errorf("expected status 201, got %d", resp.StatusCode)
		}
	})

	t.Run("rejects invalid email", func(t *testing.T) {
		body, _ := json.Marshal(models.CreateUserRequest{
			Email:    "invalid-email",
			Password: "password123",
			Name:     "Test User",
			Role:     models.RoleTalent,
		})

		req := httptest.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})

	t.Run("rejects empty password", func(t *testing.T) {
		body, _ := json.Marshal(models.CreateUserRequest{
			Email:    "test@test.com",
			Password: "",
			Name:     "Test User",
			Role:     models.RoleTalent,
		})

		req := httptest.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})
}

func TestLoginHandler(t *testing.T) {
	app := fiber.New()
	handler := NewAuthHandler(newMockUserService(), "test-secret")
	app.Post("/api/auth/login", handler.Login)

	t.Run("rejects missing credentials", func(t *testing.T) {
		body, _ := json.Marshal(models.LoginRequest{
			Email:    "",
			Password: "",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})
}
