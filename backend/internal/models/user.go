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
	// New optional fields for job seekers
	PhoneNumber   string             `bson:"phone_number,omitempty" json:"phone_number,omitempty"`
	Summary       string             `bson:"summary,omitempty" json:"summary,omitempty"`
	Education     string             `bson:"education,omitempty" json:"education,omitempty"`
	TenthMarks    interface{}        `bson:"tenth_marks,omitempty" json:"tenth_marks,omitempty"` // string or number
	TwelfthMarks  interface{}        `bson:"twelfth_marks,omitempty" json:"twelfth_marks,omitempty"` // string or number
	Experience    interface{}        `bson:"experience,omitempty" json:"experience,omitempty"` // string or number
	IsActive      *bool              `bson:"is_active,omitempty" json:"is_active,omitempty"` // pointer to allow nil (default true)
	IsPremium     bool               `bson:"is_premium,omitempty" json:"is_premium,omitempty"` // premium status for job seekers
	PremiumPaymentID *primitive.ObjectID `bson:"premium_payment_id,omitempty" json:"premium_payment_id,omitempty"` // reference to premium payment
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updated_at"`
}
