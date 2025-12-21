package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Message represents a message between users.
type Message struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FromUserID primitive.ObjectID `bson:"from_user_id" json:"from_user_id"`
	FromRole   string             `bson:"from_role" json:"from_role"` // "recruiter" | "seeker"
	ToUserID   primitive.ObjectID `bson:"to_user_id" json:"to_user_id"`
	ToRole     string             `bson:"to_role" json:"to_role"` // "admin" | "recruiter"
	Message    string             `bson:"message" json:"message"`
	IsRead     bool               `bson:"is_read" json:"is_read"`
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
}
