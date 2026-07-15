package repository

import (
	"testing"

	"github.com/amardikamahdi/AetherHub/internal/models"
)

func TestUserRepository_Create(t *testing.T) {
	repo := NewInMemoryUserRepository()

	t.Run("creates user successfully", func(t *testing.T) {
		user := &models.User{
			ID:    "user-1",
			Email: "test@example.com",
			Name:  "Test User",
			Role:  models.RoleTalent,
		}

		err := repo.Create(user)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		found, err := repo.GetByID("user-1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found.Email != "test@example.com" {
			t.Errorf("expected email 'test@example.com', got '%s'", found.Email)
		}
	})

	t.Run("rejects duplicate email", func(t *testing.T) {
		user1 := &models.User{ID: "user-2", Email: "dup@example.com", Name: "User 1", Role: models.RoleTalent}
		user2 := &models.User{ID: "user-3", Email: "dup@example.com", Name: "User 2", Role: models.RoleTalent}

		err := repo.Create(user1)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		err = repo.Create(user2)
		if err == nil {
			t.Fatal("should reject duplicate email")
		}
	})
}

func TestUserRepository_GetByID(t *testing.T) {
	repo := NewInMemoryUserRepository()

	t.Run("returns user by ID", func(t *testing.T) {
		user := &models.User{ID: "user-10", Email: "byid@example.com", Name: "By ID", Role: models.RoleAdmin}
		_ = repo.Create(user)

		found, err := repo.GetByID("user-10")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found.Name != "By ID" {
			t.Errorf("expected name 'By ID', got '%s'", found.Name)
		}
	})

	t.Run("returns error for non-existent ID", func(t *testing.T) {
		_, err := repo.GetByID("non-existent")
		if err == nil {
			t.Fatal("should return error for non-existent user")
		}
	})
}

func TestUserRepository_GetByEmail(t *testing.T) {
	repo := NewInMemoryUserRepository()

	t.Run("returns user by email", func(t *testing.T) {
		user := &models.User{ID: "user-20", Email: "byemail@example.com", Name: "By Email", Role: models.RoleTalent}
		_ = repo.Create(user)

		found, err := repo.GetByEmail("byemail@example.com")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if found.ID != "user-20" {
			t.Errorf("expected ID 'user-20', got '%s'", found.ID)
		}
	})

	t.Run("returns error for non-existent email", func(t *testing.T) {
		_, err := repo.GetByEmail("missing@example.com")
		if err == nil {
			t.Fatal("should return error for non-existent email")
		}
	})
}

func TestUserRepository_List(t *testing.T) {
	repo := NewInMemoryUserRepository()

	t.Run("returns paginated user list", func(t *testing.T) {
		for i := 0; i < 5; i++ {
			user := &models.User{
				ID:    "list-user-" + string(rune('a'+i)),
				Email: "list" + string(rune('a'+i)) + "@example.com",
				Name:  "List User",
				Role:  models.RoleTalent,
			}
			_ = repo.Create(user)
		}

		users, total, err := repo.List(0, 3)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(users) != 3 {
			t.Errorf("expected 3 users, got %d", len(users))
		}
		if total < 5 {
			t.Errorf("expected total >= 5, got %d", total)
		}
	})

	t.Run("returns empty list when no users", func(t *testing.T) {
		freshRepo := NewInMemoryUserRepository()
		users, total, err := freshRepo.List(0, 10)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(users) != 0 {
			t.Errorf("expected 0 users, got %d", len(users))
		}
		if total != 0 {
			t.Errorf("expected total 0, got %d", total)
		}
	})
}

func TestUserRepository_Update(t *testing.T) {
	repo := NewInMemoryUserRepository()

	t.Run("updates user successfully", func(t *testing.T) {
		user := &models.User{ID: "user-30", Email: "update@example.com", Name: "Original", Role: models.RoleTalent}
		_ = repo.Create(user)

		user.Name = "Updated"
		err := repo.Update(user)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		found, _ := repo.GetByID("user-30")
		if found.Name != "Updated" {
			t.Errorf("expected name 'Updated', got '%s'", found.Name)
		}
	})

	t.Run("returns error for non-existent user", func(t *testing.T) {
		user := &models.User{ID: "non-existent", Email: "x@x.com", Name: "X", Role: models.RoleTalent}
		err := repo.Update(user)
		if err == nil {
			t.Fatal("should return error for non-existent user")
		}
	})
}

func TestUserRepository_Delete(t *testing.T) {
	repo := NewInMemoryUserRepository()

	t.Run("soft deletes user", func(t *testing.T) {
		user := &models.User{ID: "user-40", Email: "delete@example.com", Name: "Delete Me", Role: models.RoleTalent}
		_ = repo.Create(user)

		err := repo.Delete("user-40")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		users, _, _ := repo.List(0, 100)
		for _, u := range users {
			if u.ID == "user-40" {
				t.Fatal("deleted user should not appear in list")
			}
		}
	})

	t.Run("returns error for non-existent user", func(t *testing.T) {
		err := repo.Delete("non-existent")
		if err == nil {
			t.Fatal("should return error for non-existent user")
		}
	})
}
