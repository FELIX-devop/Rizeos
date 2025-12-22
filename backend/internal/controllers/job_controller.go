package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
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

	// Enrich jobs with recruiter info and match scores
	enrichedJobs := make([]map[string]interface{}, 0, len(jobs))
	for _, jb := range jobs {
		enriched := map[string]interface{}{
			"id":          jb.ID,
			"title":       jb.Title,
			"description": jb.Description,
			"skills":      jb.Skills,
			"location":    jb.Location,
			"tags":        jb.Tags,
			"budget":      jb.Budget,
			"created_at":  jb.CreatedAt,
			"updated_at":  jb.UpdatedAt,
			"candidates":  jb.Candidates,
			"recruiter_id": jb.RecruiterID,
		}
		// Initialize match_scores as empty map if nil
		if jb.MatchScores == nil {
			enriched["match_scores"] = map[string]float64{}
		} else {
			enriched["match_scores"] = jb.MatchScores
		}
		// Add recruiter name
		recruiter, err := j.UserService.FindByID(ctx, jb.RecruiterID)
		if err == nil {
			enriched["recruiter_name"] = recruiter.Name
		}
		enrichedJobs = append(enrichedJobs, enriched)
	}

	// Attach match score if seeker logged in.
	userID, ok := c.Get("user_id")
	role, roleOk := c.Get("role")
	if ok && roleOk && role.(string) == models.RoleSeeker && j.AIService != nil {
		oid, _ := primitive.ObjectIDFromHex(userID.(string))
		user, err := j.UserService.FindByID(ctx, oid)
		if err == nil && user.Bio != "" {
			for idx, enriched := range enrichedJobs {
				jb := jobs[idx]
				score, err := j.AIService.MatchScore(ctx, jb.Description, user.Bio)
				if err == nil {
					scores, ok := enriched["match_scores"].(map[string]float64)
					if !ok {
						scores = map[string]float64{}
					}
					scores[user.ID.Hex()] = score
					enriched["match_scores"] = scores
					enrichedJobs[idx] = enriched
				}
			}
		}
	}

	utils.JSON(c, http.StatusOK, enrichedJobs)
}

// GetJobProfile returns detailed job information with recruiter info (public endpoint for job seekers).
func (j *JobController) GetJobProfile(c *gin.Context) {
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

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	job, err := j.JobService.FindByID(ctx, jobOID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.JSONError(c, http.StatusNotFound, "job not found")
			return
		}
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Get recruiter information
	var recruiter map[string]interface{}
	recruiterUser, err := j.UserService.FindByID(ctx, job.RecruiterID)
	if err == nil {
		recruiter = map[string]interface{}{
			"id":    recruiterUser.ID,
			"name":  recruiterUser.Name,
			"email": recruiterUser.Email,
		}
	} else {
		recruiter = map[string]interface{}{
			"id":    job.RecruiterID,
			"name":  "Unknown",
			"email": "N/A",
		}
	}

	// Count applications
	applicationsCount := len(job.Candidates)

	// Determine job status (active by default)
	jobStatus := "ACTIVE"

	stats := map[string]interface{}{
		"applications": applicationsCount,
	}

	response := gin.H{
		"id":          job.ID,
		"title":       job.Title,
		"description": job.Description,
		"skills":      job.Skills,
		"location":    job.Location,
		"tags":        job.Tags,
		"budget":      job.Budget,
		"status":      jobStatus,
		"created_at":  job.CreatedAt,
		"updated_at":  job.UpdatedAt,
		"recruiter":   recruiter,
		"stats":       stats,
		"match_scores": job.MatchScores,
	}

	utils.JSON(c, http.StatusOK, response)
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

// GetRankedJobSeekers returns job seekers ranked by fitment score for a specific job.
func (j *JobController) GetRankedJobSeekers(c *gin.Context) {
	jobID := c.Param("jobId")
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
	recruiterOID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	// Verify job exists and recruiter owns it
	job, err := j.JobService.FindByID(ctx, jobOID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.JSONError(c, http.StatusNotFound, "job not found")
			return
		}
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	if job.RecruiterID != recruiterOID {
		utils.JSONError(c, http.StatusForbidden, "you do not own this job")
		return
	}

	// Fetch all job seekers
	seekers, err := j.UserService.Search(ctx, models.RoleSeeker, "", nil)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, "failed to fetch job seekers: "+err.Error())
		return
	}

	// Calculate fitment scores for each seeker
	type rankedSeeker struct {
		JobSeekerID string   `json:"jobSeekerId"`
		Name        string   `json:"name"`
		Email       string   `json:"email"`
		Skills      []string `json:"skills"`
		FitmentScore float64 `json:"fitmentScore"`
	}

	var ranked []rankedSeeker
	for _, seeker := range seekers {
		// Use bio or summary for candidate bio
		candidateBio := seeker.Bio
		if seeker.Summary != "" {
			candidateBio = seeker.Summary
		}
		if candidateBio == "" {
			candidateBio = seeker.Name // Fallback to name if no bio/summary
		}

		// Calculate match score with skills
		score, err := j.AIService.MatchScoreWithSkills(ctx, job.Description, candidateBio, job.Skills, seeker.Skills)
		if err != nil {
			// If AI service fails, skip this seeker or use 0
			score = 0.0
		}

		// Clamp score to 0-100 (AI service already returns percentage, no multiplication needed)
		if score < 0 {
			score = 0
		}
		if score > 100 {
			score = 100
		}

		ranked = append(ranked, rankedSeeker{
			JobSeekerID:  seeker.ID.Hex(),
			Name:         seeker.Name,
			Email:        seeker.Email,
			Skills:       seeker.Skills,
			FitmentScore: score, // AI service already returns 0-100 percentage
		})
	}

	// Sort by fitment score descending
	for i := 0; i < len(ranked); i++ {
		for j := i + 1; j < len(ranked); j++ {
			if ranked[j].FitmentScore > ranked[i].FitmentScore {
				ranked[i], ranked[j] = ranked[j], ranked[i]
			}
		}
	}

	response := gin.H{
		"jobId":    jobID,
		"jobTitle": job.Title,
		"results":  ranked,
	}

	utils.JSON(c, http.StatusOK, response)
}
