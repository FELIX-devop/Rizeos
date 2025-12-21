package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Role constants.
const (
	RoleAdmin     = "admin"
	RoleRecruiter = "recruiter"
	RoleSeeker    = "seeker"
)

// User represents a platform user.
type User struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name          string             `bson:"name" json:"name"`
	Email         string             `bson:"email" json:"email"`
	PasswordHash  string             `bson:"password_hash" json:"-"`
	Role          string             `bson:"role" json:"role"`
	Bio           string             `bson:"bio" json:"bio"`
	LinkedInURL   string             `bson:"linkedin_url" json:"linkedin_url"`
	Skills        []string           `bson:"skills" json:"skills"`
	WalletAddress string             `bson:"wallet_address" json:"wallet_address"`
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updated_at"`
}
