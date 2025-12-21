package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Payment represents a platform fee payment.
type Payment struct {
	ID          primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	RecruiterID primitive.ObjectID  `bson:"recruiter_id" json:"recruiter_id"`
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
