package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"rizeos/backend/internal/config"
	"rizeos/backend/internal/utils"
)

// ConfigController returns public configuration.
type ConfigController struct {
	Cfg config.Config
}

// Public returns admin wallet and platform fee.
func (cctrl *ConfigController) Public(ctx *gin.Context) {
	utils.JSON(ctx, http.StatusOK, gin.H{
		"admin_wallet":       cctrl.Cfg.AdminWallet,
		"platform_fee_matic": cctrl.Cfg.PlatformFeeMatic,
		"polygon_rpc_url":    cctrl.Cfg.PolygonRPCURL,
	})
}
