package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"rizeos/backend/internal/models"
	"rizeos/backend/internal/utils"
)

// RequireRoles ensures user has one of the allowed roles.
func RequireRoles(roles ...string) gin.HandlerFunc {
	roleSet := map[string]struct{}{}
	for _, r := range roles {
		roleSet[r] = struct{}{}
	}
	return func(c *gin.Context) {
		role, ok := c.Get("role")
		if !ok {
			utils.JSONError(c, http.StatusForbidden, "missing role")
			return
		}
		if _, exists := roleSet[role.(string)]; !exists {
			utils.JSONError(c, http.StatusForbidden, "insufficient permissions")
			return
		}
		c.Next()
	}
}

// Convenience helpers.
func AdminOnly() gin.HandlerFunc {
	return RequireRoles(models.RoleAdmin)
}

func RecruiterOnly() gin.HandlerFunc {
	return RequireRoles(models.RoleRecruiter)
}

func SeekerOnly() gin.HandlerFunc {
	return RequireRoles(models.RoleSeeker)
}
