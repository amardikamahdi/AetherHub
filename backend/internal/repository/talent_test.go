package repository

import (
	"testing"

	"github.com/amardikamahdi/AetherHub/internal/models"
)

func TestInMemoryTalentRepository_Create(t *testing.T) {
	repo := NewInMemoryTalentRepository()

	t.Run("creates talent profile successfully", func(t *testing.T) {
		talent := &models.TalentProfile{
			ID:     "talent-1",
			UserID: "user-1",
			Name:   "Alice",
			Email:  "alice@test.com",
			Phone:  "08123456789",
		}

		if err := repo.Create(talent); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		if talent.CreatedAt.IsZero() {
			t.Error("expected CreatedAt to be set")
		}
	})

	t.Run("rejects duplicate user ID", func(t *testing.T) {
		talent := &models.TalentProfile{
			ID:     "talent-2",
			UserID: "user-1",
			Name:   "Alice2",
			Email:  "alice2@test.com",
		}

		err := repo.Create(talent)
		if err == nil {
			t.Error("expected error for duplicate user, got nil")
		}
	})
}

func TestInMemoryTalentRepository_GetByID(t *testing.T) {
	repo := NewInMemoryTalentRepository()

	repo.Create(&models.TalentProfile{
		ID:     "talent-1",
		UserID: "user-1",
		Name:   "Alice",
		Email:  "alice@test.com",
	})

	t.Run("returns talent by ID", func(t *testing.T) {
		talent, err := repo.GetByID("talent-1")
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if talent.Name != "Alice" {
			t.Errorf("expected name 'Alice', got '%s'", talent.Name)
		}
	})

	t.Run("returns error for non-existent ID", func(t *testing.T) {
		_, err := repo.GetByID("non-existent")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})

	t.Run("returns error for deleted talent", func(t *testing.T) {
		repo.Delete("talent-1")
		_, err := repo.GetByID("talent-1")
		if err == nil {
			t.Error("expected error for deleted talent, got nil")
		}
	})
}

func TestInMemoryTalentRepository_GetByUserID(t *testing.T) {
	repo := NewInMemoryTalentRepository()

	repo.Create(&models.TalentProfile{
		ID:     "talent-1",
		UserID: "user-1",
		Name:   "Alice",
		Email:  "alice@test.com",
	})

	t.Run("returns talent by user ID", func(t *testing.T) {
		talent, err := repo.GetByUserID("user-1")
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if talent.ID != "talent-1" {
			t.Errorf("expected ID 'talent-1', got '%s'", talent.ID)
		}
	})

	t.Run("returns error for non-existent user", func(t *testing.T) {
		_, err := repo.GetByUserID("non-existent")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestInMemoryTalentRepository_List(t *testing.T) {
	repo := NewInMemoryTalentRepository()

	for i := 0; i < 5; i++ {
		repo.Create(&models.TalentProfile{
			ID:     "talent-" + string(rune('a'+i)),
			UserID: "user-" + string(rune('a'+i)),
			Name:   "Talent " + string(rune('A'+i)),
			Email:  "talent" + string(rune('a'+i)) + "@test.com",
		})
	}

	t.Run("returns paginated results", func(t *testing.T) {
		talents, total, err := repo.List(0, 3)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if total != 5 {
			t.Errorf("expected total 5, got %d", total)
		}
		if len(talents) != 3 {
			t.Errorf("expected 3 talents, got %d", len(talents))
		}
	})

	t.Run("returns empty for out-of-range offset", func(t *testing.T) {
		talents, total, _ := repo.List(100, 10)
		if len(talents) != 0 {
			t.Errorf("expected 0 talents, got %d", len(talents))
		}
		if total != 5 {
			t.Errorf("expected total 5, got %d", total)
		}
	})

	t.Run("excludes deleted talents", func(t *testing.T) {
		repo.Delete("talent-a")
		talents, total, _ := repo.List(0, 10)
		if total != 4 {
			t.Errorf("expected total 4 after delete, got %d", total)
		}
		for _, t2 := range talents {
			if t2.ID == "talent-a" {
				t.Error("deleted talent should not appear in list")
			}
		}
	})
}

func TestInMemoryTalentRepository_Update(t *testing.T) {
	repo := NewInMemoryTalentRepository()

	repo.Create(&models.TalentProfile{
		ID:     "talent-1",
		UserID: "user-1",
		Name:   "Alice",
		Email:  "alice@test.com",
	})

	t.Run("updates talent successfully", func(t *testing.T) {
		talent, _ := repo.GetByID("talent-1")
		talent.Name = "Alice Updated"

		if err := repo.Update(talent); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		updated, _ := repo.GetByID("talent-1")
		if updated.Name != "Alice Updated" {
			t.Errorf("expected name 'Alice Updated', got '%s'", updated.Name)
		}
	})

	t.Run("returns error for non-existent talent", func(t *testing.T) {
		err := repo.Update(&models.TalentProfile{ID: "non-existent"})
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestInMemoryTalentRepository_Delete(t *testing.T) {
	repo := NewInMemoryTalentRepository()

	repo.Create(&models.TalentProfile{
		ID:     "talent-1",
		UserID: "user-1",
		Name:   "Alice",
		Email:  "alice@test.com",
	})

	t.Run("deletes talent successfully", func(t *testing.T) {
		if err := repo.Delete("talent-1"); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		_, err := repo.GetByID("talent-1")
		if err == nil {
			t.Error("expected error after delete, got nil")
		}
	})

	t.Run("returns error for non-existent talent", func(t *testing.T) {
		err := repo.Delete("non-existent")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestInMemorySocialMediaRepository_Create(t *testing.T) {
	repo := NewInMemorySocialMediaRepository()

	t.Run("creates social media account successfully", func(t *testing.T) {
		account := &models.SocialMediaAccount{
			ID:       "sm-1",
			TalentID: "talent-1",
			Platform: "instagram",
			Username: "@alice",
		}

		if err := repo.Create(account); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		if account.CreatedAt.IsZero() {
			t.Error("expected CreatedAt to be set")
		}
	})
}

func TestInMemorySocialMediaRepository_ListByTalentID(t *testing.T) {
	repo := NewInMemorySocialMediaRepository()

	repo.Create(&models.SocialMediaAccount{ID: "sm-1", TalentID: "talent-1", Platform: "instagram", Username: "@alice"})
	repo.Create(&models.SocialMediaAccount{ID: "sm-2", TalentID: "talent-1", Platform: "tiktok", Username: "@alice"})
	repo.Create(&models.SocialMediaAccount{ID: "sm-3", TalentID: "talent-2", Platform: "youtube", Username: "@bob"})

	t.Run("returns accounts for specific talent", func(t *testing.T) {
		accounts, err := repo.ListByTalentID("talent-1")
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(accounts) != 2 {
			t.Errorf("expected 2 accounts, got %d", len(accounts))
		}
	})

	t.Run("returns empty for talent with no accounts", func(t *testing.T) {
		accounts, _ := repo.ListByTalentID("talent-99")
		if len(accounts) != 0 {
			t.Errorf("expected 0 accounts, got %d", len(accounts))
		}
	})
}

func TestInMemorySocialMediaRepository_Update(t *testing.T) {
	repo := NewInMemorySocialMediaRepository()

	repo.Create(&models.SocialMediaAccount{ID: "sm-1", TalentID: "talent-1", Platform: "instagram", Username: "@alice"})

	t.Run("updates account successfully", func(t *testing.T) {
		account, _ := repo.GetByID("sm-1")
		account.Username = "@alice_updated"

		if err := repo.Update(account); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		updated, _ := repo.GetByID("sm-1")
		if updated.Username != "@alice_updated" {
			t.Errorf("expected username '@alice_updated', got '%s'", updated.Username)
		}
	})

	t.Run("returns error for non-existent account", func(t *testing.T) {
		err := repo.Update(&models.SocialMediaAccount{ID: "non-existent"})
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestInMemorySocialMediaRepository_Delete(t *testing.T) {
	repo := NewInMemorySocialMediaRepository()

	repo.Create(&models.SocialMediaAccount{ID: "sm-1", TalentID: "talent-1", Platform: "instagram", Username: "@alice"})

	t.Run("deletes account successfully", func(t *testing.T) {
		if err := repo.Delete("sm-1"); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		_, err := repo.GetByID("sm-1")
		if err == nil {
			t.Error("expected error after delete, got nil")
		}
	})

	t.Run("returns error for non-existent account", func(t *testing.T) {
		err := repo.Delete("non-existent")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}
