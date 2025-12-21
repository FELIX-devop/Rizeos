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
	Service *services.PaymentService
	Cfg     config.Config
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
