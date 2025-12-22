package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"rizeos/backend/internal/services"
	"rizeos/backend/internal/utils"
)

// ProfileController manages profile updates.
type ProfileController struct {
	UserService *services.UserService
	AIService   *services.AIService
}

type updateProfileRequest struct {
	Name          string   `json:"name"`
	Bio           string   `json:"bio"`
	LinkedInURL   string   `json:"linkedin_url"`
	Skills        []string `json:"skills"`
	WalletAddress string   `json:"wallet_address"`
	ExtractSkills bool     `json:"extract_skills"`
	// New optional fields
	PhoneNumber   string      `json:"phone_number,omitempty"`
	Summary       string      `json:"summary,omitempty"`
	Education     string      `json:"education,omitempty"`
	TenthMarks    interface{} `json:"tenth_marks,omitempty"` // string or number
	TwelfthMarks  interface{} `json:"twelfth_marks,omitempty"` // string or number
	Experience    interface{} `json:"experience,omitempty"` // string or number
	IsActive      *bool       `json:"is_active,omitempty"` // pointer to allow nil
}

// Update updates user profile and optionally enriches skills via AI.
func (p *ProfileController) Update(c *gin.Context) {
	var req updateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	oid, _ := primitive.ObjectIDFromHex(userID.(string))

	update := bson.M{}
	if req.Name != "" {
		update["name"] = req.Name
	}
	if req.Bio != "" {
		update["bio"] = req.Bio
	}
	if req.LinkedInURL != "" {
		update["linkedin_url"] = req.LinkedInURL
	}
	if req.WalletAddress != "" {
		update["wallet_address"] = req.WalletAddress
	}
	update["skills"] = req.Skills

	// Handle new optional fields (only update if provided)
	if req.PhoneNumber != "" {
		update["phone_number"] = req.PhoneNumber
	}
	if req.Summary != "" {
		update["summary"] = req.Summary
	}
	if req.Education != "" {
		update["education"] = req.Education
	}
	if req.TenthMarks != nil {
		update["tenth_marks"] = req.TenthMarks
	}
	if req.TwelfthMarks != nil {
		update["twelfth_marks"] = req.TwelfthMarks
	}
	if req.Experience != nil {
		update["experience"] = req.Experience
	}
	// Handle is_active: default to true if not provided, but allow explicit false
	if req.IsActive != nil {
		update["is_active"] = *req.IsActive
	} else {
		// If is_active is not in the request, don't update it (preserve existing value)
		// For new users, it will default to true in the model
	}

	// Handle skill extraction and merging
	if req.ExtractSkills && req.Bio != "" && p.AIService != nil {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 20*time.Second)
		defer cancel()
		skills, err := p.AIService.ExtractSkills(ctx, req.Bio)
		if err == nil && len(skills) > 0 {
			// Merge extracted skills with existing skills (avoid duplicates)
			existingSkills := make(map[string]bool)
			for _, s := range req.Skills {
				existingSkills[s] = true
			}
			for _, skill := range skills {
				if !existingSkills[skill] {
					req.Skills = append(req.Skills, skill)
					existingSkills[skill] = true
				}
			}
			update["skills"] = req.Skills
		}
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()
	updated, err := p.UserService.UpdateProfile(ctx, oid, update)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}
	updated.PasswordHash = ""
	utils.JSON(c, http.StatusOK, updated)
}
