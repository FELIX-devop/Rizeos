package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// JobApplication represents a job seeker's application to a job.
type JobApplication struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	JobID             primitive.ObjectID `bson:"job_id" json:"job_id"`
	JobSeekerID       primitive.ObjectID `bson:"job_seeker_id" json:"job_seeker_id"`
	RecruiterID       primitive.ObjectID `bson:"recruiter_id" json:"recruiter_id"`
	ApplicationStatus string             `bson:"application_status" json:"application_status"` // "APPLIED", "SHORTLISTED", "REJECTED", etc.
	AppliedAt         time.Time          `bson:"applied_at" json:"applied_at"`
	CreatedAt         time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt         time.Time          `bson:"updated_at" json:"updated_at"`
}

