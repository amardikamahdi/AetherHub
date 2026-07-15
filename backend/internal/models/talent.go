package models

// CreateTalentRequest is the payload for creating a new talent profile.
type CreateTalentRequest struct {
	UserID string `json:"user_id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Phone  string `json:"phone,omitempty"`
	Photo  string `json:"photo_url,omitempty"`
	Bio    string `json:"bio,omitempty"`
}

// UpdateTalentRequest is the payload for updating a talent profile.
type UpdateTalentRequest struct {
	Name  string `json:"name,omitempty"`
	Email string `json:"email,omitempty"`
	Phone string `json:"phone,omitempty"`
	Photo string `json:"photo_url,omitempty"`
	Bio   string `json:"bio,omitempty"`
}

// CreateSocialMediaRequest is the payload for adding a social media account.
type CreateSocialMediaRequest struct {
	Platform string `json:"platform"`
	Username string `json:"username"`
	URL      string `json:"url,omitempty"`
}

// UpdateSocialMediaRequest is the payload for updating a social media account.
type UpdateSocialMediaRequest struct {
	Username string `json:"username,omitempty"`
	URL      string `json:"url,omitempty"`
}

// ValidPlatforms is the set of supported social media platforms.
var ValidPlatforms = map[string]bool{
	"instagram": true,
	"tiktok":    true,
	"youtube":   true,
	"twitter":   true,
	"facebook":  true,
}
