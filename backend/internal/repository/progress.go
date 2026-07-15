package repository

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/amardikamahdi/AetherHub/internal/models"
)

// ProgressRepository defines the interface for progress operations.
type ProgressRepository interface {
	Create(progress *models.AssignmentProgress) error
	GetByAssignmentID(assignmentID string) (*models.AssignmentProgress, error)
	ListByJobID(jobID string) ([]*models.AssignmentProgress, error)
	ListByTalentID(talentID string) ([]*models.AssignmentProgress, error)
	Update(progress *models.AssignmentProgress) error
	Delete(assignmentID string) error
}

// InMemoryProgressRepository implements ProgressRepository with in-memory storage.
type InMemoryProgressRepository struct {
	mu        sync.RWMutex
	progress  map[string]*models.AssignmentProgress
}

// NewInMemoryProgressRepository creates a new in-memory progress repository.
func NewInMemoryProgressRepository() *InMemoryProgressRepository {
	return &InMemoryProgressRepository{
		progress: make(map[string]*models.AssignmentProgress),
	}
}

var ErrProgressNotFound = errors.New("progress not found")

// Create adds a new progress entry to the repository.
func (r *InMemoryProgressRepository) Create(progress *models.AssignmentProgress) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()
	progress.CreatedAt = now
	progress.UpdatedAt = now
	r.progress[progress.AssignmentID] = progress
	return nil
}

// GetByAssignmentID retrieves progress by assignment ID.
func (r *InMemoryProgressRepository) GetByAssignmentID(assignmentID string) (*models.AssignmentProgress, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	progress, exists := r.progress[assignmentID]
	if !exists {
		return nil, fmt.Errorf("%w: %s", ErrProgressNotFound, assignmentID)
	}
	return progress, nil
}

// ListByJobID returns all progress entries for a specific job.
func (r *InMemoryProgressRepository) ListByJobID(jobID string) ([]*models.AssignmentProgress, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []*models.AssignmentProgress
	for _, p := range r.progress {
		if p.JobID == jobID {
			result = append(result, p)
		}
	}
	return result, nil
}

// ListByTalentID returns all progress entries for a specific talent.
func (r *InMemoryProgressRepository) ListByTalentID(talentID string) ([]*models.AssignmentProgress, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []*models.AssignmentProgress
	for _, p := range r.progress {
		if p.TalentID == talentID {
			result = append(result, p)
		}
	}
	return result, nil
}

// Update modifies an existing progress entry.
func (r *InMemoryProgressRepository) Update(progress *models.AssignmentProgress) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.progress[progress.AssignmentID]; !exists {
		return fmt.Errorf("%w: %s", ErrProgressNotFound, progress.AssignmentID)
	}

	progress.UpdatedAt = time.Now()
	r.progress[progress.AssignmentID] = progress
	return nil
}

// Delete removes a progress entry.
func (r *InMemoryProgressRepository) Delete(assignmentID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.progress[assignmentID]; !exists {
		return fmt.Errorf("%w: %s", ErrProgressNotFound, assignmentID)
	}

	delete(r.progress, assignmentID)
	return nil
}

// InitializeSteps creates the 4 progress steps for a new assignment.
func InitializeSteps() []models.ProgressStepState {
	steps := make([]models.ProgressStepState, len(models.OrderedProgressSteps))
	for i, step := range models.OrderedProgressSteps {
		steps[i] = models.ProgressStepState{
			Step:   step,
			Status: models.ProgressStatusPending,
		}
	}
	return steps
}
