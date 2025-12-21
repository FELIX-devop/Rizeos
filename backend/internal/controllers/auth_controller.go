package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"rizeos/backend/internal/config"
	"rizeos/backend/internal/models"
	"rizeos/backend/internal/services"
	"rizeos/backend/internal/utils"
)

// AuthController handles authentication endpoints.
type AuthController struct {
	UserService *services.UserService
	Cfg         config.Config
}

type registerRequest struct {
	Name            string   `json:"name" binding:"required"`
	Email           string   `json:"email" binding:"required,email"`
	Password        string   `json:"password" binding:"required,min=8"`
	Role            string   `json:"role" binding:"required"`
	Bio             string   `json:"bio"`
	LinkedInURL     string   `json:"linkedin_url"`
	Skills          []string `json:"skills"`
	WalletAddress   string   `json:"wallet_address"`
	AdminSignupCode string   `json:"admin_signup_code"`
}

// Register registers a user and returns JWT.
func (a *AuthController) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	role := req.Role
	if role == models.RoleAdmin {
		if req.AdminSignupCode == "" || req.AdminSignupCode != a.Cfg.AdminSignupCode {
			utils.JSONError(c, http.StatusForbidden, "admin signup code invalid")
			return
		}
	} else if role != models.RoleRecruiter && role != models.RoleSeeker {
		utils.JSONError(c, http.StatusBadRequest, "role must be recruiter or seeker")
		return
	}

	user := models.User{
		Name:          req.Name,
		Email:         req.Email,
		Role:          role,
		Bio:           req.Bio,
		LinkedInURL:   req.LinkedInURL,
		Skills:        req.Skills,
		WalletAddress: req.WalletAddress,
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	created, err := a.UserService.Register(ctx, user, req.Password)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	token, err := utils.GenerateToken(a.Cfg.JWTSecret, created.ID.Hex(), created.Email, created.Role, 72)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, "could not generate token")
		return
	}

	utils.JSON(c, http.StatusCreated, gin.H{"user": created, "token": token})
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Login authenticates and returns JWT.
func (a *AuthController) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()
	user, err := a.UserService.FindByEmail(ctx, req.Email)
	if err != nil || !utils.CheckPassword(user.PasswordHash, req.Password) {
		utils.JSONError(c, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := utils.GenerateToken(a.Cfg.JWTSecret, user.ID.Hex(), user.Email, user.Role, 72)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, "could not generate token")
		return
	}

	user.PasswordHash = ""
	utils.JSON(c, http.StatusOK, gin.H{"user": user, "token": token})
}

// Current returns profile of current user.
func (a *AuthController) Current(c *gin.Context) {
	userID, _ := c.Get("user_id")
	oid, _ := primitive.ObjectIDFromHex(userID.(string))
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()
	user, err := a.UserService.FindByID(ctx, oid)
	if err != nil {
		utils.JSONError(c, http.StatusNotFound, "user not found")
		return
	}
	user.PasswordHash = ""
	utils.JSON(c, http.StatusOK, user)
}
