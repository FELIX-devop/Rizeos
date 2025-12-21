package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"rizeos/backend/internal/services"
	"rizeos/backend/internal/utils"
)

// AIController exposes AI-related helper endpoints.
type AIController struct {
	JobService  *services.JobService
	UserService *services.UserService
	AIService   *services.AIService
}

// MatchScoreResponse is the payload for match score.
type MatchScoreResponse struct {
	JobID        string   `json:"jobId"`
	CandidateID  string   `json:"candidateId"`
	MatchScore   float64  `json:"matchScore"`
	MatchedSkills []string `json:"matchedSkills"`
}

// MatchScore returns similarity between a job and a candidate.
func (a *AIController) MatchScore(c *gin.Context) {
	jobID := c.Query("jobId")
	candID := c.Query("candidateId")
	if jobID == "" || candID == "" {
		utils.JSONError(c, http.StatusBadRequest, "jobId and candidateId required")
		return
	}
	jOID, err := primitive.ObjectIDFromHex(jobID)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, "invalid jobId")
		return
	}
	uOID, err := primitive.ObjectIDFromHex(candID)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, "invalid candidateId")
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 15*time.Second)
	defer cancel()

	job, err := a.JobService.FindByID(ctx, jOID)
	if err != nil {
		utils.JSONError(c, http.StatusNotFound, "job not found")
		return
	}
	user, err := a.UserService.FindByID(ctx, uOID)
	if err != nil {
		utils.JSONError(c, http.StatusNotFound, "candidate not found")
		return
	}

	score, _ := a.AIService.MatchScore(ctx, job.Description, user.Bio)
	matched := intersect(job.Skills, user.Skills)

	utils.JSON(c, http.StatusOK, MatchScoreResponse{
		JobID:         jobID,
		CandidateID:   candID,
		MatchScore:    score,
		MatchedSkills: matched,
	})
}

// ExtractSkills extracts skills from resume/bio text.
func (a *AIController) ExtractSkills(c *gin.Context) {
	var req struct {
		ResumeText string `json:"resumeText"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 20*time.Second)
	defer cancel()
	skills, _ := a.AIService.ExtractSkills(ctx, req.ResumeText)
	utils.JSON(c, http.StatusOK, gin.H{
		"extractedSkills": skills,
		"confidenceScore": 1.0,
	})
}

// RecommendJobs recommends jobs to a seeker.
func (a *AIController) RecommendJobs(c *gin.Context) {
	userID := c.Query("userId")
	if userID == "" {
		utils.JSONError(c, http.StatusBadRequest, "userId required")
		return
	}
	uOID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, "invalid userId")
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 20*time.Second)
	defer cancel()

	user, err := a.UserService.FindByID(ctx, uOID)
	if err != nil {
		utils.JSONError(c, http.StatusNotFound, "user not found")
		return
	}
	jobs, err := a.JobService.List(ctx, map[string]interface{}{})
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}
	type rec struct {
		JobID string  `json:"jobId"`
		Title string  `json:"title"`
		Score float64 `json:"score"`
	}
	var recs []rec
	for _, jb := range jobs {
		score, _ := a.AIService.MatchScore(ctx, jb.Description, user.Bio)
		recs = append(recs, rec{JobID: jb.ID.Hex(), Title: jb.Title, Score: score})
	}
	// Simple sort descending
	for i := 0; i < len(recs); i++ {
		for j := i + 1; j < len(recs); j++ {
			if recs[j].Score > recs[i].Score {
				recs[i], recs[j] = recs[j], recs[i]
			}
		}
	}
	utils.JSON(c, http.StatusOK, recs)
}

// RecommendCandidates recommends candidates for a job.
func (a *AIController) RecommendCandidates(c *gin.Context) {
	jobID := c.Query("jobId")
	if jobID == "" {
		utils.JSONError(c, http.StatusBadRequest, "jobId required")
		return
	}
	jOID, err := primitive.ObjectIDFromHex(jobID)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, "invalid jobId")
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 20*time.Second)
	defer cancel()

	job, err := a.JobService.FindByID(ctx, jOID)
	if err != nil {
		utils.JSONError(c, http.StatusNotFound, "job not found")
		return
	}

	// get seekers
	seekers, err := a.UserService.Search(ctx, "seeker", "", nil)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	type rec struct {
		CandidateID string   `json:"candidateId"`
		Name        string   `json:"name"`
		Email       string   `json:"email"`
		Skills      []string `json:"skills"`
		Score       float64  `json:"score"`
	}
	var recs []rec
	for _, u := range seekers {
		score, _ := a.AIService.MatchScore(ctx, job.Description, u.Bio)
		recs = append(recs, rec{
			CandidateID: u.ID.Hex(),
			Name:        u.Name,
			Email:       u.Email,
			Skills:      u.Skills,
			Score:       score,
		})
	}
	// sort descending
	for i := 0; i < len(recs); i++ {
		for j := i + 1; j < len(recs); j++ {
			if recs[j].Score > recs[i].Score {
				recs[i], recs[j] = recs[j], recs[i]
			}
		}
	}
	utils.JSON(c, http.StatusOK, recs)
}

func intersect(a, b []string) []string {
	m := map[string]struct{}{}
	for _, s := range a {
		m[strings.ToLower(s)] = struct{}{}
	}
	var out []string
	for _, s := range b {
		if _, ok := m[strings.ToLower(s)]; ok {
			out = append(out, s)
		}
	}
	return out
}

