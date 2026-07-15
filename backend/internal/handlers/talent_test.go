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

func setupTalentApp() (*fiber.App, *TalentHandler) {
	app := fiber.New()
	repo := repository.NewInMemoryTalentRepository()
	handler := NewTalentHandler(repo)

	app.Get("/api/talents", handler.List)
	app.Get("/api/talents/:id", handler.GetByID)
	app.Post("/api/talents", handler.Create)
	app.Put("/api/talents/:id", handler.Update)
	app.Delete("/api/talents/:id", handler.Delete)

	return app, handler
}

func TestTalentHandler_List(t *testing.T) {
	app, handler := setupTalentApp()

	for i := 0; i < 5; i++ {
		handler.repo.Create(&models.TalentProfile{
			ID:     "talent-" + string(rune('a'+i)),
			UserID: "user-" + string(rune('a'+i)),
			Name:   "Talent " + string(rune('A'+i)),
			Email:  "talent" + string(rune('a'+i)) + "@test.com",
		})
	}

	t.Run("returns paginated talent list", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/talents?offset=0&limit=3", nil)
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
			t.Errorf("expected 3 talents, got %d", len(data))
		}
	})

	t.Run("returns empty list for out-of-range offset", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/talents?offset=100&limit=10", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}
	})
}

func TestTalentHandler_GetByID(t *testing.T) {
	app, handler := setupTalentApp()

	handler.repo.Create(&models.TalentProfile{
		ID:     "talent-detail",
		UserID: "user-1",
		Name:   "Alice",
		Email:  "alice@test.com",
	})

	t.Run("returns talent by ID", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/talents/talent-detail", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var body map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&body)
		data := body["data"].(map[string]interface{})

		if data["name"] != "Alice" {
			t.Errorf("expected name 'Alice', got '%s'", data["name"])
		}
	})

	t.Run("returns 404 for non-existent talent", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/talents/non-existent", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}

func TestTalentHandler_Create(t *testing.T) {
	app, _ := setupTalentApp()

	t.Run("creates talent successfully", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"name":  "New Talent",
			"email": "new@test.com",
			"phone": "08123456789",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/talents", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusCreated {
			t.Errorf("expected status 201, got %d", resp.StatusCode)
		}

		var respBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&respBody)
		data := respBody["data"].(map[string]interface{})

		if data["name"] != "New Talent" {
			t.Errorf("expected name 'New Talent', got '%s'", data["name"])
		}
	})

	t.Run("returns 400 for missing name", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"email": "noname@test.com",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/talents", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 400 for missing email", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"name": "No Email",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/talents", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 400 for invalid email", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"name":  "Bad Email",
			"email": "not-an-email",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/talents", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})
}

func TestTalentHandler_Update(t *testing.T) {
	app, handler := setupTalentApp()

	handler.repo.Create(&models.TalentProfile{
		ID:     "talent-update",
		UserID: "user-1",
		Name:   "Original Name",
		Email:  "original@test.com",
	})

	t.Run("updates talent successfully", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"name": "Updated Name",
		})

		req := httptest.NewRequest(http.MethodPut, "/api/talents/talent-update", bytes.NewReader(body))
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

	t.Run("returns 400 for invalid email", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"email": "bad-email",
		})

		req := httptest.NewRequest(http.MethodPut, "/api/talents/talent-update", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 404 for non-existent talent", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{"name": "X"})
		req := httptest.NewRequest(http.MethodPut, "/api/talents/non-existent", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}

func TestTalentHandler_Delete(t *testing.T) {
	app, handler := setupTalentApp()

	handler.repo.Create(&models.TalentProfile{
		ID:     "talent-delete",
		UserID: "user-1",
		Name:   "Delete Me",
		Email:  "delete@test.com",
	})

	t.Run("deletes talent successfully", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/talents/talent-delete", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		getReq := httptest.NewRequest(http.MethodGet, "/api/talents/talent-delete", nil)
		getResp, _ := app.Test(getReq)

		if getResp.StatusCode != http.StatusNotFound {
			t.Errorf("expected 404 after delete, got %d", getResp.StatusCode)
		}
	})

	t.Run("returns 404 for non-existent talent", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/talents/non-existent", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}
