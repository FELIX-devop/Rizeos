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

// AdminController returns aggregated analytics.
type AdminController struct {
	PaymentService *services.PaymentService
	UserService    *services.UserService
	JobService     *services.JobService
	UserCol        *mongo.Collection
	JobCol         *mongo.Collection
}

// Dashboard returns payment totals and counts.
func (a *AdminController) Dashboard(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	payments, err := a.PaymentService.List(ctx, bson.M{"status": "verified"})
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}
	total := 0.0
	for _, p := range payments {
		total += p.Amount
	}

	var users []map[string]interface{}
	cursor, err := a.UserCol.Find(ctx, bson.M{})
	if err == nil {
		defer cursor.Close(ctx)
		for cursor.Next(ctx) {
			var u bson.M
			if err := cursor.Decode(&u); err == nil {
				delete(u, "password_hash")
				users = append(users, u)
			}
		}
	}

	var jobs []bson.M
	jobCur, err := a.JobCol.Find(ctx, bson.M{})
	if err == nil {
		defer jobCur.Close(ctx)
		_ = jobCur.All(ctx, &jobs)
	}

	userCount, _ := a.UserCol.CountDocuments(ctx, bson.M{})
	jobCount, _ := a.JobCol.CountDocuments(ctx, bson.M{})

	utils.JSON(c, http.StatusOK, gin.H{
		"total_payments_matic": total,
		"payments":             payments,
		"users":                userCount,
		"jobs":                 jobCount,
		"user_list":            users,
		"job_list":             jobs,
	})
}

// GetUserProfile returns detailed user information with role-specific stats.
func (a *AdminController) GetUserProfile(c *gin.Context) {
	userID := c.Param("userId")
	if userID == "" {
		utils.JSONError(c, http.StatusBadRequest, "missing user id")
		return
	}

	userOID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, "invalid user id")
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	user, err := a.UserService.FindByID(ctx, userOID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.JSONError(c, http.StatusNotFound, "user not found")
			return
		}
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Build stats based on role
	stats := make(map[string]interface{})

	if user.Role == models.RoleRecruiter {
		// Count jobs posted by this recruiter
		jobs, err := a.JobService.List(ctx, bson.M{"recruiter_id": userOID})
		if err == nil {
			stats["jobs_posted"] = len(jobs)
		} else {
			stats["jobs_posted"] = 0
		}

		// Calculate total payments made
		payments, err := a.PaymentService.List(ctx, bson.M{"recruiter_id": userOID, "status": "verified"})
		if err == nil {
			total := 0.0
			for _, p := range payments {
				total += p.Amount
			}
			stats["payments_matic"] = total
			stats["payments_count"] = len(payments)
		} else {
			stats["payments_matic"] = 0.0
			stats["payments_count"] = 0
		}
	} else if user.Role == models.RoleSeeker {
		// Count jobs applied to
		jobs, err := a.JobService.List(ctx, bson.M{})
		if err == nil {
			appliedCount := 0
			for _, job := range jobs {
				for _, candidateID := range job.Candidates {
					if candidateID == userOID {
						appliedCount++
						break
					}
				}
			}
			stats["jobs_applied"] = appliedCount
		} else {
			stats["jobs_applied"] = 0
		}
	} else if user.Role == models.RoleAdmin {
		stats["role"] = "system_admin"
		stats["note"] = "System administrator account"
	}

	response := gin.H{
		"id":            user.ID,
		"name":          user.Name,
		"email":         user.Email,
		"role":          user.Role,
		"bio":           user.Bio,
		"linkedin_url":  user.LinkedInURL,
		"skills":        user.Skills,
		"wallet_address": user.WalletAddress,
		"created_at":    user.CreatedAt,
		"updated_at":    user.UpdatedAt,
		"stats":         stats,
		// New optional fields for job seekers
		"phone_number":  user.PhoneNumber,
		"summary":       user.Summary,
		"education":     user.Education,
		"tenth_marks":   user.TenthMarks,
		"twelfth_marks": user.TwelfthMarks,
		"experience":    user.Experience,
		"is_active":     user.IsActive,
		"is_premium":    user.IsPremium,
	}

	utils.JSON(c, http.StatusOK, response)
}

// GetJobProfile returns detailed job information with recruiter info and stats.
func (a *AdminController) GetJobProfile(c *gin.Context) {
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

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	job, err := a.JobService.FindByID(ctx, jobOID)
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
	recruiterUser, err := a.UserService.FindByID(ctx, job.RecruiterID)
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

	// Get payment status
	paymentStatus := "NOT_PAID"
	if job.PaymentID != primitive.NilObjectID {
		payment, err := a.PaymentService.FindByID(ctx, job.PaymentID)
		if err == nil && payment.Status == "verified" {
			paymentStatus = "PAID"
		}
	}

	// Count applications
	applicationsCount := len(job.Candidates)

	// Determine job status (active by default, can be extended later)
	jobStatus := "ACTIVE"
	if len(job.Candidates) > 0 {
		// Job has applications, still active
		jobStatus = "ACTIVE"
	}

	stats := map[string]interface{}{
		"applications":   applicationsCount,
		"payment_status": paymentStatus,
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
	}

	utils.JSON(c, http.StatusOK, response)
}
