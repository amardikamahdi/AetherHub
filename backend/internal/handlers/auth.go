package handlers

import (
	"net/http"
	"regexp"
	"time"

	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/amardikamahdi/AetherHub/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// UserService defines the interface for user operations.
type UserService interface {
	CreateUser(user *models.User) error
	GetUserByEmail(email string) (*models.User, error)
}

// AuthHandler handles authentication endpoints.
type AuthHandler struct {
	userService UserService
	jwtSecret   string
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(userService UserService, jwtSecret string) *AuthHandler {
	return &AuthHandler{
		userService: userService,
		jwtSecret:   jwtSecret,
	}
}

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// Register handles user registration.
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req models.CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Validate email
	if !emailRegex.MatchString(req.Email) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid email format",
		})
	}

	// Validate password
	if len(req.Password) < 6 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Password must be at least 6 characters",
		})
	}

	// Validate name
	if req.Name == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Name is required",
		})
	}

	// Validate role
	if req.Role != models.RoleTalent {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Only talent registration is allowed",
		})
	}

	// Hash password
	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to hash password",
		})
	}

	user := &models.User{
		ID:           uuid.New().String(),
		Email:        req.Email,
		PasswordHash: hash,
		Name:         req.Name,
		Role:         req.Role,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := h.userService.CreateUser(user); err != nil {
		return c.Status(http.StatusConflict).JSON(fiber.Map{
			"success": false,
			"error":   "Email already exists",
		})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    user,
	})
}

// Login handles user login.
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
		})
	}

	// Validate input
	if req.Email == "" || req.Password == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Email and password are required",
		})
	}

	// Get user by email
	user, err := h.userService.GetUserByEmail(req.Email)
	if err != nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid credentials",
		})
	}

	// Check password
	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid credentials",
		})
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.Role, h.jwtSecret, 24*time.Hour)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to generate token",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data": models.LoginResponse{
			Token: token,
			User:  *user,
		},
	})
}
