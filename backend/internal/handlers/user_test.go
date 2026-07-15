package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/amardikamahdi/AetherHub/internal/repository"
	"github.com/gofiber/fiber/v2"
)

func setupUserApp() (*fiber.App, *UserHandler) {
	app := fiber.New()
	repo := repository.NewInMemoryUserRepository()
	handler := NewUserHandler(repo)

	app.Get("/api/users", handler.List)
	app.Get("/api/users/:id", handler.GetByID)
	app.Put("/api/users/:id", handler.Update)
	app.Delete("/api/users/:id", handler.Delete)

	return app, handler
}

func TestUserHandler_List(t *testing.T) {
	app, handler := setupUserApp()

	for i := 0; i < 5; i++ {
		handler.repo.Create(&models.User{
			ID:    "user-" + string(rune('a'+i)),
			Email: "user" + string(rune('a'+i)) + "@test.com",
			Name:  "User " + string(rune('A'+i)),
			Role:  models.RoleTalent,
		})
	}

	t.Run("returns paginated user list", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/users?offset=0&limit=3", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var body map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&body)

		if body["success"] != true {
			t.Error("expected success=true")
		}

		data := body["data"].([]interface{})
		if len(data) != 3 {
			t.Errorf("expected 3 users, got %d", len(data))
		}
	})

	t.Run("returns empty list for out-of-range offset", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/users?offset=100&limit=10", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}
	})
}

func TestUserHandler_GetByID(t *testing.T) {
	app, handler := setupUserApp()

	handler.repo.Create(&models.User{
		ID:    "user-detail",
		Email: "detail@test.com",
		Name:  "Detail User",
		Role:  models.RoleAdmin,
	})

	t.Run("returns user by ID", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/users/user-detail", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var body map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&body)
		data := body["data"].(map[string]interface{})

		if data["name"] != "Detail User" {
			t.Errorf("expected name 'Detail User', got '%s'", data["name"])
		}
	})

	t.Run("returns 404 for non-existent user", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/users/non-existent", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}

func TestUserHandler_Update(t *testing.T) {
	app, handler := setupUserApp()

	handler.repo.Create(&models.User{
		ID:    "user-update",
		Email: "update@test.com",
		Name:  "Original Name",
		Role:  models.RoleTalent,
	})

	t.Run("updates user successfully", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"name": "Updated Name",
		})

		req := httptest.NewRequest(http.MethodPut, "/api/users/user-update", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var respBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&respBody)
		data := respBody["data"].(map[string]interface{})

		if data["name"] != "Updated Name" {
			t.Errorf("expected name 'Updated Name', got '%s'", data["name"])
		}
	})

	t.Run("returns 404 for non-existent user", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{"name": "X"})
		req := httptest.NewRequest(http.MethodPut, "/api/users/non-existent", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}

func TestUserHandler_Delete(t *testing.T) {
	app, handler := setupUserApp()

	handler.repo.Create(&models.User{
		ID:    "user-delete",
		Email: "delete@test.com",
		Name:  "Delete Me",
		Role:  models.RoleTalent,
	})

	t.Run("deletes user successfully", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/users/user-delete", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		getReq := httptest.NewRequest(http.MethodGet, "/api/users/user-delete", nil)
		getResp, _ := app.Test(getReq)

		if getResp.StatusCode != http.StatusNotFound {
			t.Errorf("expected 404 after delete, got %d", getResp.StatusCode)
		}
	})

	t.Run("returns 404 for non-existent user", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/users/non-existent", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}
