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

	if req.ExtractSkills && req.Bio != "" && p.AIService != nil {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 20*time.Second)
		defer cancel()
		skills, err := p.AIService.ExtractSkills(ctx, req.Bio)
		if err == nil && len(skills) > 0 {
			update["skills"] = append(req.Skills, skills...)
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
