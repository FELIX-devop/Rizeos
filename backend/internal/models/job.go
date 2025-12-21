package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Job represents a recruiter-created job listing.
type Job struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	RecruiterID primitive.ObjectID   `bson:"recruiter_id" json:"recruiter_id"`
	Title       string               `bson:"title" json:"title"`
	Description string               `bson:"description" json:"description"`
	Skills      []string             `bson:"skills" json:"skills"`
	Location    string               `bson:"location" json:"location"`
	Tags        []string             `bson:"tags" json:"tags"`
	Budget      float64              `bson:"budget" json:"budget"`
	PaymentID   primitive.ObjectID   `bson:"payment_id" json:"payment_id"`
	CreatedAt   time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time            `bson:"updated_at" json:"updated_at"`
	MatchScores map[string]float64   `bson:"match_scores,omitempty" json:"match_scores,omitempty"`
	Candidates  []primitive.ObjectID `bson:"candidates,omitempty" json:"candidates,omitempty"`
}
