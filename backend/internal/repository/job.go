package repository

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/amardikamahdi/AetherHub/internal/models"
)

// JobRepository defines the interface for job operations.
type JobRepository interface {
	Create(job *models.Job) error
	GetByID(id string) (*models.Job, error)
	List(offset, limit int) ([]*models.Job, int, error)
	Update(job *models.Job) error
	Delete(id string) error
}

// InMemoryJobRepository implements JobRepository with in-memory storage.
type InMemoryJobRepository struct {
	mu  sync.RWMutex
	jobs map[string]*models.Job
}

// NewInMemoryJobRepository creates a new in-memory job repository.
func NewInMemoryJobRepository() *InMemoryJobRepository {
	return &InMemoryJobRepository{
		jobs: make(map[string]*models.Job),
	}
}

var ErrJobNotFound = errors.New("job not found")

// Create adds a new job to the repository.
func (r *InMemoryJobRepository) Create(job *models.Job) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()
	job.CreatedAt = now
	job.UpdatedAt = now
	r.jobs[job.ID] = job
	return nil
}

// GetByID retrieves a job by its ID.
func (r *InMemoryJobRepository) GetByID(id string) (*models.Job, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	job, exists := r.jobs[id]
	if !exists || job.DeletedAt != nil {
		return nil, fmt.Errorf("%w: %s", ErrJobNotFound, id)
	}
	return job, nil
}

// List returns a paginated list of non-deleted jobs.
func (r *InMemoryJobRepository) List(offset, limit int) ([]*models.Job, int, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var all []*models.Job
	for _, job := range r.jobs {
		if job.DeletedAt == nil {
			all = append(all, job)
		}
	}

	total := len(all)

	if offset >= total {
		return []*models.Job{}, total, nil
	}

	end := offset + limit
	if end > total {
		end = total
	}

	return all[offset:end], total, nil
}

// Update modifies an existing job.
func (r *InMemoryJobRepository) Update(job *models.Job) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.jobs[job.ID]; !exists {
		return fmt.Errorf("%w: %s", ErrJobNotFound, job.ID)
	}

	job.UpdatedAt = time.Now()
	r.jobs[job.ID] = job
	return nil
}

// Delete soft-deletes a job by setting DeletedAt.
func (r *InMemoryJobRepository) Delete(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	job, exists := r.jobs[id]
	if !exists {
		return fmt.Errorf("%w: %s", ErrJobNotFound, id)
	}

	now := time.Now()
	job.DeletedAt = &now
	job.UpdatedAt = now
	return nil
}
