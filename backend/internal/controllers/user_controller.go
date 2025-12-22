package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"rizeos/backend/internal/models"
	"rizeos/backend/internal/services"
	"rizeos/backend/internal/utils"
)

// UserController provides user listing for admin/recruiter views.
type UserController struct {
	UserService *services.UserService
}

// GetUserProfilePublic returns public user information (for job seekers viewing recruiters).
func (u *UserController) GetUserProfilePublic(c *gin.Context) {
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

	user, err := u.UserService.FindByID(ctx, userOID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.JSONError(c, http.StatusNotFound, "user not found")
			return
		}
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Get current user's role from JWT context
	currentUserRole, roleExists := c.Get("role")
	
	// If recruiter is viewing a job seeker, return full profile (same as admin view)
	if roleExists && currentUserRole.(string) == models.RoleRecruiter && user.Role == models.RoleSeeker {
		// Return full profile data matching Admin panel response
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
			// Extended Job Seeker fields
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
		return
	}

	// For other cases (e.g., job seeker viewing recruiter), return basic public info
	response := gin.H{
		"id":          user.ID,
		"name":        user.Name,
		"email":       user.Email,
		"role":        user.Role,
		"bio":         user.Bio,
		"linkedin_url": user.LinkedInURL,
		"created_at":  user.CreatedAt,
		"updated_at":  user.UpdatedAt,
		"is_premium":  user.IsPremium,
	}

	utils.JSON(c, http.StatusOK, response)
}

// List returns users with optional filters: role, name, skills (comma-separated).
func (u *UserController) List(c *gin.Context) {
	role := c.Query("role")
	nameQ := strings.TrimSpace(c.Query("name"))
	skillsQ := strings.TrimSpace(c.Query("skills"))
	var skills []string
	if skillsQ != "" {
		for _, s := range strings.Split(skillsQ, ",") {
			if trimmed := strings.TrimSpace(s); trimmed != "" {
				skills = append(skills, trimmed)
			}
		}
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	users, err := u.UserService.Search(ctx, role, nameQ, skills)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// strip passwords
	for i := range users {
		users[i].PasswordHash = ""
	}
	utils.JSON(c, http.StatusOK, users)
}

// GetPremiumStatus returns the premium status of the current job seeker.
func (u *UserController) GetPremiumStatus(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")
	
	// Only job seekers can check their premium status
	if role != models.RoleSeeker {
		utils.JSONError(c, http.StatusForbidden, "only job seekers can check premium status")
		return
	}
	
	userOID, _ := primitive.ObjectIDFromHex(userID.(string))
	
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()
	
	user, err := u.UserService.FindByID(ctx, userOID)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, "user not found")
		return
	}
	
	utils.JSON(c, http.StatusOK, gin.H{
		"is_premium": user.IsPremium,
	})
}

