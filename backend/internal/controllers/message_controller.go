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

// MessageController manages message endpoints.
type MessageController struct {
	MessageService *services.MessageService
	UserService    *services.UserService
}

type sendMessageRequest struct {
	ToUserID string `json:"toUserId" binding:"required"`
	ToRole   string `json:"toRole" binding:"required"`
	Message  string `json:"message" binding:"required"`
}

// Send handles message creation from any role to another role.
func (m *MessageController) Send(c *gin.Context) {
	var req sendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")
	fromRole := role.(string)

	// Validate role combinations
	validCombinations := map[string][]string{
		models.RoleRecruiter: {models.RoleAdmin},
		models.RoleSeeker:    {models.RoleRecruiter},
	}

	allowedRoles, ok := validCombinations[fromRole]
	if !ok {
		utils.JSONError(c, http.StatusForbidden, "your role cannot send messages")
		return
	}

	validToRole := false
	for _, r := range allowedRoles {
		if r == req.ToRole {
			validToRole = true
			break
		}
	}
	if !validToRole {
		utils.JSONError(c, http.StatusBadRequest, "invalid recipient role for your role")
		return
	}

	fromUserOID, _ := primitive.ObjectIDFromHex(userID.(string))
	toUserOID, err := primitive.ObjectIDFromHex(req.ToUserID)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, "invalid recipient user id")
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	// Verify recipient exists and has correct role
	recipient, err := m.UserService.FindByID(ctx, toUserOID)
	if err != nil {
		utils.JSONError(c, http.StatusNotFound, "recipient user not found")
		return
	}
	if recipient.Role != req.ToRole {
		utils.JSONError(c, http.StatusBadRequest, "recipient role mismatch")
		return
	}

	// Special case: If recruiter sends to admin, find any admin (backward compatibility)
	if fromRole == models.RoleRecruiter && req.ToRole == models.RoleAdmin {
		adminUsers, err := m.UserService.Search(ctx, models.RoleAdmin, "", nil)
		if err != nil || len(adminUsers) == 0 {
			utils.JSONError(c, http.StatusInternalServerError, "admin user not found")
			return
		}
		// Use first admin found
		toUserOID = adminUsers[0].ID
	}

	message := models.Message{
		FromUserID: fromUserOID,
		FromRole:   fromRole,
		ToUserID:   toUserOID,
		ToRole:     req.ToRole,
		Message:    req.Message,
	}

	created, err := m.MessageService.Create(ctx, message)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.JSON(c, http.StatusCreated, created)
}

// AdminInbox returns all messages for admin.
func (m *MessageController) AdminInbox(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	messages, err := m.MessageService.GetAdminInbox(ctx)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Enrich messages with sender names
	enrichedMessages := make([]map[string]interface{}, 0, len(messages))
	for _, msg := range messages {
		user, err := m.UserService.FindByID(ctx, msg.FromUserID)
		enriched := map[string]interface{}{
			"id":           msg.ID,
			"from_user_id": msg.FromUserID,
			"from_role":    msg.FromRole,
			"to_role":      msg.ToRole,
			"message":      msg.Message,
			"is_read":      msg.IsRead,
			"created_at":   msg.CreatedAt,
		}
		if err == nil {
			enriched["from_user_name"] = user.Name
			enriched["from_user_email"] = user.Email
		}
		enrichedMessages = append(enrichedMessages, enriched)
	}

	utils.JSON(c, http.StatusOK, enrichedMessages)
}

// MarkAsRead marks a message as read.
func (m *MessageController) MarkAsRead(c *gin.Context) {
	messageID := c.Param("id")
	if messageID == "" {
		utils.JSONError(c, http.StatusBadRequest, "missing message id")
		return
	}

	messageOID, err := primitive.ObjectIDFromHex(messageID)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, "invalid message id")
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	if err := m.MessageService.MarkAsRead(ctx, messageOID); err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.JSON(c, http.StatusOK, gin.H{"status": "marked as read"})
}

// GetUnreadCount returns the count of unread messages for admin.
func (m *MessageController) GetUnreadCount(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	count, err := m.MessageService.GetUnreadCount(ctx)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.JSON(c, http.StatusOK, gin.H{"unread_count": count})
}

// RecruiterInbox returns all messages for the current recruiter.
func (m *MessageController) RecruiterInbox(c *gin.Context) {
	userID, _ := c.Get("user_id")
	recruiterOID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	messages, err := m.MessageService.GetRecruiterInbox(ctx, recruiterOID)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Enrich messages with sender names
	enrichedMessages := make([]map[string]interface{}, 0, len(messages))
	for _, msg := range messages {
		user, err := m.UserService.FindByID(ctx, msg.FromUserID)
		enriched := map[string]interface{}{
			"id":           msg.ID,
			"from_user_id": msg.FromUserID,
			"from_role":    msg.FromRole,
			"to_user_id":   msg.ToUserID,
			"to_role":      msg.ToRole,
			"message":      msg.Message,
			"is_read":      msg.IsRead,
			"created_at":   msg.CreatedAt,
		}
		if err == nil {
			enriched["from_user_name"] = user.Name
			enriched["from_user_email"] = user.Email
		}
		enrichedMessages = append(enrichedMessages, enriched)
	}

	utils.JSON(c, http.StatusOK, enrichedMessages)
}

// GetRecruiterUnreadCount returns the count of unread messages for the current recruiter.
func (m *MessageController) GetRecruiterUnreadCount(c *gin.Context) {
	userID, _ := c.Get("user_id")
	recruiterOID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	count, err := m.MessageService.GetRecruiterUnreadCount(ctx, recruiterOID)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.JSON(c, http.StatusOK, gin.H{"unread_count": count})
}
