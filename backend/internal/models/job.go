package models

import "time"

// JobStatus constants for job lifecycle.
const (
	JobStatusDraft     = "draft"
	JobStatusActive    = "active"
	JobStatusCompleted = "completed"
	JobStatusCancelled = "cancelled"
)

// ValidJobStatuses is the set of valid job statuses.
var ValidJobStatuses = map[string]bool{
	JobStatusDraft:     true,
	JobStatusActive:    true,
	JobStatusCompleted: true,
	JobStatusCancelled: true,
}

// Job represents a campaign/job created by an admin.
type Job struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description,omitempty"`
	BrandName   string     `json:"brand_name"`
	Status      string     `json:"status"`
	Deadline    *time.Time `json:"deadline,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

// CreateJobRequest is the payload for creating a new job.
type CreateJobRequest struct {
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	BrandName   string `json:"brand_name"`
	Deadline    string `json:"deadline,omitempty"`
}

// UpdateJobRequest is the payload for updating a job.
type UpdateJobRequest struct {
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	BrandName   string `json:"brand_name,omitempty"`
	Status      string `json:"status,omitempty"`
	Deadline    string `json:"deadline,omitempty"`
}

// JobAssignment represents a link between a social media account and a job.
type JobAssignment struct {
	ID            string    `json:"id"`
	JobID         string    `json:"job_id"`
	SocialMediaID string    `json:"social_media_id"`
	TalentID      string    `json:"talent_id"`
	Platform      string    `json:"platform"`
	Username      string    `json:"username"`
	AssignedAt    time.Time `json:"assigned_at"`
}
