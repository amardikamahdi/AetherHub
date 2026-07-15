package repository

import (
	"testing"

	"github.com/amardikamahdi/AetherHub/internal/models"
)

func TestInMemoryProgressRepository_Create(t *testing.T) {
	repo := NewInMemoryProgressRepository()

	t.Run("creates progress successfully", func(t *testing.T) {
		progress := &models.AssignmentProgress{
			AssignmentID: "assign-1",
			JobID:        "job-1",
			TalentID:     "talent-1",
			Steps:        InitializeSteps(),
		}

		if err := repo.Create(progress); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		if progress.CreatedAt.IsZero() {
			t.Error("expected CreatedAt to be set")
		}

		if progress.UpdatedAt.IsZero() {
			t.Error("expected UpdatedAt to be set")
		}
	})
}

func TestInMemoryProgressRepository_GetByAssignmentID(t *testing.T) {
	repo := NewInMemoryProgressRepository()

	repo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-1",
		JobID:        "job-1",
		TalentID:     "talent-1",
		Steps:        InitializeSteps(),
	})

	t.Run("returns progress by assignment ID", func(t *testing.T) {
		progress, err := repo.GetByAssignmentID("assign-1")
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if progress.JobID != "job-1" {
			t.Errorf("expected job ID 'job-1', got '%s'", progress.JobID)
		}
		if len(progress.Steps) != 4 {
			t.Errorf("expected 4 steps, got %d", len(progress.Steps))
		}
	})

	t.Run("returns error for non-existent ID", func(t *testing.T) {
		_, err := repo.GetByAssignmentID("non-existent")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestInMemoryProgressRepository_ListByJobID(t *testing.T) {
	repo := NewInMemoryProgressRepository()

	repo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-1",
		JobID:        "job-1",
		TalentID:     "talent-1",
		Steps:        InitializeSteps(),
	})
	repo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-2",
		JobID:        "job-1",
		TalentID:     "talent-2",
		Steps:        InitializeSteps(),
	})
	repo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-3",
		JobID:        "job-2",
		TalentID:     "talent-1",
		Steps:        InitializeSteps(),
	})

	t.Run("returns all progress for a job", func(t *testing.T) {
		progress, err := repo.ListByJobID("job-1")
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(progress) != 2 {
			t.Errorf("expected 2 progress entries, got %d", len(progress))
		}
	})

	t.Run("returns empty for job with no progress", func(t *testing.T) {
		progress, err := repo.ListByJobID("job-empty")
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(progress) != 0 {
			t.Errorf("expected 0 progress entries, got %d", len(progress))
		}
	})
}

func TestInMemoryProgressRepository_ListByTalentID(t *testing.T) {
	repo := NewInMemoryProgressRepository()

	repo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-1",
		JobID:        "job-1",
		TalentID:     "talent-1",
		Steps:        InitializeSteps(),
	})
	repo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-2",
		JobID:        "job-2",
		TalentID:     "talent-1",
		Steps:        InitializeSteps(),
	})
	repo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-3",
		JobID:        "job-1",
		TalentID:     "talent-2",
		Steps:        InitializeSteps(),
	})

	t.Run("returns all progress for a talent", func(t *testing.T) {
		progress, err := repo.ListByTalentID("talent-1")
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(progress) != 2 {
			t.Errorf("expected 2 progress entries, got %d", len(progress))
		}
	})
}

func TestInMemoryProgressRepository_Update(t *testing.T) {
	repo := NewInMemoryProgressRepository()

	repo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-1",
		JobID:        "job-1",
		TalentID:     "talent-1",
		Steps:        InitializeSteps(),
	})

	t.Run("updates progress successfully", func(t *testing.T) {
		progress, _ := repo.GetByAssignmentID("assign-1")
		progress.Steps[0].Status = models.ProgressStatusCompleted

		if err := repo.Update(progress); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		updated, _ := repo.GetByAssignmentID("assign-1")
		if updated.Steps[0].Status != models.ProgressStatusCompleted {
			t.Error("expected step 0 to be completed")
		}
	})

	t.Run("returns error for non-existent progress", func(t *testing.T) {
		err := repo.Update(&models.AssignmentProgress{AssignmentID: "non-existent"})
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestInMemoryProgressRepository_Delete(t *testing.T) {
	repo := NewInMemoryProgressRepository()

	repo.Create(&models.AssignmentProgress{
		AssignmentID: "assign-1",
		JobID:        "job-1",
		TalentID:     "talent-1",
		Steps:        InitializeSteps(),
	})

	t.Run("deletes progress successfully", func(t *testing.T) {
		if err := repo.Delete("assign-1"); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		_, err := repo.GetByAssignmentID("assign-1")
		if err == nil {
			t.Error("expected error after delete, got nil")
		}
	})

	t.Run("returns error for non-existent progress", func(t *testing.T) {
		err := repo.Delete("non-existent")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestInitializeSteps(t *testing.T) {
	steps := InitializeSteps()

	if len(steps) != 4 {
		t.Errorf("expected 4 steps, got %d", len(steps))
	}

	expectedSteps := []string{
		models.ProgressStepAbsen,
		models.ProgressStepDraftStoryline,
		models.ProgressStepInputLink,
		models.ProgressStepInsight,
	}

	for i, step := range steps {
		if step.Step != expectedSteps[i] {
			t.Errorf("step %d: expected '%s', got '%s'", i, expectedSteps[i], step.Step)
		}
		if step.Status != models.ProgressStatusPending {
			t.Errorf("step %d: expected status '%s', got '%s'", i, models.ProgressStatusPending, step.Status)
		}
	}
}
