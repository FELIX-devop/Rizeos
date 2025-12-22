package controllers

import (
	"context"
	"net/http"
	"sort"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"rizeos/backend/internal/models"
	"rizeos/backend/internal/services"
	"rizeos/backend/internal/utils"
)

// JobApplicationController manages job application endpoints.
type JobApplicationController struct {
	JobApplicationService *services.JobApplicationService
	JobService            *services.JobService
	UserService           *services.UserService
	AIService             *services.AIService
}

type applyJobRequest struct {
	JobID string `json:"jobId" binding:"required"`
}

// Apply creates a new job application.
func (j *JobApplicationController) Apply(c *gin.Context) {
	var req applyJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	jobOID, err := primitive.ObjectIDFromHex(req.JobID)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, "invalid job id")
		return
	}

	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	// Validate role
	if role != models.RoleSeeker {
		utils.JSONError(c, http.StatusForbidden, "only job seekers can apply")
		return
	}

	jobSeekerOID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	// Verify job exists
	job, err := j.JobService.FindByID(ctx, jobOID)
	if err != nil {
		utils.JSONError(c, http.StatusNotFound, "job not found")
		return
	}

	// Create application
	application := models.JobApplication{
		JobID:             jobOID,
		JobSeekerID:       jobSeekerOID,
		RecruiterID:       job.RecruiterID,
		ApplicationStatus: "APPLIED",
		AppliedAt:         time.Now(),
	}

	created, err := j.JobApplicationService.Create(ctx, application)
	if err != nil {
		if err.Error() == "already applied to this job" {
			utils.JSONError(c, http.StatusBadRequest, "already applied to this job")
			return
		}
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Also add to job.Candidates for backward compatibility
	exists := false
	for _, cand := range job.Candidates {
		if cand == jobSeekerOID {
			exists = true
			break
		}
	}
	if !exists {
		job.Candidates = append(job.Candidates, jobSeekerOID)
		_ = j.JobService.SetCandidates(ctx, jobOID, job.Candidates)
	}

	utils.JSON(c, http.StatusCreated, created)
}

// GetApplicants returns all applicants for a specific job (recruiter only).
func (j *JobApplicationController) GetApplicants(c *gin.Context) {
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
	role, _ := c.Get("role")

	// Validate role
	if role != models.RoleRecruiter {
		utils.JSONError(c, http.StatusForbidden, "only recruiters can view applicants")
		return
	}

	recruiterOID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	// Verify job exists and recruiter owns it
	job, err := j.JobService.FindByID(ctx, jobOID)
	if err != nil {
		utils.JSONError(c, http.StatusNotFound, "job not found")
		return
	}

	if job.RecruiterID != recruiterOID {
		utils.JSONError(c, http.StatusForbidden, "you do not own this job")
		return
	}

	// Get all applications for this job
	applications, err := j.JobApplicationService.FindByJobID(ctx, jobOID)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Enrich with job seeker details and fitment scores
	type applicantDTO struct {
		JobSeekerID   string   `json:"jobSeekerId"`
		Name          string   `json:"name"`
		Email         string   `json:"email"`
		PremiumUser   bool     `json:"premiumUser"`
		ProfileStatus string   `json:"profileStatus"` // "ACTIVE" or "INACTIVE"
		Skills        []string `json:"skills"`
		Experience    interface{} `json:"experience"`
		Education     string   `json:"education"`
		AppliedAt     string   `json:"appliedAt"`
		FitmentScore  *float64 `json:"fitmentScore,omitempty"`
	}

	applicants := make([]applicantDTO, 0, len(applications))

	for _, app := range applications {
		// Get job seeker details
		seeker, err := j.UserService.FindByID(ctx, app.JobSeekerID)
		if err != nil {
			continue // Skip if user not found
		}

		// Calculate fitment score if possible
		var fitmentScore *float64
		candidateBio := seeker.Bio
		if seeker.Summary != "" {
			candidateBio = seeker.Summary
		}
		if candidateBio == "" {
			candidateBio = seeker.Name
		}

		if j.AIService != nil && candidateBio != "" {
			score, err := j.AIService.MatchScoreWithSkills(ctx, job.Description, candidateBio, job.Skills, seeker.Skills)
			if err == nil {
				// Clamp score to 0-100
				if score < 0 {
					score = 0
				}
				if score > 100 {
					score = 100
				}
				fitmentScore = &score
			}
		}

		// Determine profile status
		profileStatus := "ACTIVE"
		if seeker.IsActive != nil && !*seeker.IsActive {
			profileStatus = "INACTIVE"
		}

		applicants = append(applicants, applicantDTO{
			JobSeekerID:   app.JobSeekerID.Hex(),
			Name:          seeker.Name,
			Email:         seeker.Email,
			PremiumUser:   seeker.IsPremium,
			ProfileStatus: profileStatus,
			Skills:        seeker.Skills,
			Experience:    seeker.Experience,
			Education:     seeker.Education,
			AppliedAt:     app.AppliedAt.Format(time.RFC3339),
			FitmentScore:  fitmentScore,
		})
	}

	// Sort by appliedAt DESC (newest first)
	sort.Slice(applicants, func(i, j int) bool {
		return applicants[i].AppliedAt > applicants[j].AppliedAt
	})

	// If fitment scores exist, allow sorting by score DESC
	// For now, we'll keep the default sort by appliedAt
	// Frontend can implement client-side sorting if needed

	utils.JSON(c, http.StatusOK, gin.H{
		"jobId":     jobID,
		"jobTitle":  job.Title,
		"applicants": applicants,
	})
}

