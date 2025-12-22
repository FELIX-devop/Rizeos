package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Payment represents a platform fee payment.
type Payment struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	RecruiterID *primitive.ObjectID `bson:"recruiter_id,omitempty" json:"recruiter_id,omitempty"` // nullable for job seeker payments
	JobSeekerID *primitive.ObjectID `bson:"job_seeker_id,omitempty" json:"job_seeker_id,omitempty"` // for premium payments
	PaymentType string              `bson:"payment_type,omitempty" json:"payment_type,omitempty"` // "JOB_POSTING" or "JOB_SEEKER_PREMIUM"
	TxHash      string              `bson:"tx_hash" json:"tx_hash"`
	Amount      float64             `bson:"amount" json:"amount"`
	Network     string              `bson:"network" json:"network"`
	Recipient   string              `bson:"recipient" json:"recipient"`
	Status      string              `bson:"status" json:"status"` // pending, verified, failed
	JobID       *primitive.ObjectID `bson:"job_id,omitempty" json:"job_id,omitempty"`
	Consumed    bool                `bson:"consumed" json:"consumed"`
	CreatedAt   time.Time           `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time           `bson:"updated_at" json:"updated_at"`
}
