package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"rizeos/backend/internal/services"
	"rizeos/backend/internal/utils"
)

// UserController provides user listing for admin/recruiter views.
type UserController struct {
	UserService *services.UserService
}

// List returns users with optional filters: role, name, skills (comma-separated).
func (u *UserController) List(c *gin.Context) {
	role := c.Query("role")
	nameQ := strings.TrimSpace(c.Query("name"))
	skillsQ := strings.TrimSpace(c.Query("skills"))
	var skills []string
	if skillsQ != "" {
		for _, s := range strings.Split(skillsQ, ",") {
			if trimmed := strings.TrimSpace(s); trimmed != "" {
				skills = append(skills, trimmed)
			}
		}
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	users, err := u.UserService.Search(ctx, role, nameQ, skills)
	if err != nil {
		utils.JSONError(c, http.StatusInternalServerError, err.Error())
		return
	}

	// strip passwords
	for i := range users {
		users[i].PasswordHash = ""
	}
	utils.JSON(c, http.StatusOK, users)
}

