package repository

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/amardikamahdi/AetherHub/internal/models"
)

// BrandRepository defines the interface for brand access code operations.
type BrandRepository interface {
	Create(code *models.BrandAccessCode) error
	GetByCode(uniqueCode string) (*models.BrandAccessCode, error)
}

// InMemoryBrandRepository implements BrandRepository with in-memory storage.
type InMemoryBrandRepository struct {
	mu    sync.RWMutex
	codes map[string]*models.BrandAccessCode
}

// NewInMemoryBrandRepository creates a new in-memory brand repository.
func NewInMemoryBrandRepository() *InMemoryBrandRepository {
	return &InMemoryBrandRepository{
		codes: make(map[string]*models.BrandAccessCode),
	}
}

var ErrCodeNotFound = errors.New("brand access code not found")

// Create adds a new brand access code.
func (r *InMemoryBrandRepository) Create(code *models.BrandAccessCode) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	code.CreatedAt = time.Now()
	r.codes[code.UniqueCode] = code
	return nil
}

// GetByCode retrieves a brand access code by its unique code.
func (r *InMemoryBrandRepository) GetByCode(uniqueCode string) (*models.BrandAccessCode, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	code, exists := r.codes[uniqueCode]
	if !exists {
		return nil, fmt.Errorf("%w: %s", ErrCodeNotFound, uniqueCode)
	}
	return code, nil
}
