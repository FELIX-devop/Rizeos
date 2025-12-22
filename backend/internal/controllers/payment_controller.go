package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"rizeos/backend/internal/config"
	"rizeos/backend/internal/models"
	"rizeos/backend/internal/services"
	"rizeos/backend/internal/utils"
)

// PaymentController handles payment verification and reporting.
type PaymentController struct {
	Service     *services.PaymentService
	UserService *services.UserService
	Cfg         config.Config
}

type verifyPaymentRequest struct {
	TxHash string `json:"tx_hash" binding:"required"`
}

// Verify verifies a Polygon transaction and stores it.
func (p *PaymentController) Verify(c *gin.Context) {
	var req verifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}
	if p.Cfg.AdminWallet == "" || p.Cfg.PolygonRPCURL == "" {
		utils.JSONError(c, http.StatusInternalServerError, "admin wallet or RPC not configured")
		return
	}
	userID, _ := c.Get("user_id")
	recruiterOID, _ := primitive.ObjectIDFromHex(userID.(string))

	ctx, cancel := context.WithTimeout(c.Request.Context(), 20*time.Second)
	defer cancel()
	payment, err := p.Service.VerifyAndStore(ctx, p.Cfg.PolygonRPCURL, p.Cfg.AdminWallet, req.TxHash, p.Cfg.PlatformFeeMatic)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}
	_ = p.Service.AttachRecruiter(ctx, payment.ID, recruiterOID)
	utils.JSON(c, http.StatusCreated, payment)
}

// List returns payments for admin or recruiter.
func (p *PaymentController) List(c *gin.Context) {
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")
	filter := bson.M{}
	if role == models.RoleRecruiter {
		oid, _ := primitive.ObjectIDFromHex(userID.(string))
		filter["recruiter_id"] = oid
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()
	items, err := p.Service.List(ctx, filter)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.JSON(c, http.StatusOK, items)
}

// VerifyJobSeekerPremium verifies a premium payment for a job seeker.
func (p *PaymentController) VerifyJobSeekerPremium(c *gin.Context) {
	var req verifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}
	if p.Cfg.AdminWallet == "" || p.Cfg.PolygonRPCURL == "" {
		utils.JSONError(c, http.StatusInternalServerError, "admin wallet or RPC not configured")
		return
	}
	
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")
	
	// Only job seekers can upgrade to premium
	if role != models.RoleSeeker {
		utils.JSONError(c, http.StatusForbidden, "only job seekers can upgrade to premium")
		return
	}
	
	jobSeekerOID, _ := primitive.ObjectIDFromHex(userID.(string))
	
	// Check if user is already premium
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()
	user, err := p.UserService.FindByID(ctx, jobSeekerOID)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, "user not found")
		return
	}
	if user.IsPremium {
		utils.JSONError(c, http.StatusBadRequest, "you already have premium access")
		return
	}
	
	// Verify payment
	ctx2, cancel2 := context.WithTimeout(c.Request.Context(), 20*time.Second)
	defer cancel2()
	payment, err := p.Service.VerifyAndStore(ctx2, p.Cfg.PolygonRPCURL, p.Cfg.AdminWallet, req.TxHash, p.Cfg.PlatformFeeMatic)
	if err != nil {
		utils.JSONError(c, http.StatusBadRequest, err.Error())
		return
	}
	
	// Attach job seeker and mark as consumed
	err = p.Service.AttachJobSeeker(ctx2, payment.ID, jobSeekerOID)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, "failed to attach payment")
		return
	}
	
	// Update user premium status
	err = p.UserService.UpdatePremiumStatus(ctx2, jobSeekerOID, payment.ID)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, "failed to update premium status")
		return
	}
	
	utils.JSON(c, http.StatusCreated, gin.H{
		"payment": payment,
		"message": "premium access activated",
	})
}
