package repository

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/amardikamahdi/AetherHub/internal/models"
)

// AssignmentRepository defines the interface for job assignment operations.
type AssignmentRepository interface {
	Assign(assignment *models.JobAssignment) error
	Unassign(id string) error
	GetByID(id string) (*models.JobAssignment, error)
	ListByJobID(jobID string) ([]*models.JobAssignment, error)
	ListBySocialMediaID(socialMediaID string) ([]*models.JobAssignment, error)
}

// InMemoryAssignmentRepository implements AssignmentRepository with in-memory storage.
type InMemoryAssignmentRepository struct {
	mu          sync.RWMutex
	assignments map[string]*models.JobAssignment
}

// NewInMemoryAssignmentRepository creates a new in-memory assignment repository.
func NewInMemoryAssignmentRepository() *InMemoryAssignmentRepository {
	return &InMemoryAssignmentRepository{
		assignments: make(map[string]*models.JobAssignment),
	}
}

var (
	ErrAssignmentNotFound  = errors.New("assignment not found")
	ErrDuplicateAssignment = errors.New("social media account already assigned to this job")
)

// Assign adds a new job assignment.
func (r *InMemoryAssignmentRepository) Assign(assignment *models.JobAssignment) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Check for duplicate assignment (same social_media_id + job_id)
	for _, a := range r.assignments {
		if a.JobID == assignment.JobID && a.SocialMediaID == assignment.SocialMediaID {
			return fmt.Errorf("%w: job=%s social_media=%s", ErrDuplicateAssignment, assignment.JobID, assignment.SocialMediaID)
		}
	}

	assignment.AssignedAt = time.Now()
	r.assignments[assignment.ID] = assignment
	return nil
}

// Unassign removes a job assignment.
func (r *InMemoryAssignmentRepository) Unassign(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.assignments[id]; !exists {
		return fmt.Errorf("%w: %s", ErrAssignmentNotFound, id)
	}

	delete(r.assignments, id)
	return nil
}

// GetByID retrieves an assignment by its ID.
func (r *InMemoryAssignmentRepository) GetByID(id string) (*models.JobAssignment, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	assignment, exists := r.assignments[id]
	if !exists {
		return nil, fmt.Errorf("%w: %s", ErrAssignmentNotFound, id)
	}
	return assignment, nil
}

// ListByJobID returns all assignments for a given job.
func (r *InMemoryAssignmentRepository) ListByJobID(jobID string) ([]*models.JobAssignment, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var assignments []*models.JobAssignment
	for _, a := range r.assignments {
		if a.JobID == jobID {
			assignments = append(assignments, a)
		}
	}
	return assignments, nil
}

// ListBySocialMediaID returns all assignments for a given social media account.
func (r *InMemoryAssignmentRepository) ListBySocialMediaID(socialMediaID string) ([]*models.JobAssignment, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var assignments []*models.JobAssignment
	for _, a := range r.assignments {
		if a.SocialMediaID == socialMediaID {
			assignments = append(assignments, a)
		}
	}
	return assignments, nil
}
