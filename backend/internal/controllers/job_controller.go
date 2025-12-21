package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"rizeos/backend/internal/models"
	"rizeos/backend/internal/services"
	"rizeos/backend/internal/utils"
)

// JobController manages job endpoints.
type JobController struct {
	JobService       *services.JobService
	PaymentService   *services.PaymentService
	AIService        *services.AIService
	UserService      *services.UserService
	PlatformFeeMatic float64
}

type createJobRequest struct {
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description" binding:"required"`
	Skills      []string `json:"skills" binding:"required"`
	Location    string   `json:"location"`
	Tags        []string `json:"tags"`
	Budget      float64  `json:"budget"`
	PaymentID   string   `json:"payment_id" binding:"required"`
}

// Create handles job creation after payment verification.
func (j *JobController) Create(c *gin.Context) {
	var req createJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}
	userID, _ := c.Get("user_id")
	recruiterOID, _ := primitive.ObjectIDFromHex(userID.(string))

	paymentOID, err := primitive.ObjectIDFromHex(req.PaymentID)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, "invalid payment id")
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	payment, err := j.PaymentService.FindByID(ctx, paymentOID)
	if err != nil || payment.Status != "verified" || payment.Consumed {
		utils.JSONError(c, http.StatusForbidden, "payment not valid or already used")
		return
	}
	if payment.RecruiterID != primitive.NilObjectID && payment.RecruiterID != recruiterOID {
		utils.JSONError(c, http.StatusForbidden, "payment not owned by recruiter")
		return
	}
	if payment.Amount < j.PlatformFeeMatic {
		utils.JSONError(c, http.StatusBadRequest, "fee below platform minimum")
		return
	}

	// Attach recruiter if not set.
	if payment.RecruiterID == primitive.NilObjectID {
		_ = j.PaymentService.AttachRecruiter(ctx, paymentOID, recruiterOID)
	}

	job := models.Job{
		RecruiterID: recruiterOID,
		Title:       req.Title,
		Description: req.Description,
		Skills:      req.Skills,
		Location:    req.Location,
		Tags:        req.Tags,
		Budget:      req.Budget,
		PaymentID:   paymentOID,
	}

	created, err := j.JobService.Create(ctx, job)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}
	_ = j.PaymentService.MarkConsumed(ctx, paymentOID, created.ID)
	utils.JSON(c, http.StatusCreated, created)
}

// List returns job listings with optional filters and AI match scores.
func (j *JobController) List(c *gin.Context) {
	filters := bson.M{}
	if skill := c.Query("skill"); skill != "" {
		filters["skills"] = skill
	}
	if location := c.Query("location"); location != "" {
		filters["location"] = location
	}
	if tag := c.Query("tag"); tag != "" {
		filters["tags"] = tag
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()
	jobs, err := j.JobService.List(ctx, filters)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Attach match score if seeker logged in.
	userID, ok := c.Get("user_id")
	if ok && j.AIService != nil {
		oid, _ := primitive.ObjectIDFromHex(userID.(string))
		user, err := j.UserService.FindByID(ctx, oid)
		if err == nil {
			for idx, jb := range jobs {
				score, err := j.AIService.MatchScore(ctx, jb.Description, user.Bio)
				if err == nil {
					if jb.MatchScores == nil {
						jb.MatchScores = map[string]float64{}
					}
					jb.MatchScores[user.ID.Hex()] = score
					jobs[idx] = jb
				}
			}
		}
	}

	utils.JSON(c, http.StatusOK, jobs)
}

// Apply lets a seeker apply to a job; stores candidate id.
func (j *JobController) Apply(c *gin.Context) {
	jobID := c.Param("id")
	if jobID == "" {
		utils.JSONError(c, http.StatusBadRequest, "missing job id")
		return
	}
	jobOID, err := primitive.ObjectIDFromHex(jobID)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, "invalid job id")
		return
	}

	userID, _ := c.Get("user_id")
	seekerOID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	job, err := j.JobService.FindByID(ctx, jobOID)
	if err != nil {
		utils.JSONError(c, http.StatusNotFound, "job not found")
		return
	}

	// Add candidate if not already present.
	exists := false
	for _, cand := range job.Candidates {
		if cand == seekerOID {
			exists = true
			break
		}
	}
	if !exists {
		job.Candidates = append(job.Candidates, seekerOID)
		_ = j.JobService.SetCandidates(ctx, jobOID, job.Candidates)
	}
	utils.JSON(c, http.StatusOK, job)
}
