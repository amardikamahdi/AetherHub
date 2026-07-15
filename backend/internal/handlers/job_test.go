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

func setupJobApp() (*fiber.App, *JobHandler) {
	app := fiber.New()
	repo := repository.NewInMemoryJobRepository()
	handler := NewJobHandler(repo)

	app.Get("/api/jobs", handler.List)
	app.Get("/api/jobs/:id", handler.GetByID)
	app.Post("/api/jobs", handler.Create)
	app.Put("/api/jobs/:id", handler.Update)
	app.Delete("/api/jobs/:id", handler.Delete)

	return app, handler
}

func TestJobHandler_List(t *testing.T) {
	app, handler := setupJobApp()

	for i := 0; i < 5; i++ {
		handler.repo.Create(&models.Job{
			ID:        "job-" + string(rune('a'+i)),
			Title:     "Job " + string(rune('A'+i)),
			BrandName: "Brand",
			Status:    models.JobStatusActive,
		})
	}

	t.Run("returns paginated job list", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/jobs?offset=0&limit=3", nil)
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
			t.Errorf("expected 3 jobs, got %d", len(data))
		}
	})

	t.Run("returns empty list for out-of-range offset", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/jobs?offset=100&limit=10", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}
	})
}

func TestJobHandler_GetByID(t *testing.T) {
	app, handler := setupJobApp()

	handler.repo.Create(&models.Job{
		ID:        "job-detail",
		Title:     "Instagram Campaign",
		BrandName: "Nike",
		Status:    models.JobStatusDraft,
	})

	t.Run("returns job by ID", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/jobs/job-detail", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var body map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&body)
		data := body["data"].(map[string]interface{})

		if data["title"] != "Instagram Campaign" {
			t.Errorf("expected title 'Instagram Campaign', got '%s'", data["title"])
		}
	})

	t.Run("returns 404 for non-existent job", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/jobs/non-existent", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}

func TestJobHandler_Create(t *testing.T) {
	app, _ := setupJobApp()

	t.Run("creates job successfully", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"title":      "New Campaign",
			"brand_name": "Adidas",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/jobs", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusCreated {
			t.Errorf("expected status 201, got %d", resp.StatusCode)
		}

		var respBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&respBody)
		data := respBody["data"].(map[string]interface{})

		if data["title"] != "New Campaign" {
			t.Errorf("expected title 'New Campaign', got '%s'", data["title"])
		}
		if data["status"] != models.JobStatusDraft {
			t.Errorf("expected status 'draft', got '%s'", data["status"])
		}
	})

	t.Run("returns 400 for missing title", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"brand_name": "Nike",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/jobs", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 400 for missing brand_name", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"title": "No Brand",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/jobs", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})

	t.Run("creates job with deadline", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"title":      "Deadline Job",
			"brand_name": "Puma",
			"deadline":   "2026-12-31",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/jobs", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusCreated {
			t.Errorf("expected status 201, got %d", resp.StatusCode)
		}
	})
}

func TestJobHandler_Update(t *testing.T) {
	app, handler := setupJobApp()

	handler.repo.Create(&models.Job{
		ID:        "job-update",
		Title:     "Original Title",
		BrandName: "Nike",
		Status:    models.JobStatusDraft,
	})

	t.Run("updates job successfully", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"title": "Updated Title",
		})

		req := httptest.NewRequest(http.MethodPut, "/api/jobs/job-update", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var respBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&respBody)
		data := respBody["data"].(map[string]interface{})

		if data["title"] != "Updated Title" {
			t.Errorf("expected title 'Updated Title', got '%s'", data["title"])
		}
	})

	t.Run("updates job status", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"status": "active",
		})

		req := httptest.NewRequest(http.MethodPut, "/api/jobs/job-update", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 400 for invalid status", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"status": "invalid",
		})

		req := httptest.NewRequest(http.MethodPut, "/api/jobs/job-update", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 404 for non-existent job", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{"title": "X"})
		req := httptest.NewRequest(http.MethodPut, "/api/jobs/non-existent", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}

func TestJobHandler_Delete(t *testing.T) {
	app, handler := setupJobApp()

	handler.repo.Create(&models.Job{
		ID:        "job-delete",
		Title:     "Delete Me",
		BrandName: "Nike",
		Status:    models.JobStatusDraft,
	})

	t.Run("deletes job successfully", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/jobs/job-delete", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		getReq := httptest.NewRequest(http.MethodGet, "/api/jobs/job-delete", nil)
		getResp, _ := app.Test(getReq)

		if getResp.StatusCode != http.StatusNotFound {
			t.Errorf("expected 404 after delete, got %d", getResp.StatusCode)
		}
	})

	t.Run("returns 404 for non-existent job", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/jobs/non-existent", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}
