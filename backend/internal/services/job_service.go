package services

import (
	"context"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"rizeos/backend/internal/models"
)

// JobService manages job persistence.
type JobService struct {
	col *mongo.Collection
}

var jobMemory = struct {
	sync.Mutex
	data map[string]models.Job
}{data: map[string]models.Job{}}

// NewJobService creates a JobService.
func NewJobService(db *mongo.Database) *JobService {
	if db == nil {
		return &JobService{col: nil}
	}
	return &JobService{col: db.Collection("jobs")}
}

// Create inserts a new job.
func (s *JobService) Create(ctx context.Context, job models.Job) (models.Job, error) {
	if s.col == nil {
		jobMemory.Lock()
		defer jobMemory.Unlock()
		job.ID = primitive.NewObjectID()
		job.CreatedAt = time.Now()
		job.UpdatedAt = time.Now()
		jobMemory.data[job.ID.Hex()] = job
		return job, nil
	}
	job.CreatedAt = time.Now()
	job.UpdatedAt = time.Now()
	res, err := s.col.InsertOne(ctx, job)
	if err != nil {
		return models.Job{}, err
	}
	job.ID = res.InsertedID.(primitive.ObjectID)
	return job, nil
}

// List returns jobs optionally filtered by skills/tags/location.
func (s *JobService) List(ctx context.Context, filters map[string]interface{}) ([]models.Job, error) {
	if s.col == nil {
		jobMemory.Lock()
		defer jobMemory.Unlock()
		jobs := make([]models.Job, 0, len(jobMemory.data))
		for _, j := range jobMemory.data {
			jobs = append(jobs, j)
		}
		return jobs, nil
	}
	cursor, err := s.col.Find(ctx, filters)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var jobs []models.Job
	if err := cursor.All(ctx, &jobs); err != nil {
		return nil, err
	}
	return jobs, nil
}

// SetMatchScores updates match scores for a job.
func (s *JobService) SetMatchScores(ctx context.Context, jobID primitive.ObjectID, scores map[string]float64) error {
	if s.col == nil {
		jobMemory.Lock()
		defer jobMemory.Unlock()
		job, ok := jobMemory.data[jobID.Hex()]
		if !ok {
			return mongo.ErrNoDocuments
		}
		job.MatchScores = scores
		jobMemory.data[jobID.Hex()] = job
		return nil
	}
	_, err := s.col.UpdateByID(ctx, jobID, bson.M{"$set": bson.M{"match_scores": scores, "updated_at": time.Now()}})
	return err
}

// FindByID returns a job by id.
func (s *JobService) FindByID(ctx context.Context, id primitive.ObjectID) (models.Job, error) {
	if s.col == nil {
		jobMemory.Lock()
		defer jobMemory.Unlock()
		if j, ok := jobMemory.data[id.Hex()]; ok {
			return j, nil
		}
		return models.Job{}, mongo.ErrNoDocuments
	}
	var job models.Job
	if err := s.col.FindOne(ctx, bson.M{"_id": id}).Decode(&job); err != nil {
		return models.Job{}, err
	}
	return job, nil
}

// SetCandidates updates job candidates.
func (s *JobService) SetCandidates(ctx context.Context, jobID primitive.ObjectID, candidates []primitive.ObjectID) error {
	if s.col == nil {
		jobMemory.Lock()
		defer jobMemory.Unlock()
		job, ok := jobMemory.data[jobID.Hex()]
		if !ok {
			return mongo.ErrNoDocuments
		}
		job.Candidates = candidates
		jobMemory.data[jobID.Hex()] = job
		return nil
	}
	_, err := s.col.UpdateByID(ctx, jobID, bson.M{"$set": bson.M{"candidates": candidates, "updated_at": time.Now()}})
	return err
}
