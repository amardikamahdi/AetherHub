package handlers

import (
	"net/http"

	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/amardikamahdi/AetherHub/internal/repository"
	"github.com/gofiber/fiber/v2"
)

// DashboardHandler handles dashboard summary endpoints.
type DashboardHandler struct {
	jobRepo      repository.JobRepository
	assignRepo   repository.AssignmentRepository
	progressRepo repository.ProgressRepository
}

// NewDashboardHandler creates a new DashboardHandler.
func NewDashboardHandler(jobRepo repository.JobRepository, assignRepo repository.AssignmentRepository, progressRepo repository.ProgressRepository) *DashboardHandler {
	return &DashboardHandler{
		jobRepo:      jobRepo,
		assignRepo:   assignRepo,
		progressRepo: progressRepo,
	}
}

// DashboardSummary represents the dashboard statistics.
type DashboardSummary struct {
	TotalJobs       int `json:"total_jobs"`
	ActiveJobs      int `json:"active_jobs"`
	CompletedJobs   int `json:"completed_jobs"`
	TotalAssignments int `json:"total_assignments"`
	CompletedSteps  int `json:"completed_steps"`
	TotalSteps      int `json:"total_steps"`
}

// GetSummary returns dashboard statistics.
func (h *DashboardHandler) GetSummary(c *fiber.Ctx) error {
	// Get all jobs
	jobs, _, err := h.jobRepo.List(0, 1000)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get jobs",
		})
	}

	// Count job statuses
	totalJobs := len(jobs)
	activeJobs := 0
	completedJobs := 0
	for _, job := range jobs {
		switch job.Status {
		case models.JobStatusActive:
			activeJobs++
		case models.JobStatusCompleted:
			completedJobs++
		}
	}

	// Get all progress entries by iterating through jobs
	totalAssignments := 0
	completedSteps := 0
	totalSteps := 0
	for _, job := range jobs {
		progressList, err := h.progressRepo.ListByJobID(job.ID)
		if err != nil {
			continue
		}
		totalAssignments += len(progressList)
		for _, p := range progressList {
			for _, step := range p.Steps {
				if step.Status == models.ProgressStatusCompleted {
					completedSteps++
				}
			}
		}
	}
	totalSteps = totalAssignments * 4 // 4 steps per assignment

	summary := DashboardSummary{
		TotalJobs:        totalJobs,
		ActiveJobs:       activeJobs,
		CompletedJobs:    completedJobs,
		TotalAssignments: totalAssignments,
		CompletedSteps:   completedSteps,
		TotalSteps:       totalSteps,
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    summary,
	})
}
