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

func setupDashboardApp() (*fiber.App, *DashboardHandler, *repository.InMemoryJobRepository, *repository.InMemoryProgressRepository) {
	app := fiber.New()
	jobRepo := repository.NewInMemoryJobRepository()
	assignRepo := repository.NewInMemoryAssignmentRepository()
	progressRepo := repository.NewInMemoryProgressRepository()
	handler := NewDashboardHandler(jobRepo, assignRepo, progressRepo)

	app.Get("/api/dashboard", handler.GetSummary)

	return app, handler, jobRepo, progressRepo
}

func TestDashboardHandler_GetSummary(t *testing.T) {
	app, _, jobRepo, progressRepo := setupDashboardApp()

	// Seed jobs
	jobRepo.Create(&models.Job{
		ID:        "job-1",
		Title:     "Job 1",
		BrandName: "Brand",
		Status:    models.JobStatusActive,
	})
	jobRepo.Create(&models.Job{
		ID:        "job-2",
		Title:     "Job 2",
		BrandName: "Brand",
		Status:    models.JobStatusCompleted,
	})
	jobRepo.Create(&models.Job{
		ID:        "job-3",
		Title:     "Job 3",
		BrandName: "Brand",
		Status:    models.JobStatusDraft,
	})

	// Seed progress
	progressRepo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-1",
		JobID:        "job-1",
		TalentID:     "talent-1",
		Steps: []models.ProgressStepState{
			{Step: models.ProgressStepAbsen, Status: models.ProgressStatusCompleted},
			{Step: models.ProgressStepDraftStoryline, Status: models.ProgressStatusCompleted},
			{Step: models.ProgressStepInputLink, Status: models.ProgressStatusPending},
			{Step: models.ProgressStepInsight, Status: models.ProgressStatusPending},
		},
	})
	progressRepo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-2",
		JobID:        "job-1",
		TalentID:     "talent-2",
		Steps: []models.ProgressStepState{
			{Step: models.ProgressStepAbsen, Status: models.ProgressStatusCompleted},
			{Step: models.ProgressStepDraftStoryline, Status: models.ProgressStatusPending},
			{Step: models.ProgressStepInputLink, Status: models.ProgressStatusPending},
			{Step: models.ProgressStepInsight, Status: models.ProgressStatusPending},
		},
	})

	t.Run("returns correct dashboard summary", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/dashboard", nil)
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

		if int(data["total_jobs"].(float64)) != 3 {
			t.Errorf("expected total_jobs=3, got %v", data["total_jobs"])
		}
		if int(data["active_jobs"].(float64)) != 1 {
			t.Errorf("expected active_jobs=1, got %v", data["active_jobs"])
		}
		if int(data["completed_jobs"].(float64)) != 1 {
			t.Errorf("expected completed_jobs=1, got %v", data["completed_jobs"])
		}
		if int(data["total_assignments"].(float64)) != 2 {
			t.Errorf("expected total_assignments=2, got %v", data["total_assignments"])
		}
		if int(data["completed_steps"].(float64)) != 3 {
			t.Errorf("expected completed_steps=3, got %v", data["completed_steps"])
		}
		if int(data["total_steps"].(float64)) != 8 {
			t.Errorf("expected total_steps=8, got %v", data["total_steps"])
		}
	})

	t.Run("returns zero stats for empty state", func(t *testing.T) {
		app2 := fiber.New()
		jobRepo2 := repository.NewInMemoryJobRepository()
		assignRepo2 := repository.NewInMemoryAssignmentRepository()
		progressRepo2 := repository.NewInMemoryProgressRepository()
		handler2 := NewDashboardHandler(jobRepo2, assignRepo2, progressRepo2)
		app2.Get("/api/dashboard", handler2.GetSummary)

		req := httptest.NewRequest(http.MethodGet, "/api/dashboard", nil)
		resp, _ := app2.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}

		var body map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&body)
		data := body["data"].(map[string]interface{})

		if int(data["total_jobs"].(float64)) != 0 {
			t.Errorf("expected total_jobs=0, got %v", data["total_jobs"])
		}
		if int(data["total_assignments"].(float64)) != 0 {
			t.Errorf("expected total_assignments=0, got %v", data["total_assignments"])
		}
	})
}
