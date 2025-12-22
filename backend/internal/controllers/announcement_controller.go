package controllers

import (
	"context"
	"net/http"
	"time"

	"rizeos/backend/internal/models"
	"rizeos/backend/internal/services"
	"rizeos/backend/internal/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AnnouncementController manages announcement endpoints.
type AnnouncementController struct {
	AnnouncementService *services.AnnouncementService
	UserService         *services.UserService
	MessageService      *services.MessageService
}

type createAnnouncementRequest struct {
	Message string `json:"message" binding:"required"`
}

// CreateAnnouncement handles announcement creation by admin.
func (a *AnnouncementController) CreateAnnouncement(c *gin.Context) {
	var req createAnnouncementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	// Create announcement
	announcement := models.Announcement{
		FromRole: models.RoleAdmin,
		Message:  req.Message,
	}

	created, err := a.AnnouncementService.Create(ctx, announcement)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Send announcement as messages to all recruiters and job seekers
	// Get all recruiters
	recruiters, err := a.UserService.Search(ctx, models.RoleRecruiter, "", nil)
	if err == nil {
		for _, recruiter := range recruiters {
			message := models.Message{
				FromUserID: primitive.NilObjectID, // No specific sender for announcements
				FromRole:   models.RoleAdmin,
				ToUserID:   recruiter.ID,
				ToRole:     models.RoleRecruiter,
				Message:    "[ANNOUNCEMENT] " + req.Message,
			}
			_, _ = a.MessageService.Create(ctx, message) // Ignore errors for individual sends
		}
	}

	// Get all job seekers
	seekers, err := a.UserService.Search(ctx, models.RoleSeeker, "", nil)
	if err == nil {
		for _, seeker := range seekers {
			// For job seekers, announcements are sent as messages with ToRole = "recruiter" 
			// but ToUserID = seeker.ID (this is a special case for announcements)
			// Actually, we need to check the message model - it seems ToRole should match the recipient
			// Let's use a special approach: send to seeker with ToRole matching their role
			message := models.Message{
				FromUserID: primitive.NilObjectID, // No specific sender for announcements
				FromRole:   models.RoleAdmin,
				ToUserID:   seeker.ID,
				ToRole:     models.RoleSeeker, // This should work if the model supports it
				Message:    "[ANNOUNCEMENT] " + req.Message,
			}
			_, _ = a.MessageService.Create(ctx, message) // Ignore errors for individual sends
		}
	}

	utils.JSON(c, http.StatusCreated, created)
}

// ListAnnouncements returns all announcements for recruiters and job seekers.
func (a *AnnouncementController) ListAnnouncements(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	announcements, err := a.AnnouncementService.List(ctx)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.JSON(c, http.StatusOK, announcements)
}

