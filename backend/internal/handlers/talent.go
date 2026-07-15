package handlers

import (
	"net/http"
	"strconv"

	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/amardikamahdi/AetherHub/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// TalentHandler handles talent management endpoints.
type TalentHandler struct {
	repo repository.TalentRepository
}

// NewTalentHandler creates a new TalentHandler.
func NewTalentHandler(repo repository.TalentRepository) *TalentHandler {
	return &TalentHandler{repo: repo}
}

// List returns a paginated list of talent profiles.
func (h *TalentHandler) List(c *fiber.Ctx) error {
	offset, _ := strconv.Atoi(c.Query("offset", "0"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	if offset < 0 {
		offset = 0
	}
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	talents, total, err := h.repo.List(offset, limit)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to list talents",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    talents,
		"total":   total,
		"offset":  offset,
		"limit":   limit,
	})
}

// GetByID returns a talent profile by their ID.
func (h *TalentHandler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")

	talent, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Talent not found",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    talent,
	})
}

// Create adds a new talent profile.
func (h *TalentHandler) Create(c *fiber.Ctx) error {
	var req models.CreateTalentRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Validate required fields
	if req.Name == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Name is required",
		})
	}

	if req.Email == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Email is required",
		})
	}

	if !emailRegex.MatchString(req.Email) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid email format",
		})
	}

	// Generate user ID if not provided
	userID := req.UserID
	if userID == "" {
		userID = uuid.New().String()
	}

	talent := &models.TalentProfile{
		ID:     uuid.New().String(),
		UserID: userID,
		Name:   req.Name,
		Email:  req.Email,
		Phone:  req.Phone,
		Photo:  req.Photo,
		Bio:    req.Bio,
	}

	if err := h.repo.Create(talent); err != nil {
		return c.Status(http.StatusConflict).JSON(fiber.Map{
			"success": false,
			"error":   "Talent already exists for this user",
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    talent,
	})
}

// Update modifies an existing talent profile.
func (h *TalentHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")

	existing, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Talent not found",
		})
	}

	// Deep copy to avoid mutating the live map entry (data race)
	talent := *existing

	var req models.UpdateTalentRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.Name != "" {
		talent.Name = req.Name
	}

	if req.Email != "" {
		if !emailRegex.MatchString(req.Email) {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid email format",
			})
		}
		talent.Email = req.Email
	}

	if req.Phone != "" {
		talent.Phone = req.Phone
	}

	if req.Photo != "" {
		talent.Photo = req.Photo
	}

	if req.Bio != "" {
		talent.Bio = req.Bio
	}

	if err := h.repo.Update(&talent); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update talent",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    talent,
	})
}

// Delete soft-deletes a talent profile.
func (h *TalentHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := h.repo.Delete(id); err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Talent not found",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Talent deleted successfully",
	})
}
