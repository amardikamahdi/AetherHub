package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/amardikamahdi/AetherHub/internal/repository"
	"github.com/gofiber/fiber/v2"
)

// ProgressHandler handles progress tracking endpoints.
type ProgressHandler struct {
	progressRepo repository.ProgressRepository
	assignRepo   repository.AssignmentRepository
}

// NewProgressHandler creates a new ProgressHandler.
func NewProgressHandler(progressRepo repository.ProgressRepository, assignRepo repository.AssignmentRepository) *ProgressHandler {
	return &ProgressHandler{
		progressRepo: progressRepo,
		assignRepo:   assignRepo,
	}
}

// GetByAssignmentID returns progress for a specific assignment.
func (h *ProgressHandler) GetByAssignmentID(c *fiber.Ctx) error {
	assignmentID := c.Params("assignment_id")

	progress, err := h.progressRepo.GetByAssignmentID(assignmentID)
	if err != nil {
		if errors.Is(err, repository.ErrProgressNotFound) {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "Progress not found",
			})
		}
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get progress",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    progress,
	})
}

// ListByJobID returns all progress entries for a specific job.
func (h *ProgressHandler) ListByJobID(c *fiber.Ctx) error {
	jobID := c.Params("job_id")

	progressList, err := h.progressRepo.ListByJobID(jobID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to list progress",
		})
	}

	// Return empty array instead of nil
	if progressList == nil {
		progressList = []*models.AssignmentProgress{}
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    progressList,
	})
}

// UpdateStep completes a specific progress step.
func (h *ProgressHandler) UpdateStep(c *fiber.Ctx) error {
	assignmentID := c.Params("assignment_id")

	var req models.UpdateProgressStepRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Validate step
	if !isValidStep(req.Step) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid step. Must be one of: absen, draft_storyline, input_link, insight",
		})
	}

	// Verify assignment exists
	assignment, err := h.assignRepo.GetByID(assignmentID)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Assignment not found",
		})
	}

	// Verify talent owns assignment (admins/superadmins can update any)
	role, _ := c.Locals("role").(string)
	talentID, hasTalentID := c.Locals("talent_id").(string)
	if role != models.RoleAdmin && role != models.RoleSuperadmin {
		if !hasTalentID || assignment.TalentID != talentID {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"error":   "You can only update your own progress",
			})
		}
	}

	// Get or create progress
	progress, err := h.progressRepo.GetByAssignmentID(assignmentID)
	if err != nil {
		if errors.Is(err, repository.ErrProgressNotFound) {
			// Auto-create progress for this assignment
			progress = &models.AssignmentProgress{
				AssignmentID: assignmentID,
				JobID:        assignment.JobID,
				TalentID:     assignment.TalentID,
				Steps:        repository.InitializeSteps(),
			}
			if err := h.progressRepo.Create(progress); err != nil {
				return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"error":   "Failed to create progress",
				})
			}
		} else {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"error":   "Failed to get progress",
			})
		}
	}

	// Deep copy to avoid data race
	updated := *progress
	updated.Steps = make([]models.ProgressStepState, len(progress.Steps))
	copy(updated.Steps, progress.Steps)

	// Validate step ordering
	stepIndex := getStepIndex(req.Step)
	if stepIndex < 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid step",
		})
	}

	// Check if previous steps are completed
	for i := 0; i < stepIndex; i++ {
		if updated.Steps[i].Status != models.ProgressStatusCompleted {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   "Previous steps must be completed first",
			})
		}
	}

	// Update the step (idempotent - can re-complete)
	now := time.Now()
	updated.Steps[stepIndex].Status = models.ProgressStatusCompleted
	updated.Steps[stepIndex].CompletedAt = &now
	if req.Notes != "" {
		updated.Steps[stepIndex].Notes = req.Notes
	}

	if err := h.progressRepo.Update(&updated); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update progress",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    updated,
	})
}

// isValidStep checks if the step is a valid progress step.
func isValidStep(step string) bool {
	for _, s := range models.OrderedProgressSteps {
		if s == step {
			return true
		}
	}
	return false
}

// getStepIndex returns the index of the step in the ordered list, or -1 if not found.
func getStepIndex(step string) int {
	for i, s := range models.OrderedProgressSteps {
		if s == step {
			return i
		}
	}
	return -1
}
