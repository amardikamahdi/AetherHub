package handlers

import (
	"net/http"

	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/amardikamahdi/AetherHub/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// AssignmentHandler handles job assignment endpoints.
type AssignmentHandler struct {
	assignmentRepo  repository.AssignmentRepository
	jobRepo         repository.JobRepository
	socialMediaRepo repository.SocialMediaRepository
}

// NewAssignmentHandler creates a new AssignmentHandler.
func NewAssignmentHandler(
	assignmentRepo repository.AssignmentRepository,
	jobRepo repository.JobRepository,
	socialMediaRepo repository.SocialMediaRepository,
) *AssignmentHandler {
	return &AssignmentHandler{
		assignmentRepo:  assignmentRepo,
		jobRepo:         jobRepo,
		socialMediaRepo: socialMediaRepo,
	}
}

// AssignRequest is the payload for assigning a social media account to a job.
type AssignRequest struct {
	SocialMediaID string `json:"social_media_id"`
}

// Assign adds a social media account to a job.
func (h *AssignmentHandler) Assign(c *fiber.Ctx) error {
	jobID := c.Params("jobId")

	// Verify job exists
	job, err := h.jobRepo.GetByID(jobID)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Job not found",
		})
	}

	// Only active or draft jobs can have assignments
	if job.Status != models.JobStatusActive && job.Status != models.JobStatusDraft {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Can only assign to active or draft jobs",
		})
	}

	var req AssignRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.SocialMediaID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Social media ID is required",
		})
	}

	// Verify social media account exists
	sm, err := h.socialMediaRepo.GetByID(req.SocialMediaID)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Social media account not found",
		})
	}

	assignment := &models.JobAssignment{
		ID:            uuid.New().String(),
		JobID:         jobID,
		SocialMediaID: req.SocialMediaID,
		TalentID:      sm.TalentID,
		Platform:      sm.Platform,
		Username:      sm.Username,
	}

	if err := h.assignmentRepo.Assign(assignment); err != nil {
		return c.Status(http.StatusConflict).JSON(fiber.Map{
			"success": false,
			"error":   "Social media account already assigned to this job",
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    assignment,
	})
}

// Unassign removes a social media account from a job.
func (h *AssignmentHandler) Unassign(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := h.assignmentRepo.Unassign(id); err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Assignment not found",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Assignment removed successfully",
	})
}

// ListByJobID returns all assignments for a job.
func (h *AssignmentHandler) ListByJobID(c *fiber.Ctx) error {
	jobID := c.Params("jobId")

	// Verify job exists
	if _, err := h.jobRepo.GetByID(jobID); err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Job not found",
		})
	}

	assignments, err := h.assignmentRepo.ListByJobID(jobID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to list assignments",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    assignments,
	})
}
