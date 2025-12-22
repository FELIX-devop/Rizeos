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

// AnnouncementService handles announcement persistence.
type AnnouncementService struct {
	col *mongo.Collection
}

var announcementMemory = struct {
	sync.Mutex
	data map[string]models.Announcement
}{data: map[string]models.Announcement{}}

// NewAnnouncementService creates an AnnouncementService.
func NewAnnouncementService(db *mongo.Database) *AnnouncementService {
	if db == nil {
		return &AnnouncementService{col: nil}
	}
	return &AnnouncementService{col: db.Collection("announcements")}
}

// Create inserts a new announcement.
func (s *AnnouncementService) Create(ctx context.Context, announcement models.Announcement) (models.Announcement, error) {
	if s.col == nil {
		announcementMemory.Lock()
		defer announcementMemory.Unlock()
		announcement.ID = primitive.NewObjectID()
		announcement.CreatedAt = time.Now()
		announcementMemory.data[announcement.ID.Hex()] = announcement
		return announcement, nil
	}
	announcement.CreatedAt = time.Now()
	res, err := s.col.InsertOne(ctx, announcement)
	if err != nil {
		return models.Announcement{}, err
	}
	announcement.ID = res.InsertedID.(primitive.ObjectID)
	return announcement, nil
}

// List returns all announcements, sorted by latest first.
func (s *AnnouncementService) List(ctx context.Context) ([]models.Announcement, error) {
	if s.col == nil {
		announcementMemory.Lock()
		defer announcementMemory.Unlock()
		announcements := make([]models.Announcement, 0, len(announcementMemory.data))
		for _, a := range announcementMemory.data {
			announcements = append(announcements, a)
		}
		// Sort by CreatedAt descending (latest first)
		for i := 0; i < len(announcements)-1; i++ {
			for j := i + 1; j < len(announcements); j++ {
				if announcements[i].CreatedAt.Before(announcements[j].CreatedAt) {
					announcements[i], announcements[j] = announcements[j], announcements[i]
				}
			}
		}
		return announcements, nil
	}
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := s.col.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var announcements []models.Announcement
	if err := cursor.All(ctx, &announcements); err != nil {
		return nil, err
	}
	return announcements, nil
}

