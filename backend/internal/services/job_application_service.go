package services

import (
	"context"
	"errors"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"rizeos/backend/internal/models"
)

// JobApplicationService manages job application persistence.
type JobApplicationService struct {
	col *mongo.Collection
}

var jobApplicationMemory = struct {
	sync.Mutex
	data map[string]models.JobApplication
}{data: map[string]models.JobApplication{}}

// NewJobApplicationService creates a JobApplicationService.
func NewJobApplicationService(db *mongo.Database) *JobApplicationService {
	if db == nil {
		return &JobApplicationService{col: nil}
	}
	return &JobApplicationService{col: db.Collection("job_applications")}
}

// Create inserts a new job application.
func (s *JobApplicationService) Create(ctx context.Context, application models.JobApplication) (models.JobApplication, error) {
	if s.col == nil {
		jobApplicationMemory.Lock()
		defer jobApplicationMemory.Unlock()
		application.ID = primitive.NewObjectID()
		application.CreatedAt = time.Now()
		application.UpdatedAt = time.Now()
		jobApplicationMemory.data[application.ID.Hex()] = application
		return application, nil
	}

	// Check for duplicate application
	filter := bson.M{
		"job_id":       application.JobID,
		"job_seeker_id": application.JobSeekerID,
	}
	var existing models.JobApplication
	err := s.col.FindOne(ctx, filter).Decode(&existing)
	if err == nil {
		return models.JobApplication{}, errors.New("already applied to this job")
	}
	if err != mongo.ErrNoDocuments {
		return models.JobApplication{}, err
	}

	application.CreatedAt = time.Now()
	application.UpdatedAt = time.Now()
	res, err := s.col.InsertOne(ctx, application)
	if err != nil {
		return models.JobApplication{}, err
	}
	application.ID = res.InsertedID.(primitive.ObjectID)
	return application, nil
}

// FindByJobID returns all applications for a specific job.
func (s *JobApplicationService) FindByJobID(ctx context.Context, jobID primitive.ObjectID) ([]models.JobApplication, error) {
	if s.col == nil {
		jobApplicationMemory.Lock()
		defer jobApplicationMemory.Unlock()
		applications := make([]models.JobApplication, 0)
		for _, app := range jobApplicationMemory.data {
			if app.JobID == jobID {
				applications = append(applications, app)
			}
		}
		return applications, nil
	}

	cursor, err := s.col.Find(ctx, bson.M{"job_id": jobID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var applications []models.JobApplication
	if err := cursor.All(ctx, &applications); err != nil {
		return nil, err
	}
	return applications, nil
}

// FindByJobSeekerID returns all applications by a specific job seeker.
func (s *JobApplicationService) FindByJobSeekerID(ctx context.Context, jobSeekerID primitive.ObjectID) ([]models.JobApplication, error) {
	if s.col == nil {
		jobApplicationMemory.Lock()
		defer jobApplicationMemory.Unlock()
		applications := make([]models.JobApplication, 0)
		for _, app := range jobApplicationMemory.data {
			if app.JobSeekerID == jobSeekerID {
				applications = append(applications, app)
			}
		}
		return applications, nil
	}

	cursor, err := s.col.Find(ctx, bson.M{"job_seeker_id": jobSeekerID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var applications []models.JobApplication
	if err := cursor.All(ctx, &applications); err != nil {
		return nil, err
	}
	return applications, nil
}

