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

func setupProgressApp() (*fiber.App, *ProgressHandler, *repository.InMemoryAssignmentRepository) {
	app := fiber.New()
	progressRepo := repository.NewInMemoryProgressRepository()
	assignRepo := repository.NewInMemoryAssignmentRepository()
	handler := NewProgressHandler(progressRepo, assignRepo)

	// Middleware to set talent_id for testing
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("talent_id", "talent-1")
		return c.Next()
	})

	app.Get("/api/progress/:assignment_id", handler.GetByAssignmentID)
	app.Get("/api/jobs/:job_id/progress", handler.ListByJobID)
	app.Put("/api/progress/:assignment_id/step", handler.UpdateStep)

	return app, handler, assignRepo
}

func TestProgressHandler_GetByAssignmentID(t *testing.T) {
	app, handler, _ := setupProgressApp()

	// Seed progress
	progressRepo := handler.progressRepo
	progressRepo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-1",
		JobID:        "job-1",
		TalentID:     "talent-1",
		Steps:        repository.InitializeSteps(),
	})

	t.Run("returns progress by assignment ID", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/progress/assign-1", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var body map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&body)

		if body["success"] != true {
			t.Error("expected success=true")
		}

		data := body["data"].(map[string]interface{})
		if data["assignment_id"] != "assign-1" {
			t.Errorf("expected assignment_id 'assign-1', got '%s'", data["assignment_id"])
		}

		steps := data["steps"].([]interface{})
		if len(steps) != 4 {
			t.Errorf("expected 4 steps, got %d", len(steps))
		}
	})

	t.Run("returns 404 for non-existent progress", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/progress/non-existent", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}

func TestProgressHandler_ListByJobID(t *testing.T) {
	app, handler, _ := setupProgressApp()

	progressRepo := handler.progressRepo
	progressRepo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-1",
		JobID:        "job-1",
		TalentID:     "talent-1",
		Steps:        repository.InitializeSteps(),
	})
	progressRepo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-2",
		JobID:        "job-1",
		TalentID:     "talent-2",
		Steps:        repository.InitializeSteps(),
	})

	t.Run("returns all progress for a job", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/jobs/job-1/progress", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var body map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&body)

		data := body["data"].([]interface{})
		if len(data) != 2 {
			t.Errorf("expected 2 progress entries, got %d", len(data))
		}
	})

	t.Run("returns empty for job with no progress", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/jobs/job-empty/progress", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var body map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&body)

		data := body["data"].([]interface{})
		if len(data) != 0 {
			t.Errorf("expected 0 progress entries, got %d", len(data))
		}
	})
}

func TestProgressHandler_UpdateStep(t *testing.T) {
	app, handler, assignRepo := setupProgressApp()

	// Seed assignment
	assignRepo.Assign(&models.JobAssignment{
		ID:            "assign-1",
		JobID:         "job-1",
		SocialMediaID: "sm-1",
		TalentID:      "talent-1",
		Platform:      "instagram",
		Username:      "@alice",
	})

	// Seed progress
	progressRepo := handler.progressRepo
	progressRepo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-1",
		JobID:        "job-1",
		TalentID:     "talent-1",
		Steps:        repository.InitializeSteps(),
	})

	t.Run("completes step successfully", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"step": "absen",
		})

		req := httptest.NewRequest(http.MethodPut, "/api/progress/assign-1/step", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var respBody map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&respBody)
		data := respBody["data"].(map[string]interface{})
		steps := data["steps"].([]interface{})
		firstStep := steps[0].(map[string]interface{})

		if firstStep["status"] != models.ProgressStatusCompleted {
			t.Errorf("expected step status 'completed', got '%s'", firstStep["status"])
		}
	})

	t.Run("rejects out-of-order step", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"step": "input_link", // Skip draft_storyline
		})

		req := httptest.NewRequest(http.MethodPut, "/api/progress/assign-1/step", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 400 for invalid step", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"step": "invalid_step",
		})

		req := httptest.NewRequest(http.MethodPut, "/api/progress/assign-1/step", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 404 for non-existent assignment", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"step": "absen",
		})

		req := httptest.NewRequest(http.MethodPut, "/api/progress/non-existent/step", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 403 for unauthorized talent", func(t *testing.T) {
		// Create another app with different talent_id
		app2 := fiber.New()
		app2.Use(func(c *fiber.Ctx) error {
			c.Locals("talent_id", "talent-2") // Different talent
			return c.Next()
		})
		app2.Put("/api/progress/:assignment_id/step", handler.UpdateStep)

		body, _ := json.Marshal(map[string]string{
			"step": "absen",
		})

		req := httptest.NewRequest(http.MethodPut, "/api/progress/assign-1/step", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app2.Test(req)

		if resp.StatusCode != http.StatusForbidden {
			t.Errorf("expected status 403, got %d", resp.StatusCode)
		}
	})

	t.Run("is idempotent for already completed step", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"step": "absen", // Already completed above
		})

		req := httptest.NewRequest(http.MethodPut, "/api/progress/assign-1/step", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}
	})
}
