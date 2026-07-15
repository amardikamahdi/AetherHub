package repository

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/amardikamahdi/AetherHub/internal/models"
)

// TalentRepository defines the interface for talent profile operations.
type TalentRepository interface {
	Create(talent *models.TalentProfile) error
	GetByID(id string) (*models.TalentProfile, error)
	GetByUserID(userID string) (*models.TalentProfile, error)
	List(offset, limit int) ([]*models.TalentProfile, int, error)
	Update(talent *models.TalentProfile) error
	Delete(id string) error
}

// InMemoryTalentRepository implements TalentRepository with in-memory storage.
type InMemoryTalentRepository struct {
	mu      sync.RWMutex
	talents map[string]*models.TalentProfile
}

// NewInMemoryTalentRepository creates a new in-memory talent repository.
func NewInMemoryTalentRepository() *InMemoryTalentRepository {
	return &InMemoryTalentRepository{
		talents: make(map[string]*models.TalentProfile),
	}
}

var (
	ErrTalentNotFound = errors.New("talent not found")
	ErrTalentExists   = errors.New("talent already exists for this user")
)

// Create adds a new talent profile to the repository.
func (r *InMemoryTalentRepository) Create(talent *models.TalentProfile) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, t := range r.talents {
		if t.UserID == talent.UserID && t.DeletedAt == nil {
			return fmt.Errorf("%w: %s", ErrTalentExists, talent.UserID)
		}
	}

	now := time.Now()
	talent.CreatedAt = now
	talent.UpdatedAt = now
	r.talents[talent.ID] = talent
	return nil
}

// GetByID retrieves a talent profile by its ID.
func (r *InMemoryTalentRepository) GetByID(id string) (*models.TalentProfile, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	talent, exists := r.talents[id]
	if !exists || talent.DeletedAt != nil {
		return nil, fmt.Errorf("%w: %s", ErrTalentNotFound, id)
	}
	return talent, nil
}

// GetByUserID retrieves a talent profile by the associated user ID.
func (r *InMemoryTalentRepository) GetByUserID(userID string) (*models.TalentProfile, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, talent := range r.talents {
		if talent.UserID == userID && talent.DeletedAt == nil {
			return talent, nil
		}
	}
	return nil, fmt.Errorf("%w: user %s", ErrTalentNotFound, userID)
}

// List returns a paginated list of non-deleted talent profiles.
func (r *InMemoryTalentRepository) List(offset, limit int) ([]*models.TalentProfile, int, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var all []*models.TalentProfile
	for _, talent := range r.talents {
		if talent.DeletedAt == nil {
			all = append(all, talent)
		}
	}

	total := len(all)

	if offset >= total {
		return []*models.TalentProfile{}, total, nil
	}

	end := offset + limit
	if end > total {
		end = total
	}

	return all[offset:end], total, nil
}

// Update modifies an existing talent profile.
func (r *InMemoryTalentRepository) Update(talent *models.TalentProfile) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.talents[talent.ID]; !exists {
		return fmt.Errorf("%w: %s", ErrTalentNotFound, talent.ID)
	}

	talent.UpdatedAt = time.Now()
	r.talents[talent.ID] = talent
	return nil
}

// Delete soft-deletes a talent profile by setting DeletedAt.
func (r *InMemoryTalentRepository) Delete(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	talent, exists := r.talents[id]
	if !exists {
		return fmt.Errorf("%w: %s", ErrTalentNotFound, id)
	}

	now := time.Now()
	talent.DeletedAt = &now
	talent.UpdatedAt = now
	return nil
}

// SocialMediaRepository defines the interface for social media account operations.
type SocialMediaRepository interface {
	Create(account *models.SocialMediaAccount) error
	GetByID(id string) (*models.SocialMediaAccount, error)
	ListByTalentID(talentID string) ([]*models.SocialMediaAccount, error)
	Update(account *models.SocialMediaAccount) error
	Delete(id string) error
}

// InMemorySocialMediaRepository implements SocialMediaRepository with in-memory storage.
type InMemorySocialMediaRepository struct {
	mu       sync.RWMutex
	accounts map[string]*models.SocialMediaAccount
}

// NewInMemorySocialMediaRepository creates a new in-memory social media repository.
func NewInMemorySocialMediaRepository() *InMemorySocialMediaRepository {
	return &InMemorySocialMediaRepository{
		accounts: make(map[string]*models.SocialMediaAccount),
	}
}

var ErrSocialMediaNotFound = errors.New("social media account not found")

// Create adds a new social media account.
func (r *InMemorySocialMediaRepository) Create(account *models.SocialMediaAccount) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	account.CreatedAt = time.Now()
	r.accounts[account.ID] = account
	return nil
}

// GetByID retrieves a social media account by its ID.
func (r *InMemorySocialMediaRepository) GetByID(id string) (*models.SocialMediaAccount, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	account, exists := r.accounts[id]
	if !exists {
		return nil, fmt.Errorf("%w: %s", ErrSocialMediaNotFound, id)
	}
	return account, nil
}

// ListByTalentID returns all social media accounts for a given talent.
func (r *InMemorySocialMediaRepository) ListByTalentID(talentID string) ([]*models.SocialMediaAccount, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var accounts []*models.SocialMediaAccount
	for _, account := range r.accounts {
		if account.TalentID == talentID {
			accounts = append(accounts, account)
		}
	}
	return accounts, nil
}

// Update modifies an existing social media account.
func (r *InMemorySocialMediaRepository) Update(account *models.SocialMediaAccount) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.accounts[account.ID]; !exists {
		return fmt.Errorf("%w: %s", ErrSocialMediaNotFound, account.ID)
	}

	r.accounts[account.ID] = account
	return nil
}

// Delete removes a social media account.
func (r *InMemorySocialMediaRepository) Delete(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.accounts[id]; !exists {
		return fmt.Errorf("%w: %s", ErrSocialMediaNotFound, id)
	}

	delete(r.accounts, id)
	return nil
}
