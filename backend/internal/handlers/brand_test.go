package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/amardikamahdi/AetherHub/internal/repository"
	"github.com/gofiber/fiber/v2"
)

func setupBrandApp() (*fiber.App, *BrandHandler) {
	app := fiber.New()
	repo := repository.NewInMemoryBrandRepository()
	handler := NewBrandHandler(repo)

	app.Post("/api/brand/validate/:code", handler.ValidateCode)
	app.Get("/api/brand/access/:code", handler.Access)

	return app, handler
}

func TestBrandHandler_ValidateCode(t *testing.T) {
	app, handler := setupBrandApp()

	handler.repo.Create(&models.BrandAccessCode{
		ID:         "brand-1",
		BrandName:  "Test Brand",
		UniqueCode: "ABC123",
		IsActive:   true,
	})

	t.Run("validates active code", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/brand/validate/ABC123", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var body map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&body)
		if body["success"] != true {
			t.Error("expected success=true")
		}
	})

	t.Run("rejects invalid code", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/brand/validate/INVALID", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})

	t.Run("rejects inactive code", func(t *testing.T) {
		handler.repo.Create(&models.BrandAccessCode{
			ID:         "brand-2",
			BrandName:  "Inactive",
			UniqueCode: "INACTIVE",
			IsActive:   false,
		})

		req := httptest.NewRequest(http.MethodPost, "/api/brand/validate/INACTIVE", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusForbidden {
			t.Errorf("expected status 403, got %d", resp.StatusCode)
		}
	})
}

func TestBrandHandler_Access(t *testing.T) {
	app, handler := setupBrandApp()

	handler.repo.Create(&models.BrandAccessCode{
		ID:         "brand-3",
		BrandName:  "Access Brand",
		UniqueCode: "ACCESS1",
		IsActive:   true,
	})

	t.Run("returns brand data for valid code", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/brand/access/ACCESS1", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 404 for invalid code", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/brand/access/INVALID", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}
