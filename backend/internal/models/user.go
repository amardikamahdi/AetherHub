package models

import "time"

// Role constants for user types.
const (
	RoleSuperadmin = "superadmin"
	RoleAdmin      = "admin"
	RoleTalent     = "talent"
)

// User represents a platform user.
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Name         string    `json:"name"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty"`
}

// CreateUserRequest is the payload for creating a new user.
type CreateUserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Role     string `json:"role"`
}

// LoginRequest is the payload for user login.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse is the response after successful login.
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// TalentProfile extends User with talent-specific fields.
type TalentProfile struct {
	ID        string     `json:"id"`
	UserID    string     `json:"user_id"`
	Name      string     `json:"name"`
	Email     string     `json:"email"`
	Phone     string     `json:"phone,omitempty"`
	Photo     string     `json:"photo_url,omitempty"`
	Bio       string     `json:"bio,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

// SocialMediaAccount represents a talent's social media account.
type SocialMediaAccount struct {
	ID        string    `json:"id"`
	TalentID  string    `json:"talent_id"`
	Platform  string    `json:"platform"`
	Username  string    `json:"username"`
	URL       string    `json:"url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// BrandAccessCode represents a unique code for brand access.
type BrandAccessCode struct {
	ID         string    `json:"id"`
	JobID      string    `json:"job_id,omitempty"`
	BrandName  string    `json:"brand_name"`
	UniqueCode string    `json:"unique_code"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
}
