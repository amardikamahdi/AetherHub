package main

import (
	"log"
	"os"

	"github.com/amardikamahdi/AetherHub/internal/handlers"
	"github.com/amardikamahdi/AetherHub/internal/middleware"
	"github.com/amardikamahdi/AetherHub/internal/models"
	"github.com/amardikamahdi/AetherHub/internal/repository"
	"github.com/amardikamahdi/AetherHub/internal/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Initialize repositories
	userRepo := repository.NewInMemoryUserRepository()
	talentRepo := repository.NewInMemoryTalentRepository()
	socialMediaRepo := repository.NewInMemorySocialMediaRepository()
	brandRepo := repository.NewInMemoryBrandRepository()
	jobRepo := repository.NewInMemoryJobRepository()
	assignmentRepo := repository.NewInMemoryAssignmentRepository()
	progressRepo := repository.NewInMemoryProgressRepository()

	// Seed default superadmin
	seedSuperAdmin(userRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo, jwtSecret)
	userHandler := handlers.NewUserHandler(userRepo)
	talentHandler := handlers.NewTalentHandler(talentRepo)
	socialMediaHandler := handlers.NewSocialMediaHandler(socialMediaRepo)
	brandHandler := handlers.NewBrandHandler(brandRepo, jobRepo, progressRepo)
	jobHandler := handlers.NewJobHandler(jobRepo)
	assignmentHandler := handlers.NewAssignmentHandler(assignmentRepo, jobRepo, socialMediaRepo)
	progressHandler := handlers.NewProgressHandler(progressRepo, assignmentRepo)
	dashboardHandler := handlers.NewDashboardHandler(jobRepo, assignmentRepo, progressRepo)

	// Create Fiber app
	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New())

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Public routes
	api := app.Group("/api")

	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)

	// Brand routes (public with code)
	brand := api.Group("/brand")
	brand.Post("/validate/:code", brandHandler.ValidateCode)
	brand.Get("/access/:code", brandHandler.Access)

	// Protected routes
	protected := api.Group("", middleware.AuthMiddleware(jwtSecret))

	// Auth - authenticated
	protected.Get("/auth/me", func(c *fiber.Ctx) error {
		userID, ok := c.Locals("userID").(string)
		if !ok {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"error":   "Unauthorized",
			})
		}
		user, err := userRepo.GetByID(userID)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"error":   "User not found",
			})
		}
		return c.JSON(fiber.Map{
			"success": true,
			"data":    user,
		})
	})

	// User management - admin only
	users := protected.Group("/users", middleware.RoleMiddleware(models.RoleAdmin, models.RoleSuperadmin))
	users.Get("", userHandler.List)
	users.Post("", userHandler.Create)
	users.Get("/:id", userHandler.GetByID)
	users.Put("/:id", userHandler.Update)
	users.Delete("/:id", userHandler.Delete)

	// Talent management - admin only for CRUD
	talents := protected.Group("/talents", middleware.RoleMiddleware(models.RoleAdmin, models.RoleSuperadmin))
	talents.Get("", talentHandler.List)
	talents.Post("", talentHandler.Create)
	talents.Get("/:id", talentHandler.GetByID)
	talents.Put("/:id", talentHandler.Update)
	talents.Delete("/:id", talentHandler.Delete)

	// Social media - talent owns, admin can view
	socialMedia := protected.Group("/talents/:talentId/social-media")
	socialMedia.Get("", socialMediaHandler.ListByTalentID)
	socialMedia.Post("", socialMediaHandler.Create)

	// Social media update/delete - ownership check in handler
	protected.Put("/social-media/:id", socialMediaHandler.Update)
	protected.Delete("/social-media/:id", socialMediaHandler.Delete)

	// Job management - admin only for CRUD
	jobs := protected.Group("/jobs", middleware.RoleMiddleware(models.RoleAdmin, models.RoleSuperadmin))
	jobs.Get("", jobHandler.List)
	jobs.Post("", jobHandler.Create)
	jobs.Get("/:id", jobHandler.GetByID)
	jobs.Put("/:id", jobHandler.Update)
	jobs.Delete("/:id", jobHandler.Delete)

	// Job assignments - admin only
	jobs.Post("/:jobId/assignments", assignmentHandler.Assign)
	jobs.Get("/:jobId/assignments", assignmentHandler.ListByJobID)
	protected.Delete("/assignments/:id",
		middleware.RoleMiddleware(models.RoleAdmin, models.RoleSuperadmin),
		assignmentHandler.Unassign)

	// Progress tracking - talent and admin
	progress := protected.Group("/progress")
	progress.Get("/:assignment_id", progressHandler.GetByAssignmentID)
	progress.Put("/:assignment_id/step", progressHandler.UpdateStep)

	// Job progress - admin only
	jobs.Get("/:job_id/progress", progressHandler.ListByJobID)

	// Dashboard - admin only
	dashboard := protected.Group("/dashboard", middleware.RoleMiddleware(models.RoleAdmin, models.RoleSuperadmin))
	dashboard.Get("", dashboardHandler.GetSummary)

	// Start server
	log.Printf("Server starting on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func seedSuperAdmin(repo repository.UserRepository) {
	// Check if superadmin already exists
	users, _, _ := repo.List(0, 100)
	for _, u := range users {
		if u.Role == models.RoleSuperadmin {
			return
		}
	}

	// Get seed password from environment or generate random
	seedPassword := os.Getenv("SEED_ADMIN_PASSWORD")
	if seedPassword == "" {
		seedPassword = uuid.New().String()[:12]
		log.Printf("WARNING: SEED_ADMIN_PASSWORD not set. Generated random password. Set SEED_ADMIN_PASSWORD env var for persistence.")
	}

	hash, err := utils.HashPassword(seedPassword)
	if err != nil {
		log.Printf("Warning: failed to hash superadmin password: %v", err)
		return
	}

	adminEmail := os.Getenv("SEED_ADMIN_EMAIL")
	if adminEmail == "" {
		adminEmail = "admin@aetherhub.com"
	}

	superadmin := &models.User{
		ID:           uuid.New().String(),
		Email:        adminEmail,
		PasswordHash: hash,
		Name:         "Super Admin",
		Role:         models.RoleSuperadmin,
	}

	if err := repo.Create(superadmin); err != nil {
		log.Printf("Warning: failed to seed superadmin: %v", err)
	} else {
		log.Printf("Default superadmin created. Email: %s — check SEED_ADMIN_PASSWORD env var for credentials.", adminEmail)
	}
}
