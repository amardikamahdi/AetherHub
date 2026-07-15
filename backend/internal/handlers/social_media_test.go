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

func setupSocialMediaApp() (*fiber.App, *SocialMediaHandler) {
	app := fiber.New()
	repo := repository.NewInMemorySocialMediaRepository()
	handler := NewSocialMediaHandler(repo)

	// Simulate auth middleware — set userID and role in locals
	app.Use("/api/talents/:talentId/social-media", func(c *fiber.Ctx) error {
		c.Locals("userID", "user-1")
		c.Locals("role", models.RoleTalent)
		return c.Next()
	})
	app.Use("/api/social-media/:id", func(c *fiber.Ctx) error {
		c.Locals("userID", "user-1")
		c.Locals("role", models.RoleTalent)
		return c.Next()
	})

	app.Get("/api/talents/:talentId/social-media", handler.ListByTalentID)
	app.Post("/api/talents/:talentId/social-media", handler.Create)
	app.Put("/api/social-media/:id", handler.Update)
	app.Delete("/api/social-media/:id", handler.Delete)

	return app, handler
}

func TestSocialMediaHandler_ListByTalentID(t *testing.T) {
	app, handler := setupSocialMediaApp()

	handler.repo.Create(&models.SocialMediaAccount{ID: "sm-1", TalentID: "talent-1", Platform: "instagram", Username: "@alice"})
	handler.repo.Create(&models.SocialMediaAccount{ID: "sm-2", TalentID: "talent-1", Platform: "tiktok", Username: "@alice"})

	t.Run("returns accounts for talent", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/talents/talent-1/social-media", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var body map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&body)
		data := body["data"].([]interface{})

		if len(data) != 2 {
			t.Errorf("expected 2 accounts, got %d", len(data))
		}
	})

	t.Run("returns empty for talent with no accounts", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/talents/talent-99/social-media", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}
	})
}

func TestSocialMediaHandler_Create(t *testing.T) {
	app, _ := setupSocialMediaApp()

	t.Run("creates account successfully", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"platform": "instagram",
			"username": "@newuser",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/talents/talent-1/social-media", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusCreated {
			t.Errorf("expected status 201, got %d", resp.StatusCode)
		}

		var respBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&respBody)
		data := respBody["data"].(map[string]interface{})

		if data["platform"] != "instagram" {
			t.Errorf("expected platform 'instagram', got '%s'", data["platform"])
		}
	})

	t.Run("returns 400 for invalid platform", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"platform": "invalid",
			"username": "@user",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/talents/talent-1/social-media", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 400 for missing username", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"platform": "instagram",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/talents/talent-1/social-media", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})
}

func TestSocialMediaHandler_Update(t *testing.T) {
	app, handler := setupSocialMediaApp()

	handler.repo.Create(&models.SocialMediaAccount{
		ID:       "sm-1",
		TalentID: "user-1", // same as mock userID
		Platform: "instagram",
		Username: "@alice",
	})

	t.Run("updates own account successfully", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"username": "@alice_updated",
		})

		req := httptest.NewRequest(http.MethodPut, "/api/social-media/sm-1", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 404 for non-existent account", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{"username": "@x"})
		req := httptest.NewRequest(http.MethodPut, "/api/social-media/non-existent", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}

func TestSocialMediaHandler_Delete(t *testing.T) {
	app, handler := setupSocialMediaApp()

	handler.repo.Create(&models.SocialMediaAccount{
		ID:       "sm-delete",
		TalentID: "user-1",
		Platform: "instagram",
		Username: "@alice",
	})

	t.Run("deletes own account successfully", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/social-media/sm-delete", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 404 for non-existent account", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/social-media/non-existent", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}
