package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Post represents a feed item (job or update).
type Post struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	Type      string             `bson:"type" json:"type"` // job_post, update
	Title     string             `bson:"title" json:"title"`
	Content   string             `bson:"content" json:"content"`
	Tags      []string           `bson:"tags" json:"tags"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}
