package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"rizeos/backend/internal/config"
	"rizeos/backend/internal/utils"
)

// AuthMiddleware validates JWT and injects claims.
func AuthMiddleware(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			utils.JSONError(c, http.StatusUnauthorized, "missing token")
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := utils.ParseToken(cfg.JWTSecret, tokenStr)
		if err != nil {
			utils.JSONError(c, http.StatusUnauthorized, "invalid token")
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// OptionalAuth sets claims when token is provided; otherwise continues.
func OptionalAuth(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			if claims, err := utils.ParseToken(cfg.JWTSecret, tokenStr); err == nil {
				c.Set("user_id", claims.UserID)
				c.Set("email", claims.Email)
				c.Set("role", claims.Role)
			}
		}
		c.Next()
	}
}
