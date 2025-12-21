package services

import (
	"context"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"rizeos/backend/internal/models"
)

// MessageService handles message persistence.
type MessageService struct {
	col *mongo.Collection
}

var messageMemory = struct {
	sync.Mutex
	data map[string]models.Message
}{data: map[string]models.Message{}}

// NewMessageService creates a MessageService.
func NewMessageService(db *mongo.Database) *MessageService {
	if db == nil {
		return &MessageService{col: nil}
	}
	return &MessageService{col: db.Collection("messages")}
}

// Create inserts a new message.
func (s *MessageService) Create(ctx context.Context, msg models.Message) (models.Message, error) {
	if s.col == nil {
		messageMemory.Lock()
		defer messageMemory.Unlock()
		msg.ID = primitive.NewObjectID()
		msg.IsRead = false
		msg.CreatedAt = time.Now()
		messageMemory.data[msg.ID.Hex()] = msg
		return msg, nil
	}
	msg.IsRead = false
	msg.CreatedAt = time.Now()
	res, err := s.col.InsertOne(ctx, msg)
	if err != nil {
		return models.Message{}, err
	}
	msg.ID = res.InsertedID.(primitive.ObjectID)
	return msg, nil
}

// GetAdminInbox returns all messages for admin, sorted by latest first.
func (s *MessageService) GetAdminInbox(ctx context.Context) ([]models.Message, error) {
	if s.col == nil {
		messageMemory.Lock()
		defer messageMemory.Unlock()
		messages := make([]models.Message, 0, len(messageMemory.data))
		for _, m := range messageMemory.data {
			if m.ToRole == models.RoleAdmin {
				messages = append(messages, m)
			}
		}
		// Sort by CreatedAt descending (latest first)
		for i := 0; i < len(messages)-1; i++ {
			for j := i + 1; j < len(messages); j++ {
				if messages[i].CreatedAt.Before(messages[j].CreatedAt) {
					messages[i], messages[j] = messages[j], messages[i]
				}
			}
		}
		return messages, nil
	}
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := s.col.Find(ctx, bson.M{"to_role": models.RoleAdmin}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var messages []models.Message
	if err := cursor.All(ctx, &messages); err != nil {
		return nil, err
	}
	return messages, nil
}

// GetRecruiterInbox returns all messages for a specific recruiter, sorted by latest first.
func (s *MessageService) GetRecruiterInbox(ctx context.Context, recruiterID primitive.ObjectID) ([]models.Message, error) {
	if s.col == nil {
		messageMemory.Lock()
		defer messageMemory.Unlock()
		messages := make([]models.Message, 0, len(messageMemory.data))
		for _, m := range messageMemory.data {
			if m.ToRole == models.RoleRecruiter && m.ToUserID == recruiterID {
				messages = append(messages, m)
			}
		}
		// Sort by CreatedAt descending (latest first)
		for i := 0; i < len(messages)-1; i++ {
			for j := i + 1; j < len(messages); j++ {
				if messages[i].CreatedAt.Before(messages[j].CreatedAt) {
					messages[i], messages[j] = messages[j], messages[i]
				}
			}
		}
		return messages, nil
	}
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := s.col.Find(ctx, bson.M{
		"to_role":   models.RoleRecruiter,
		"to_user_id": recruiterID,
	}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var messages []models.Message
	if err := cursor.All(ctx, &messages); err != nil {
		return nil, err
	}
	return messages, nil
}

// GetRecruiterUnreadCount returns the count of unread messages for a recruiter.
func (s *MessageService) GetRecruiterUnreadCount(ctx context.Context, recruiterID primitive.ObjectID) (int64, error) {
	if s.col == nil {
		messageMemory.Lock()
		defer messageMemory.Unlock()
		count := int64(0)
		for _, m := range messageMemory.data {
			if m.ToRole == models.RoleRecruiter && m.ToUserID == recruiterID && !m.IsRead {
				count++
			}
		}
		return count, nil
	}
	count, err := s.col.CountDocuments(ctx, bson.M{
		"to_role":   models.RoleRecruiter,
		"to_user_id": recruiterID,
		"is_read":   false,
	})
	return count, err
}

// MarkAsRead marks a message as read.
func (s *MessageService) MarkAsRead(ctx context.Context, messageID primitive.ObjectID) error {
	if s.col == nil {
		messageMemory.Lock()
		defer messageMemory.Unlock()
		if msg, ok := messageMemory.data[messageID.Hex()]; ok {
			msg.IsRead = true
			messageMemory.data[messageID.Hex()] = msg
		}
		return nil
	}
	_, err := s.col.UpdateByID(ctx, messageID, bson.M{"$set": bson.M{"is_read": true}})
	return err
}

// GetUnreadCount returns the count of unread messages for admin.
func (s *MessageService) GetUnreadCount(ctx context.Context) (int64, error) {
	if s.col == nil {
		messageMemory.Lock()
		defer messageMemory.Unlock()
		count := int64(0)
		for _, m := range messageMemory.data {
			if m.ToRole == models.RoleAdmin && !m.IsRead {
				count++
			}
		}
		return count, nil
	}
	count, err := s.col.CountDocuments(ctx, bson.M{
		"to_role": models.RoleAdmin,
		"is_read": false,
	})
	return count, err
}

