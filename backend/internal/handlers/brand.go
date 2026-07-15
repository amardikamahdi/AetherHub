package handlers

import (
	"net/http"

	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/amardikamahdi/AetherHub/internal/repository"
	"github.com/gofiber/fiber/v2"
)

// BrandHandler handles brand access endpoints.
type BrandHandler struct {
	repo         repository.BrandRepository
	jobRepo      repository.JobRepository
	progressRepo repository.ProgressRepository
}

// NewBrandHandler creates a new BrandHandler.
func NewBrandHandler(repo repository.BrandRepository, jobRepo repository.JobRepository, progressRepo repository.ProgressRepository) *BrandHandler {
	return &BrandHandler{
		repo:         repo,
		jobRepo:      jobRepo,
		progressRepo: progressRepo,
	}
}

// ValidateCode checks if a brand access code is valid and active.
func (h *BrandHandler) ValidateCode(c *fiber.Ctx) error {
	code := c.Params("code")

	brandCode, err := h.repo.GetByCode(code)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid access code",
		})
	}

	if !brandCode.IsActive {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Access code is inactive",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"brand_name": brandCode.BrandName,
			"code":       brandCode.UniqueCode,
		},
	})
}

// Access returns brand dashboard data using a valid code.
func (h *BrandHandler) Access(c *fiber.Ctx) error {
	code := c.Params("code")

	brandCode, err := h.repo.GetByCode(code)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid access code",
		})
	}

	if !brandCode.IsActive {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Access code is inactive",
		})
	}

	// Build response with job and progress data
	type JobWithProgress struct {
		ID        string                      `json:"id"`
		Title     string                      `json:"title"`
		BrandName string                      `json:"brand_name"`
		Status    string                      `json:"status"`
		Progress  []*models.AssignmentProgress `json:"progress"`
	}

	jobsWithProgress := []JobWithProgress{}

	// If the brand code has a specific job, include it
	if brandCode.JobID != "" {
		job, err := h.jobRepo.GetByID(brandCode.JobID)
		if err == nil {
			progressList, _ := h.progressRepo.ListByJobID(job.ID)
			if progressList == nil {
				progressList = []*models.AssignmentProgress{}
			}
			jobsWithProgress = append(jobsWithProgress, JobWithProgress{
				ID:        job.ID,
				Title:     job.Title,
				BrandName: job.BrandName,
				Status:    job.Status,
				Progress:  progressList,
			})
		}
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"brand_name": brandCode.BrandName,
			"code":       brandCode.UniqueCode,
			"jobs":       jobsWithProgress,
		},
	})
}
