package services

import (
	"context"
	"errors"
	"strings"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"rizeos/backend/internal/models"
	"rizeos/backend/internal/utils"
)

// UserService handles user persistence.
type UserService struct {
	col *mongo.Collection
}

var userMemory = struct {
	sync.Mutex
	data map[string]models.User
}{data: map[string]models.User{}}

// NewUserService returns a new service.
func NewUserService(db *mongo.Database) *UserService {
	if db == nil {
		return &UserService{col: nil}
	}
	return &UserService{col: db.Collection("users")}
}

// Register creates a user with hashed password.
func (s *UserService) Register(ctx context.Context, user models.User, password string) (models.User, error) {
	// In-memory fallback for tests.
	if s.col == nil {
		userMemory.Lock()
		defer userMemory.Unlock()
		for _, u := range userMemory.data {
			if u.Email == user.Email {
				return models.User{}, errors.New("email already registered")
			}
		}
		hash, err := utils.HashPassword(password)
		if err != nil {
			return models.User{}, err
		}
		user.ID = primitive.NewObjectID()
		user.PasswordHash = hash
		user.CreatedAt = time.Now()
		user.UpdatedAt = time.Now()
		userMemory.data[user.ID.Hex()] = user
		user.PasswordHash = ""
		return user, nil
	}

	var existing models.User
	if err := s.col.FindOne(ctx, bson.M{"email": user.Email}).Decode(&existing); err == nil {
		return models.User{}, errors.New("email already registered")
	}

	hash, err := utils.HashPassword(password)
	if err != nil {
		return models.User{}, err
	}
	user.PasswordHash = hash
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	if user.Role == "" {
		user.Role = models.RoleSeeker
	}

	res, err := s.col.InsertOne(ctx, user)
	if err != nil {
		return models.User{}, err
	}
	user.ID = res.InsertedID.(primitive.ObjectID)
	user.PasswordHash = ""
	return user, nil
}

// Search returns users filtered by role, name substring, and skills.
func (s *UserService) Search(ctx context.Context, role string, name string, skills []string) ([]models.User, error) {
	filter := bson.M{}
	if role != "" {
		filter["role"] = role
	}
	if name != "" {
		filter["name"] = bson.M{"$regex": name, "$options": "i"}
	}
	if len(skills) > 0 {
		filter["skills"] = bson.M{"$all": skills}
	}

	if s.col == nil {
		userMemory.Lock()
		defer userMemory.Unlock()
		var res []models.User
		for _, u := range userMemory.data {
			if role != "" && u.Role != role {
				continue
			}
			if name != "" && !strings.Contains(strings.ToLower(u.Name), strings.ToLower(name)) {
				continue
			}
			if len(skills) > 0 {
				matches := true
				for _, sk := range skills {
					found := false
					for _, us := range u.Skills {
						if strings.EqualFold(us, sk) {
							found = true
							break
						}
					}
					if !found {
						matches = false
						break
					}
				}
				if !matches {
					continue
				}
			}
			u.PasswordHash = ""
			res = append(res, u)
		}
		return res, nil
	}

	cur, err := s.col.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var users []models.User
	if err := cur.All(ctx, &users); err != nil {
		return nil, err
	}
	for i := range users {
		users[i].PasswordHash = ""
	}
	return users, nil
}

// FindByEmail returns user by email.
func (s *UserService) FindByEmail(ctx context.Context, email string) (models.User, error) {
	if s.col == nil {
		userMemory.Lock()
		defer userMemory.Unlock()
		for _, u := range userMemory.data {
			if u.Email == email {
				return u, nil
			}
		}
		return models.User{}, mongo.ErrNoDocuments
	}
	var user models.User
	if err := s.col.FindOne(ctx, bson.M{"email": email}).Decode(&user); err != nil {
		return models.User{}, err
	}
	return user, nil
}

// FindByID returns user by id.
func (s *UserService) FindByID(ctx context.Context, id primitive.ObjectID) (models.User, error) {
	if s.col == nil {
		userMemory.Lock()
		defer userMemory.Unlock()
		if u, ok := userMemory.data[id.Hex()]; ok {
			return u, nil
		}
		return models.User{}, mongo.ErrNoDocuments
	}
	var user models.User
	if err := s.col.FindOne(ctx, bson.M{"_id": id}).Decode(&user); err != nil {
		return models.User{}, err
	}
	return user, nil
}

// UpdateProfile updates profile fields.
func (s *UserService) UpdateProfile(ctx context.Context, id primitive.ObjectID, update bson.M) (models.User, error) {
	if s.col == nil {
		userMemory.Lock()
		defer userMemory.Unlock()
		u, ok := userMemory.data[id.Hex()]
		if !ok {
			return models.User{}, mongo.ErrNoDocuments
		}
		if v, ok := update["name"].(string); ok && v != "" {
			u.Name = v
		}
		if v, ok := update["bio"].(string); ok {
			u.Bio = v
		}
		if v, ok := update["linkedin_url"].(string); ok {
			u.LinkedInURL = v
		}
		if v, ok := update["wallet_address"].(string); ok {
			u.WalletAddress = v
		}
		if v, ok := update["skills"].([]string); ok {
			u.Skills = v
		}
		u.UpdatedAt = time.Now()
		userMemory.data[id.Hex()] = u
		return u, nil
	}
	update["updated_at"] = time.Now()
	_, err := s.col.UpdateByID(ctx, id, bson.M{"$set": update})
	if err != nil {
		return models.User{}, err
	}
	return s.FindByID(ctx, id)
}
