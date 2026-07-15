package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/amardikamahdi/AetherHub/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// JobHandler handles job management endpoints.
type JobHandler struct {
	repo repository.JobRepository
}

// NewJobHandler creates a new JobHandler.
func NewJobHandler(repo repository.JobRepository) *JobHandler {
	return &JobHandler{repo: repo}
}

// List returns a paginated list of jobs.
func (h *JobHandler) List(c *fiber.Ctx) error {
	offset, _ := strconv.Atoi(c.Query("offset", "0"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	if offset < 0 {
		offset = 0
	}
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	jobs, total, err := h.repo.List(offset, limit)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to list jobs",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    jobs,
		"total":   total,
		"offset":  offset,
		"limit":   limit,
	})
}

// GetByID returns a job by its ID.
func (h *JobHandler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")

	job, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Job not found",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    job,
	})
}

// Create adds a new job.
func (h *JobHandler) Create(c *fiber.Ctx) error {
	var req models.CreateJobRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Validate required fields
	if req.Title == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Title is required",
		})
	}

	if req.BrandName == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Brand name is required",
		})
	}

	job := &models.Job{
		ID:          uuid.New().String(),
		Title:       req.Title,
		Description: req.Description,
		BrandName:   req.BrandName,
		Status:      models.JobStatusDraft,
	}

	// Parse deadline if provided
	if req.Deadline != "" {
		deadline, err := time.Parse(time.RFC3339, req.Deadline)
		if err != nil {
			deadline, err = time.Parse("2006-01-02", req.Deadline)
			if err != nil {
				return c.Status(http.StatusBadRequest).JSON(fiber.Map{
					"success": false,
					"error":   "Invalid deadline format. Use RFC3339 or YYYY-MM-DD",
				})
			}
		}
		job.Deadline = &deadline
	}

	if err := h.repo.Create(job); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create job",
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    job,
	})
}

// Update modifies an existing job.
func (h *JobHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")

	existing, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Job not found",
		})
	}

	// Deep copy to avoid mutating the live map entry (data race)
	job := *existing

	var req models.UpdateJobRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.Title != "" {
		job.Title = req.Title
	}

	if req.Description != "" {
		job.Description = req.Description
	}

	if req.BrandName != "" {
		job.BrandName = req.BrandName
	}

	if req.Status != "" {
		if !models.ValidJobStatuses[req.Status] {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid status. Must be one of: draft, active, completed, cancelled",
			})
		}
		job.Status = req.Status
	}

	if req.Deadline != "" {
		deadline, err := time.Parse(time.RFC3339, req.Deadline)
		if err != nil {
			deadline, err = time.Parse("2006-01-02", req.Deadline)
			if err != nil {
				return c.Status(http.StatusBadRequest).JSON(fiber.Map{
					"success": false,
					"error":   "Invalid deadline format. Use RFC3339 or YYYY-MM-DD",
				})
			}
		}
		job.Deadline = &deadline
	}

	if err := h.repo.Update(&job); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update job",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    job,
	})
}

// Delete soft-deletes a job.
func (h *JobHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := h.repo.Delete(id); err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Job not found",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Job deleted successfully",
	})
}
