package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Announcement represents a global announcement sent by admin or recruiter.
type Announcement struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FromRole  string             `bson:"from_role" json:"from_role"` // "admin" or "recruiter"
	Message   string             `bson:"message" json:"message"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

