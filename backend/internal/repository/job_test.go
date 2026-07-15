package repository

import (
	"testing"

	"github.com/amardikamahdi/AetherHub/internal/models"
)

func TestInMemoryJobRepository_Create(t *testing.T) {
	repo := NewInMemoryJobRepository()

	t.Run("creates job successfully", func(t *testing.T) {
		job := &models.Job{
			ID:        "job-1",
			Title:     "Instagram Campaign",
			BrandName: "Nike",
			Status:    models.JobStatusDraft,
		}

		if err := repo.Create(job); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		if job.CreatedAt.IsZero() {
			t.Error("expected CreatedAt to be set")
		}

		if job.UpdatedAt.IsZero() {
			t.Error("expected UpdatedAt to be set")
		}
	})
}

func TestInMemoryJobRepository_GetByID(t *testing.T) {
	repo := NewInMemoryJobRepository()

	repo.Create(&models.Job{
		ID:        "job-1",
		Title:     "Instagram Campaign",
		BrandName: "Nike",
		Status:    models.JobStatusDraft,
	})

	t.Run("returns job by ID", func(t *testing.T) {
		job, err := repo.GetByID("job-1")
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if job.Title != "Instagram Campaign" {
			t.Errorf("expected title 'Instagram Campaign', got '%s'", job.Title)
		}
	})

	t.Run("returns error for non-existent ID", func(t *testing.T) {
		_, err := repo.GetByID("non-existent")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})

	t.Run("returns error for deleted job", func(t *testing.T) {
		repo.Delete("job-1")
		_, err := repo.GetByID("job-1")
		if err == nil {
			t.Error("expected error for deleted job, got nil")
		}
	})
}

func TestInMemoryJobRepository_List(t *testing.T) {
	repo := NewInMemoryJobRepository()

	for i := 0; i < 5; i++ {
		repo.Create(&models.Job{
			ID:        "job-" + string(rune('a'+i)),
			Title:     "Job " + string(rune('A'+i)),
			BrandName: "Brand",
			Status:    models.JobStatusActive,
		})
	}

	t.Run("returns paginated results", func(t *testing.T) {
		jobs, total, err := repo.List(0, 3)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if total != 5 {
			t.Errorf("expected total 5, got %d", total)
		}
		if len(jobs) != 3 {
			t.Errorf("expected 3 jobs, got %d", len(jobs))
		}
	})

	t.Run("returns empty for out-of-range offset", func(t *testing.T) {
		jobs, total, _ := repo.List(100, 10)
		if len(jobs) != 0 {
			t.Errorf("expected 0 jobs, got %d", len(jobs))
		}
		if total != 5 {
			t.Errorf("expected total 5, got %d", total)
		}
	})

	t.Run("excludes deleted jobs", func(t *testing.T) {
		repo.Delete("job-a")
		jobs, total, _ := repo.List(0, 10)
		if total != 4 {
			t.Errorf("expected total 4 after delete, got %d", total)
		}
		for _, j := range jobs {
			if j.ID == "job-a" {
				t.Error("deleted job should not appear in list")
			}
		}
	})
}

func TestInMemoryJobRepository_Update(t *testing.T) {
	repo := NewInMemoryJobRepository()

	repo.Create(&models.Job{
		ID:        "job-1",
		Title:     "Instagram Campaign",
		BrandName: "Nike",
		Status:    models.JobStatusDraft,
	})

	t.Run("updates job successfully", func(t *testing.T) {
		job, _ := repo.GetByID("job-1")
		job.Title = "Updated Campaign"

		if err := repo.Update(job); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		updated, _ := repo.GetByID("job-1")
		if updated.Title != "Updated Campaign" {
			t.Errorf("expected title 'Updated Campaign', got '%s'", updated.Title)
		}
	})

	t.Run("returns error for non-existent job", func(t *testing.T) {
		err := repo.Update(&models.Job{ID: "non-existent"})
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestInMemoryJobRepository_Delete(t *testing.T) {
	repo := NewInMemoryJobRepository()

	repo.Create(&models.Job{
		ID:        "job-1",
		Title:     "Instagram Campaign",
		BrandName: "Nike",
		Status:    models.JobStatusDraft,
	})

	t.Run("deletes job successfully", func(t *testing.T) {
		if err := repo.Delete("job-1"); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		_, err := repo.GetByID("job-1")
		if err == nil {
			t.Error("expected error after delete, got nil")
		}
	})

	t.Run("returns error for non-existent job", func(t *testing.T) {
		err := repo.Delete("non-existent")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}
