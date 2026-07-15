package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/amardikamahdi/AetherHub/internal/utils"
	"github.com/gofiber/fiber/v2"
)

func TestAuthMiddleware(t *testing.T) {
	app := fiber.New()
	secret := "test-secret"

	app.Get("/protected", AuthMiddleware(secret), func(c *fiber.Ctx) error {
		userID := c.Locals("userID").(string)
		role := c.Locals("role").(string)
		return c.JSON(fiber.Map{"userID": userID, "role": role})
	})

	t.Run("allows request with valid token", func(t *testing.T) {
		token, _ := utils.GenerateToken("user-1", "admin", secret, 24*time.Hour)

		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}
	})

	t.Run("rejects request without token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("expected status 401, got %d", resp.StatusCode)
		}
	})

	t.Run("rejects request with invalid token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer invalid-token")
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("expected status 401, got %d", resp.StatusCode)
		}
	})

	t.Run("rejects request with expired token", func(t *testing.T) {
		token, _ := utils.GenerateToken("user-1", "admin", secret, -1*time.Hour)

		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("expected status 401, got %d", resp.StatusCode)
		}
	})

	t.Run("rejects request with wrong secret", func(t *testing.T) {
		token, _ := utils.GenerateToken("user-1", "admin", "wrong-secret", 24*time.Hour)

		req := httptest.NewRequest(http.MethodGet, "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("expected status 401, got %d", resp.StatusCode)
		}
	})
}

func TestRoleMiddleware(t *testing.T) {
	app := fiber.New()
	secret := "test-secret"

	app.Get("/admin", AuthMiddleware(secret), RoleMiddleware("admin", "superadmin"), func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "welcome admin"})
	})

	t.Run("allows access for matching role", func(t *testing.T) {
		token, _ := utils.GenerateToken("user-1", "admin", secret, 24*time.Hour)

		req := httptest.NewRequest(http.MethodGet, "/admin", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}
	})

	t.Run("rejects access for non-matching role", func(t *testing.T) {
		token, _ := utils.GenerateToken("user-2", "talent", secret, 24*time.Hour)

		req := httptest.NewRequest(http.MethodGet, "/admin", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusForbidden {
			t.Errorf("expected status 403, got %d", resp.StatusCode)
		}
	})

	t.Run("allows superadmin access to admin route", func(t *testing.T) {
		token, _ := utils.GenerateToken("user-3", "superadmin", secret, 24*time.Hour)

		req := httptest.NewRequest(http.MethodGet, "/admin", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		resp, _ := app.Test(req)

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected status 200, got %d", resp.StatusCode)
		}
	})
}
