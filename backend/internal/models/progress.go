package models

import "time"

// ProgressStep constants define the 4-step progress flow.
const (
	ProgressStepAbsen         = "absen"
	ProgressStepDraftStoryline = "draft_storyline"
	ProgressStepInputLink     = "input_link"
	ProgressStepInsight       = "insight"
)

// OrderedProgressSteps defines the required completion order.
var OrderedProgressSteps = []string{
	ProgressStepAbsen,
	ProgressStepDraftStoryline,
	ProgressStepInputLink,
	ProgressStepInsight,
}

// ProgressStatus constants for step lifecycle.
const (
	ProgressStatusPending   = "pending"
	ProgressStatusCompleted = "completed"
)

// ProgressStepState represents a single step's state within an assignment's progress.
type ProgressStepState struct {
	Step        string     `json:"step"`
	Status      string     `json:"status"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	Notes       string     `json:"notes,omitempty"`
}

// AssignmentProgress represents the full progress for one assignment (one social media account).
type AssignmentProgress struct {
	AssignmentID string             `json:"assignment_id"`
	JobID        string             `json:"job_id"`
	TalentID     string             `json:"talent_id"`
	Steps        []ProgressStepState `json:"steps"`
	CreatedAt    time.Time          `json:"created_at"`
	UpdatedAt    time.Time          `json:"updated_at"`
}

// UpdateProgressStepRequest is the payload for completing a progress step.
type UpdateProgressStepRequest struct {
	Step  string `json:"step"`
	Notes string `json:"notes,omitempty"`
}
