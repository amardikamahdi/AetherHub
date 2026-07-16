package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/amardikamahdi/AetherHub/internal/middleware"
	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/amardikamahdi/AetherHub/internal/repository"
	"github.com/gofiber/fiber/v2"
)

func setupAssignmentApp() (*fiber.App, *AssignmentHandler, *repository.InMemoryJobRepository, *repository.InMemorySocialMediaRepository) {
	app := fiber.New()
	jobRepo := repository.NewInMemoryJobRepository()
	smRepo := repository.NewInMemorySocialMediaRepository()
	assignRepo := repository.NewInMemoryAssignmentRepository()
	handler := NewAssignmentHandler(assignRepo, jobRepo, smRepo)

	// Seed a job
	jobRepo.Create(&models.Job{
		ID:        "job-1",
		Title:     "Test Job",
		BrandName: "Nike",
		Status:    models.JobStatusActive,
	})

	// Seed a social media account
	smRepo.Create(&models.SocialMediaAccount{
		ID:       "sm-1",
		TalentID: "talent-1",
		Platform: "instagram",
		Username: "@alice",
	})

	app.Post("/api/jobs/:jobId/assignments", handler.Assign)
	app.Delete("/api/assignments/:id", handler.Unassign)
	app.Get("/api/jobs/:jobId/assignments", handler.ListByJobID)

	return app, handler, jobRepo, smRepo
}

func TestAssignmentHandler_Assign(t *testing.T) {
	app, _, _, _ := setupAssignmentApp()

	t.Run("assigns successfully", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"social_media_id": "sm-1",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/jobs/job-1/assignments", bytes.NewReader(body))
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
		if data["talent_id"] != "talent-1" {
			t.Errorf("expected talent_id 'talent-1', got '%s'", data["talent_id"])
		}
	})

	t.Run("returns 409 for duplicate assignment", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"social_media_id": "sm-1",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/jobs/job-1/assignments", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusConflict {
			t.Errorf("expected status 409, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 404 for non-existent job", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"social_media_id": "sm-1",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/jobs/non-existent/assignments", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 404 for non-existent social media", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"social_media_id": "sm-non-existent",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/jobs/job-1/assignments", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 400 for missing social_media_id", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{})

		req := httptest.NewRequest(http.MethodPost, "/api/jobs/job-1/assignments", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})
}

func TestAssignmentHandler_Assign_CompletedJob(t *testing.T) {
	app := fiber.New()
	jobRepo := repository.NewInMemoryJobRepository()
	smRepo := repository.NewInMemorySocialMediaRepository()
	assignRepo := repository.NewInMemoryAssignmentRepository()
	handler := NewAssignmentHandler(assignRepo, jobRepo, smRepo)

	// Seed a completed job
	jobRepo.Create(&models.Job{
		ID:        "job-completed",
		Title:     "Completed Job",
		BrandName: "Nike",
		Status:    models.JobStatusCompleted,
	})

	smRepo.Create(&models.SocialMediaAccount{
		ID:       "sm-1",
		TalentID: "talent-1",
		Platform: "instagram",
		Username: "@alice",
	})

	app.Post("/api/jobs/:jobId/assignments", handler.Assign)

	t.Run("returns 400 for completed job", func(t *testing.T) {
		body, _ := json.Marshal(map[string]string{
			"social_media_id": "sm-1",
		})

		req := httptest.NewRequest(http.MethodPost, "/api/jobs/job-completed/assignments", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("expected status 400, got %d", resp.StatusCode)
		}
	})
}

func TestAssignmentHandler_Unassign(t *testing.T) {
	app := fiber.New()
	jobRepo := repository.NewInMemoryJobRepository()
	smRepo := repository.NewInMemorySocialMediaRepository()
	assignRepo := repository.NewInMemoryAssignmentRepository()
	handler := NewAssignmentHandler(assignRepo, jobRepo, smRepo)

	// Seed an assignment
	assignRepo.Assign(&models.JobAssignment{
		ID:            "assign-1",
		JobID:         "job-1",
		SocialMediaID: "sm-1",
		TalentID:      "talent-1",
	})

	app.Delete("/api/assignments/:id", handler.Unassign)

	t.Run("unassigns successfully", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/assignments/assign-1", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}
	})

	t.Run("returns 404 for non-existent assignment", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/assignments/non-existent", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}

func TestAssignmentHandler_Unassign_RoleEnforcement(t *testing.T) {
	app := fiber.New()
	jobRepo := repository.NewInMemoryJobRepository()
	smRepo := repository.NewInMemorySocialMediaRepository()
	assignRepo := repository.NewInMemoryAssignmentRepository()
	handler := NewAssignmentHandler(assignRepo, jobRepo, smRepo)

	// Seed assignments for each test case
	assignRepo.Assign(&models.JobAssignment{
		ID:            "assign-talent",
		JobID:         "job-1",
		SocialMediaID: "sm-1",
		TalentID:      "talent-1",
	})
	assignRepo.Assign(&models.JobAssignment{
		ID:            "assign-admin",
		JobID:         "job-1",
		SocialMediaID: "sm-2",
		TalentID:      "talent-2",
	})
	assignRepo.Assign(&models.JobAssignment{
		ID:            "assign-super",
		JobID:         "job-1",
		SocialMediaID: "sm-3",
		TalentID:      "talent-3",
	})

	// Add role middleware that restricts to admin/superadmin
	app.Delete("/api/assignments/:id",
		func(c *fiber.Ctx) error {
			// Simulate auth middleware setting userID and role
			c.Locals("userID", "user-1")
			c.Locals("role", c.Get("X-Test-Role"))
			return c.Next()
		},
		middleware.RoleMiddleware(models.RoleAdmin, models.RoleSuperadmin),
		handler.Unassign,
	)

	t.Run("admin can unassign", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/assignments/assign-admin", nil)
		req.Header.Set("X-Test-Role", models.RoleAdmin)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200 for admin, got %d", resp.StatusCode)
		}
	})

	t.Run("superadmin can unassign", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/assignments/assign-super", nil)
		req.Header.Set("X-Test-Role", models.RoleSuperadmin)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200 for superadmin, got %d", resp.StatusCode)
		}
	})

	t.Run("talent cannot unassign", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodDelete, "/api/assignments/assign-talent", nil)
		req.Header.Set("X-Test-Role", models.RoleTalent)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusForbidden {
			t.Errorf("expected status 403 for talent, got %d", resp.StatusCode)
		}
	})
}

func TestAssignmentHandler_ListByJobID(t *testing.T) {
	app := fiber.New()
	jobRepo := repository.NewInMemoryJobRepository()
	smRepo := repository.NewInMemorySocialMediaRepository()
	assignRepo := repository.NewInMemoryAssignmentRepository()
	handler := NewAssignmentHandler(assignRepo, jobRepo, smRepo)

	// Seed data
	jobRepo.Create(&models.Job{ID: "job-1", Title: "Job 1", BrandName: "Nike", Status: models.JobStatusActive})
	assignRepo.Assign(&models.JobAssignment{ID: "assign-1", JobID: "job-1", SocialMediaID: "sm-1", TalentID: "talent-1"})
	assignRepo.Assign(&models.JobAssignment{ID: "assign-2", JobID: "job-1", SocialMediaID: "sm-2", TalentID: "talent-2"})

	app.Get("/api/jobs/:jobId/assignments", handler.ListByJobID)

	t.Run("returns assignments for job", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/jobs/job-1/assignments", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var body map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&body)
		data := body["data"].([]interface{})

		if len(data) != 2 {
			t.Errorf("expected 2 assignments, got %d", len(data))
		}
	})

	t.Run("returns 404 for non-existent job", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/jobs/non-existent/assignments", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", resp.StatusCode)
		}
	})
}
