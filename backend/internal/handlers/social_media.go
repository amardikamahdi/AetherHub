package handlers

import (
	"net/http"

	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/amardikamahdi/AetherHub/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// SocialMediaHandler handles social media account endpoints.
type SocialMediaHandler struct {
	repo repository.SocialMediaRepository
}

// NewSocialMediaHandler creates a new SocialMediaHandler.
func NewSocialMediaHandler(repo repository.SocialMediaRepository) *SocialMediaHandler {
	return &SocialMediaHandler{repo: repo}
}

// ListByTalentID returns all social media accounts for a talent.
func (h *SocialMediaHandler) ListByTalentID(c *fiber.Ctx) error {
	talentID := c.Params("talentId")

	accounts, err := h.repo.ListByTalentID(talentID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to list social media accounts",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    accounts,
	})
}

// Create adds a new social media account.
func (h *SocialMediaHandler) Create(c *fiber.Ctx) error {
	talentID := c.Params("talentId")

	var req models.CreateSocialMediaRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Validate platform
	if !models.ValidPlatforms[req.Platform] {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid platform. Must be one of: instagram, tiktok, youtube, twitter, facebook",
		})
	}

	// Validate username
	if req.Username == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Username is required",
		})
	}

	account := &models.SocialMediaAccount{
		ID:       uuid.New().String(),
		TalentID: talentID,
		Platform: req.Platform,
		Username: req.Username,
		URL:      req.URL,
	}

	if err := h.repo.Create(account); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to create social media account",
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    account,
	})
}

// Update modifies an existing social media account.
func (h *SocialMediaHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")

	account, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Social media account not found",
		})
	}

	// Check ownership
	userID, ok := c.Locals("userID").(string)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Unauthorized",
		})
	}

	role, _ := c.Locals("role").(string)
	if role != models.RoleAdmin && role != models.RoleSuperadmin && account.TalentID != userID {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "You can only modify your own social media accounts",
		})
	}

	var req models.UpdateSocialMediaRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.Username != "" {
		account.Username = req.Username
	}

	if req.URL != "" {
		account.URL = req.URL
	}

	if err := h.repo.Update(account); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update social media account",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    account,
	})
}

// Delete removes a social media account.
func (h *SocialMediaHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")

	account, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Social media account not found",
		})
	}

	// Check ownership
	userID, ok := c.Locals("userID").(string)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Unauthorized",
		})
	}

	role, _ := c.Locals("role").(string)
	if role != models.RoleAdmin && role != models.RoleSuperadmin && account.TalentID != userID {
		return c.Status(http.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "You can only delete your own social media accounts",
		})
	}

	if err := h.repo.Delete(id); err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Social media account not found",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Social media account deleted successfully",
	})
}
