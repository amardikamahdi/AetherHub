package repository

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/amardikamahdi/AetherHub/internal/models"
)

// UserRepository defines the interface for user data operations.
type UserRepository interface {
	Create(user *models.User) error
	GetByID(id string) (*models.User, error)
	GetByEmail(email string) (*models.User, error)
	List(offset, limit int) ([]*models.User, int, error)
	Update(user *models.User) error
	Delete(id string) error
}

// InMemoryUserRepository implements UserRepository with in-memory storage.
type InMemoryUserRepository struct {
	mu    sync.RWMutex
	users map[string]*models.User
}

// NewInMemoryUserRepository creates a new in-memory user repository.
func NewInMemoryUserRepository() *InMemoryUserRepository {
	return &InMemoryUserRepository{
		users: make(map[string]*models.User),
	}
}

var (
	ErrUserNotFound   = errors.New("user not found")
	ErrDuplicateEmail = errors.New("email already exists")
)

// Create adds a new user to the repository.
func (r *InMemoryUserRepository) Create(user *models.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, u := range r.users {
		if u.Email == user.Email && u.DeletedAt == nil {
			return fmt.Errorf("%w: %s", ErrDuplicateEmail, user.Email)
		}
	}

	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now
	r.users[user.ID] = user
	return nil
}

// GetByID retrieves a user by their ID.
func (r *InMemoryUserRepository) GetByID(id string) (*models.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	user, exists := r.users[id]
	if !exists || user.DeletedAt != nil {
		return nil, fmt.Errorf("%w: %s", ErrUserNotFound, id)
	}
	return user, nil
}

// GetByEmail retrieves a user by their email.
func (r *InMemoryUserRepository) GetByEmail(email string) (*models.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, user := range r.users {
		if user.Email == email && user.DeletedAt == nil {
			return user, nil
		}
	}
	return nil, fmt.Errorf("%w: %s", ErrUserNotFound, email)
}

// List returns a paginated list of non-deleted users.
func (r *InMemoryUserRepository) List(offset, limit int) ([]*models.User, int, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var all []*models.User
	for _, user := range r.users {
		if user.DeletedAt == nil {
			all = append(all, user)
		}
	}

	total := len(all)

	if offset >= total {
		return []*models.User{}, total, nil
	}

	end := offset + limit
	if end > total {
		end = total
	}

	return all[offset:end], total, nil
}

// Update modifies an existing user.
func (r *InMemoryUserRepository) Update(user *models.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.users[user.ID]; !exists {
		return fmt.Errorf("%w: %s", ErrUserNotFound, user.ID)
	}

	user.UpdatedAt = time.Now()
	r.users[user.ID] = user
	return nil
}

// Delete soft-deletes a user by setting DeletedAt.
func (r *InMemoryUserRepository) Delete(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	user, exists := r.users[id]
	if !exists {
		return fmt.Errorf("%w: %s", ErrUserNotFound, id)
	}

	now := time.Now()
	user.DeletedAt = &now
	user.UpdatedAt = now
	return nil
}
