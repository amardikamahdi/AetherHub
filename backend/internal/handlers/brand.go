package handlers

import (
	"net/http"

	"github.com/amardikamahdi/AetherHub/internal/repository"
	"github.com/gofiber/fiber/v2"
)

// BrandHandler handles brand access endpoints.
type BrandHandler struct {
	repo repository.BrandRepository
}

// NewBrandHandler creates a new BrandHandler.
func NewBrandHandler(repo repository.BrandRepository) *BrandHandler {
	return &BrandHandler{repo: repo}
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

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"brand_name": brandCode.BrandName,
			"code":       brandCode.UniqueCode,
			"jobs":       []interface{}{},
		},
	})
}
