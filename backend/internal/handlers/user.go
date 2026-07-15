package handlers

import (
	"net/http"
	"strconv"

	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/amardikamahdi/AetherHub/internal/repository"
	"github.com/gofiber/fiber/v2"
)

// UserHandler handles user management endpoints.
type UserHandler struct {
	repo repository.UserRepository
}

// NewUserHandler creates a new UserHandler.
func NewUserHandler(repo repository.UserRepository) *UserHandler {
	return &UserHandler{repo: repo}
}

// List returns a paginated list of users.
func (h *UserHandler) List(c *fiber.Ctx) error {
	offset, _ := strconv.Atoi(c.Query("offset", "0"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	if limit <= 0 || limit > 100 {
		limit = 20
	}

	users, total, err := h.repo.List(offset, limit)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to list users",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    users,
		"total":   total,
		"offset":  offset,
		"limit":   limit,
	})
}

// GetByID returns a user by their ID.
func (h *UserHandler) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")

	user, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "User not found",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    user,
	})
}

// Update modifies an existing user.
func (h *UserHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")

	user, err := h.repo.GetByID(id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "User not found",
		})
	}

	var req struct {
		Name  string `json:"name"`
		Email string `json:"email"`
		Role  string `json:"role"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	if req.Role != "" {
		validRoles := map[string]bool{
			models.RoleSuperadmin: true,
			models.RoleAdmin:      true,
			models.RoleTalent:     true,
		}
		if !validRoles[req.Role] {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid role. Must be one of: superadmin, admin, talent",
			})
		}
		user.Role = req.Role
	}

	if req.Email != "" {
		if !emailRegex.MatchString(req.Email) {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"error":   "Invalid email format",
			})
		}
		user.Email = req.Email
	}

	if req.Name != "" {
		user.Name = req.Name
	}

	if err := h.repo.Update(user); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to update user",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    user,
	})
}

// Delete soft-deletes a user.
func (h *UserHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")

	if err := h.repo.Delete(id); err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "User not found",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "User deleted successfully",
	})
}
