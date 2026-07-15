package repository

import (
	"testing"

	"github.com/amardikamahdi/AetherHub/internal/models"
)

func TestInMemoryAssignmentRepository_Assign(t *testing.T) {
	repo := NewInMemoryAssignmentRepository()

	t.Run("assigns successfully", func(t *testing.T) {
		assignment := &models.JobAssignment{
			ID:            "assign-1",
			JobID:         "job-1",
			SocialMediaID: "sm-1",
			TalentID:      "talent-1",
			Platform:      "instagram",
			Username:      "@alice",
		}

		if err := repo.Assign(assignment); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		if assignment.AssignedAt.IsZero() {
			t.Error("expected AssignedAt to be set")
		}
	})

	t.Run("rejects duplicate assignment", func(t *testing.T) {
		assignment := &models.JobAssignment{
			ID:            "assign-2",
			JobID:         "job-1",
			SocialMediaID: "sm-1",
			TalentID:      "talent-1",
			Platform:      "instagram",
			Username:      "@alice",
		}

		err := repo.Assign(assignment)
		if err == nil {
			t.Error("expected error for duplicate assignment, got nil")
		}
	})

	t.Run("allows same social media on different jobs", func(t *testing.T) {
		assignment := &models.JobAssignment{
			ID:            "assign-3",
			JobID:         "job-2",
			SocialMediaID: "sm-1",
			TalentID:      "talent-1",
			Platform:      "instagram",
			Username:      "@alice",
		}

		if err := repo.Assign(assignment); err != nil {
			t.Errorf("expected no error, got %v", err)
		}
	})
}

func TestInMemoryAssignmentRepository_Unassign(t *testing.T) {
	repo := NewInMemoryAssignmentRepository()

	repo.Assign(&models.JobAssignment{
		ID:            "assign-1",
		JobID:         "job-1",
		SocialMediaID: "sm-1",
		TalentID:      "talent-1",
	})

	t.Run("unassigns successfully", func(t *testing.T) {
		if err := repo.Unassign("assign-1"); err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		_, err := repo.GetByID("assign-1")
		if err == nil {
			t.Error("expected error after unassign, got nil")
		}
	})

	t.Run("returns error for non-existent assignment", func(t *testing.T) {
		err := repo.Unassign("non-existent")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestInMemoryAssignmentRepository_GetByID(t *testing.T) {
	repo := NewInMemoryAssignmentRepository()

	repo.Assign(&models.JobAssignment{
		ID:            "assign-1",
		JobID:         "job-1",
		SocialMediaID: "sm-1",
		TalentID:      "talent-1",
	})

	t.Run("returns assignment by ID", func(t *testing.T) {
		assignment, err := repo.GetByID("assign-1")
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if assignment.JobID != "job-1" {
			t.Errorf("expected job_id 'job-1', got '%s'", assignment.JobID)
		}
	})

	t.Run("returns error for non-existent ID", func(t *testing.T) {
		_, err := repo.GetByID("non-existent")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestInMemoryAssignmentRepository_ListByJobID(t *testing.T) {
	repo := NewInMemoryAssignmentRepository()

	repo.Assign(&models.JobAssignment{ID: "assign-1", JobID: "job-1", SocialMediaID: "sm-1", TalentID: "talent-1"})
	repo.Assign(&models.JobAssignment{ID: "assign-2", JobID: "job-1", SocialMediaID: "sm-2", TalentID: "talent-1"})
	repo.Assign(&models.JobAssignment{ID: "assign-3", JobID: "job-2", SocialMediaID: "sm-3", TalentID: "talent-2"})

	t.Run("returns assignments for specific job", func(t *testing.T) {
		assignments, err := repo.ListByJobID("job-1")
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(assignments) != 2 {
			t.Errorf("expected 2 assignments, got %d", len(assignments))
		}
	})

	t.Run("returns empty for job with no assignments", func(t *testing.T) {
		assignments, _ := repo.ListByJobID("job-99")
		if len(assignments) != 0 {
			t.Errorf("expected 0 assignments, got %d", len(assignments))
		}
	})
}

func TestInMemoryAssignmentRepository_ListBySocialMediaID(t *testing.T) {
	repo := NewInMemoryAssignmentRepository()

	repo.Assign(&models.JobAssignment{ID: "assign-1", JobID: "job-1", SocialMediaID: "sm-1", TalentID: "talent-1"})
	repo.Assign(&models.JobAssignment{ID: "assign-2", JobID: "job-2", SocialMediaID: "sm-1", TalentID: "talent-1"})
	repo.Assign(&models.JobAssignment{ID: "assign-3", JobID: "job-1", SocialMediaID: "sm-2", TalentID: "talent-2"})

	t.Run("returns assignments for specific social media account", func(t *testing.T) {
		assignments, err := repo.ListBySocialMediaID("sm-1")
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(assignments) != 2 {
			t.Errorf("expected 2 assignments, got %d", len(assignments))
		}
	})

	t.Run("returns empty for account with no assignments", func(t *testing.T) {
		assignments, _ := repo.ListBySocialMediaID("sm-99")
		if len(assignments) != 0 {
			t.Errorf("expected 0 assignments, got %d", len(assignments))
		}
	})
}
